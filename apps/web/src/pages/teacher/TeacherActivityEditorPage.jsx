import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Eye, Info, Send, Sparkles, TriangleAlert } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionNarrow } from '../../components/layout/Section';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorSummary, Message } from '../../components/ui/Message';
import { RichText } from '../../components/ui/RichText';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../context/ToastContext';
import { useDemoWorkspace } from '../../context/DemoWorkspaceContext';
import { ACTIVITY_STATUS, DIFFICULTY_LEVELS, SUBJECT_AREAS } from '../../data/demoData';
import { countWords, slugify } from '../../utils/format';

const EMPTY_FORM = {
  title: '',
  subject: 'Bioquímica',
  topic: '',
  difficulty: 'introductorio',
  summary: '',
  scenario: '',
  challenge: '',
  objectivesText: '',
  tutorInstructions: '',
};

const MAX_INSTRUCTIONS = 3000;

function toForm(activity) {
  if (!activity) return EMPTY_FORM;
  return {
    title: activity.title,
    subject: activity.subject,
    topic: activity.topic,
    difficulty: activity.difficulty,
    summary: activity.summary,
    scenario: activity.scenario,
    challenge: activity.challenge,
    objectivesText: (activity.objectives ?? []).join('\n'),
    tutorInstructions: activity.tutorInstructions ?? '',
  };
}

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'El título identifica la actividad en los listados.';
  else if (values.title.trim().length < 8) errors.title = 'Amplía el título para que sea descriptivo (mínimo 8 caracteres).';

  if (!values.topic.trim()) errors.topic = 'Indica el tema que se trabaja.';
  if (!values.summary.trim()) errors.summary = 'Escribe un resumen breve para el catálogo.';
  else if (values.summary.trim().length < 20) errors.summary = 'El resumen necesita algo más de contexto (mínimo 20 caracteres).';

  if (!values.scenario.trim()) errors.scenario = 'Describe la situación inicial que verá la persona estudiante.';
  if (!values.challenge.trim()) errors.challenge = 'Indica qué razonamiento se espera que sostenga por escrito.';

  if (!values.tutorInstructions.trim()) errors.tutorInstructions = 'Las instrucciones de tutoría son el contenido central de esta pantalla.';
  else if (countWords(values.tutorInstructions) < 20) {
    errors.tutorInstructions = 'Amplía las instrucciones: menos de 20 palabras no describe un comportamiento útil.';
  }

  return errors;
}

export function TeacherActivityEditorPage() {
  const { activityId } = useParams();
  const isNew = !activityId;
  const { getActivity, createActivity, updateActivity, notice } = useDemoWorkspace();
  const { push } = useToast();
  const navigate = useNavigate();
  const summaryRef = useRef(null);

  const existing = getActivity(activityId);
  // Un identificador presente en la URL pero ausente en los datos no es una
  // actividad nueva: es una actividad que no existe y hay que decirlo.
  const notFound = !isNew && !existing;
  const [values, setValues] = useState(() => toForm(existing));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = isNew
      ? 'Nueva actividad · Espacio docente'
      : notFound
        ? 'Actividad no encontrada · Espacio docente'
        : `Editar ${existing.title} · Espacio docente`;
  }, [isNew, notFound, existing]);

  const setField = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const previewActivity = useMemo(
    () => ({
      title: values.title.trim() || 'Actividad sin título',
      subject: values.subject,
      topic: values.topic.trim() || 'Tema por definir',
      summary: values.summary.trim() || 'Resumen por escribir.',
      scenario: values.scenario.trim() || 'Situación por escribir.',
      challenge: values.challenge.trim() || 'Reto por escribir.',
      objectives: values.objectivesText
        .split('\n')
        .map((line) => line.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean),
      tutorInstructions: values.tutorInstructions.trim() || '',
    }),
    [values],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSubmitted(true);
    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    const payload = {
      title: values.title.trim(),
      subject: values.subject,
      topic: values.topic.trim(),
      difficulty: values.difficulty,
      summary: values.summary.trim(),
      scenario: values.scenario.trim(),
      challenge: values.challenge.trim(),
      objectives: previewActivity.objectives,
      tutorInstructions: values.tutorInstructions.trim(),
      slug: slugify(values.title),
    };

    if (isNew) {
      const created = createActivity(payload);
      push({
        tone: 'success',
        title: 'Actividad creada como borrador',
        description: 'Revisa la vista previa y publícala cuando esté lista.',
      });
      navigate(buildPath(APP_ROUTES.teacherActivityEdit, { activityId: created.id }));
      return;
    }

    updateActivity(activityId, payload);
    push({
      tone: 'success',
      title: 'Cambios aplicados en esta sesión',
      description: `La actividad pasa a la versión v${(existing?.version ?? 1) + 1}.`,
    });
  };

  if (notFound) {
    return (
      <>
        <PageHeader
          title="Actividad no encontrada"
          description="La actividad que intentas editar no existe o ya no está disponible."
          breadcrumbs={[
            { label: 'Inicio', to: APP_ROUTES.home },
            { label: 'Espacio docente', to: APP_ROUTES.teacherDashboard },
            { label: 'Actividades', to: APP_ROUTES.teacherActivities },
            { label: 'No encontrada' },
          ]}
        />
        <SectionNarrow>
          <EmptyState
            icon={TriangleAlert}
            title="No encontramos esta actividad"
            description="Vuelve al listado para abrir una actividad existente o crear una nueva."
            action={
              <Button to={APP_ROUTES.teacherActivities} icon={ArrowLeft}>
                Volver al listado
              </Button>
            }
          />
        </SectionNarrow>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isNew ? 'Nueva actividad' : 'Editar actividad'}
        description={
          isNew
            ? 'Define el escenario y redacta las instrucciones que seguirá quien acompañe la conversación.'
            : 'Los cambios se aplican a la actividad de esta sesión mientras permanezcas en la aplicación.'
        }
        breadcrumbs={[
          { label: 'Inicio', to: APP_ROUTES.home },
          { label: 'Espacio docente', to: APP_ROUTES.teacherDashboard },
          { label: 'Actividades', to: APP_ROUTES.teacherActivities },
          { label: isNew ? 'Nueva' : 'Editar' },
        ]}
        actions={
          <Button to={APP_ROUTES.teacherActivities} variant="secondary" icon={ArrowLeft}>
            Volver al listado
          </Button>
        }
      >
        {!isNew && existing ? (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={existing.status === ACTIVITY_STATUS.published ? 'success' : 'warning'} dot>
              {existing.status === ACTIVITY_STATUS.published ? 'Publicada' : 'Borrador'}
            </StatusBadge>
            <StatusBadge variant="neutral">v{existing.version}</StatusBadge>
            <StatusBadge variant="neutral">
              {countWords(existing.tutorInstructions ?? '')} palabras en las instrucciones
            </StatusBadge>
          </div>
        ) : null}
      </PageHeader>

      <SectionNarrow>
        <Message tone="warning" title="El prompt no se envía a ningún servicio" className="mb-8">
          <p>
            Las instrucciones de tutoría se guardan como contenido de la actividad. Esta pantalla
            no las envía a ningún modelo de lenguaje, no requiere claves de proveedor y no
            configura ninguna llamada externa.
          </p>
        </Message>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div ref={summaryRef}>
            {submitted && Object.keys(errors).length > 0 ? <ErrorSummary errors={errors} /> : null}
          </div>

          <Card>
            <CardHeader title="Identificación" description="Cómo se verá la actividad en los listados." level="h2" />
            <CardBody className="space-y-5">
              <TextField
                label="Título"
                value={values.title}
                onChange={setField('title')}
                error={errors.title}
                placeholder="Regulación de la glucemia durante el ayuno prolongado"
                hint="Aparece en el catálogo, en la ficha y en la cabecera del simulador."
                required
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Área"
                  value={values.subject}
                  onChange={setField('subject')}
                  options={SUBJECT_AREAS}
                  required
                />
                <SelectField
                  label="Nivel"
                  value={values.difficulty}
                  onChange={setField('difficulty')}
                  options={DIFFICULTY_LEVELS}
                />
              </div>

              <TextField
                label="Tema"
                value={values.topic}
                onChange={setField('topic')}
                error={errors.topic}
                placeholder="Metabolismo de hidratos de carbono"
                required
              />

              <TextAreaField
                label="Resumen para el catálogo"
                value={values.summary}
                onChange={setField('summary')}
                error={errors.summary}
                rows={3}
                counter={`${countWords(values.summary)} palabras`}
                hint="Dos o tres frases que expliquen qué se practica."
                required
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Escenario" description="El caso con el que se abre la conversación." level="h2" />
            <CardBody className="space-y-5">
              <TextAreaField
                label="Situación"
                value={values.scenario}
                onChange={setField('scenario')}
                error={errors.scenario}
                rows={5}
                hint="Puedes dejar un espacio en blanco para separar párrafos: la vista previa los respeta."
                required
              />
              <TextAreaField
                label="Reto de razonamiento"
                value={values.challenge}
                onChange={setField('challenge')}
                error={errors.challenge}
                rows={4}
                hint="Qué debe sostener por escrito la persona estudiante."
                required
              />
              <TextAreaField
                label="Objetivos"
                value={values.objectivesText}
                onChange={setField('objectivesText')}
                rows={4}
                placeholder={'Un objetivo por línea'}
                hint="Opcional. Un objetivo por línea."
                counter={`${previewActivity.objectives.length} objetivos`}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Instrucciones de tutoría"
              description="El prompt educativo: cómo debe comportarse quien acompaña la conversación."
              level="h2"
              actions={
                <StatusBadge variant="info">
                  <Sparkles size={13} aria-hidden="true" className="mr-1" />
                  {countWords(values.tutorInstructions)} palabras
                </StatusBadge>
              }
            />
            <CardBody className="space-y-4">
              <TextAreaField
                label="Instrucciones"
                value={values.tutorInstructions}
                onChange={setField('tutorInstructions')}
                error={errors.tutorInstructions}
                rows={10}
                maxLength={MAX_INSTRUCTIONS}
                counter={`${values.tutorInstructions.length} / ${MAX_INSTRUCTIONS} caracteres`}
                hint="Describe el rol, el ritmo de la conversación, cuándo pedir argumentos y cómo cerrar. Puedes usar listas con guiones."
                required
              />

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <Info size={16} aria-hidden="true" className="mt-1 shrink-0 text-slate-400" />
                  <span>
                    No hay campos de proveedor, modelo ni clave API en esta pantalla. La gestión de
                    credenciales pertenece al backend y todavía no está implementada.
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Vista previa"
              description="Cómo se verá el escenario y las instrucciones antes de publicar."
              level="h2"
            />
            <CardBody>
              <Tabs
                ariaLabel="Vista previa de la actividad"
                tabs={[
                  { id: 'preview', label: 'Escenario' },
                  { id: 'instructions', label: 'Instrucciones' },
                ]}
              >
                {(activeId) => {
                  return activeId === 'preview' ? (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Título
                        </h3>
                        <p className="mt-1 text-lg font-semibold text-navy">{previewActivity.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {previewActivity.subject} · {previewActivity.topic}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Situación
                        </h3>
                        <div className="mt-1.5">
                          <RichText content={previewActivity.scenario} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Reto
                        </h3>
                        <div className="mt-1.5">
                          <RichText content={previewActivity.challenge} />
                        </div>
                      </div>
                      {previewActivity.objectives.length > 0 ? (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Objetivos
                          </h3>
                          <ul className="mt-2 space-y-1.5">
                            {previewActivity.objectives.map((objective) => (
                              <li key={objective} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                                <span
                                  aria-hidden="true"
                                  className="mt-2 size-1.5 shrink-0 rounded-full bg-action"
                                />
                                <span className="min-w-0">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    previewActivity.tutorInstructions ? (
                      <div>
                        <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                          <Eye size={15} aria-hidden="true" />
                          Se mostrará en la ficha de la actividad y en el panel lateral del simulador.
                        </p>
                        <RichText content={previewActivity.tutorInstructions} />
                      </div>
                    ) : (
                      <EmptyPreview />
                    )
                  );
                }}
              </Tabs>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Criterios de evaluación" description="Se definirán más adelante con el profesorado." level="h2" />
            <CardBody>
              <div className="flex gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-semibold text-navy">Rúbrica pendiente de definir</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    No se ha establecido ninguna puntuación, ponderación ni escala. Esta sección se
                    incorporará cuando el profesorado defina los criterios, y se integrará con las
                    pantallas de resultados sin necesidad de rehacerlas.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <Button type="submit" size="lg" icon={Check}>
              {isNew ? 'Crear borrador' : 'Guardar cambios'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              icon={Send}
              disabled={isNew || !existing}
              title={
                isNew || !existing
                  ? 'Primero guarda la actividad para poder publicarla'
                  : 'Publica la actividad en el catálogo'
              }
              onClick={() => {
                push({
                  tone: 'info',
                  title: existing?.status === ACTIVITY_STATUS.published ? 'Ya estaba publicada' : 'Publicación simulada',
                  description:
                    'El estado de publicación se cambia desde el listado de actividades, y solo afecta a esta sesión.',
                });
              }}
            >
              Publicar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                setValues(toForm(existing));
                setErrors({});
                setSubmitted(false);
              }}
            >
              Descartar cambios
            </Button>
          </div>
        </form>
      </SectionNarrow>
    </>
  );
}

function EmptyPreview() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <Eye size={20} aria-hidden="true" className="mx-auto text-slate-400" />
      <p className="mt-3 text-sm font-medium text-navy">Aún no has redactado las instrucciones</p>
      <p className="mt-1 text-sm text-slate-600">La vista previa aparecerá aquí al escribir.</p>
    </div>
  );
}
