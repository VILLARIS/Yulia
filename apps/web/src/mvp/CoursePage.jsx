import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Message } from '../components/ui/Message';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from './api';
import { useAuth } from './AuthContext';

export function CoursePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const teacher = user.role === 'teacher';
  const [course, setCourse] = useState(null);
  const [simulations, setSimulations] = useState([]);
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
        if (active) setSimulations(list);
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
      setCourse({ ...course, enrolled: true }); setSimulations(list);
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

  if (loading) return <Section><p role="status">Cargando curso…</p></Section>;
  if (!course) return <Section><Message tone="error">{error || 'Curso no encontrado'}</Message></Section>;
  return <>
    <PageHeader title={course.title} description={course.description || 'Sin descripción.'} breadcrumbs={[{ label: teacher ? 'Mis cursos' : 'Cursos', to: teacher ? '/docente' : '/estudiante' }, { label: course.title }]} actions={teacher && <><Button to={`/docente/cursos/${course.id}/editar`} variant="secondary">Editar curso</Button><Button to={`/docente/cursos/${course.id}/simulaciones/nueva`}>Crear simulación</Button></>}>
      <StatusBadge variant={course.published ? 'success' : 'warning'}>{course.published ? 'Curso publicado' : 'Curso no publicado'}</StatusBadge>
    </PageHeader>
    <Section>
      {error && <Message tone="error" className="mb-6">{error}</Message>}
      {!teacher && !course.enrolled ? <Card><CardBody><h2 className="text-lg font-semibold text-navy">Entrar al curso</h2><p className="mt-2 text-sm text-slate-600">Inscríbete para consultar las simulaciones publicadas.</p><Button onClick={enroll} disabled={busy} className="mt-5">{busy ? 'Inscribiendo…' : 'Inscribirme'}</Button></CardBody></Card> : <>
        <h2 className="mb-5 text-2xl font-semibold text-navy">Simulaciones</h2>
        {simulations.length === 0 && <EmptyState title="Aún no hay simulaciones visibles" description={teacher ? 'Crea la primera simulación dentro de este curso.' : 'La docente todavía no ha publicado simulaciones.'} />}
        <div className="grid gap-5 md:grid-cols-2">
          {simulations.map((simulation) => <Card key={simulation.id}><CardBody>
            <div className="mb-3"><StatusBadge variant={simulation.published ? 'success' : 'warning'}>{simulation.published ? 'Publicada' : 'Borrador'}</StatusBadge></div>
            <h3 className="text-lg font-semibold text-navy">{simulation.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{simulation.objective}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {teacher ? <><Link className="text-sm font-semibold text-action underline" to={`/docente/simulaciones/${simulation.id}/editar`}>Editar</Link><Button size="sm" variant="secondary" disabled={busy} onClick={() => toggle(simulation)}>{simulation.published ? 'Despublicar' : 'Publicar'}</Button></> : <Link className="text-sm font-semibold text-action underline" to={`/estudiante/simulaciones/${simulation.id}`}>Abrir simulación</Link>}
            </div>
          </CardBody></Card>)}
        </div>
      </>}
    </Section>
  </>;
}
