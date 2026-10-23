import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Apple, ArrowRight, BookOpen, Brain, CalendarDays, CheckCircle2, FlaskConical, HeartPulse, Microscope, PenLine, Plus, Salad, Search, Trash2, UserRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Message } from '../components/ui/Message';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import backgroundCourses from '../assets/yulia/courses/backgroundCourses.png';
import { api, deleteCourse } from './api';
import { useAuth } from './AuthContext';

/* Cada tarjeta recibe un tono y un icono según su posición: determinista y
 * estable entre renders, sin aleatoriedad ni datos que el curso no tenga. */
const VISUAL_TONES = ['course-card-visual-green', 'course-card-visual-blue', 'course-card-visual-cream', 'course-card-visual-teal'];
const VISUAL_ICONS = [BookOpen, FlaskConical, Apple, Activity, Microscope, Brain, Salad, HeartPulse];

/* Tono del chip de las tarjetas de gestión del docente, en la misma paleta. */
const TEACHER_CHIP_TONES = ['teacher-card-chip-green', 'teacher-card-chip-blue', 'teacher-card-chip-cream', 'teacher-card-chip-teal'];

const dateFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'enrolled', label: 'Inscritos' },
  { key: 'available', label: 'Disponibles' },
];

function CourseCard({ course, index, isAuthenticated, enrolled }) {
  const Icon = VISUAL_ICONS[index % VISUAL_ICONS.length];
  const tone = VISUAL_TONES[index % VISUAL_TONES.length];
  const detailPath = `/estudiante/cursos/${course.id}`;
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = Boolean(course.coverImageUrl) && !coverFailed;
  const action = !isAuthenticated
    ? { to: '/acceso', label: 'Ver curso', solid: false }
    : enrolled
      ? { to: detailPath, label: 'Continuar curso', solid: true }
      : { to: detailPath, label: 'Ver curso', solid: false };

  return (
    <article className={`course-card ${enrolled ? 'course-card-enrolled' : ''}`}>
      {showCover ? (
        <div className="course-card-cover">
          <img
            src={course.coverImageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="course-card-cover-img"
            onError={() => setCoverFailed(true)}
          />
        </div>
      ) : (
        <div className={`course-card-visual ${tone}`} aria-hidden="true">
          <span className="course-card-orb" />
          <Icon size={44} strokeWidth={1.5} className="course-card-icon" />
        </div>
      )}
      <div className="course-card-body">
        <div className="course-card-top">
          <span className="course-card-label">Curso</span>
          {enrolled ? <StatusBadge variant="success" dot>Inscrito</StatusBadge> : null}
        </div>
        <h2 className="course-card-title line-clamp-2">{course.title}</h2>
        <p className="course-card-desc line-clamp-3">{course.description || 'Sin descripción.'}</p>
        {course.teacherName ? (
          <p className="course-card-teacher"><UserRound size={14} aria-hidden="true" />Docente: {course.teacherName}</p>
        ) : null}
        <div className="course-card-action">
          <Button
            to={action.to}
            variant={action.solid ? 'primary' : 'secondary'}
            icon={ArrowRight}
            iconPosition="end"
            className={`${action.solid ? 'course-cta-solid' : 'course-cta-outline'} w-full sm:w-auto`}
          >
            {action.label}
          </Button>
        </div>
      </div>
    </article>
  );
}

function TeacherCourseCard({ course, index, onDelete, busy }) {
  const Icon = VISUAL_ICONS[index % VISUAL_ICONS.length];
  const chip = TEACHER_CHIP_TONES[index % TEACHER_CHIP_TONES.length];
  const updated = formatDate(course.updatedAt);
  const viewPath = `/docente/cursos/${course.id}`;
  const editPath = `/docente/cursos/${course.id}/editar`;

  return (
    <li>
      <article className="teacher-card">
        <div className="teacher-card-top">
          <span className={`teacher-card-chip ${chip}`} aria-hidden="true">
            <Icon size={22} strokeWidth={1.7} />
          </span>
          <StatusBadge variant={course.published ? 'success' : 'warning'} dot>
            {course.published ? 'Publicado' : 'Borrador'}
          </StatusBadge>
        </div>
        <h2 className="teacher-card-title line-clamp-2">{course.title}</h2>
        <p className="teacher-card-desc line-clamp-3">{course.description || 'Sin descripción.'}</p>
        {updated ? (
          <p className="teacher-card-meta">
            <CalendarDays size={14} aria-hidden="true" /> Actualizado el {updated}
          </p>
        ) : null}
        <div className="teacher-card-foot">
          <Button to={viewPath} variant="secondary" icon={ArrowRight} iconPosition="end" className="teacher-cta-view">
            Ver curso
          </Button>
          <Link to={editPath} className="teacher-cta-edit">
            <PenLine size={15} aria-hidden="true" /> Editar
          </Link>
          <button
            type="button"
            className="teacher-cta-delete"
            onClick={() => onDelete(course)}
            disabled={busy}
            aria-label={`Eliminar ${course.title}`}
          >
            <Trash2 size={15} aria-hidden="true" /> Eliminar
          </button>
        </div>
      </article>
    </li>
  );
}

export function CoursesPage() {
  const { user } = useAuth();
  const teacher = user?.role === 'teacher';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let active = true;
    api('/courses').then(({ courses: data }) => { if (active) setCourses(data); })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const term = query.trim().toLowerCase();
  const visible = useMemo(() => courses.filter((course) => {
    const matchesTerm = !term || course.title.toLowerCase().includes(term) || (course.description ?? '').toLowerCase().includes(term);
    const matchesFilter = filter === 'enrolled' ? Boolean(course.enrolled) : filter === 'available' ? !course.enrolled : true;
    return matchesTerm && matchesFilter;
  }), [courses, term, filter]);

  const openDelete = (course) => { setDeleteError(''); setPendingDelete(course); };
  const closeDelete = () => { if (deleteBusy) return; setPendingDelete(null); setDeleteError(''); };
  const confirmDelete = async () => {
    setDeleteBusy(true); setDeleteError('');
    try {
      await deleteCourse(pendingDelete.id);
      setCourses((current) => current.filter((item) => item.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (cause) { setDeleteError(cause.message); }
    finally { setDeleteBusy(false); }
  };

  // El docente conserva su panel de gestión; el catálogo público es para el
  // visitante y para el estudiante, con una única implementación.
  if (teacher) {
    const published = courses.filter((course) => course.published).length;
    const drafts = courses.length - published;
    const hasCourses = courses.length > 0;

    return (
      <div className="courses-page teacher-page">
        <section className="teacher-hero" style={{ '--teacher-hero-background': `url("${backgroundCourses}")` }}>
          <div className="site-container">
            <p className="teacher-eyebrow">Panel docente</p>
            <div className="teacher-hero-row">
              <div className="min-w-0">
                <h1 className="teacher-title">Mis cursos</h1>
                <p className="teacher-subtitle">Gestiona tus cursos y prepara sus simulaciones.</p>
              </div>
              <Button to="/docente/cursos/nuevo" icon={Plus} className="teacher-create">Crear curso</Button>
            </div>

            {!loading && !error && hasCourses ? (
              <div className="teacher-metrics">
                <div className="teacher-metric">
                  <span className="teacher-metric-icon teacher-metric-icon-green" aria-hidden="true"><CheckCircle2 size={18} strokeWidth={1.9} /></span>
                  <span>
                    <span className="teacher-metric-value">{published}</span>
                    <span className="teacher-metric-label">{published === 1 ? 'Publicado' : 'Publicados'}</span>
                  </span>
                </div>
                <div className="teacher-metric">
                  <span className="teacher-metric-icon teacher-metric-icon-amber" aria-hidden="true"><PenLine size={18} strokeWidth={1.9} /></span>
                  <span>
                    <span className="teacher-metric-value">{drafts}</span>
                    <span className="teacher-metric-label">{drafts === 1 ? 'Borrador' : 'Borradores'}</span>
                  </span>
                </div>
                <div className="teacher-metric">
                  <span className="teacher-metric-icon teacher-metric-icon-blue" aria-hidden="true"><BookOpen size={18} strokeWidth={1.9} /></span>
                  <span>
                    <span className="teacher-metric-value">{courses.length}</span>
                    <span className="teacher-metric-label">{courses.length === 1 ? 'Curso total' : 'Cursos totales'}</span>
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="teacher-main">
          <div className="site-container">
            {loading ? (
              <div className="teacher-grid" aria-hidden="true">
                {[0, 1, 2].map((index) => <li key={index} className="teacher-card course-card-skeleton" />)}
              </div>
            ) : null}
            {error ? <Message tone="error">{error}</Message> : null}
            {!loading && !error && !hasCourses ? (
              <EmptyState
                icon={BookOpen}
                title="Todavía no tienes cursos"
                description="Crea tu primer curso para empezar a añadir simulaciones."
                action={<Button to="/docente/cursos/nuevo" icon={Plus}>Crear curso</Button>}
              />
            ) : null}
            {!loading && !error && hasCourses ? (
              <ul className="teacher-grid">
                {courses.map((course, index) => (
                  <TeacherCourseCard key={course.id} course={course} index={index} onDelete={openDelete} busy={deleteBusy} />
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <Modal
          open={Boolean(pendingDelete)}
          onClose={closeDelete}
          title="Eliminar curso"
          description="Se eliminará este curso, sus simulaciones, inscripciones y todo el historial relacionado de los estudiantes."
          footer={
            <>
              <Button variant="secondary" onClick={closeDelete} disabled={deleteBusy}>Cancelar</Button>
              <Button variant="danger" icon={Trash2} onClick={confirmDelete} disabled={deleteBusy}>
                {deleteBusy ? 'Eliminando…' : 'Eliminar curso'}
              </Button>
            </>
          }
        >
          <p className="delete-warning">Esta acción no se puede deshacer.</p>
          {pendingDelete ? <p className="delete-target">{pendingDelete.title}</p> : null}
          {deleteError ? <Message tone="error" className="mt-3">{deleteError}</Message> : null}
        </Modal>
      </div>
    );
  }

  const isAuthenticated = Boolean(user);
  const hasCourses = courses.length > 0;
  const resetFilters = () => { setQuery(''); setFilter('all'); };

  return (
    <div className="courses-page">
      <section className="courses-header">
        <div className="site-container">
          <p className="courses-eyebrow">Explora y aprende</p>
          <h1 className="courses-title">Cursos disponibles</h1>
          <p className="courses-subtitle">Descubre contenidos de bromatología y nutrición, casos prácticos y simulaciones para aprender aplicando.</p>
          {!loading && !error && hasCourses ? (
            <p className="courses-count">{courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}</p>
          ) : null}
        </div>
      </section>

      <section className="courses-main">
        <div className="site-container">
          <div className="courses-toolbar">
            <div className="courses-search">
              <Search size={18} aria-hidden="true" className="courses-search-icon" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar cursos"
                aria-label="Buscar cursos"
                className="courses-search-input"
              />
            </div>
            {isAuthenticated ? (
              <div className="courses-filters" role="group" aria-label="Filtrar cursos">
                {FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                    className={`courses-filter ${filter === key ? 'courses-filter-active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="courses-grid" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((index) => <div key={index} className="course-card course-card-skeleton" />)}
            </div>
          ) : null}

          {error ? <Message tone="error">{error}</Message> : null}

          {!loading && !error && !hasCourses ? (
            <div className="courses-empty">
              <EmptyState icon={BookOpen} title="No hay cursos disponibles todavía." description="Vuelve pronto para descubrir nuevos contenidos." />
            </div>
          ) : null}

          {!loading && !error && hasCourses && visible.length === 0 ? (
            <div className="courses-empty">
              <EmptyState icon={Search} title="No encontramos cursos" description="Prueba con otra búsqueda o cambia el filtro." action={<Button variant="secondary" onClick={resetFilters}>Limpiar filtros</Button>} />
            </div>
          ) : null}

          {!loading && !error && visible.length > 0 ? (
            <ul className="courses-grid">
              {visible.map((course, index) => (
                <li key={course.id}>
                  <CourseCard
                    course={course}
                    index={index}
                    isAuthenticated={isAuthenticated}
                    enrolled={Boolean(course.enrolled)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
