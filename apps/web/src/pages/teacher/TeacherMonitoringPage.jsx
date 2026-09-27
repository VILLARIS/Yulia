import { useEffect, useMemo, useState } from 'react';
import { Eye, Radio, RefreshCw, TriangleAlert } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { SelectField } from '../../components/ui/Field';
import { Message } from '../../components/ui/Message';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { DEMO_MONITORING } from '../../data/demoData';
import { formatDateTime } from '../../utils/format';

const EVENT_VARIANT = { info: 'info', warning: 'warning' };

export function TeacherMonitoringPage() {
  const { notice, monitoring, conversations, getActivity } = useDemoWorkspace();
  const { push } = useToast();
  const [activityId, setActivityId] = useState(DEMO_MONITORING.activityId);
  const [showTranscript, setShowTranscript] = useState(true);

  useEffect(() => {
    document.title = 'Seguimiento · Espacio docente';
  }, []);

  const session = useMemo(
    () => (activityId === DEMO_MONITORING.activityId ? monitoring : null),
    [activityId, monitoring],
  );
  const messages = session ? conversations[session.activityId]?.messages ?? [] : [];
  const activityTitle = getActivity(activityId)?.title ?? 'Actividad';

  return (
    <>
      <PageHeader
        title="Seguimiento de sesión"
        description="Vista de ejemplo para revisar el diseño del panel en vivo. No hay telemetría conectada."
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Espacio docente', to: APP_ROUTES.teacherDashboard },
          { label: 'Seguimiento' },
        ]}
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={() =>
              push({
                tone: 'info',
                title: 'Sin datos en vivo',
                description: 'No hay servicio de supervisión conectado, así que la vista no se actualiza.',
              })
            }
          >
            Actualizar
          </Button>
        }
      />

      <Section>
        <DemoNotice {...notice} className="mb-8" />

        <div className="mb-8 flex flex-wrap items-end gap-4">
          <SelectField
            label="Actividad"
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
            options={[
              { value: DEMO_MONITORING.activityId, label: activityTitle },
              { value: 'sin-sesion', label: 'Actividad sin sesión de ejemplo' },
            ]}
          />
          <p className="flex-1 text-sm text-slate-600">
            Solo existe una sesión de muestra. Las demás actividades se muestran sin sesión para
            comprobar el estado vacío.
          </p>
        </div>

        {session ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <Avatar
                      initials={session.student.initials}
                      name={session.student.name}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-navy">{session.student.name}</h2>
                        <StatusBadge variant="info" dot>
                          Sesión abierta
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {activityTitle} · {session.student.cohort}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Iniciada el {formatDateTime(session.startedAt)} · {session.lastSeenLabel}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Eventos de la sesión"
                  description="Registro ficticio para revisar la jerarquía del panel."
                  level="h2"
                  actions={
                    <StatusBadge variant="neutral">
                      <Radio size={12} aria-hidden="true" className="mr-1" />
                      {session.events.length} eventos
                    </StatusBadge>
                  }
                />
                <CardBody>
                  <ol className="space-y-0">
                    {session.events.map((event, index) => (
                      <li key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            aria-hidden="true"
                            className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                              event.kind === 'warning' ? 'bg-warning' : 'bg-action'
                            }`}
                          />
                          {index < session.events.length - 1 ? (
                            <span aria-hidden="true" className="w-px flex-1 bg-slate-200" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1 pb-5 last:pb-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-navy">{event.label}</p>
                            <StatusBadge variant={EVENT_VARIANT[event.kind] ?? 'neutral'}>
                              {event.at}
                            </StatusBadge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardBody>
              </Card>

              <Message tone="warning" title="Supervisión sin conexión">
                <p>
                  Esta pantalla no abre ningún canal con la sesión del estudiante. Los eventos y el
                  estado que aparecen son datos fijos de demostración.
                </p>
              </Message>
            </div>

            <Card className="flex flex-col">
              <CardHeader
                title="Conversación de la sesión"
                description="Los mismos mensajes que vería la persona estudiante en el simulador."
                level="h2"
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => setShowTranscript((value) => !value)}
                    aria-expanded={showTranscript}
                  >
                    {showTranscript ? 'Ocultar' : 'Mostrar'}
                  </Button>
                }
              />
              <CardBody className="flex-1">
                {showTranscript ? (
                  messages.length > 0 ? (
                    <ol className="space-y-4">
                      {messages.map((message) => (
                        <li
                          key={message.id}
                          className={
                            message.role === 'student'
                              ? 'ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-blue-50 px-4 py-3'
                              : 'mr-auto max-w-[85%] rounded-xl rounded-bl-sm bg-slate-100 px-4 py-3'
                          }
                        >
                          <p className="text-xs font-semibold text-slate-500">{message.author}</p>
                          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-navy">
                            {message.content}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <EmptyState
                      compact
                      title="Sin transcripción"
                      description="La muestra no incluye los mensajes de esta actividad."
                    />
                  )
                ) : (
                  <p className="text-sm text-slate-600">Transcripción oculta.</p>
                )}
              </CardBody>
            </Card>
          </div>
        ) : (
          <EmptyState
            icon={TriangleAlert}
            title="No hay sesión abierta para esta actividad"
            description="La muestra incluye una única sesión en directo, asociada a la actividad de glucemia en ayuno. Cuando exista el servicio de supervisión, esta pantalla mostrará las sesiones reales del grupo."
            action={
              <Button to={APP_ROUTES.teacherActivities} variant="secondary">
                Volver a actividades
              </Button>
            }
          />
        )}
      </Section>
    </>
  );
}
