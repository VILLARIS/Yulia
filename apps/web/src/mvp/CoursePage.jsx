import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity, Apple, ArrowRight, BookOpen, Brain, ChevronRight, Clock, FlaskConical,
  HeartPulse, Layers, Lock, Microscope, PencilLine, Plus, Salad, Sparkles, UserRound, Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Message } from '../components/ui/Message';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from './api';
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

function SimulationRow({ simulation, index, session, teacher, busy, onToggle }) {
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
  const { user } = useAuth();
  const teacher = user?.role === 'teacher';
  const [course, setCourse] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
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
  const hasActiveSession = simulations.some((item) => sessions[item.id]);
  const activeSimulation = simulations.find((item) => sessions[item.id]) ?? null;
  const rootPath = teacher ? '/docente' : '/cursos';
  const rootLabel = teacher ? 'Mis cursos' : 'Cursos';
  const updatedAt = formatUpdatedAt(course.updatedAt);

  const summary = [];
  if (teacher || isEnrolled) {
    summary.push({ icon: Layers, tone: 'course-summary-icon-blue', value: simulations.length, label: simulations.length === 1 ? 'Simulación' : 'Simulaciones' });
  }
  if (course.teacherName) {
    summary.push({ icon: Users, tone: 'course-summary-icon-green', value: course.teacherName, label: 'Docente' });
  }
  summary.push({
    icon: Activity,
    tone: teacher ? 'course-summary-icon-blue' : 'course-summary-icon-green',
    value: teacher ? (course.published ? 'Publicado' : 'Borrador') : isEnrolled ? 'Inscrito' : course.published ? 'Disponible' : 'No disponible',
    label: 'Estado',
  });
  if (updatedAt) summary.push({ icon: Clock, tone: 'course-summary-icon-blue', value: updatedAt, label: 'Actualizado' });

  const nextStep = teacher
    ? {
      text: simulations.length === 0 ? 'Crea la primera simulación de este curso.' : 'Añade o edita simulaciones cuando quieras.',
      action: <Button to={`/docente/cursos/${course.id}/simulaciones/nueva`} size="sm" icon={Plus} className="course-cta-solid">Crear simulación</Button>,
    }
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
        <div className="course-container">
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
                {course.teacherName ? (
                  <span className="course-cover-teacher"><UserRound size={15} aria-hidden="true" />Docente: {course.teacherName}</span>
                ) : teacher ? (
                  <span className="course-cover-teacher"><UserRound size={15} aria-hidden="true" />Tu curso</span>
                ) : null}
                {teacher ? (
                  <StatusBadge variant={course.published ? 'success' : 'warning'} dot>
                    {course.published ? 'Curso publicado' : 'Curso no publicado'}
                  </StatusBadge>
                ) : isEnrolled ? (
                  <StatusBadge variant="success" dot>Inscrito</StatusBadge>
                ) : null}
              </div>

              <div className="course-cover-actions">
                {teacher ? (
                  <>
                    <Button to={`/docente/cursos/${course.id}/editar`} variant="secondary" icon={PencilLine} className="course-cta-outline">Editar curso</Button>
                    <Button to={`/docente/cursos/${course.id}/simulaciones/nueva`} icon={Plus} className="course-cta-solid">Crear simulación</Button>
                  </>
                ) : !user ? (
                  <Button to="/registro" icon={ArrowRight} iconPosition="end" className="course-cta-solid">Crear cuenta para acceder</Button>
                ) : isEnrolled ? (
                  <>
                    <Button to={`/estudiante/cursos/${course.id}`} icon={ArrowRight} iconPosition="end" className="course-cta-solid">Ver simulaciones</Button>
                    <a className="course-cta-text course-cover-cta-text" href="#simulaciones">
                      Ver el contenido<ArrowRight size={15} aria-hidden="true" className="course-cta-arrow" />
                    </a>
                  </>
                ) : (
                  <Button onClick={enroll} disabled={busy} icon={ArrowRight} iconPosition="end" className="course-cta-solid">
                    {busy ? 'Inscribiendo…' : 'Inscribirme'}
                  </Button>
                )}
              </div>
            </div>

            <CourseCoverVisual />
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
                <h2 id="curso-sobre" className="course-about-title">Sobre este curso</h2>
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
                      />
                    ))}
                  </ul>
                )}
              </section>
            </main>

            <aside className="course-side" aria-label="Panel del curso">
              <div className="course-side-block">
                <p className="course-side-label">Estado</p>
                <p className="course-side-value">
                  {teacher
                    ? (course.published ? 'Curso publicado' : 'Curso no publicado')
                    : isEnrolled ? 'Estás inscrito' : 'Sin inscribir'}
                </p>
              </div>

              <div className="course-side-block">
                <p className="course-side-label">Docente</p>
                <p className="course-side-value">
                  <UserRound size={15} aria-hidden="true" />
                  {course.teacherName || (teacher ? 'Tú' : 'Sin asignar')}
                </p>
              </div>

              <div className="course-side-block">
                {teacher ? (
                  <div className="course-side-actions">
                    <Button to={`/docente/cursos/${course.id}/editar`} variant="secondary" icon={PencilLine} className="course-cta-outline w-full">Editar curso</Button>
                    <Button to={`/docente/cursos/${course.id}/simulaciones/nueva`} icon={Plus} className="course-cta-solid w-full">Crear simulación</Button>
                  </div>
                ) : !user ? (
                  <Button to="/registro" icon={ArrowRight} iconPosition="end" className="course-cta-solid w-full">Crear cuenta para acceder</Button>
                ) : isEnrolled ? (
                  hasActiveSession && activeSimulation ? (
                    <Button to={`/estudiante/simulaciones/${activeSimulation.id}`} icon={ArrowRight} iconPosition="end" className="course-cta-solid w-full">Continuar simulación</Button>
                  ) : (
                    <Button onClick={enroll} disabled variant="secondary" className="course-cta-outline w-full">Inscrito</Button>
                  )
                ) : (
                  <Button onClick={enroll} disabled={busy} icon={ArrowRight} iconPosition="end" className="course-cta-solid w-full">
                    {busy ? 'Inscribiendo…' : 'Inscribirme'}
                  </Button>
                )}
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
    </div>
  );
}
