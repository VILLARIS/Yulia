import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, FileEdit, PlusCircle, Search, Send, Trash2 } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { TextField } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { ACTIVITY_STATUS, LEVEL_LABELS } from '../../data/demoData';
import { countWords, formatDate } from '../../utils/format';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: ACTIVITY_STATUS.published, label: 'Publicadas' },
  { id: ACTIVITY_STATUS.draft, label: 'Borradores' },
];

export function TeacherActivitiesPage() {
  const { activities, notice, duplicateActivity, removeActivity, togglePublish } = useDemoWorkspace();
  const { push } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    document.title = 'Actividades · Espacio docente';
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activities.filter((activity) => {
      if (filter !== 'all' && activity.status !== filter) return false;
      if (!normalized) return true;
      return `${activity.title} ${activity.topic} ${activity.summary}`.toLowerCase().includes(normalized);
    });
  }, [activities, query, filter]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    removeActivity(pendingDelete.id);
    setPendingDelete(null);
    push({
      tone: 'info',
      title: 'Actividad eliminada de la sesión',
      description: 'Vuelve a aparecer si recargas la página o restableces la muestra.',
    });
  };

  return (
    <>
      <PageHeader
        title="Actividades educativas"
        description="Crea escenarios, redacta las instrucciones de tutoría y decide cuándo se publican."
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Espacio docente', to: APP_ROUTES.teacherDashboard },
          { label: 'Actividades' },
        ]}
        actions={
          <Button to={APP_ROUTES.teacherActivityCreate} icon={PlusCircle}>
            Nueva actividad
          </Button>
        }
      />

      <Section>
        <DemoNotice {...notice} className="mb-8" />

        <div className="grid gap-4 rounded-panel border border-slate-200 bg-white p-5 lg:grid-cols-[1.6fr_1fr]">
          <TextField
            label="Buscar"
            type="search"
            icon={Search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, tema o palabra clave"
          />

          <div>
            <span className="text-sm font-semibold text-navy" id="docente-filtro-label">
              Estado
            </span>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="docente-filtro-label">
              {FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  aria-pressed={filter === option.id}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 ${
                    filter === option.id
                      ? 'border-action bg-blue-50 text-action'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-600" role="status">
          {filtered.length === 1
            ? '1 actividad coincide con los filtros.'
            : `${filtered.length} actividades coinciden con los filtros.`}
        </p>

        {filtered.length > 0 ? (
          <ul className="mt-5 space-y-4">
            {filtered.map((activity) => {
              const isPublished = activity.status === ACTIVITY_STATUS.published;
              const editPath = buildPath(APP_ROUTES.teacherActivityEdit, { activityId: activity.id });

              return (
                <li key={activity.id}>
                  <Card>
                    <CardBody>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge variant={isPublished ? 'success' : 'warning'} dot>
                              {isPublished ? 'Publicada' : 'Borrador'}
                            </StatusBadge>
                            <StatusBadge variant="neutral">{activity.subject}</StatusBadge>
                            {activity.difficulty ? (
                              <StatusBadge variant="neutral">{LEVEL_LABELS[activity.difficulty]}</StatusBadge>
                            ) : null}
                            <StatusBadge variant="neutral">v{activity.version}</StatusBadge>
                          </div>

                          <h2 className="mt-3 text-lg font-semibold text-navy">{activity.title}</h2>
                          <p className="mt-1.5 text-sm leading-6 text-slate-600">{activity.summary}</p>

                          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                            <div className="flex gap-1.5">
                              <dt>Tema:</dt>
                              <dd>{activity.topic}</dd>
                            </div>
                            <div className="flex gap-1.5">
                              <dt>Actualizada:</dt>
                              <dd>{formatDate(activity.updatedAt)}</dd>
                            </div>
                            <div className="flex gap-1.5">
                              <dt>Instrucciones:</dt>
                              <dd>
                                {activity.tutorInstructions
                                  ? `${countWords(activity.tutorInstructions)} palabras`
                                  : 'sin redactar'}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button to={editPath} variant="secondary" size="sm" icon={FileEdit}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={isPublished ? Trash2 : Send}
                            onClick={() => {
                              togglePublish(activity.id);
                              push({
                                tone: 'info',
                                title: isPublished ? 'Actividad retirada del catálogo' : 'Actividad publicada',
                                description: 'Cambio aplicado solo en memoria, para esta sesión.',
                              });
                            }}
                          >
                            {isPublished ? 'Retirar' : 'Publicar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Copy}
                            onClick={() => {
                              const copy = duplicateActivity(activity.id);
                              if (copy) {
                                push({
                                  tone: 'success',
                                  title: 'Duplicada como borrador',
                                  description: `«${copy.title}».`,
                                });
                                navigate(buildPath(APP_ROUTES.teacherActivityEdit, { activityId: copy.id }));
                              }
                            }}
                          >
                            Duplicar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => setPendingDelete(activity)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon={PlusCircle}
              title="No hay actividades que coincidan"
              description={
                activities.length === 0
                  ? 'Empieza por crear la primera actividad del curso.'
                  : 'Prueba con otro texto de búsqueda o cambia el filtro de estado.'
              }
              action={
                <Button to={APP_ROUTES.teacherActivityCreate} icon={PlusCircle}>
                  Nueva actividad
                </Button>
              }
            />
          </div>
        )}
      </Section>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Eliminar actividad"
        description="Esta acción solo afecta a la sesión del navegador."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm leading-7 text-slate-700">
          Se eliminará «{pendingDelete?.title}» del listado de esta sesión. Como no hay
          almacenamiento conectado, la actividad volverá a aparecer al recargar la página.
        </p>
      </Modal>
    </>
  );
}
