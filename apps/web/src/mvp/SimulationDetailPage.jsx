import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionNarrow } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Message } from '../components/ui/Message';
import { RichText } from '../components/ui/RichText';
import { TextAreaField, TextField } from '../components/ui/Field';
import { api } from './api';
import { useAuth } from './AuthContext';
import { clearGeminiKey, getGeminiKey, setGeminiKey } from './geminiKey';

export function SimulationDetailPage() {
  const { simulationId } = useParams();
  const { user } = useAuth();
  const [simulation, setSimulation] = useState(null);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [key, setKey] = useState(() => getGeminiKey(user?.id));
  const [keyDraft, setKeyDraft] = useState('');
  const [editingKey, setEditingKey] = useState(!getGeminiKey(user?.id));
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);
  useEffect(() => {
    let active = true;
    Promise.all([api(`/simulations/${simulationId}`), api(`/simulations/${simulationId}/session`)])
      .then(([detail, conversation]) => {
        if (!active) return;
        setSimulation(detail.simulation);
        setSession(conversation.session);
        setMessages(conversation.messages);
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [simulationId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages.length]);

  async function testKey(event) {
    event.preventDefault();
    if (!keyDraft.trim()) return setError('Introduce tu API key de Gemini.');
    setBusy(true); setError(''); setNotice('');
    try {
      await api('/gemini/test', { method: 'POST', body: JSON.stringify({ apiKey: keyDraft.trim() }) });
      setGeminiKey(user.id, keyDraft.trim()); setKey(keyDraft.trim()); setKeyDraft('');
      setEditingKey(false); setNotice('Gemini conectado correctamente.');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }

  function removeKey() {
    clearGeminiKey(); setKey(''); setKeyDraft(''); setEditingKey(true); setNotice(''); setError('');
  }

  async function start() {
    if (!key) return setError('Configura tu API key de Gemini primero.');
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api(`/simulations/${simulationId}/sessions`, { method: 'POST', body: JSON.stringify({ apiKey: key }) });
      setSession(result.session); setMessages(result.messages);
    } catch (cause) {
      if (cause.status === 409) {
        try {
          const result = await api(`/simulations/${simulationId}/session`);
          setSession(result.session); setMessages(result.messages);
        } catch (reloadError) { setError(reloadError.message); }
      } else setError(cause.message);
    } finally { setBusy(false); }
  }

  async function send(event) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;
    if (!key) return setError('Configura tu API key de Gemini para continuar.');
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api(`/sessions/${session.id}/messages`, { method: 'POST', body: JSON.stringify({
        apiKey: key, content, expectedLastSequence: messages.at(-1)?.sequenceNumber ?? 0,
      }) });
      setMessages((current) => [...current, ...result.messages]); setDraft('');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }

  if (loading) return <SectionNarrow><p role="status">Cargando simulación…</p></SectionNarrow>;
  if (!simulation) return <SectionNarrow><Message tone="error">{error || 'Simulación no disponible'}</Message></SectionNarrow>;
  return <>
    <PageHeader title={simulation.title} description="Simulación del curso" actions={<Button to={`/estudiante/cursos/${simulation.courseId}`} variant="secondary">Volver al curso</Button>} />
    <SectionNarrow className="space-y-6">
      <Card><CardHeader title="Escenario" /><CardBody><RichText content={simulation.scenario} /></CardBody></Card>
      <Card><CardHeader title="Objetivo" /><CardBody><RichText content={simulation.objective} /></CardBody></Card>
      <Card><CardHeader title="Gemini" /><CardBody className="space-y-4">
        {editingKey ? <form onSubmit={testKey} className="space-y-4">
          <TextField label="API key de Gemini" type="password" autoComplete="off" value={keyDraft} onChange={(event) => { setKeyDraft(event.target.value); setError(''); }} hint="Se conserva solo en esta pestaña y se elimina al cerrar sesión." />
          <Button type="submit" disabled={busy || !keyDraft.trim()}>{busy ? 'Probando conexión…' : 'Probar conexión'}</Button>
          {key ? <Button variant="ghost" onClick={() => setEditingKey(false)}>Cancelar</Button> : null}
        </form> : <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-emerald-700">Gemini conectado correctamente</span>
          <Button size="sm" variant="ghost" onClick={() => { setEditingKey(true); setNotice(''); }}>Cambiar API key</Button>
          <Button size="sm" variant="ghost" onClick={removeKey}>Eliminar de esta sesión</Button>
        </div>}
      </CardBody></Card>
      {notice ? <Message tone="success">{notice}</Message> : null}
      {error ? <Message tone="error">{error} {session && draft.trim() ? 'Puedes reintentar el envío.' : null}</Message> : null}
      {!session ? <Card><CardHeader title="Conversación" /><CardBody>
        <p className="mb-4 text-sm text-slate-600">Gemini iniciará el diálogo a partir del caso de la docente.</p>
        <Button disabled={!key || busy} onClick={start}>{busy ? 'Gemini está respondiendo…' : 'Iniciar simulación'}</Button>
      </CardBody></Card> : <Card><CardHeader title="Conversación" /><CardBody className="space-y-5">
        <div role="log" aria-label="Conversación de la simulación" className="space-y-3">
          {messages.map((message) => <div key={message.id} className={`rounded-lg px-4 py-3 ${message.role === 'student' ? 'ml-8 bg-blue-50' : 'mr-8 bg-slate-100'}`}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{message.role === 'student' ? 'Estudiante' : 'Tutor'}</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-navy">{message.content}</p>
          </div>)}
          {busy ? <p role="status" className="text-sm text-slate-600">Gemini está respondiendo…</p> : null}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="space-y-3">
          <TextAreaField label="Tu respuesta" rows={3} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
          }} hint="Enter para enviar; Shift+Enter para una nueva línea." counter={`${draft.length}/4000`} disabled={busy || !key} />
          <Button type="submit" disabled={busy || !key || !draft.trim()}>{busy ? 'Esperando respuesta…' : 'Enviar'}</Button>
        </form>
      </CardBody></Card>}
    </SectionNarrow>
  </>;
}
