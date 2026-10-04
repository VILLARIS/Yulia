import { useEffect } from 'react';
import { ArrowRight, Atom, BookOpen, FlaskConical, Leaf, MessageCircle, RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import heroBackground from '../assets/yulia/home/heroBackground.png';
import studentImage from '../assets/yulia/home/studentImage.png';
import teacherImage from '../assets/yulia/home/teacherImage.png';
import { useAuth } from './AuthContext';

const benefits = [
  { icon: BookOpen, title: 'Cursos creados por docentes', description: 'Contenido estructurado por especialistas.', color: 'bg-blue-50 text-action' },
  { icon: MessageCircle, title: 'Simulaciones conversacionales', description: 'Casos interactivos guiados por IA.', color: 'bg-emerald-50 text-brand-ink' },
  { icon: FlaskConical, title: 'Aprendizaje práctico', description: 'Aplica conocimientos en escenarios reales.', color: 'bg-blue-50 text-action' },
  { icon: RotateCcw, title: 'Progreso continuo', description: 'Retoma tus simulaciones y sigue avanzando.', color: 'bg-emerald-50 text-brand-ink' },
];

const studentSteps = ['Crea tu cuenta', 'Inscríbete en un curso', 'Entra a una simulación', 'Conversa con el tutor IA'];
const teacherSteps = ['Crea un curso', 'Diseña una simulación', 'Publica para tus estudiantes'];

function JourneyPanel({ title, description, steps, image, imageAlt, tone }) {
  const student = tone === 'student';
  return <article className={`home-journey relative isolate flex min-h-[355px] flex-col overflow-hidden rounded-[1.5rem] border p-6 sm:flex-row sm:p-7 lg:p-7 xl:p-8 ${student ? 'border-blue-100 bg-[#edf6ff]' : 'border-emerald-100 bg-[#eff9f2]'}`}>
    <div className={`pointer-events-none absolute -bottom-28 -right-16 size-96 rounded-full border opacity-60 ${student ? 'border-blue-200 bg-blue-100/35' : 'border-emerald-200 bg-emerald-100/35'}`} aria-hidden="true" />
    <div className="relative z-10 flex w-full flex-col sm:max-w-[64%] lg:max-w-[67%] xl:max-w-[62%]">
      <span className={`mb-3 inline-flex self-start rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${student ? 'border-blue-200 bg-white/80 text-action' : 'border-emerald-200 bg-white/80 text-brand-ink'}`}>{student ? 'Estudiante' : 'Docente'}</span>
      <h3 className="text-2xl font-semibold tracking-tight text-navy sm:text-[1.7rem]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-700">{description}</p>
      <ol className={`home-steps relative mt-5 flex flex-col gap-2 ${student ? 'home-steps-blue' : 'home-steps-green'}`} aria-label={`Pasos ${student ? 'para estudiantes' : 'para docentes'}`}>
        {steps.map((step, index) => <li key={step} className="relative z-10 flex items-center gap-3 text-sm font-medium text-navy">
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-full border bg-white text-[11px] font-bold shadow-sm ${student ? 'border-blue-200 text-action' : 'border-emerald-200 text-brand-ink'}`}>{String(index + 1).padStart(2, '0')}</span>
          <span>{step}</span>
        </li>)}
      </ol>
    </div>
    <img src={image} alt={imageAlt} loading="lazy" className="pointer-events-none relative z-0 -mb-6 -mr-6 mt-3 h-[185px] w-auto max-w-[70%] self-end object-contain object-bottom drop-shadow-[0_12px_12px_rgba(15,41,66,0.12)] sm:absolute sm:bottom-0 sm:right-[-3%] sm:m-0 sm:h-[87%] sm:max-w-[46%] lg:right-[-5%] lg:max-w-[44%] xl:right-[-2%] xl:max-w-[46%]" />
  </article>;
}

export function HomePage() {
  const { user } = useAuth();
  const location = useLocation();
  const coursePath = user ? user.role === 'teacher' ? '/docente' : '/estudiante' : '/acceso';

  useEffect(() => {
    if (location.hash === '#acerca') document.getElementById('acerca')?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location.hash]);

  return <>
    <section className="home-hero relative overflow-hidden bg-[#f8fbfe] lg:min-h-[560px]">
      <div className="site-container py-11 sm:py-14 lg:flex lg:min-h-[560px] lg:items-center lg:py-12">
        <div className="home-hero-copy relative z-10 max-w-[620px] lg:w-[50%] lg:max-w-none lg:pr-5">
          <p className="eyebrow flex items-center gap-3 text-xs tracking-[0.08em] sm:text-sm sm:tracking-[0.12em]"><span className="h-px w-7 shrink-0 bg-brand" aria-hidden="true" />Bioquímica aplicada a la nutrición</p>
          <h1 aria-label="Aprende mediante casos y simulaciones" className="mt-5 text-[2.7rem] font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-[3.3rem] xl:text-[3.65rem] 2xl:text-[4rem]">
            Aprende mediante<br className="hidden sm:block" /> <span className="text-brand-ink">casos y simulaciones</span>
          </h1>
          <p className="mt-6 max-w-[510px] text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">Practica el razonamiento bioquímico y nutricional mediante escenarios guiados por un tutor inteligente.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/acceso" size="lg" icon={ArrowRight} iconPosition="end" className="home-cta-primary w-full sm:w-auto">Comenzar</Button>
            <Button to={coursePath} variant="secondary" size="lg" icon={ArrowRight} iconPosition="end" className="home-cta-secondary w-full sm:w-auto">Explorar cursos</Button>
          </div>
        </div>
      </div>
      <div className="relative h-[290px] w-full overflow-hidden sm:h-[400px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[58%]" aria-label="Yulia con recursos de bioquímica y nutrición">
        <img src={heroBackground} alt="Yulia junto a una laptop, libros de bioquímica y alimentos" className="absolute inset-0 size-full object-cover object-right" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-56 bg-gradient-to-r from-[#f8fbfe] via-[#f8fbfe]/80 to-transparent lg:block" aria-hidden="true" />
      </div>
    </section>

    <section className="home-benefits relative overflow-hidden" aria-label="Beneficios de la plataforma">
      <Atom size={152} strokeWidth={0.8} className="pointer-events-none absolute -left-12 top-4 text-action opacity-[0.07]" aria-hidden="true" />
      <Leaf size={112} strokeWidth={0.8} className="pointer-events-none absolute -right-7 bottom-0 text-brand-ink opacity-[0.08]" aria-hidden="true" />
      <div className="site-container relative z-10 py-10 sm:py-12 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description, color }, index) => <article key={title} className="home-benefit rounded-2xl border border-white/90 bg-white p-4 shadow-[0_3px_16px_rgba(15,41,66,0.05)]" style={{ animationDelay: `${index * 70}ms` }}>
            <span className={`home-benefit-icon mb-2.5 inline-flex size-9 items-center justify-center rounded-xl ${color}`}><Icon size={19} aria-hidden="true" /></span>
            <h2 className="text-[15px] font-semibold leading-snug text-navy">{title}</h2>
            <p className="mt-1.5 text-sm leading-[1.55] text-slate-700">{description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section id="acerca" className="scroll-mt-24 bg-[#fdfefd] pb-14 pt-12 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
      <div className="site-container">
        <div className="text-center">
          <p className="eyebrow text-xs">Una plataforma, dos experiencias</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-[2.1rem]">¿Cómo funciona?</h2>
          <p className="mt-2 text-base text-slate-700">Dos perfiles, una misma plataforma.</p>
          <span className="mx-auto mt-5 block h-0.5 w-12 rounded-full bg-brand/70" aria-hidden="true" />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:gap-6">
          <JourneyPanel title="Para estudiantes" description="Explora, practica y aprende con la guía de un tutor inteligente." steps={studentSteps} image={studentImage} imageAlt="Estudiante con computadora portátil" tone="student" />
          <JourneyPanel title="Para docentes" description="Crea experiencias de aprendizaje interactivas para tus estudiantes." steps={teacherSteps} image={teacherImage} imageAlt="Docente de bioquímica con tableta" tone="teacher" />
        </div>
      </div>
    </section>
  </>;
}
