import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileEdit, PlusCircle, RotateCcw, Users } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section, SectionHeading } from '../../components/layout/Section';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { ACTIVITY_STATUS, STUDENT_ACTIVITY_STATUS } from '../../data/demoData';
import { formatDate } from '../../utils/format';

const QUICK_ACTIONS = [
  {
    icon: PlusCircle,
    title: 'Crear una actividad',
    description: 'Define el escenario y redacta las instrucciones de tutoría.',
    to: APP_ROUTES.teacherActivityCreate,
  },
  {
    icon: BookOpen,
    title: 'Revisar publicadas',
    description: 'Comprueba qué actividades ven las personas estudiantes.',
    to: APP_ROUTES.teacherActivities,
  },
  {
    icon: Users,
    title: 'Seguir al grupo',
    description: 'Consulta la actividad registrada por el alumnado.',
    to: APP_ROUTES.teacherMonitoring,
  },
];

export function TeacherDashboardPage() {
  const { teacher, activities, students, notice, resetDemo } = useDemoWorkspace();
  const { push } = useToast();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.title = 'Panel docente · Bioquímica Nutricional';
  }, []);

  const stats = useMemo(() => {
    const published = activities.filter((activity) => activity.status === ACTIVITY_STATUS.published);
    const drafts = activities.filter((activity) => activity.status === ACTIVITY_STATUS.draft);
    const sessions = students.reduce(
      (total, student) =>
        total + Object.values(student.activityStates).filter((value) => value === STUDENT_ACTIVITY_STATUS.inProgress).length,
      0,
    );
    return { published: published.length, drafts: drafts.length, sessions, students: students.length };
  }, [activities, students]);

  const visible = filter === 'all' ? activities.slice(0, 4) : activities.filter((a) => a.status === filter).slice(0, 4);

  return (
    <>
      <PageHeader
        title="Panel docente"
        description={`${teacher.title} · ${teacher.department}`}
        breadcrumbs={[{ label: 'Inicio', to: APP_ROUTES.home }, { label: 'Espacio docente' }]}
        actions={
          <Button to={APP_ROUTES.teacherActivityCreate} icon={PlusCircle}>
            Nueva actividad
          </Button>
        }
      />

      <Section>
        <DemoNotice {...notice} className="mb-8" />

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { term: 'Actividades publicadas', value: stats.published, hint: 'Visibles en el catálogo' },
            { term: 'Borradores', value: stats.drafts, hint: 'Solo visibles para el profesorado' },
            { term: 'Sesiones en curso', value: stats.sessions, hint: 'Actividad registrada, sin nota' },
            { term: 'Estudiantes', value: stats.students, hint: 'Conjunto de demostración' },
          ].map((item) => (
            <Card key={item.term}>
              <CardBody>
                <dt className="text-sm text-slate-500">{item.term}</dt>
                <dd className="mt-2 text-3xl font-semibold text-navy">{item.value}</dd>
                <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              </CardBody>
            </Card>
          ))}
        </dl>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {QUICK_ACTIONS.map(({ icon: Icon, title, description, to }) => (
            <Card key={title} className="flex h-full flex-col">
              <CardBody className="flex flex-1 flex-col">
                <span className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-action">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-navy">{title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <Button to={to} variant="secondary" size="sm" icon={ArrowRight} iconPosition="end">
                    Abrir
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <SectionHeading
              title="Actividades recientes"
              description="Las últimas sobre las que has trabajado en esta sesión."
            >
              <Button to={APP_ROUTES.teacherActivities} variant="ghost" size="sm" icon={ArrowRight} iconPosition="end">
                Ver todas
              </Button>
            </SectionHeading>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Todas' },
                { id: ACTIVITY_STATUS.published, label: 'Publicadas' },
                { id: ACTIVITY_STATUS.draft, label: 'Borradores' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  aria-pressed={filter === option.id}
                  className={`min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 ${
                    filter === option.id
                      ? 'border-action bg-blue-50 text-action'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {visible.length > 0 ? (
              <ul className="mt-5 divide-y divide-slate-200 rounded-panel border border-slate-200 bg-white">
                {visible.map((activity) => (
                  <li key={activity.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <Link
                        to={buildPath(APP_ROUTES.teacherActivityEdit, { activityId: activity.id })}
                        className="rounded text-sm font-semibold text-navy underline-offset-4 hover:text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
                      >
                        {activity.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        v{activity.version} · {formatDate(activity.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={activity.status === ACTIVITY_STATUS.published ? 'success' : 'warning'} dot>
                        {activity.status === ACTIVITY_STATUS.published ? 'Publicada' : 'Borrador'}
                      </StatusBadge>
                      <Button
                        to={buildPath(APP_ROUTES.teacherActivityEdit, { activityId: activity.id })}
                        variant="ghost"
                        size="sm"
                        icon={FileEdit}
                      >
                        Editar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5">
                <EmptyState
                  compact
                  title="Sin actividades en este filtro"
                  description="Crea una actividad nueva o cambia el filtro seleccionado."
                  action={
                    <Button to={APP_ROUTES.teacherActivityCreate} variant="secondary" size="sm">
                      Nueva actividad
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          <div>
            <SectionHeading title="Reiniciar la muestra" />
            <Card className="mt-6">
              <CardBody>
                <p className="text-sm leading-6 text-slate-600">
                  Los cambios que hagas en esta sesión se guardan solo en memoria. Al recargar la
                  página, o con el botón de abajo, vuelves al conjunto de actividad inicial.
                </p>
                <Button
                  variant="secondary"
                  icon={RotateCcw}
                  className="mt-4 w-full"
                  onClick={() => {
                    resetDemo();
                    push({
                      tone: 'success',
                      title: 'Muestra restablecida',
                      description: 'Las actividades han vuelto a su estado inicial.',
                    });
                  }}
                >
                  Restablecer datos de demostración
                </Button>
              </CardBody>
            </Card>

            <Card className="mt-6">
              <CardHeader title="Docente de la muestra" level="h2" />
              <CardBody>
                <div className="flex items-center gap-4">
                  <Avatar initials={teacher.initials} name={teacher.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-navy">{teacher.name}</p>
                    <p className="truncate text-sm text-slate-600">{teacher.title}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
