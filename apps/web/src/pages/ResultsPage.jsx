import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck, Lightbulb, ListChecks, MessageSquareText, Target, TriangleAlert } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionNarrow } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { DemoNotice } from '../components/ui/DemoNotice';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs } from '../components/ui/Tabs';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';

export function ResultsPage() {
  const { activityId } = useParams();
  const { getActivity, getResult, getConversation, notice } = useDemoWorkspace();
  const activity = getActivity(activityId);
  const result = getResult(activityId);
  const conversation = getConversation(activityId);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    document.title = activity
      ? `Resultados · ${activity.title}`
      : 'Resultados · Bioquímica Nutricional';
  }, [activity]);

  if (!activity) {
    return (
      <>
        <PageHeader
          title="Resultados no disponibles"
          breadcrumbs={[{ label: 'Inicio', to: APP_ROUTES.home }, { label: 'Simulaciones', to: APP_ROUTES.simulations }]}
        />
        <SectionNarrow>
          <EmptyState
            icon={TriangleAlert}
            title="No encontramos esta actividad"
            description="La actividad solicitada no existe o no está publicada en esta demostración."
            action={
              <Button to={APP_ROUTES.simulations} variant="secondary" icon={ArrowLeft}>
                Volver al catálogo
              </Button>
            }
          />
        </SectionNarrow>
      </>
    );
  }

  const hasResult = Boolean(result);

  return (
    <>
      <PageHeader
        title="Resultados y retroalimentación"
        description={activity.title}
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Mis actividades', to: APP_ROUTES.studentActivities },
          { label: 'Resultados' },
        ]}
        actions={
          <>
            <Button
              to={buildPath(APP_ROUTES.studentActivityDetail, { activityId: activity.id })}
              variant="secondary"
              icon={ArrowLeft}
            >
              Volver a la actividad
            </Button>
            <Button to={buildPath(APP_ROUTES.simulation, { activityId: activity.id })} variant="secondary">
              Abrir el simulador
            </Button>
          </>
        }
      >
        <StatusBadge variant="info">Lectura de muestra, sin nota</StatusBadge>
      </PageHeader>

      <SectionNarrow>
        <DemoNotice {...notice} className="mb-8" />

        {hasResult ? (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Valoración del profesorado"
                description="Lectura cualitativa del razonamiento, sin puntuación numérica."
                level="h2"
              />
              <CardBody>
                <p className="text-base leading-8 text-slate-700">{result.overallComment}</p>
                {result.teacherComment ? (
                  <div className="mt-5 flex gap-3 border-t border-slate-100 pt-5">
                    <MessageSquareText size={17} aria-hidden="true" className="mt-1 shrink-0 text-action" />
                    <div>
                      <p className="text-sm font-semibold text-navy">Nota de la sesión</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{result.teacherComment}</p>
                    </div>
                  </div>
                ) : null}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="En qué te apoyaste" description="Aspectos que la muestra señala como logrados." level="h2" />
              <CardBody>
                <ul className="space-y-3">
                  {result.strengths.map((strength) => (
                    <li key={strength} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <CircleCheck size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
                      <span className="min-w-0">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Dónde seguir trabajando" description="Sugerencias de mejora para la siguiente sesión." level="h2" />
              <CardBody>
                <ul className="space-y-3">
                  {result.improvementAreas.map((area) => (
                    <li key={area} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <Lightbulb size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />
                      <span className="min-w-0">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Criterios de evaluación"
                description="Esta sección se adapta cuando el profesorado defina la rúbrica."
                level="h2"
              />
              <CardBody>
                <EmptyState
                  compact
                  icon={ListChecks}
                  title="Rúbrica pendiente de definir"
                  description="La plataforma no calcula notas. Cuando la docente defina los criterios y su ponderación, aparecerán aquí sin necesidad de rehacer esta pantalla."
                />
              </CardBody>
            </Card>

            {result.transcriptAvailable && conversation.length > 0 ? (
              <Card>
                <CardHeader
                  title="Transcripción de la sesión"
                  description={`${conversation.length} mensajes de la conversación de ejemplo.`}
                  level="h2"
                  actions={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTranscriptOpen((open) => !open)}
                      aria-expanded={transcriptOpen}
                    >
                      {transcriptOpen ? 'Ocultar' : 'Ver'}
                    </Button>
                  }
                />
                {transcriptOpen ? (
                  <CardBody>
                    <ol className="space-y-4">
                      {conversation.map((message) => (
                        <li
                          key={message.id}
                          className={`rounded-lg border px-4 py-3 text-sm leading-6 ${
                            message.role === 'tutor'
                              ? 'border-slate-200 bg-slate-50'
                              : 'border-blue-100 bg-blue-50/60'
                          }`}
                        >
                          <p className="text-xs font-semibold text-slate-500">
                            {message.role === 'tutor' ? 'Simulador' : 'Estudiante'}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-slate-700">{message.content}</p>
                        </li>
                      ))}
                    </ol>
                  </CardBody>
                ) : null}
              </Card>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            <EmptyState
              icon={Target}
              title="Todavía no hay resultados para esta actividad"
              description="La retroalimentación se genera al finalizar una conversación. En esta versión de demostración solo hay una actividad con lectura de ejemplo."
              action={
                <Button to={APP_ROUTES.studentActivities} variant="secondary">
                  Ver mis actividades
                </Button>
              }
            />
            <Card>
              <CardHeader title="Cómo se completará esta pantalla" level="h2" />
              <CardBody>
                <Tabs
                  ariaLabel="Ejemplo de criterios futuros"
                  tabs={[
                    { id: 'criterio', label: 'Ejemplo de criterio' },
                    { id: 'evidencia', label: 'Evidencia' },
                  ]}
                >
                  {(activeId) =>
                    activeId === 'criterio' ? (
                      <p className="text-sm leading-7 text-slate-600">
                        Cada criterio se almacenará con su etiqueta y su ponderación. El nombre
                        del criterio proviene del archivo de rúbrica, de modo que añadir un
                        criterio nuevo no obliga a modificar esta pantalla.
                      </p>
                    ) : (
                      <p className="text-sm leading-7 text-slate-600">
                        Cada puntuación irá acompañada del fragmento de la conversación que la
                        sostiene, para que la persona estudiante pueda revisar el fundamento de la
                        valoración en lugar de recibir un número sin explicación.
                      </p>
                    )
                  }
                </Tabs>
              </CardBody>
            </Card>
          </div>
        )}
      </SectionNarrow>
    </>
  );
}
