import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, MessageSquareText, Sparkles } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionNarrow } from '../../components/layout/Section';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { DefinitionList } from '../../components/ui/DefinitionList';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { RichText } from '../../components/ui/RichText';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { LEVEL_LABELS, STUDENT_ACTIVITY_STATUS } from '../../data/demoData';
import { formatDate, truncate } from '../../utils/format';

/** Longitud del extracto de cada mensaje en la vista previa. */
const PREVIEW_LENGTH = 160;

export function StudentActivityDetailPage() {
  const { activityId } = useParams();
  const { getActivity, getResult, getConversation, studentActivityState, notice } = useDemoWorkspace();
  const activity = getActivity(activityId);
  const state = activity ? studentActivityState[activity.id] : null;
  const result = getResult(activityId);
  const conversation = getConversation(activityId);

  useEffect(() => {
    document.title = activity
      ? `${activity.title} · Actividad`
      : 'Actividad no encontrada · Bioquímica Nutricional';
  }, [activity]);

  if (!activity) {
    return (
      <>
        <PageHeader
          title="Actividad no encontrada"
          breadcrumbs={[
            { label: 'Inicio', to: APP_ROUTES.home },
            { label: 'Mis actividades', to: APP_ROUTES.studentActivities },
          ]}
        />
        <SectionNarrow>
          <EmptyState
            title="No encontramos esta actividad"
            description="Es posible que se trate de un borrador que todavía no está publicado."
            action={
              <Button to={APP_ROUTES.studentActivities} variant="secondary">
                Volver a mis actividades
              </Button>
            }
          />
        </SectionNarrow>
      </>
    );
  }

  const isCompleted = state?.status === STUDENT_ACTIVITY_STATUS.completed;
  const hasResult = Boolean(result);

  return (
    <>
      <PageHeader
        title={activity.title}
        description={activity.summary}
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Mis actividades', to: APP_ROUTES.studentActivities },
          { label: activity.topic },
        ]}
        actions={
          <>
            {hasResult ? (
              <Button
                to={buildPath(APP_ROUTES.results, { activityId: activity.id })}
                variant="secondary"
                icon={Sparkles}
              >
                Ver resultados
              </Button>
            ) : null}
            <Button
              to={buildPath(APP_ROUTES.simulation, { activityId: activity.id })}
              icon={ArrowRight}
              iconPosition="end"
            >
              {isCompleted ? 'Repetir la conversación' : 'Abrir el simulador'}
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge variant={isCompleted ? 'success' : 'info'} dot>
            {isCompleted ? 'Finalizada' : state?.status === STUDENT_ACTIVITY_STATUS.inProgress ? 'En curso' : 'Sin iniciar'}
          </StatusBadge>
          <StatusBadge variant="neutral">{activity.subject}</StatusBadge>
          <StatusBadge variant="neutral">{LEVEL_LABELS[activity.difficulty]}</StatusBadge>
          {state?.lastActivityAt ? (
            <StatusBadge variant="neutral">Última actividad: {formatDate(state.lastActivityAt)}</StatusBadge>
          ) : null}
        </div>
      </PageHeader>

      <SectionNarrow>
        <DemoNotice {...notice} className="mb-8" />

        <div className="space-y-6">
          <Card>
            <CardHeader title="Qué vas a practicar" level="h2" />
            <CardBody>
              <RichText content={activity.scenario} />
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-navy">Reto de razonamiento</h3>
                <RichText content={activity.challenge} className="mt-2" />
              </div>
            </CardBody>
          </Card>

          {conversation.length > 0 ? (
            <Card>
              <CardHeader
                title="Avance de la conversación"
                description="Últimos mensajes de la sesión de demostración."
                level="h2"
                actions={
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <MessageSquareText size={14} aria-hidden="true" />
                    {conversation.length} en el ejemplo
                  </span>
                }
              />
              <CardBody>
                <ul className="space-y-4">
                  {conversation.slice(-3).map((message) => {
                    const preview = truncate(message.content, PREVIEW_LENGTH);
                    const isPartial = preview.length < message.content.trim().length;
                    return (
                      <li
                        key={message.id}
                        className={`rounded-lg border px-4 py-3 text-sm leading-6 ${
                          message.role === 'tutor'
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-blue-100 bg-blue-50/60'
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-500">
                          {message.role === 'tutor' ? 'Simulador' : 'Tú'}
                        </span>
                        <p className="mt-1 text-slate-700">{preview}</p>
                        {isPartial ? (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <MessageSquareText size={13} aria-hidden="true" />
                            Extracto: el mensaje continúa y se lee completo en el simulador.
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <Button
                  to={buildPath(APP_ROUTES.simulation, { activityId: activity.id })}
                  variant="secondary"
                  className="mt-5"
                  icon={ArrowRight}
                  iconPosition="end"
                >
                  Abrir la conversación completa
                </Button>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Datos de la actividad" level="h2" />
            <CardBody>
              <DefinitionList
                items={[
                  { term: 'Área', value: activity.subject },
                  { term: 'Tema', value: activity.topic },
                  { term: 'Versión', value: `v${activity.version}` },
                  {
                    term: 'Turnos en la sesión de ejemplo',
                    value: state?.turnsSoFar ? `${state.turnsSoFar} turnos` : 'Ninguno registrado',
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </SectionNarrow>
    </>
  );
}
