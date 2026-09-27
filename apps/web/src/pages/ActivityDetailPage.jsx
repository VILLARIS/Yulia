import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ListChecks, MessagesSquare, Target, TriangleAlert } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionNarrow } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { DefinitionList } from '../components/ui/DefinitionList';
import { DemoNotice } from '../components/ui/DemoNotice';
import { EmptyState } from '../components/ui/EmptyState';
import { RichText } from '../components/ui/RichText';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { LEVEL_LABELS } from '../data/demoData';
import { countWords, formatDate } from '../utils/format';

export function ActivityDetailPage() {
  const { activityId } = useParams();
  const { getActivity, notice } = useDemoWorkspace();
  const activity = getActivity(activityId);

  useEffect(() => {
    document.title = activity
      ? `${activity.title} · Bioquímica Nutricional`
      : 'Escenario no encontrado · Bioquímica Nutricional';
  }, [activity]);

  if (!activity) {
    return (
      <>
        <PageHeader
          title="Escenario no encontrado"
          description="La actividad solicitada no existe o ya no está disponible."
          breadcrumbs={[{ label: 'Inicio', to: APP_ROUTES.home }, { label: 'Simulaciones', to: APP_ROUTES.simulations }]}
        />
        <SectionNarrow>
          <EmptyState
            icon={TriangleAlert}
            title="No encontramos esta actividad"
            description="Vuelve al catálogo para ver los escenarios disponibles en esta versión."
            action={
              <Button to={APP_ROUTES.simulations} icon={ArrowLeft}>
                Volver al catálogo
              </Button>
            }
          />
        </SectionNarrow>
      </>
    );
  }

  const simulationPath = buildPath(APP_ROUTES.simulation, { activityId: activity.id });

  return (
    <>
      <PageHeader
        title={activity.title}
        description={activity.summary}
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Simulaciones', to: APP_ROUTES.simulations },
          { label: activity.topic },
        ]}
        actions={
          <Button to={simulationPath} icon={ArrowRight} iconPosition="end">
            Abrir el simulador
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge variant="neutral">{activity.subject}</StatusBadge>
          {activity.difficulty ? (
            <StatusBadge variant="neutral">{LEVEL_LABELS[activity.difficulty]}</StatusBadge>
          ) : null}
          <StatusBadge variant="neutral">Versión {activity.version}</StatusBadge>
        </div>
      </PageHeader>

      <SectionNarrow>
        <DemoNotice {...notice} className="mb-8" />

        <div className="space-y-6">
          <Card>
            <CardHeader title="Situación" description="El caso con el que se abre la conversación." />
            <CardBody>
              <RichText content={activity.scenario} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Reto de razonamiento"
              description="Qué se espera que la persona estudiante sea capaz de sostener por escrito."
            />
            <CardBody>
              <RichText content={activity.challenge} />
            </CardBody>
          </Card>

          {activity.objectives?.length > 0 ? (
            <Card>
              <CardHeader
                title="Objetivos de la actividad"
                description="Redactados por el profesorado para esta actividad."
                level="h2"
              />
              <CardBody>
                <ul className="space-y-3">
                  {activity.objectives.map((objective) => (
                    <li key={objective} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <Target size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-action" />
                      <span className="min-w-0">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}

          {activity.tutorInstructions ? (
            <Card>
              <CardHeader
                title="Instrucciones de tutoría"
                description="Cómo debe comportarse quien acompaña la conversación."
                level="h2"
                actions={
                  <StatusBadge variant="info">
                    <MessagesSquare size={13} aria-hidden="true" className="mr-1" />
                    {countWords(activity.tutorInstructions)} palabras
                  </StatusBadge>
                }
              />
              <CardBody>
                <RichText content={activity.tutorInstructions} />
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Instrucciones de tutoría" level="h2" />
              <CardBody>
              <EmptyState
                compact
                icon={ListChecks}
                title="Esta actividad aún no tiene instrucciones"
                description="La docente puede añadirlas desde el editor del espacio docente."
              />
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Ficha de la actividad" level="h2" />
            <CardBody>
              <DefinitionList
                items={[
                  { term: 'Área', value: activity.subject },
                  { term: 'Tema', value: activity.topic },
                  {
                    term: 'Nivel',
                    value: LEVEL_LABELS[activity.difficulty] ?? 'Sin definir',
                  },
                  { term: 'Autoría', value: activity.author },
                  { term: 'Versión', value: `v${activity.version}` },
                  { term: 'Actualizada', value: formatDate(activity.updatedAt) },
                  {
                    term: 'Duración estimada',
                    value:
                      activity.estimatedTime ??
                      'Por definir con el profesorado',
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to={APP_ROUTES.simulations} variant="secondary" icon={ArrowLeft}>
            Volver al catálogo
          </Button>
          <Button to={simulationPath} icon={ArrowRight} iconPosition="end">
            Abrir el simulador
          </Button>
        </div>
      </SectionNarrow>
    </>
  );
}
