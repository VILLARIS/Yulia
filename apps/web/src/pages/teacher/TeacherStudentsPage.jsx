import { useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Search, Users } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { DefinitionList } from '../../components/ui/DefinitionList';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { SelectField, TextField } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { STATUS_LABELS, STUDENT_ACTIVITY_STATUS } from '../../data/demoData';
import { formatDate } from '../../utils/format';

const STATE_VARIANT = {
  [STUDENT_ACTIVITY_STATUS.completed]: 'success',
  [STUDENT_ACTIVITY_STATUS.inProgress]: 'info',
  [STUDENT_ACTIVITY_STATUS.notStarted]: 'neutral',
};

export function TeacherStudentsPage() {
  const { students, activities, notice } = useDemoWorkspace();
  const [query, setQuery] = useState('');
  const [cohort, setCohort] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = 'Estudiantes · Espacio docente';
  }, []);

  const cohorts = useMemo(
    () => Array.from(new Set(students.map((student) => student.cohort))).sort(),
    [students],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return students.filter((student) => {
      if (cohort !== 'all' && student.cohort !== cohort) return false;
      if (!normalized) return true;
      return `${student.name} ${student.email} ${student.program}`.toLowerCase().includes(normalized);
    });
  }, [students, query, cohort]);

  const countBy = (student) =>
    Object.values(student.activityStates).reduce(
      (acc, status) => ({ ...acc, [status]: (acc[status] ?? 0) + 1 }),
      {},
    );

  return (
    <>
      <PageHeader
        title="Estudiantes"
        description="Conjunto ficticio incluido en la demostración, para revisar el diseño del listado y del detalle."
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Espacio docente', to: APP_ROUTES.teacherDashboard },
          { label: 'Estudiantes' },
        ]}
        actions={
          <Button to={APP_ROUTES.studentDashboard} variant="secondary" icon={Eye}>
            Ver espacio estudiante
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
            placeholder="Nombre, correo o titulación"
          />

          <SelectField
            label="Grupo"
            value={cohort}
            onChange={(event) => setCohort(event.target.value)}
            options={[
              { value: 'all', label: 'Todos los grupos' },
              ...cohorts.map((value) => ({ value, label: value })),
            ]}
          />
        </div>

        <p className="mt-5 text-sm text-slate-600" role="status">
          {filtered.length === 1
            ? '1 estudiante coincide con los filtros.'
            : `${filtered.length} estudiantes coinciden con los filtros.`}
        </p>

        {filtered.length > 0 ? (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {filtered.map((student) => {
              const counts = countBy(student);
              return (
                <li key={student.id}>
                  <Card className="h-full">
                    <CardBody className="flex h-full flex-col">
                      <div className="flex items-start gap-4">
                        <Avatar initials={student.initials} name={student.name} size="md" />
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-base font-semibold text-navy">{student.name}</h2>
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-600">
                            <Mail size={13} aria-hidden="true" className="shrink-0 text-slate-400" />
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                        <div className="flex gap-1.5">
                          <dt>Grupo:</dt>
                          <dd>{student.cohort}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt>Última conexión:</dt>
                          <dd>{formatDate(student.lastSeenAt)}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusBadge variant="neutral">
                          {counts[STUDENT_ACTIVITY_STATUS.inProgress] ?? 0} en curso
                        </StatusBadge>
                        <StatusBadge variant="neutral">
                          {counts[STUDENT_ACTIVITY_STATUS.completed] ?? 0} finalizadas
                        </StatusBadge>
                      </div>

                      <div className="mt-5 flex-1" />

                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelected(student)}
                      >
                        Ver detalle
                      </Button>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon={Users}
              title="Ningún estudiante coincide"
              description="Ajusta la búsqueda o selecciona otro grupo para ampliar los resultados."
            />
          </div>
        )}
      </Section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Detalle del estudiante'}
        description="Información ficticia del conjunto de demostración."
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Cerrar
          </Button>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar initials={selected.initials} name={selected.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-navy">{selected.name}</p>
                <p className="truncate text-sm text-slate-600">{selected.email}</p>
              </div>
            </div>

            <DefinitionList
              items={[
                { term: 'Titulación', value: selected.program },
                { term: 'Curso y grupo', value: selected.cohort },
                { term: 'Última conexión', value: formatDate(selected.lastSeenAt) },
              ]}
            />

            <div>
              <h3 className="text-sm font-semibold text-navy">Actividad registrada</h3>
              {Object.keys(selected.activityStates).length > 0 ? (
                <ul className="mt-3 divide-y divide-slate-100">
                  {Object.entries(selected.activityStates).map(([activityId, status]) => {
                    const activity = activities.find((item) => item.id === activityId);
                    return (
                      <li
                        key={activityId}
                        className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-navy">
                          {activity?.title ?? activityId}
                        </span>
                        <StatusBadge variant={STATE_VARIANT[status] ?? 'neutral'}>
                          {STATUS_LABELS[status] ?? status}
                        </StatusBadge>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  Este estudiante no tiene actividad registrada en la muestra.
                </p>
              )}
            </div>

            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
              No hay expediente académico ni calificaciones en esta versión. Cuando exista el
              servicio correspondiente, estos campos se alimentarán del backend sin modificar el
              diseño de las pantallas.
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
