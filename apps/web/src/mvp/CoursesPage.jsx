import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Message } from '../components/ui/Message';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from './api';
import { useAuth } from './AuthContext';

export function CoursesPage() {
  const { user } = useAuth();
  const teacher = user.role === 'teacher';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api('/courses').then(({ courses: data }) => { if (active) setCourses(data); })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <>
    <PageHeader title={teacher ? 'Mis cursos' : 'Cursos disponibles'} description={teacher ? 'Crea cursos y prepara sus simulaciones.' : 'Inscríbete en un curso para ver sus simulaciones.'} actions={teacher && <Button to="/docente/cursos/nuevo">Crear curso</Button>} />
    <Section>
      {loading && <p role="status">Cargando cursos…</p>}
      {error && <Message tone="error">{error}</Message>}
      {!loading && !error && courses.length === 0 && <EmptyState title={teacher ? 'Todavía no tienes cursos' : 'Aún no hay cursos disponibles'} description={teacher ? 'Crea tu primer curso para añadir simulaciones.' : 'Vuelve cuando el profesorado publique un curso.'} action={teacher && <Button to="/docente/cursos/nuevo">Crear curso</Button>} />}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => <Card key={course.id}>
          <CardBody className="flex h-full flex-col">
            <div className="flex flex-wrap gap-2">
              <StatusBadge variant={course.published ? 'success' : 'warning'}>{course.published ? 'Publicado' : 'No publicado'}</StatusBadge>
              {!teacher && course.enrolled && <StatusBadge variant="info">Inscrito</StatusBadge>}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-navy">{course.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.description || 'Sin descripción.'}</p>
            {!teacher && <p className="mt-3 text-xs text-slate-500">Docente: {course.teacherName}</p>}
            <Link className="mt-5 text-sm font-semibold text-action underline" to={teacher ? `/docente/cursos/${course.id}` : `/estudiante/cursos/${course.id}`}>Ver curso</Link>
          </CardBody>
        </Card>)}
      </div>
    </Section>
  </>;
}
