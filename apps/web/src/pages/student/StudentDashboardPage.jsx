import { useEffect, useMemo } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Compass, PlayCircle } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section, SectionHeading } from '../../components/layout/Section';
import { ActivityCard } from '../../components/activity/ActivityCard';
import { YuliaAvatar } from '../../components/brand/YuliaAvatar';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { STUDENT_ACTIVITY_STATUS } from '../../data/demoData';
import { formatDate } from '../../utils/format';

/**
 * Acciones fijas del panel. La de "continuar" y la de "revisar resultados" se
 * completan en el componente con la actividad concreta, para que el enlace
 * lleve al contenido que anuncia y no a otra sección.
 */
const NEXT_ACTIONS = [
  {
    title: 'Explorar el catálogo',
    description: 'Descubre los escenarios que el profesorado ha publicado.',
    to: APP_ROUTES.simulations,
    cta: 'Abrir el catálogo',
    icon: Compass,
  },
];

export function StudentDashboardPage() {
  const { student, publishedActivities, studentActivityState, notice } = useDemoWorkspace();

  useEffect(() => {
    document.title = 'Mi aprendizaje · Bioquímica Nutricional';
  }, []);

  const groups = useMemo(() => {
    const withState = publishedActivities.map((activity) => ({
      activity,
      state: studentActivityState[activity.id] ?? { status: STUDENT_ACTIVITY_STATUS.notStarted, lastActivityAt: null },
    }));
    return {
      inProgress: withState.filter((item) => item.state.status === STUDENT_ACTIVITY_STATUS.inProgress),
      completed: withState.filter((item) => item.state.status === STUDENT_ACTIVITY_STATUS.completed),
      notStarted: withState.filter((item) => item.state.status === STUDENT_ACTIVITY_STATUS.notStarted),
    };
  }, [publishedActivities, studentActivityState]);

  const nextUp = groups.inProgress[0] ?? null;

  // Los dos acciones que dependen del estado real: si no hay nada que continuar
  // o que revisar, el enlace y el texto lo dicen en lugar de apuntar a otro sitio.
  const nextActions = useMemo(() => {
    const continueAction = nextUp
      ? {
          title: 'Continuar una práctica',
          description: 'Retoma una conversación abierta sin perder el contexto anterior.',
          to: buildPath(APP_ROUTES.simulation, { activityId: nextUp.activity.id }),
          cta: 'Seguir conversando',
          icon: PlayCircle,
        }
      : {
          title: 'Empezar una práctica',
          description: 'No tienes conversaciones abiertas. Elige un escenario para empezar.',
          to: APP_ROUTES.studentActivities,
          cta: 'Ver mis actividades',
          icon: PlayCircle,
        };

    const lastCompleted = groups.completed[groups.completed.length - 1] ?? null;
    const resultsAction = lastCompleted
      ? {
          title: 'Revisar resultados',
          description: 'Consulta la retroalimentación de las actividades ya terminadas.',
          to: buildPath(APP_ROUTES.results, { activityId: lastCompleted.activity.id }),
          cta: 'Ver resultados',
          icon: CheckCircle2,
        }
      : {
          title: 'Aún no hay resultados',
          description: 'Al terminar una conversación podrás leer aquí la retroalimentación de ejemplo.',
          to: APP_ROUTES.studentActivities,
          cta: 'Ver mis actividades',
          icon: CheckCircle2,
        };

    return [continueAction, ...NEXT_ACTIONS, resultsAction];
  }, [nextUp, groups.completed]);

  return (
    <>
      <PageHeader
        title={`Hola, ${student.name.split(' ')[0]}`}
        description={`${student.program} · ${student.cohort} · ${student.course}`}
        breadcrumbs={[{ label: 'Inicio', to: APP_ROUTES.home }, { label: 'Mi aprendizaje' }]}
        actions={
          <>
            <Button to={APP_ROUTES.studentActivities} variant="secondary">
              Todas las actividades
            </Button>
            <Button to={APP_ROUTES.studentProfile} variant="secondary">
              Mi perfil
            </Button>
          </>
        }
      />

      <Section>
        <DemoNotice {...notice} className="mb-8" />

        {nextUp ? (
          <Card className="mb-10 overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[1.5fr_1fr]">
              <CardBody>
                <p className="flex items-center gap-2.5">
                  <YuliaAvatar size="xs" />
                  <span className="eyebrow">Continúa donde lo dejaste</span>
                </p>
                <h2 className="mt-2 text-xl font-semibold text-navy">{nextUp.activity.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{nextUp.activity.summary}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    to={buildPath(APP_ROUTES.simulation, { activityId: nextUp.activity.id })}
                    icon={ArrowRight}
                    iconPosition="end"
                  >
                    Abrir la conversación
                  </Button>
                  <span className="text-xs text-slate-500">
                    Última actividad: {formatDate(nextUp.state.lastActivityAt)}
                  </span>
                </div>
              </CardBody>
              <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-5 md:border-l md:border-t-0 sm:px-6">
                <h3 className="text-sm font-semibold text-navy">Resumen de tu espacio</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    { term: 'En curso', value: groups.inProgress.length },
                    { term: 'Finalizadas', value: groups.completed.length },
                    { term: 'Sin iniciar', value: groups.notStarted.length },
                  ].map((item) => (
                    <div key={item.term} className="flex items-baseline justify-between gap-3">
                      <dt className="text-slate-600">{item.term}</dt>
                      <dd className="text-lg font-semibold text-navy">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
                  Recuentos de interfaz, no calificaciones. La plataforma no calcula notas.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <SectionHeading title="Siguientes pasos" />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {nextActions.map(({ icon: Icon, title, description, to, cta }) => (
            <Card key={title} className="flex h-full flex-col">
              <CardBody className="flex flex-1 flex-col">
                <span className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-action">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <Button to={to} variant="secondary" size="sm" icon={ArrowRight} iconPosition="end">
                    {cta}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <SectionHeading
              title="Actividades en curso"
              description="Conversaciones que puedes retomar cuando quieras."
            >
              <Button to={APP_ROUTES.studentActivities} variant="ghost" size="sm" icon={ArrowRight} iconPosition="end">
                Ver todas
              </Button>
            </SectionHeading>

            {groups.inProgress.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {groups.inProgress.map(({ activity, state }) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    statusOverride={state.status}
                    to={buildPath(APP_ROUTES.simulation, { activityId: activity.id })}
                    actionLabel="Continuar"
                    footer={
                      <>
                        <StatusBadge variant="neutral">{state.turnsSoFar} turnos</StatusBadge>
                        <span className="text-xs text-slate-500">
                          {formatDate(state.lastActivityAt)}
                        </span>
                      </>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  compact
                  icon={BookOpen}
                  title="No tienes actividades en curso"
                  description="Cuando inicies una actividad publicada aparecerá aquí para poder retomarla."
                  action={
                    <Button to={APP_ROUTES.simulations} variant="secondary" size="sm">
                      Explorar el catálogo
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          <div>
            <SectionHeading title="Tu perfil" />
            <Card className="mt-6">
              <CardBody>
                <div className="flex items-center gap-4">
                  <Avatar initials={student.initials} name={student.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-navy">{student.name}</p>
                    <p className="truncate text-sm text-slate-600">{student.email}</p>
                  </div>
                </div>
                <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                  {[
                    { term: 'Titulación', value: student.program },
                    { term: 'Grupo', value: student.cohort },
                    { term: 'Alta en la plataforma', value: formatDate(student.joinedAt) },
                  ].map((item) => (
                    <div key={item.term}>
                      <dt className="text-slate-500">{item.term}</dt>
                      <dd className="mt-0.5 font-medium text-navy">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <Button to={APP_ROUTES.studentProfile} variant="secondary" className="mt-5 w-full">
                  Ver el perfil completo
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
