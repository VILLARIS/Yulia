import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionNarrow } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { CheckboxField, TextAreaField, TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { api } from './api';

export function SimulationEditorPage() {
  const { courseId, simulationId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', scenario: '', objective: '', tutorInstructions: '', published: false });
  const [parentId, setParentId] = useState(courseId);
  const [loading, setLoading] = useState(Boolean(simulationId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!simulationId) return;
    let active = true;
    api(`/simulations/${simulationId}`).then(({ simulation }) => {
      if (active) { setValues({ title: simulation.title, scenario: simulation.scenario, objective: simulation.objective, tutorInstructions: simulation.tutorInstructions, published: simulation.published }); setParentId(simulation.courseId); }
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

  return <>
    <PageHeader title={simulationId ? 'Editar simulación' : 'Nueva simulación'} description="Prepara el caso, el objetivo y las instrucciones que guiarán al tutor Gemini." />
    <SectionNarrow>
      {loading ? <p role="status">Cargando simulación…</p> : <Card><CardBody><form onSubmit={submit} className="space-y-5">
        {error && <Message tone="error">{error}</Message>}
        <TextField label="Título" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} minLength={3} maxLength={200} required />
        <TextAreaField label="Escenario" value={values.scenario} onChange={(event) => setValues({ ...values, scenario: event.target.value })} minLength={10} maxLength={20000} rows={6} required />
        <TextAreaField label="Objetivo" value={values.objective} onChange={(event) => setValues({ ...values, objective: event.target.value })} minLength={3} maxLength={5000} rows={3} required />
        <TextAreaField label="Instrucciones del tutor" hint="Solo visibles para el docente; se envían a Gemini como contexto de la simulación." value={values.tutorInstructions} onChange={(event) => setValues({ ...values, tutorInstructions: event.target.value })} minLength={3} maxLength={20000} rows={6} required />
        <CheckboxField label="Publicar simulación" checked={values.published} onChange={(event) => setValues({ ...values, published: event.target.checked })} />
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar simulación'}</Button><Button to={`/docente/cursos/${parentId}`} variant="secondary">Cancelar</Button></div>
      </form></CardBody></Card>}
    </SectionNarrow>
  </>;
}
