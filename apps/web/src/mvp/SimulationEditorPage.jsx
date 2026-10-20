import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CircleHelp, Eye, FlaskConical, Info, Lightbulb, Save, Sparkles, Timer, Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, deleteSimulation } from './api';

const HELP = {
  title: {
    text: 'Escribe un nombre breve que permita identificar rápidamente el caso.',
    example: 'Dislipidemia en adulto joven',
    avoid: "Nombres demasiado generales como 'Caso 1'.",
  },
  scenario: {
    text: 'Describe la situación que analizará el estudiante. Incluye solo la información necesaria para comprender el caso.',
    example: 'Paciente de 32 años con antecedentes familiares de hipercolesterolemia. Presenta LDL elevado y triglicéridos dentro de rango.',
    avoid: 'Dar directamente la respuesta o explicar qué debe concluir el estudiante.',
  },
  objective: {
    text: 'Indica qué debería ser capaz de comprender, explicar o resolver el estudiante al finalizar la simulación.',
    example: 'Que el estudiante interprete el perfil lipídico y relacione el LDL elevado con el riesgo cardiovascular.',
    avoid: "Objetivos demasiado amplios como 'que aprenda nutrición'.",
  },
  tutorInstructions: {
    text: 'Indica cómo quieres que Yulia guíe al estudiante durante la conversación. Estas instrucciones no son visibles para el estudiante.',
    example: 'Haz preguntas breves, da pistas si se equivoca y evita entregar la respuesta completa inmediatamente.',
    avoid: 'Repetir aquí todo el escenario o el objetivo.',
  },
  duration: {
    text: 'Define el número máximo de respuestas que podrá dar el estudiante antes de que la simulación deba cerrarse. Yulia podrá terminar antes si el estudiante alcanza el objetivo.',
    example: '6 respuestas suele ser suficiente para una conversación breve.',
  },
  visibility: {
    text: 'Controla si los estudiantes pueden encontrar y abrir esta simulación.',
    example: 'Déjala como borrador mientras la preparas y publícala cuando esté lista.',
  },
};

function FieldHelp({ label, text, example, avoid }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const id = useId();

  const place = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const width = window.innerWidth < 640 ? window.innerWidth - 32 : Math.min(340, window.innerWidth - 32);
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16);
    const height = panelRef.current?.offsetHeight ?? 0;
    let top = rect.bottom + 8;
    if (height && top + height > window.innerHeight - 16) top = Math.max(16, rect.top - height - 8);
    setCoords((current) => (current.top === top && current.left === left && current.width === width ? current : { top, left, width }));
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (buttonRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onViewportChange = () => place();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, place]);

  return (
    <span className="field-help">
      <button
        ref={buttonRef}
        type="button"
        className="field-help-btn"
        aria-label={`Ayuda: ${label}`}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelp size={16} aria-hidden="true" />
      </button>
      {open && typeof document !== 'undefined' ? createPortal(
        <div
          id={id}
          ref={panelRef}
          className="field-help-pop"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
          role="note"
          aria-live="polite"
        >
          <p className="field-help-text">{text}</p>
          {example ? (
            <p className="field-help-example">
              <span className="field-help-example-label">Ejemplo</span>
              {example}
            </p>
          ) : null}
          {avoid ? <p className="field-help-avoid"><span>Evita:</span> {avoid}</p> : null}
        </div>,
        document.body,
      ) : null}
    </span>
  );
}

export function SimulationEditorPage() {
  const { courseId, simulationId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', scenario: '', objective: '', tutorInstructions: '', maxStudentTurns: 6, published: false });
  const [parentId, setParentId] = useState(courseId);
  const [loading, setLoading] = useState(Boolean(simulationId));
  const [busy, setBusy] = useState(false);
  const [durationError, setDurationError] = useState('');
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  useEffect(() => {
    if (!simulationId) return;
    let active = true;
    api(`/simulations/${simulationId}`).then(({ simulation }) => {
      if (active) {
        setValues({
          title: simulation.title,
          scenario: simulation.scenario ?? '',
          objective: simulation.objective ?? '',
          tutorInstructions: simulation.tutorInstructions ?? '',
          maxStudentTurns: simulation.maxStudentTurns ?? 6,
          published: simulation.published,
        });
        setParentId(simulation.courseId);
      }
    }).catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [simulationId]);

  const submit = async (event) => {
    event.preventDefault();
    const maxStudentTurns = Number(values.maxStudentTurns);
    if (!Number.isInteger(maxStudentTurns) || maxStudentTurns < 3 || maxStudentTurns > 12) {
      setDurationError('Elige un número entre 3 y 12 respuestas.');
      return;
    }
    setDurationError(''); setBusy(true); setError('');
    try {
      await api(simulationId ? `/simulations/${simulationId}` : `/courses/${courseId}/simulations`, { method: simulationId ? 'PATCH' : 'POST', body: JSON.stringify({ ...values, maxStudentTurns }) });
      navigate(`/docente/cursos/${parentId}`);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const cancelTo = `/docente/cursos/${parentId}`;

  const closeDelete = () => {
    if (deleteBusy) return;
    setConfirmOpen(false);
    setDeleteError('');
  };
  const confirmDelete = async () => {
    setDeleteBusy(true); setDeleteError('');
    try {
      await deleteSimulation(simulationId);
      setConfirmOpen(false);
      navigate(cancelTo);
    } catch (cause) { setDeleteError(cause.message); }
    finally { setDeleteBusy(false); }
  };

  return (
    <div className="courses-page editor-page">
      <section className="editor-hero">
        <div className="site-container">
          <nav className="editor-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/docente" className="editor-breadcrumb-link">Panel docente</Link>
            <span className="editor-breadcrumb-sep" aria-hidden="true">/</span>
            <Link to={cancelTo} className="editor-breadcrumb-link">Curso</Link>
            <span className="editor-breadcrumb-sep" aria-hidden="true">/</span>
            <span className="editor-breadcrumb-current" aria-current="page">{simulationId ? 'Editar simulación' : 'Nueva simulación'}</span>
          </nav>
          <div className="editor-hero-row">
            <div className="min-w-0">
              <p className="editor-eyebrow">Panel docente</p>
              <h1 className="editor-title">{simulationId ? 'Editar simulación' : 'Nueva simulación'}</h1>
              <p className="editor-subtitle">Prepara el caso, el objetivo y las instrucciones que guiarán al tutor Gemini.</p>
            </div>
            <Link to={cancelTo} className="editor-back">
              <ArrowLeft size={15} aria-hidden="true" /> Volver al curso
            </Link>
          </div>
        </div>
      </section>

      <section className="editor-main">
        <div className="site-container">
          {loading ? (
            <div className="editor-grid" aria-hidden="true">
              <p className="sr-only" role="status">Cargando simulación…</p>
              <div className="editor-form">
                <div className="editor-card editor-skeleton editor-skeleton-lg" />
                <div className="editor-card editor-skeleton editor-skeleton-sm" />
              </div>
              <div className="editor-aside">
                <div className="editor-card editor-skeleton editor-skeleton-sm" />
              </div>
            </div>
          ) : (
            <div className="editor-grid">
              <form onSubmit={submit} className="editor-form">
                {error ? <Message tone="error">{error}</Message> : null}

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-green" aria-hidden="true"><FlaskConical size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Caso y objetivo</h2>
                      <p className="editor-card-sub">El escenario clínico y lo que el estudiante debe lograr.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <TextField
                      label="Título"
                      help={<FieldHelp label="Título" {...HELP.title} />}
                      value={values.title}
                      onChange={(event) => setValues({ ...values, title: event.target.value })}
                      minLength={3}
                      maxLength={200}
                      placeholder="Ej. Caso: dislipidemia en adulto joven"
                      required
                    />
                    <TextAreaField
                      label="Escenario"
                      help={<FieldHelp label="Escenario" {...HELP.scenario} />}
                      value={values.scenario}
                      onChange={(event) => setValues({ ...values, scenario: event.target.value })}
                      minLength={10}
                      maxLength={20000}
                      rows={6}
                      hint="Describe la situación clínica y los datos del paciente."
                      counter={`${values.scenario.length}/20000`}
                      placeholder="Paciente de 32 años que acude a consulta por…"
                      required
                    />
                    <TextAreaField
                      label="Objetivo"
                      help={<FieldHelp label="Objetivo" {...HELP.objective} />}
                      value={values.objective}
                      onChange={(event) => setValues({ ...values, objective: event.target.value })}
                      minLength={3}
                      maxLength={5000}
                      rows={3}
                      hint="Qué debe lograr el estudiante al resolver el caso."
                      counter={`${values.objective.length}/5000`}
                      placeholder="Que el estudiante interprete el perfil lipídico y proponga…"
                      required
                    />
                  </div>
                </div>

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-blue" aria-hidden="true"><Sparkles size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Guía del tutor</h2>
                      <p className="editor-card-sub">Contexto que recibe Yulia para conducir la conversación.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <TextAreaField
                      label="Instrucciones del tutor"
                      help={<FieldHelp label="Instrucciones del tutor" {...HELP.tutorInstructions} />}
                      value={values.tutorInstructions}
                      onChange={(event) => setValues({ ...values, tutorInstructions: event.target.value })}
                      minLength={3}
                      maxLength={20000}
                      rows={6}
                      counter={`${values.tutorInstructions.length}/20000`}
                      placeholder="Guía a Yulia: tono, pistas, etapas y qué evitar…"
                      required
                    />
                    <p className="editor-note">
                      <Info size={15} aria-hidden="true" />
                      <span>Estas instrucciones solo las ves tú; se envían a Gemini como contexto de la simulación.</span>
                    </p>
                  </div>
                </div>

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-green" aria-hidden="true"><Timer size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Duración de la simulación</h2>
                      <p className="editor-card-sub">Define cuánto puede extenderse la conversación con el estudiante.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <div className="editor-duration-control">
                      <TextField
                        label="¿Cuántas respuestas tendrá como máximo el estudiante?"
                        help={<FieldHelp label="Duración de la simulación" {...HELP.duration} />}
                        type="number"
                        inputMode="numeric"
                        min={3}
                        max={12}
                        step={1}
                        value={values.maxStudentTurns}
                        onChange={(event) => {
                          setValues({ ...values, maxStudentTurns: event.target.value === '' ? '' : Number(event.target.value) });
                          if (durationError) setDurationError('');
                        }}
                        onBlur={() => {
                          const turns = Number(values.maxStudentTurns);
                          if (!Number.isInteger(turns) || turns < 3 || turns > 12) setDurationError('Elige un número entre 3 y 12 respuestas.');
                        }}
                        hint="Yulia puede terminar antes si el estudiante ya alcanzó el objetivo."
                        error={durationError}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-blue" aria-hidden="true"><Eye size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <div className="editor-card-title-row">
                        <h2 className="editor-card-title">Visibilidad</h2>
                        <FieldHelp label="Visibilidad" {...HELP.visibility} />
                      </div>
                      <p className="editor-card-sub">Controla si la simulación está disponible para los estudiantes.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <label className="editor-switch">
                      <input
                        type="checkbox"
                        className="editor-switch-input"
                        checked={values.published}
                        onChange={(event) => setValues({ ...values, published: event.target.checked })}
                      />
                      <span className="editor-switch-track" aria-hidden="true">
                        <span className="editor-switch-thumb" />
                      </span>
                      <span className="editor-switch-text">
                        <span className="editor-switch-title">Simulación publicada</span>
                        <span className="editor-switch-desc">
                          {values.published
                            ? 'Visible para los estudiantes del curso.'
                            : 'Queda como borrador y no será visible hasta que la publiques.'}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="editor-actions">
                  <Button type="submit" disabled={busy} icon={Save} className="editor-save">
                    {busy ? 'Guardando…' : 'Guardar simulación'}
                  </Button>
                  <Button to={cancelTo} variant="secondary">Cancelar</Button>
                  {simulationId ? (
                    <button type="button" className="course-cta-delete ml-auto" onClick={() => setConfirmOpen(true)} disabled={busy}>
                      <Trash2 size={15} aria-hidden="true" /> Eliminar simulación
                    </button>
                  ) : null}
                </div>
              </form>

              <aside className="editor-aside" aria-label="Ayuda del editor">
                <div className="editor-status">
                  <p className="editor-aside-label">Estado actual</p>
                  <StatusBadge variant={values.published ? 'success' : 'warning'} dot>
                    {values.published ? 'Publicada' : 'Borrador'}
                  </StatusBadge>
                  <p className="editor-status-text">
                    {values.published
                      ? 'Los estudiantes pueden abrir esta simulación desde el curso.'
                      : 'La simulación permanecerá oculta hasta que la publiques.'}
                  </p>
                </div>

                <div className="editor-tips">
                  <p className="editor-aside-label"><Lightbulb size={13} aria-hidden="true" /> Consejos</p>
                  <ul className="editor-tips-list">
                    <li>Plantea un caso concreto y realista.</li>
                    <li>Define un objetivo claro y evaluable.</li>
                    <li>Da a Yulia pautas, no la solución.</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Modal
        open={confirmOpen}
        onClose={closeDelete}
        title="Eliminar simulación"
        description="Se eliminará esta simulación y todo el historial de conversaciones y evaluaciones relacionado."
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete} disabled={deleteBusy}>Cancelar</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete} disabled={deleteBusy}>
              {deleteBusy ? 'Eliminando…' : 'Eliminar simulación'}
            </Button>
          </>
        }
      >
        <p className="delete-warning">Esta acción no se puede deshacer.</p>
        {values.title ? <p className="delete-target">{values.title}</p> : null}
        {deleteError ? <Message tone="error" className="mt-3">{deleteError}</Message> : null}
      </Modal>
    </div>
  );
}
