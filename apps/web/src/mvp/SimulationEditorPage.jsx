import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, FlaskConical, Info, Lightbulb, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, deleteSimulation } from './api';

export function SimulationEditorPage() {
  const { courseId, simulationId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', scenario: '', objective: '', tutorInstructions: '', published: false });
  const [parentId, setParentId] = useState(courseId);
  const [loading, setLoading] = useState(Boolean(simulationId));
  const [busy, setBusy] = useState(false);
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
          published: simulation.published,
        });
        setParentId(simulation.courseId);
      }
    }).catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [simulationId]);

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api(simulationId ? `/simulations/${simulationId}` : `/courses/${courseId}/simulations`, { method: simulationId ? 'PATCH' : 'POST', body: JSON.stringify(values) });
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
                      value={values.title}
                      onChange={(event) => setValues({ ...values, title: event.target.value })}
                      minLength={3}
                      maxLength={200}
                      placeholder="Ej. Caso: dislipidemia en adulto joven"
                      required
                    />
                    <TextAreaField
                      label="Escenario"
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
                    <span className="editor-card-icon editor-card-icon-blue" aria-hidden="true"><Eye size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Visibilidad</h2>
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
