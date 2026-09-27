import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Sparkles, Target, UserCog } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { DemoNotice } from '../components/ui/DemoNotice';
import { Section, SectionHeading } from '../components/layout/Section';
import { ActivityCard } from '../components/activity/ActivityCard';
import { YuliaAvatar } from '../components/brand/YuliaAvatar';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { DEMO_RESULTS, FAQ_ITEMS } from '../data/demoData';
import { formatDate } from '../utils/format';

/** Ruta de la única actividad de demostración que tiene retroalimentación. */
/** Ruta del único resultado de ejemplo, derivada de los datos y no fija en el código. */
const DEMO_RESULTS_ROUTE = buildPath(APP_ROUTES.results, {
  activityId: Object.keys(DEMO_RESULTS)[0],
});

/** Ancla interna del CTA secundario del hero. */
const EXPERIENCE_ANCHOR = 'experiencia-educativa';

/** Puntos de la tarjeta «Antes de comenzar». */
const BEFORE_STARTING = [
  'No hay alternativas predeterminadas.',
  'Recibirás una pregunta por turno.',
  'Puedes equivocarte y reformular tus ideas.',
  'No necesitas proporcionar datos personales.',
];

const STEPS = [
  {
    icon: Compass,
    title: 'Analiza el caso',
    description:
      'Explora la situación, identifica la información clave y reconoce los dilemas bioquímicos.',
  },
  {
    icon: BookOpen,
    title: 'Defiende tu razonamiento',
    description: 'Argumenta tus ideas con base en la evidencia y recibe retroalimentación.',
  },
  {
    icon: Target,
    title: 'Consolida lo aprendido',
    description: 'Reflexiona sobre la experiencia y fortalece tu pensamiento crítico.',
  },
];

const SPACES = [
  {
    icon: UserCog,
    title: 'Espacio docente',
    description:
      'Crear y editar actividades, redactar el prompt educativo, revisar el escenario antes de publicarlo y seguir el avance del grupo.',
    to: APP_ROUTES.teacherDashboard,
    cta: 'Abrir vista previa docente',
    links: [
      { label: 'Gestión de actividades', to: APP_ROUTES.teacherActivities },
      { label: 'Seguimiento del grupo', to: APP_ROUTES.teacherMonitoring },
    ],
  },
  {
    icon: Sparkles,
    title: 'Espacio estudiante',
    description:
      'Ver las actividades publicadas, continuar una práctica en curso y consultar la retroalimentación de las actividades terminadas.',
    to: APP_ROUTES.studentDashboard,
    cta: 'Abrir vista previa estudiante',
    links: [
      { label: 'Mis actividades', to: APP_ROUTES.studentActivities },
      { label: 'Resultados de ejemplo', to: DEMO_RESULTS_ROUTE },
    ],
  },
];

export function HomePage() {
  const { publishedActivities, featuredActivityId, notice, isDemo } = useDemoWorkspace();
  const featured = publishedActivities.find((activity) => activity.id === featuredActivityId) ?? publishedActivities[0] ?? null;

  const [openFaq, setOpenFaq] = useState(() => FAQ_ITEMS.map((_, index) => index === 0));
  const activeFaq = useMemo(() => new Set(openFaq), [openFaq]);

  useEffect(() => {
    document.title = 'Decide ConCiencia · Bioquímica Nutricional';
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
    );
  };

  return (
    <>
      <section className="hero-yulia border-b border-slate-200">
        <div className="mx-auto w-full max-w-[1600px]">
          {/*
            El orden de los hijos es también el orden de lectura en móvil: texto,
            Yulia, tarjeta y métricas. En escritorio la composición se resuelve
            en CSS (`.hero-stage`), donde la figura se posiciona de forma
            absoluta para que su tamaño no dependa del reparto de un grid.
          */}
          <div className="hero-stage">
            <div className="hero-copy">
              <p className="brand-badge">Plataforma académica</p>
              <h1 className="mt-6 text-[2.125rem] font-semibold text-navy sm:text-[2.5rem] xl:text-[3.25rem] xl:leading-[1.06]">
                Decide ConCiencia
              </h1>
              <p className="mt-4 text-xl font-medium tracking-tight text-brand-ink sm:text-[1.375rem]">
                Aprende con Yulia
              </p>
              <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-7 text-slate-600">
                Practica el razonamiento en Bioquímica aplicada a la Nutrición mediante
                experiencias conversacionales guiadas.
              </p>

              <div className="hero-cta mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Button
                  to={APP_ROUTES.simulations}
                  size="md"
                  icon={ArrowRight}
                  iconPosition="end"
                  className="w-full sm:w-auto"
                >
                  Explorar simulaciones
                </Button>
                <a href={`#${EXPERIENCE_ANCHOR}`} className="button-secondary w-full sm:w-auto">
                  Cómo funciona
                </a>
              </div>
            </div>

            {/*
              Yulia es la protagonista visual del hero. La imagen tiene fondo
              transparente y el lienzo casi no tiene margen, así que se muestra
              entera, sin recortar cabeza, cabello ni bata, y sin fondo, círculo
              ni sombra añadidos.
            */}
            <div className="hero-figure">
              <YuliaAvatar fluid decorative={false} priority />
            </div>

            <Card className="hero-card">
              <CardBody>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-ink">
                  Antes de comenzar
                </p>
                <h2 className="mt-2 text-base font-semibold leading-6 text-navy">
                  Tu razonamiento es el centro
                </h2>
                <ul className="mt-4 space-y-2">
                  {BEFORE_STARTING.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2.5 text-[0.8125rem] leading-5 text-slate-600"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                      />
                      <span className="min-w-0">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <dl className="hero-metrics grid grid-cols-1 gap-x-10 gap-y-6 min-[420px]:grid-cols-2 sm:grid-cols-3">
              {[
                { term: 'Áreas', value: 'Bioquímica, fisiología y nutrición clínica' },
                { term: 'Formato', value: 'Conversación escrita guiada' },
                { term: 'Autoría', value: 'Cada escenario lo redacta el profesorado' },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.term}
                  </dt>
                  <dd className="mt-2 text-[0.8125rem] font-normal leading-5 text-slate-600">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Section id={EXPERIENCE_ANCHOR} className="scroll-mt-24">
        <DemoNotice {...notice} className="mb-10" />
        <SectionHeading
          title="Experiencia educativa"
          description="Tres momentos para construir una postura propia."
        />
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              <Card className="h-full">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-surface text-action">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold text-brand-ink">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-t border-slate-200 bg-white">
        <SectionHeading
          title="Dos espacios, un mismo escenario"
          description="El profesorado configura el contenido; la persona estudiante practica. Cada espacio tiene su propia interfaz."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {SPACES.map(({ icon: Icon, title, description, to, cta, links }) => (
            <Card key={title} className="flex h-full flex-col">
              <CardBody className="flex flex-1 flex-col">
                <span className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-action">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-navy">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <Button to={to} icon={ArrowRight} iconPosition="end" className="w-full">
                    {cta}
                  </Button>
                  <ul className="mt-4 space-y-2">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="inline-flex min-h-10 items-center text-sm font-medium text-action underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        {isDemo ? (
          <p className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            Estos accesos abren vistas previas navegables de la interfaz. No incluyen
            autenticación, y los cambios que hagas en ellas se pierden al recargar la página.
          </p>
        ) : null}
      </Section>

      <Section>
        <SectionHeading
          title="Catálogo actual"
          description="Actividades publicadas de muestra. Se amplía a medida que el profesorado publique nuevos escenarios."
        >
          <Button to={APP_ROUTES.simulations} variant="secondary" icon={ArrowRight} iconPosition="end">
            Ver todo el catálogo
          </Button>
        </SectionHeading>
        {publishedActivities.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {publishedActivities.slice(0, 3).map((activity) => (
              <ActivityCard key={activity.id} activity={activity} level="h3" />
            ))}
          </div>
        ) : (
          <Card className="mt-8">
            <CardBody>
              <p className="text-sm text-slate-600">
                No hay actividades publicadas en esta versión de demostración.
              </p>
            </CardBody>
          </Card>
        )}

        {featured ? (
          <Card className="mt-8 overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[1fr_auto]">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-action">
                  Escenario destacado
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-7 text-navy">{featured.title}</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{featured.topic}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{featured.summary}</p>
              </CardBody>
              <div className="flex items-end border-t border-slate-100 p-5 md:border-l md:border-t-0">
                <Button
                  to={buildPath(APP_ROUTES.activityDetail, { activityId: featured.id })}
                  variant="secondary"
                  icon={ArrowRight}
                  iconPosition="end"
                  className="w-full md:w-auto"
                >
                  Leer el escenario
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </Section>

      <Section className="border-t border-slate-200 bg-white">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading
              title="Preguntas frecuentes"
              description="Lo que la plataforma define hoy y lo que queda pendiente de confirmar con el profesorado."
            />
            {featured ? (
              <p className="mt-6 text-sm leading-6 text-slate-500">
                Última actividad actualizada el {formatDate(featured.updatedAt)}.
              </p>
            ) : null}
          </div>

          <div className="divide-y divide-slate-200 rounded-panel border border-slate-200 bg-white">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = activeFaq.has(index);
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              return (
                <div key={item.question}>
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-navy transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action sm:px-6"
                    >
                      <span className="min-w-0">{item.question}</span>
                      <span
                        aria-hidden="true"
                        className={`shrink-0 text-xl leading-none text-action transition-transform ${
                          isOpen ? 'rotate-45' : ''
                        }`}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  {isOpen ? (
                    <div id={panelId} role="region" aria-labelledby={buttonId} className="px-5 pb-5 sm:px-6">
                      <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="border-t border-slate-200">
        <div className="flex flex-col items-start justify-between gap-6 rounded-panel border border-slate-200 bg-white p-8 sm:flex-row sm:items-center lg:p-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-navy">
              Esta versión es una interfaz de demostración
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-600">
              No hay cuentas activas, ni datos reales, ni respuestas generadas por modelos. Todo
              el contenido visible procede de un conjunto de muestra incluido en el código.
            </p>
          </div>
          <Button to={APP_ROUTES.login} size="lg" className="shrink-0">
            Entrar al acceso
          </Button>
        </div>
      </Section>
    </>
  );
}
