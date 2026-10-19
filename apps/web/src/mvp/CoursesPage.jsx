import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Apple, ArrowRight, BookOpen, Brain, FlaskConical, HeartPulse, Microscope, Salad, Search, UserRound } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Message } from '../components/ui/Message';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from './api';
import { useAuth } from './AuthContext';

/* Cada tarjeta recibe un tono y un icono según su posición: determinista y
 * estable entre renders, sin aleatoriedad ni datos que el curso no tenga. */
const VISUAL_TONES = ['course-card-visual-green', 'course-card-visual-blue', 'course-card-visual-cream', 'course-card-visual-teal'];
const VISUAL_ICONS = [BookOpen, FlaskConical, Apple, Activity, Microscope, Brain, Salad, HeartPulse];

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'enrolled', label: 'Inscritos' },
  { key: 'available', label: 'Disponibles' },
];

function CourseCard({ course, index, isAuthenticated, enrolled }) {
  const Icon = VISUAL_ICONS[index % VISUAL_ICONS.length];
  const tone = VISUAL_TONES[index % VISUAL_TONES.length];
  const detailPath = `/estudiante/cursos/${course.id}`;
  const action = !isAuthenticated
    ? { to: '/acceso', label: 'Ver curso', solid: false }
    : enrolled
      ? { to: detailPath, label: 'Continuar curso', solid: true }
      : { to: detailPath, label: 'Ver curso', solid: false };

  return (
    <article className={`course-card ${enrolled ? 'course-card-enrolled' : ''}`}>
      <div className={`course-card-visual ${tone}`} aria-hidden="true">
        <span className="course-card-orb" />
        <Icon size={44} strokeWidth={1.5} className="course-card-icon" />
      </div>
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

export function CoursesPage() {
  const { user } = useAuth();
  const teacher = user?.role === 'teacher';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

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

  // El docente conserva su panel de gestión; el catálogo público es para el
  // visitante y para el estudiante, con una única implementación.
  if (teacher) {
    return <>
      <PageHeader title="Mis cursos" description="Crea cursos y prepara sus simulaciones." actions={<Button to="/docente/cursos/nuevo">Crear curso</Button>} />
      <Section>
        {loading && <p role="status">Cargando cursos…</p>}
        {error && <Message tone="error">{error}</Message>}
        {!loading && !error && courses.length === 0 && <EmptyState title="Todavía no tienes cursos" description="Crea tu primer curso para añadir simulaciones." action={<Button to="/docente/cursos/nuevo">Crear curso</Button>} />}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => <Card key={course.id}>
            <CardBody className="flex h-full flex-col">
              <div className="flex flex-wrap gap-2">
                <StatusBadge variant={course.published ? 'success' : 'warning'}>{course.published ? 'Publicado' : 'No publicado'}</StatusBadge>
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#173b6c]">{course.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[#5c6f82]">{course.description || 'Sin descripción.'}</p>
              <Link className="mt-5 text-sm font-semibold text-[#2b8537] underline underline-offset-4 hover:text-[#237a32]" to={`/docente/cursos/${course.id}`}>Ver curso</Link>
            </CardBody>
          </Card>)}
        </div>
      </Section>
    </>;
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
