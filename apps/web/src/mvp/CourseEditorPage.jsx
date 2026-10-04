import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionNarrow } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { CheckboxField, TextAreaField, TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { api } from './api';

export function CourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', description: '', published: true });
  const [loading, setLoading] = useState(Boolean(courseId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!courseId) return;
    let active = true;
    api(`/courses/${courseId}`).then(({ course }) => { if (active) setValues({ title: course.title, description: course.description, published: course.published }); })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId]);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { course } = await api(courseId ? `/courses/${courseId}` : '/courses', { method: courseId ? 'PATCH' : 'POST', body: JSON.stringify(values) });
      navigate(`/docente/cursos/${course.id}`);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };
  return <>
    <PageHeader title={courseId ? 'Editar curso' : 'Nuevo curso'} description="Define el espacio donde estarán tus simulaciones." />
    <SectionNarrow>
      {loading ? <p role="status">Cargando curso…</p> : <Card><CardBody>
        <form onSubmit={submit} className="space-y-5">
          {error && <Message tone="error">{error}</Message>}
          <TextField label="Título" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} minLength={3} maxLength={200} required />
          <TextAreaField label="Descripción" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} maxLength={5000} rows={5} />
          <CheckboxField label="Curso disponible para estudiantes" checked={values.published} onChange={(event) => setValues({ ...values, published: event.target.checked })} />
          <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar curso'}</Button><Button to={courseId ? `/docente/cursos/${courseId}` : '/docente'} variant="secondary">Cancelar</Button></div>
        </form>
      </CardBody></Card>}
    </SectionNarrow>
  </>;
}
