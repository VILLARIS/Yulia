import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { ActivityCard } from '../../components/activity/ActivityCard';
import { Button } from '../../components/ui/Button';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { TextField } from '../../components/ui/Field';
import { Tabs } from '../../components/ui/Tabs';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { STUDENT_ACTIVITY_STATUS } from '../../data/demoData';
import { formatDate } from '../../utils/format';

const TAB_IDS = {
  available: 'not_started',
  inProgress: 'in_progress',
  completed: 'completed',
};

export function StudentActivitiesPage() {
  const { publishedActivities, studentActivityState, notice } = useDemoWorkspace();
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Mis actividades · Bioquímica Nutricional';
  }, []);

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return publishedActivities
      .map((activity) => ({
        activity,
        state: studentActivityState[activity.id] ?? {
          status: STUDENT_ACTIVITY_STATUS.notStarted,
          lastActivityAt: null,
          turnsSoFar: 0,
        },
      }))
      .filter((item) =>
        normalized
          ? `${item.activity.title} ${item.activity.topic} ${item.activity.summary}`
              .toLowerCase()
              .includes(normalized)
          : true,
      );
  }, [publishedActivities, studentActivityState, query]);

  const countFor = (status) => items.filter((item) => item.state.status === status).length;

  const tabs = [
    { id: 'available', label: 'Disponibles', count: countFor(TAB_IDS.available) },
    { id: 'inProgress', label: 'En curso', count: countFor(TAB_IDS.inProgress) },
    { id: 'completed', label: 'Finalizadas', count: countFor(TAB_IDS.completed) },
  ];

  const renderGroup = (tabId) => {
    const status = TAB_IDS[tabId];
    const group = items.filter((item) => item.state.status === status);

    if (group.length === 0) {
      const copy = {
        available: {
          title: 'No quedan actividades sin iniciar',
          description: 'Has iniciado todas las actividades publicadas en esta versión.',
        },
        inProgress: {
          title: 'No tienes actividades en curso',
          description: 'Al abrir el simulador de una actividad, esta aparecerá aquí para poder retomarla.',
        },
        completed: {
          title: 'Aún no has terminado ninguna actividad',
          description: 'Cuando termines una conversación podrás consultar aquí la retroalimentación del profesorado.',
        },
      }[tabId];

      return (
        <EmptyState
          icon={BookOpen}
          title={copy.title}
          description={copy.description}
          action={
            <Button to={APP_ROUTES.simulations} variant="secondary">
              Ir al catálogo
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {group.map(({ activity, state }) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            statusOverride={state.status}
            to={
              state.status === STUDENT_ACTIVITY_STATUS.completed
                ? buildPath(APP_ROUTES.studentActivityDetail, { activityId: activity.id })
                : buildPath(APP_ROUTES.simulation, { activityId: activity.id })
            }
            actionLabel={state.status === STUDENT_ACTIVITY_STATUS.completed ? 'Ver actividad' : 'Empezar'}
            footer={
              <>
                <span className="text-xs text-slate-500">
                  {state.lastActivityAt
                    ? `Última actividad: ${formatDate(state.lastActivityAt)}`
                    : 'Nunca iniciada'}
                </span>
                {state.turnsSoFar > 0 ? (
                  <span className="text-xs text-slate-500">{state.turnsSoFar} turnos</span>
                ) : null}
              </>
            }
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Mis actividades"
        description="Actividades publicadas para tu curso, agrupadas por estado."
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Mi aprendizaje', to: APP_ROUTES.studentDashboard },
          { label: 'Actividades' },
        ]}
      />

      <Section>
        <DemoNotice {...notice} className="mb-8" />

        <div className="mb-8 max-w-xl">
          <TextField
            label="Buscar en mis actividades"
            type="search"
            icon={Search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, tema o palabra clave"
          />
        </div>

        <Tabs tabs={tabs} ariaLabel="Estado de las actividades">
          {(activeId) => renderGroup(activeId)}
        </Tabs>
      </Section>
    </>
  );
}
