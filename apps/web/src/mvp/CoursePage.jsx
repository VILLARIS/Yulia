import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity, Apple, ArrowRight, BookOpen, Brain, CalendarDays, ChevronRight, FlaskConical,
  HeartPulse, Layers, Lock, Microscope, PencilLine, Plus, Salad, Sparkles, Trash2, UserRound, Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Message } from '../components/ui/Message';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, deleteCourse, deleteSimulation } from './api';
import { useAuth } from './AuthContext';

/* Identidad visual de cada simulación: determinista por posición, igual que el
 * catálogo. Los tonos se declaran completos para que Tailwind los detecte. */
const SIM_ICONS = [FlaskConical, Activity, Microscope, Apple, Brain, HeartPulse, Salad, BookOpen];
const SIM_TONES = ['course-sim-icon-green', 'course-sim-icon-blue'];

/* Fecha real de `updatedAt`; si no existe o no es válida, no se muestra nada. */
function formatUpdatedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

/* Panel abstracto de portada: iconos de laboratorio y nutrición sobre formas
 * suaves. Decorativo, nunca una imagen de stock. */
function CourseCoverVisual() {
  return (
    <div className="course-cover-visual" aria-hidden="true">
      <span className="course-visual-orb course-visual-orb-green" />
      <span className="course-visual-orb course-visual-orb-blue" />
      <span className="course-visual-rings" />
      <span className="course-visual-chip course-visual-chip-lg"><Microscope size={34} strokeWidth={1.6} /></span>
      <span className="course-visual-chip course-visual-chip-a"><Apple size={22} strokeWidth={1.7} /></span>
      <span className="course-visual-chip course-visual-chip-b"><FlaskConical size={22} strokeWidth={1.7} /></span>
      <span className="course-visual-chip course-visual-chip-c"><HeartPulse size={22} strokeWidth={1.7} /></span>
    </div>
  );
}

function CourseSummary({ items }) {
  if (items.length === 0) return null;
  return (
    <section className="course-summary" aria-label="Resumen del curso">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="course-summary-item">
          <span className={`course-summary-icon ${tone}`} aria-hidden="true"><Icon size={17} strokeWidth={1.9} /></span>
          <div className="min-w-0">
            <p className="course-summary-value">{value}</p>
            <p className="course-summary-label">{label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function SimulationRow({ simulation, index, session, teacher, busy, onToggle, onDelete }) {
  const Icon = SIM_ICONS[index % SIM_ICONS.length];
  const tone = SIM_TONES[index % SIM_TONES.length];
  const description = simulation.objective || simulation.scenario || '';

  return (
    <li>
      <article className="course-sim">
        <span className={`course-sim-icon ${tone}`} aria-hidden="true"><Icon size={24} strokeWidth={1.7} /></span>
        <div className="course-sim-body">
          <div className="course-sim-top">
            <h3 className="course-sim-title">{simulation.title}</h3>
            {teacher ? (
              <StatusBadge variant={simulation.published ? 'success' : 'warning'}>
                {simulation.published ? 'Publicada' : 'Borrador'}
              </StatusBadge>
            ) : session ? (
              <StatusBadge variant="info" dot>En curso</StatusBadge>
            ) : (
              <StatusBadge variant="success" dot>Disponible</StatusBadge>
            )}
          </div>
          {description ? <p className="course-sim-desc">{description}</p> : null}
        </div>
        <div className="course-sim-action">
          {teacher ? (
            <>
              <Link className="course-cta-text" to={`/docente/simulaciones/${simulation.id}/editar`}>
                Editar<ArrowRight size={15} aria-hidden="true" className="course-cta-arrow" />
              </Link>
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => onToggle(simulation)} className="course-cta-outline">
                {simulation.published ? 'Despublicar' : 'Publicar'}
              </Button>
              <button
                type="button"
                className="course-cta-delete"
                onClick={() => onDelete(simulation)}
                disabled={busy}
                aria-label={`Eliminar ${simulation.title}`}
              >
                <Trash2 size={15} aria-hidden="true" /> Eliminar
              </button>
            </>
          ) : (
            <Button
              to={`/estudiante/simulaciones/${simulation.id}`}
              icon={ArrowRight}
              iconPosition="end"
              className="course-cta-solid w-full sm:w-auto"
            >
              {session ? 'Continuar simulación' : 'Entrar a la simulación'}
            </Button>
          )}
        </div>
      </article>
    </li>
  );
}

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const teacher = user?.role === 'teacher';
  const [course, setCourse] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [sessions, setSessions] = useState({});
  const [coverFailed, setCoverFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let active = true;
    setCoverFailed(false);
    api(`/courses/${courseId}`).then(async ({ course: data }) => {
      if (!active) return;
      setCourse(data);
      if (teacher || data.enrolled) {
        const { simulations: list } = await api(`/courses/${courseId}/simulations`);
        if (!active) return;
        setSimulations(list);
        // Estado real por simulación: si el estudiante ya tiene una sesión
        // activa, la tarjeta ofrece continuar en lugar de empezar de cero.
        if (!teacher && data.enrolled && list.length > 0) {
          const checked = await Promise.all(list.map((item) =>
            api(`/simulations/${item.id}/session`)
              .then(({ session }) => [item.id, Boolean(session)])
              .catch(() => [item.id, false])));
          if (!active) return;
          setSessions(Object.fromEntries(checked));
        }
      }
    }).catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId, teacher]);

  const enroll = async () => {
    setBusy(true); setError('');
    try {
      await api(`/courses/${courseId}/enroll`, { method: 'POST' });
      const { simulations: list } = await api(`/courses/${courseId}/simulations`);
      setCourse({ ...course, enrolled: true }); setSimulations(list); setSessions({});
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };
  const toggle = async (simulation) => {
    setBusy(true); setError('');
    try {
      const { simulation: updated } = await api(`/simulations/${simulation.id}`, { method: 'PATCH', body: JSON.stringify({ published: !simulation.published }) });
      setSimulations((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const openDelete = (target) => { setDeleteError(''); setPendingDelete(target); };
  const closeDelete = () => { if (deleteBusy) return; setPendingDelete(null); setDeleteError(''); };
  const confirmDelete = async () => {
    setDeleteBusy(true); setDeleteError('');
    try {
      if (pendingDelete.type === 'course') {
        await deleteCourse(courseId);
        setPendingDelete(null);
        navigate('/docente');
        return;
      }
      await deleteSimulation(pendingDelete.id);
      setSimulations((current) => current.filter((item) => item.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (cause) { setDeleteError(cause.message); }
    finally { setDeleteBusy(false); }
  };

  if (loading) return (
    <div className="course-page" role="status" aria-live="polite">
      <div className="course-cover course-cover-loading">
        <div className="course-container">
          <span className="course-skeleton-line course-skeleton-line-sm" />
          <span className="course-skeleton-line course-skeleton-line-lg" />
          <span className="course-skeleton-line" />
        </div>
      </div>
      <div className="course-body">
        <div className="course-container">
          <p className="course-loading-text">Cargando curso…</p>
          <div className="course-sims-list">
            <div className="course-sim course-skeleton" />
            <div className="course-sim course-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!course) return (
    <div className="course-page">
      <div className="course-body">
        <div className="course-container">
          <Message tone="error">{error || 'Curso no encontrado'}</Message>
        </div>
      </div>
    </div>
  );

  const isEnrolled = Boolean(course.enrolled);
  const activeSimulation = simulations.find((item) => sessions[item.id]) ?? null;
  const teacherDisplayName = course.teacherName || (teacher ? user?.name : '');
  const rootPath = teacher ? '/docente' : '/cursos';
  const rootLabel = teacher ? 'Mis cursos' : 'Cursos';
  const updatedAt = formatUpdatedAt(course.updatedAt);
  const statusLabel = teacher
    ? (course.published ? 'Curso publicado' : 'Curso no publicado')
    : isEnrolled ? 'Estás inscrito' : course.published ? 'Disponible' : 'No disponible';
  const statusTone = teacher
    ? (course.published ? 'success' : 'warning')
    : isEnrolled ? 'success' : course.published ? 'info' : 'neutral';
  const statusDescription = teacher
    ? (course.published ? 'El curso está visible para tus estudiantes.' : 'Publica el curso cuando esté listo.')
    : isEnrolled
      ? 'Puedes acceder a las simulaciones disponibles.'
      : 'Inscríbete para acceder a las simulaciones publicadas.';

  const summary = [];
  if (teacher || isEnrolled) {
    summary.push({ icon: Layers, tone: 'course-summary-icon-blue', value: simulations.length, label: simulations.length === 1 ? 'Simulación' : 'Simulaciones' });
  }
  if (teacherDisplayName) {
    summary.push({ icon: Users, tone: 'course-summary-icon-green', value: teacherDisplayName, label: 'Docente' });
  }
  summary.push({
    icon: Activity,
    tone: teacher ? 'course-summary-icon-blue' : 'course-summary-icon-green',
    value: teacher ? (course.published ? 'Publicado' : 'Borrador') : isEnrolled ? 'Inscrito' : course.published ? 'Disponible' : 'No disponible',
    label: 'Estado',
  });
  if (updatedAt) summary.push({ icon: CalendarDays, tone: 'course-summary-icon-blue', value: updatedAt, label: 'Actualizado' });

  const nextStep = teacher
    ? {
      text: simulations.length === 0 ? 'Crea la primera simulación de este curso.' : 'Añade o edita simulaciones cuando quieras.',
      action: null,
    }
    : !user
      ? { text: 'Crea una cuenta e inscríbete para acceder a las simulaciones publicadas.', action: null }
      : !isEnrolled
        ? { text: 'Inscríbete para acceder a las simulaciones publicadas.', action: null }
        : activeSimulation
          ? {
            text: `Tienes "${activeSimulation.title}" en curso.`,
            action: <Button to={`/estudiante/simulaciones/${activeSimulation.id}`} size="sm" icon={ArrowRight} iconPosition="end" className="course-cta-solid">Continuar simulación</Button>,
          }
          : simulations.length === 0
            ? { text: 'La docente todavía no ha publicado simulaciones.', action: null }
            : { text: 'Elige una simulación y empieza a practicar.', action: null };

  return (
    <div className="course-page">
      <header className="course-cover">
        <div className="course-cover-decor" aria-hidden="true">
          <span className="course-cover-blob course-cover-blob-green" />
          <span className="course-cover-blob course-cover-blob-blue" />
          <span className="course-cover-leaf course-cover-leaf-a" />
          <span className="course-cover-leaf course-cover-leaf-b" />
        </div>
        <div className="course-container course-cover-content">
          <nav aria-label="Ruta de navegación" className="course-breadcrumb">
            <ol>
              <li>
                <Link className="course-breadcrumb-link" to={rootPath}>{rootLabel}</Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li><span aria-current="page" className="course-breadcrumb-current">{course.title}</span></li>
            </ol>
          </nav>

          <div className="course-cover-grid">
            <div className="course-cover-main">
              <span className="course-cover-label">Curso</span>
              <h1 className="course-cover-title">{course.title}</h1>
              <p className="course-cover-desc">{course.description || 'Sin descripción.'}</p>

              <div className="course-cover-meta">
                {teacherDisplayName ? (
                  <span className="course-cover-teacher"><UserRound size={15} aria-hidden="true" />Docente: {teacherDisplayName}</span>
                ) : teacher ? (
                  <span className="course-cover-teacher"><UserRound size={15} aria-hidden="true" />Tu curso</span>
                ) : null}
                <StatusBadge variant={statusTone} dot>
                  {teacher ? statusLabel : isEnrolled ? 'Inscrito' : statusLabel}
                </StatusBadge>
              </div>

              <div className="course-cover-actions">
                {teacher ? (
                  <>
                    <Button to={`/docente/cursos/${course.id}/editar`} variant="secondary" icon={PencilLine} className="course-cta-outline">Editar curso</Button>
                    <Button to={`/docente/cursos/${course.id}/simulaciones/nueva`} icon={Plus} className="course-cta-solid">Crear simulación</Button>
                    <button type="button" className="course-cta-delete" onClick={() => openDelete({ type: 'course', title: course.title })} disabled={busy}>
                      <Trash2 size={15} aria-hidden="true" /> Eliminar curso
                    </button>
                  </>
                ) : !user ? (
                  <Button to="/registro" icon={ArrowRight} iconPosition="end" className="course-cta-solid">Crear cuenta para acceder</Button>
                ) : isEnrolled ? (
                  <>
                    <Button to={`/estudiante/cursos/${course.id}#simulaciones`} icon={ArrowRight} iconPosition="end" className="course-cta-solid">Ver simulaciones</Button>
                    <a className="course-cta-text course-cover-cta-text" href="#curso-sobre">
                      Ver el contenido<ArrowRight size={15} aria-hidden="true" className="course-cta-arrow" />
                    </a>
                  </>
                ) : (
                  <>
                    <Button onClick={enroll} disabled={busy} icon={ArrowRight} iconPosition="end" className="course-cta-solid">
                      {busy ? 'Inscribiendo…' : 'Inscribirme'}
                    </Button>
                    <a className="course-cta-text course-cover-cta-text" href="#curso-sobre">
                      Ver el contenido<ArrowRight size={15} aria-hidden="true" className="course-cta-arrow" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="course-cover-media">
              {course.coverImageUrl && !coverFailed ? (
                <div className="course-cover-image">
                  <img
                    src={course.coverImageUrl}
                    alt={`Portada de ${course.title}`}
                    decoding="async"
                    onError={() => setCoverFailed(true)}
                  />
                </div>
              ) : (
                <CourseCoverVisual />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="course-body">
        <div className="course-container">
          {error ? <Message tone="error" className="mb-6">{error}</Message> : null}

          <CourseSummary items={summary} />

          <div className="course-layout">
            <main className="course-main">
              <section className="course-about" aria-labelledby="curso-sobre">
                <div className="course-about-head">
                  <span className="course-about-icon" aria-hidden="true"><BookOpen size={21} strokeWidth={1.8} /></span>
                  <h2 id="curso-sobre" className="course-about-title">Sobre este curso</h2>
                </div>
                <p className="course-about-text">{course.description || 'Este curso todavía no tiene descripción.'}</p>
              </section>

              <section id="simulaciones" className="course-sims" aria-labelledby="curso-simulaciones">
                <div className="course-sims-head">
                  <h2 id="curso-simulaciones" className="course-sims-title">Simulaciones del curso</h2>
                  <p className="course-sims-sub">
                    {teacher ? 'Gestiona las simulaciones que practican tus estudiantes.' : 'Practica los conceptos mediante escenarios guiados.'}
                  </p>
                </div>

                {!teacher && !isEnrolled ? (
                  <div className="course-enroll-panel">
                    <span className="course-enroll-icon" aria-hidden="true"><Lock size={20} strokeWidth={1.8} /></span>
                    <div className="course-enroll-body">
                      <h3 className="course-enroll-title">Inscríbete para acceder</h3>
                      <p className="course-enroll-text">Inscríbete para consultar las simulaciones publicadas.</p>
                    </div>
                    <Button onClick={enroll} disabled={busy} icon={ArrowRight} iconPosition="end" className="course-cta-solid w-full sm:w-auto">
                      {busy ? 'Inscribiendo…' : 'Inscribirme'}
                    </Button>
                  </div>
                ) : simulations.length === 0 ? (
                  <EmptyState
                    title="Aún no hay simulaciones visibles"
                    description={teacher ? 'Crea la primera simulación dentro de este curso.' : 'La docente todavía no ha publicado simulaciones.'}
                  />
                ) : (
                  <ul className="course-sims-list">
                    {simulations.map((simulation, index) => (
                      <SimulationRow
                        key={simulation.id}
                        simulation={simulation}
                        index={index}
                        session={Boolean(sessions[simulation.id])}
                        teacher={teacher}
                        busy={busy}
                        onToggle={toggle}
                        onDelete={openDelete}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </main>

            <aside className="course-side" aria-label="Panel del curso">
              <div className="course-side-head">
                <span className="course-side-head-icon" aria-hidden="true"><BookOpen size={18} strokeWidth={1.8} /></span>
                <div className="min-w-0">
                  <p className="course-side-kicker">Resumen</p>
                  <h2 className="course-side-title">Detalles del curso</h2>
                </div>
              </div>

              <div className="course-side-block">
                <p className="course-side-label">Estado</p>
                <div className="course-side-status">
                  <span className={`course-side-status-dot course-side-status-${statusTone}`} aria-hidden="true" />
                  <p className="course-side-value">{statusLabel}</p>
                </div>
                <p className="course-side-subtext">{statusDescription}</p>
              </div>

              <div className="course-side-block">
                <p className="course-side-label">Docente</p>
                <div className="course-side-person">
                  <span className="course-side-person-icon" aria-hidden="true"><UserRound size={17} strokeWidth={1.8} /></span>
                  <div className="min-w-0">
                    <p className="course-side-value">{teacherDisplayName || (teacher ? 'Tú' : 'Sin asignar')}</p>
                    <p className="course-side-subtext">Docente del curso</p>
                  </div>
                </div>
              </div>

              <div className="course-side-block">
                <p className="course-side-label"><Sparkles size={13} aria-hidden="true" />Tu siguiente paso</p>
                <p className="course-side-text">{nextStep.text}</p>
                {nextStep.action ? <div className="course-side-action">{nextStep.action}</div> : null}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={closeDelete}
        title={pendingDelete?.type === 'course' ? 'Eliminar curso' : 'Eliminar simulación'}
        description={pendingDelete?.type === 'course'
          ? 'Se eliminará este curso, sus simulaciones, inscripciones y todo el historial relacionado de los estudiantes.'
          : 'Se eliminará esta simulación y todo el historial de conversaciones y evaluaciones relacionado.'}
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete} disabled={deleteBusy}>Cancelar</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete} disabled={deleteBusy}>
              {deleteBusy ? 'Eliminando…' : pendingDelete?.type === 'course' ? 'Eliminar curso' : 'Eliminar simulación'}
            </Button>
          </>
        }
      >
        <p className="delete-warning">Esta acción no se puede deshacer.</p>
        {pendingDelete?.title ? <p className="delete-target">{pendingDelete.title}</p> : null}
        {deleteError ? <Message tone="error" className="mt-3">{deleteError}</Message> : null}
      </Modal>
    </div>
  );
}
