import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Eye, Lightbulb, ListChecks, MessageSquareText, Target } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Tabs } from '../../components/ui/Tabs';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { STUDENT_ACTIVITY_STATUS } from '../../data/demoData';

/**
 * Vista docente de resultados. Solo organiza y filtra la retroalimentación
 * cualitativa de la muestra: no calcula ni estima ninguna nota.
 */
const FILTERS = [
  { id: 'all', label: 'Todo el grupo' },
  { id: 'con', label: 'Con retroalimentación' },
  { id: 'sin', label: 'Sin retroalimentación' },
];

/** Devuelve el primer resultado de la muestra asociado a las actividades de la estudiante. */
function findResultForStudent(student, results) {
  const activityId = Object.keys(student.activityStates).find((id) => results[id]);
  return activityId ? results[activityId] : null;
}

export function TeacherResultsPage() {
  const { students, results, publishedActivities, getActivity, notice } = useDemoWorkspace();
  const [status, setStatus] = useState('all');

  useEffect(() => {
    document.title = 'Resultados · Espacio docente';
  }, []);

  const rows = useMemo(
    () =>
      students
        .map((student) => ({
          student,
          states: student.activityStates,
          result: findResultForStudent(student, results),
        }))
        .filter((row) =>
          status === 'all' ? true : status === 'con' ? Boolean(row.result) : !row.result,
        ),
    [students, results, status],
  );

  return (
    <>
      <PageHeader
        title="Resultados y seguimiento del grupo"
        description="Lectura cualitativa de la muestra. No hay calificación, ni notas, ni criterios de evaluación definidos."
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Espacio docente', to: APP_ROUTES.teacherDashboard },
          { label: 'Resultados' },
        ]}
        actions={
          <Button to={APP_ROUTES.teacherMonitoring} variant="secondary" icon={Eye}>
            Ver seguimiento
          </Button>
        }
      />

      <Section>
        <DemoNotice {...notice} className="mb-8" />

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por disponibilidad de retroalimentación">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStatus(option.id)}
              aria-pressed={status === option.id}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 ${
                status === option.id
                  ? 'border-action bg-blue-50 text-action'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={ClipboardList}
              title="No hay estudiantes en este filtro"
              description="Cambia el filtro seleccionado para ver el resto del grupo."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map(({ student, states, result }) => {
              const completed = Object.values(states).filter(
                (value) => value === STUDENT_ACTIVITY_STATUS.completed,
              ).length;
              const inProgress = Object.values(states).filter(
                (value) => value === STUDENT_ACTIVITY_STATUS.inProgress,
              ).length;
              const resultActivity = result ? getActivity(result.activityId) : null;

              return (
                <li key={student.id}>
                  <Card>
                    <CardHeader
                      title={student.name}
                      description={`${student.cohort} · ${student.email}`}
                      level="h2"
                      actions={
                        <StatusBadge variant={result ? 'success' : 'neutral'} dot={Boolean(result)}>
                          {result ? 'Retroalimentación disponible' : 'Sin retroalimentación'}
                        </StatusBadge>
                      }
                    />
                    <CardBody className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge variant="info">{inProgress} en curso</StatusBadge>
                        <StatusBadge variant="success">{completed} finalizadas</StatusBadge>
                        <StatusBadge variant="neutral">
                          {Object.keys(states).length} registradas
                        </StatusBadge>
                      </div>

                      {result && resultActivity ? (
                        <Tabs
                          ariaLabel={`Retroalimentación de ${student.name}`}
                          tabs={[
                            { id: 'summary', label: 'Valoración' },
                            { id: 'areas', label: 'Áreas de mejora' },
                            { id: 'context', label: 'Contexto' },
                          ]}
                        >
                          {(activeId) => {
                            if (activeId === 'areas') {
                              return result.improvementAreas?.length ? (
                                <ul className="space-y-2.5">
                                  {result.improvementAreas.map((area) => (
                                    <li key={area} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                                      <Target
                                        size={15}
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-action"
                                      />
                                      <span className="min-w-0">{area}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-600">
                                  No hay áreas de mejora registradas para esta muestra.
                                </p>
                              );
                            }

                            if (activeId === 'context') {
                              return (
                                <div className="space-y-4">
                                  {result.teacherComment ? (
                                    <div>
                                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        <MessageSquareText size={13} aria-hidden="true" />
                                        Comentario del profesorado
                                      </p>
                                      <p className="mt-1.5 text-sm leading-6 text-slate-700">
                                        {result.teacherComment}
                                      </p>
                                    </div>
                                  ) : null}
                                  <div>
                                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                      <ListChecks size={13} aria-hidden="true" />
                                      Criterios de evaluación
                                    </p>
                                    <p className="mt-1.5 flex items-start gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-600">
                                      <Lightbulb size={15} aria-hidden="true" className="mt-1 shrink-0 text-slate-400" />
                                      <span>
                                        Pendientes de definir por la docente. Cuando se acuerden, se
                                        añadirán aquí y en la vista de la persona estudiante sin
                                        rehacer estas pantallas.
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-4">
                                <p className="text-sm leading-7 text-slate-700">{result.overallComment}</p>
                                {result.strengths?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                      Aspectos que la muestra señala como logrados
                                    </p>
                                    <ul className="mt-2 space-y-2">
                                      {result.strengths.map((item) => (
                                        <li key={item} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                                          <span
                                            aria-hidden="true"
                                            className="mt-2 size-1.5 shrink-0 rounded-full bg-action"
                                          />
                                          <span className="min-w-0">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null}
                              </div>
                            );
                          }}
                        </Tabs>
                      ) : (
                        <EmptyState
                          compact
                          title="Sin retroalimentación en la muestra"
                          description="La actividad no tiene un resultado de ejemplo asociado a este estudiante. No se calcula ninguno automáticamente."
                        />
                      )}

                      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <Button to={APP_ROUTES.teacherActivities} variant="ghost" size="sm">
                          Ver actividades
                        </Button>
                        {resultActivity ? (
                          <Button
                            to={buildPath(APP_ROUTES.teacherActivityEdit, { activityId: resultActivity.id })}
                            variant="ghost"
                            size="sm"
                          >
                            Editar «{resultActivity.title}»
                          </Button>
                        ) : null}
                        {publishedActivities.length > 0 ? (
                          <span className="ml-auto self-center text-xs text-slate-500">
                            {publishedActivities.length} actividades publicadas en la muestra
                          </span>
                        ) : null}
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        <Card className="mt-8">
          <CardHeader
            title="Criterios de evaluación"
            description="Sección preparada para cuando la docente defina los criterios."
            level="h2"
          />
          <CardBody>
            <div className="flex gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
              <ClipboardList size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-navy">Sin criterios definidos</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  No se ha establecido ninguna puntuación, ponderación ni escala. Ambas vistas
                  iteran sobre los criterios que entregue el servicio de rúbricas, de modo que
                  añadirlos no obligará a reconstruir esta pantalla.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </Section>
    </>
  );
}
