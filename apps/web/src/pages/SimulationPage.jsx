import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CircleSlash,
  Info,
  MessagesSquare,
  ScrollText,
  SendHorizonal,
  TriangleAlert,
} from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { RichText } from '../components/ui/RichText';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { Tabs } from '../components/ui/Tabs';
import { YuliaAvatar } from '../components/brand/YuliaAvatar';
import { countWords } from '../utils/format';

const MAX_INPUT = 2000;

/** Paneles de contexto del simulador, con el mismo comportamiento de teclado. */
const CONTEXT_TABS = [
  { id: 'scenario', label: 'Escenario' },
  { id: 'instructions', label: 'Instrucciones' },
];

/**
 * Burbuja de mensaje. La diferenciación visual nunca sustituye al texto: el rol
 * se anuncia con la etiqueta («Simulador» / «Tú»), no solo con el color. El avatar
 * de Yulia identifica a quien acompaña la conversación sin ocupar espacio.
 */
function MessageBubble({ message, studentInitials }) {
  const isTutor = message.role === 'tutor';
  return (
    <li className={`flex gap-3 ${isTutor ? '' : 'flex-row-reverse'}`}>
      {isTutor ? (
        <YuliaAvatar size="sm" className="mt-0.5" />
      ) : (
        <span
          aria-hidden="true"
          className="mt-1 grid size-9 shrink-0 place-items-center rounded-lg bg-blue-100 text-xs font-bold text-action"
        >
          {studentInitials}
        </span>
      )}

      <div className={`min-w-0 max-w-[min(46rem,88%)] ${isTutor ? '' : 'text-right'}`}>
        <p className={`flex flex-wrap items-baseline gap-x-2 text-xs text-slate-500 ${isTutor ? '' : 'justify-end'}`}>
          <span className="font-semibold text-slate-700">{isTutor ? 'Simulador' : 'Tú'}</span>
          {message.at ? <span>{message.at}</span> : null}
          {message.pending ? (
            <StatusBadge variant="warning" className="ml-1">
              Sin respuesta
            </StatusBadge>
          ) : null}
        </p>
        <div
          className={`mt-1.5 rounded-panel border px-4 py-3 text-left ${
            isTutor
              ? 'border-slate-200 bg-white'
              : 'border-blue-200 bg-blue-50/70'
          }`}
        >
          <RichText content={message.content} />
        </div>
      </div>
    </li>
  );
}

export function SimulationPage() {
  const { activityId } = useParams();
  const { getActivity, getConversation, notice, student } = useDemoWorkspace();
  const activity = getActivity(activityId);
  const demoConversation = getConversation(activityId);

  const [draft, setDraft] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const scrollRef = useRef(null);
  const composerRef = useRef(null);
  const sentCount = useRef(0);

  const messages = [...demoConversation, ...localMessages];

  useEffect(() => {
    document.title = activity
      ? `Simulador · ${activity.title}`
      : 'Simulador · Bioquímica Nutricional';
  }, [activity]);

  /**
   * Solo se desplaza el área de conversación cuando la persona escribe, nunca al
   * entrar en la pantalla: en ese momento interesa leer el escenario desde arriba.
   */
  useEffect(() => {
    const isNewMessage = localMessages.length > sentCount.current;
    sentCount.current = localMessages.length;
    if (!isNewMessage) return;

    const container = scrollRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [localMessages.length]);

  if (!activity) {
    return (
      <SectionFrame>
        <EmptyState
          icon={TriangleAlert}
          title="No hay ningún escenario asociado a esta dirección"
          description="Vuelve al catálogo y abre una actividad publicada para ver su simulador."
          action={
            <Button to={APP_ROUTES.simulations} icon={ArrowLeft}>
              Volver al catálogo
            </Button>
          }
        />
      </SectionFrame>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setLocalMessages((current) => [
      ...current,
      {
        id: `local-${current.length + 1}`,
        role: 'student',
        at: 'ahora',
        content,
        pending: true,
      },
    ]);
    setDraft('');
    composerRef.current?.focus();
  };

  const remaining = MAX_INPUT - draft.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Button
            to={buildPath(APP_ROUTES.activityDetail, { activityId: activity.id })}
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            className="-ml-3"
          >
            Volver al escenario
          </Button>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-navy lg:text-3xl">
            {activity.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{activity.topic}</p>
        </div>
        <StatusBadge variant="info" dot>
          Sesión de demostración
        </StatusBadge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="flex min-h-[34rem] flex-col overflow-hidden lg:min-h-[42rem]">
          <CardHeader
            title="Conversación"
            description="Los mensajes de ejemplo muestran cómo se leerá el intercambio en cada turno."
            actions={
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <MessagesSquare size={14} aria-hidden="true" />
                {messages.length} mensajes
              </span>
            }
          />

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length > 0 ? (
              <ul className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} studentInitials={student.initials} />
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={ScrollText}
                title="Todavía no hay conversación en esta actividad"
                description="Es una actividad creada en esta sesión de demostración y no tiene historial de ejemplo."
              />
            )}

            {localMessages.length > 0 ? (
              <div
                role="note"
                className="mt-6 flex gap-3 rounded-panel border border-dashed border-amber-300 bg-amber-50/70 px-4 py-3"
              >
                <CircleSlash size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />
                <p className="text-sm leading-6 text-slate-700">
                  Tus mensajes se han añadido solo en esta pestaña para comprobar el
                  comportamiento de la interfaz. <strong>No se envía nada a ningún servicio</strong>{' '}
                  y el simulador no produce respuestas: el texto de la derecha está escrito en el
                  propio código como ejemplo.
                </p>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-6"
            aria-label="Redactar mensaje para la conversación"
          >
            <label htmlFor="simulador-mensaje" className="text-sm font-semibold text-navy">
              Tu mensaje
            </label>
            <textarea
              id="simulador-mensaje"
              ref={composerRef}
              rows={3}
              value={draft}
              maxLength={MAX_INPUT}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              placeholder="Escribe tu razonamiento. En esta versión no se enviará a ningún servicio."
              aria-describedby="simulador-ayuda"
              className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base leading-6 text-navy placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p id="simulador-ayuda" className="text-xs leading-5 text-slate-500">
                <span className="font-medium">Ctrl</span> + <span className="font-medium">Enter</span> para
                enviar. Quedan {remaining} caracteres.
              </p>
              <Button type="submit" icon={SendHorizonal} disabled={draft.trim() === ''}>
                Añadir mensaje
              </Button>
            </div>
          </form>
        </Card>

        <aside className="space-y-4" aria-label="Información de la actividad">
          <Tabs
            variant="segmented"
            ariaLabel="Paneles de contexto"
            tabs={CONTEXT_TABS}
            panelClassName="space-y-4"
          >
            {(activePanel) => (
              <>
                {activePanel === 'scenario' ? (
                  <Card>
                    <CardHeader title="Situación" level="h2" />
                    <CardBody>
                      <RichText content={activity.scenario} className="text-sm" />
                      {activity.challenge ? (
                        <div className="mt-5 border-t border-slate-100 pt-5">
                          <h3 className="text-sm font-semibold text-navy">Reto de razonamiento</h3>
                          <RichText content={activity.challenge} className="mt-2 text-sm" />
                        </div>
                      ) : null}
                    </CardBody>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader title="Instrucciones de tutoría" level="h2" />
                    <CardBody>
                      {activity.tutorInstructions ? (
                        <>
                          <RichText content={activity.tutorInstructions} className="text-sm" />
                          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                            <Info size={13} aria-hidden="true" />
                            {countWords(activity.tutorInstructions)} palabras
                          </p>
                        </>
                      ) : (
                        <EmptyState compact title="Sin instrucciones" description="Esta actividad no define aún cómo debe comportarse el simulador." />
                      )}
                    </CardBody>
                  </Card>
                )}

                {activity.objectives?.length > 0 ? (
                  <Card>
                    <CardHeader title="Objetivos" level="h2" />
                    <CardBody>
                      <ul className="space-y-2.5">
                        {activity.objectives.map((objective) => (
                          <li key={objective} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-action" />
                            <span className="min-w-0">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                ) : null}

                <div
                  role="note"
                  className="flex gap-3 rounded-panel border border-blue-100 bg-blue-50/70 px-4 py-3"
                >
                  <Info size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-action" />
                  <p className="text-xs leading-5 text-slate-700">{notice.message}</p>
                </div>
              </>
            )}
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function SectionFrame({ children }) {
  return <div className="mx-auto w-full max-w-3xl px-5 py-16">{children}</div>;
}
