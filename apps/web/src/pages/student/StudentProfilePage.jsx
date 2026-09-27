import { useEffect, useState } from 'react';
import { Check, Pencil, ShieldAlert } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionNarrow } from '../../components/layout/Section';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { CheckboxField, TextField } from '../../components/ui/Field';
import { DefinitionList } from '../../components/ui/DefinitionList';
import { DemoNotice } from '../../components/ui/DemoNotice';
import { Message } from '../../components/ui/Message';
import { ProgressMeter } from '../../components/ui/ProgressMeter';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { STUDENT_ACTIVITY_STATUS } from '../../data/demoData';
import { formatDate } from '../../utils/format';

const PROFILE_FIELDS = [
  { key: 'displayName', label: 'Nombre y apellidos', autoComplete: 'name' },
  { key: 'email', label: 'Correo institucional', type: 'email', autoComplete: 'email' },
  { key: 'program', label: 'Titulación', autoComplete: 'organization-title' },
  { key: 'cohort', label: 'Curso y grupo', autoComplete: 'off' },
];

export function StudentProfilePage() {
  const { student, notice, studentActivityState, publishedActivities, resetDemo } = useDemoWorkspace();
  const { push } = useToast();

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    displayName: student.name,
    email: student.email,
    program: student.program,
    cohort: student.cohort,
  });
  const [errors, setErrors] = useState({});
  const [digest, setDigest] = useState(true);

  useEffect(() => {
    document.title = 'Mi perfil · Bioquímica Nutricional';
  }, []);

  const history = Object.entries(studentActivityState)
    .map(([id, state]) => ({ activity: publishedActivities.find((item) => item.id === id), state }))
    .filter((item) => item.activity)
    .sort((a, b) => (b.state.lastActivityAt ?? '').localeCompare(a.state.lastActivityAt ?? ''));

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    if (!values.displayName.trim()) found.displayName = 'El nombre no puede quedar vacío.';
    if (!values.email.trim()) found.email = 'El correo no puede quedar vacío.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      found.email = 'El formato del correo no es válido.';
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setEditing(false);
    push({
      tone: 'info',
      title: 'Cambios solo en esta pestaña',
      description: 'No hay servicio de perfil conectado, así que el formulario se ha cerrado sin guardar nada.',
    });
  };

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Información de la cuenta y actividad registrada en esta versión de demostración."
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Mi aprendizaje', to: APP_ROUTES.studentDashboard },
          { label: 'Perfil' },
        ]}
        actions={
          editing ? null : (
            <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
              Editar datos
            </Button>
          )
        }
      />

      <SectionNarrow className="space-y-6">
        <DemoNotice {...notice} />

        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center gap-5">
              <Avatar initials={student.initials} name={student.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-navy">{student.name}</p>
                <p className="text-sm text-slate-600">{student.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge variant={student.emailVerified ? 'success' : 'warning'}>
                    {student.emailVerified ? 'Correo verificado' : 'Correo sin verificar'}
                  </StatusBadge>
                  <StatusBadge variant="neutral">Alta el {formatDate(student.joinedAt)}</StatusBadge>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <ProgressMeter
                value={student.profileCompleteness}
                label="Perfil completado"
                tone="action"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Mide los campos de perfil que el profesorado puede consultar. No tiene relación con
                el rendimiento académico.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Datos de la cuenta" level="h2" />
          <CardBody>
            {editing ? (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {PROFILE_FIELDS.map((field) => (
                  <TextField
                    key={field.key}
                    label={field.label}
                    type={field.type ?? 'text'}
                    autoComplete={field.autoComplete}
                    value={values[field.key]}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    error={errors[field.key]}
                  />
                ))}
                <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <Button type="submit" icon={Check}>
                    Aplicar cambios
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditing(false);
                      setErrors({});
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <DefinitionList
                items={[
                  { term: 'Nombre y apellidos', value: student.name },
                  { term: 'Correo institucional', value: student.email },
                  { term: 'Titulación', value: student.program },
                  { term: 'Curso y grupo', value: `${student.course} · ${student.cohort}` },
                ]}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Notificaciones"
            description="Preferencias locales. No se envía ninguna comunicación."
            level="h2"
          />
          <CardBody>
            <CheckboxField
              label="Recibir un resumen de la actividad semanal"
              checked={digest}
              onChange={(event) => {
                setDigest(event.target.checked);
                push({
                  tone: 'info',
                  title: 'Preferencia aplicada en memoria',
                  description: 'No hay servicio de notificaciones conectado en esta versión.',
                });
              }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Actividad registrada"
            description="Actividad de la muestra, sin resultados académicos."
            level="h2"
          />
          <CardBody>
            {history.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {history.map(({ activity, state }) => (
                  <li key={activity.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">{activity.title}</p>
                      <p className="text-xs text-slate-500">
                        {state.lastActivityAt ? `Última actividad: ${formatDate(state.lastActivityAt)}` : 'Nunca iniciada'}
                      </p>
                    </div>
                    <StatusBadge
                      variant={
                        state.status === STUDENT_ACTIVITY_STATUS.completed
                          ? 'success'
                          : state.status === STUDENT_ACTIVITY_STATUS.inProgress
                            ? 'info'
                            : 'neutral'
                      }
                    >
                      {state.status === STUDENT_ACTIVITY_STATUS.completed
                        ? 'Finalizada'
                        : state.status === STUDENT_ACTIVITY_STATUS.inProgress
                          ? 'En curso'
                          : 'Sin iniciar'}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">Todavía no hay actividad registrada.</p>
            )}
          </CardBody>
        </Card>

        <Message tone="warning" title="Privacidad de los datos">
          <p>
            No se ha introducido ningún dato personal real. El correo, el nombre y el historial
            anteriores forman parte del conjunto de demostración incluido en el código fuente.
          </p>
          <p className="mt-2 flex items-center gap-1.5">
            <ShieldAlert size={14} aria-hidden="true" className="shrink-0" />
            <span>
              Puedes restablecer la muestra en cualquier momento.{' '}
              <button
                type="button"
                onClick={() => {
                  resetDemo();
                  push({
                    tone: 'success',
                    title: 'Muestra restablecida',
                    description: 'Las actividades han vuelto a su estado inicial.',
                  });
                }}
                className="font-semibold underline underline-offset-4"
              >
                Restablecer ahora
              </button>
              .
            </span>
          </p>
        </Message>
      </SectionNarrow>
    </>
  );
}
