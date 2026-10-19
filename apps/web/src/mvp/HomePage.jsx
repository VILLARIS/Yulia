import { useEffect } from 'react';
import { ArrowRight, BookOpen, Check, Clock, FlaskConical, GraduationCap, Leaf, MessageCircle, Play, RotateCcw, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import heroBackground from '../assets/yulia/home/heroBackground.png';
import studentImage from '../assets/yulia/home/studentImage.png';
import teacherImage from '../assets/yulia/home/teacherImage.png';
import yuliaAvatar from '../assets/yulia/avatar-yulia.png';
import { useAuth } from './AuthContext';

const studentSteps = ['Crea tu cuenta', 'Inscríbete en un curso', 'Entra a una simulación', 'Conversa con el tutor IA'];
const teacherSteps = ['Crea un curso', 'Diseña simulaciones', 'Publica videos cortos', 'Acompaña el progreso'];

const teacherBenefits = ['Crear cursos', 'Diseñar simulaciones', 'Compartir videos', 'Revisar participación y progreso'];

/*
 * Los tonos de los paneles y de los reels se aplican con plantillas
 * (`home-experience-${tone}`), así que las clases resultantes nunca aparecen
 * como texto literal y Tailwind las purga al compilar. Estas listas las
 * enumeran completas para que sobrevivan al purgado en producción.
 */
const experienceTones = ['home-experience-student', 'home-experience-teacher'];
const tagTones = ['home-tag-student', 'home-tag-teacher'];
const pathTones = ['home-path-student', 'home-path-teacher'];
const reelTones = ['home-reel-green', 'home-reel-blue', 'home-reel-ivory'];


const videos = [
  { title: '¿Qué son los macronutrientes?', duration: '3:24', tone: 'green', icon: BookOpen },
  { title: 'Cómo leer una etiqueta nutricional', duration: '4:10', tone: 'blue', icon: FlaskConical },
  { title: 'Vitaminas hidrosolubles y liposolubles', duration: '5:02', tone: 'ivory', icon: Leaf },
  { title: 'Triglicéridos: lo esencial', duration: '2:48', tone: 'green', icon: MessageCircle },
];

const conversation = [
  { role: 'tutor', text: 'Hola, soy Yulia. Vamos con un caso: un paciente llega con fatiga y palidez. ¿Qué analizarías primero?' },
  { role: 'student', text: 'Revisaría sus niveles de hierro y de hemoglobina.' },
  { role: 'tutor', text: 'Buen enfoque. ¿Por qué el hierro es clave para la hemoglobina?' },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? <p className="home-eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-3 text-[1.7rem] font-semibold leading-[1.15] tracking-tight text-[#173b6c] sm:text-[2.05rem] lg:text-[2.3rem]">{title}</h2>
      {description ? <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#5c6f82]">{description}</p> : null}
    </div>
  );
}

function ExperiencePanel({ tone, title, steps, image, imageAlt, ctaTo, ctaLabel }) {
  return (
    <article className={`home-experience home-experience-${tone}`}>
      <span className="home-experience-glow" aria-hidden="true" />
      <div className="home-experience-body">
        <span className={`home-tag home-tag-${tone}`}>
          <GraduationCap size={14} aria-hidden="true" />
          {tone === 'student' ? 'Estudiante' : 'Docente'}
        </span>
        <h3 className="home-experience-title">{title}</h3>
        <ol className={`home-path home-path-${tone}`} aria-label={`Pasos para ${title.toLowerCase()}`}>
          {steps.map((step, index) => (
            <li key={step}>
              <span className="home-path-num">{String(index + 1).padStart(2, '0')}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Button to={ctaTo} size="md" className={`mt-7 self-start ${tone === 'teacher' ? 'home-cta-green' : ''}`}>{ctaLabel}</Button>
      </div>
      <img src={image} alt={imageAlt} loading="lazy" className="home-experience-img" />
    </article>
  );
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
    <section className="home-hero">
      <div className="site-container home-hero-stage">
        <div className="home-hero-copy">
          <p className="eyebrow text-xs tracking-[0.14em] sm:text-[0.8125rem]">Aprendizaje aplicado</p>
          <h1 aria-label="Aprende bromatología y nutrición a través de casos reales" className="mt-4 text-[2.5rem] font-bold leading-[1.08] tracking-tight text-[#173b6c] sm:text-[3rem] lg:text-[3.3rem] xl:text-[3.55rem]">
            Aprende bromatología y nutrición<br className="hidden sm:block" /> <span className="text-[#2b8537]">a través de casos reales</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-7 text-[#5c6f82] sm:text-lg sm:leading-8">Cursos, simulaciones conversacionales y contenido breve para aprender aplicando.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to={coursePath} size="lg" className="home-cta-primary w-full sm:w-auto">Explorar cursos</Button>
            <Button to="/acceso" variant="secondary" size="lg" className="home-cta-secondary w-full sm:w-auto">Ver simulaciones</Button>
          </div>
          <ul className="home-hero-points" aria-label="Ventajas de la plataforma">
            <li>Contenido creado por especialistas</li>
            <li>Simulaciones guiadas</li>
            <li>Aprendizaje práctico</li>
          </ul>
        </div>
      </div>
      <figure className="home-hero-media" aria-hidden="true">
        <img src={heroBackground} alt="" />
        <span className="home-hero-scrim" />
      </figure>
    </section>

    <section className="home-section home-section-cream" aria-labelledby="valor-titulo">
      <div className="site-container">
        <SectionHeading
          eyebrow="Una forma distinta de aprender"
          title="Aprende haciendo, no solo leyendo"
          description="Combina cursos, casos, simulaciones conversacionales y contenido breve en una experiencia pensada para aplicar conocimientos."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
          <article className="home-bento home-bento-feature md:col-span-2 lg:col-span-7 lg:row-span-2">
            <span className="home-bento-index" aria-hidden="true">01</span>
            <span className="home-bento-icon home-bento-icon-green"><MessageCircle size={20} aria-hidden="true" /></span>
            <h3 className="home-bento-title">Casos y simulaciones</h3>
            <p className="home-bento-text">Analiza situaciones reales y desarrolla tu razonamiento paso a paso.</p>
            <p className="home-bento-note">Preguntas, pistas y retroalimentación en cada decisión.</p>
          </article>
          <article className="home-bento home-bento-courses lg:col-span-5">
            <span className="home-bento-index" aria-hidden="true">02</span>
            <span className="home-bento-icon home-bento-icon-blue"><BookOpen size={20} aria-hidden="true" /></span>
            <h3 className="home-bento-title">Cursos creados por docentes</h3>
            <p className="home-bento-text">Contenido estructurado y contextualizado.</p>
          </article>
          <article className="home-bento home-bento-videos lg:col-span-5">
            <span className="home-bento-index" aria-hidden="true">03</span>
            <span className="home-bento-icon home-bento-icon-green"><Play size={20} aria-hidden="true" /></span>
            <h3 className="home-bento-title">Videos cortos</h3>
            <p className="home-bento-text">Conceptos clave explicados en minutos.</p>
          </article>
          <article className="home-bento home-bento-wide md:col-span-2 lg:col-span-12">
            <span className="home-bento-index" aria-hidden="true">04</span>
            <span className="home-bento-icon home-bento-icon-blue"><RotateCcw size={20} aria-hidden="true" /></span>
            <div>
              <h3 className="home-bento-title">Aprendizaje continuo</h3>
              <p className="home-bento-text">Retoma tus simulaciones, revisa tus cursos y sigue avanzando.</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="acerca" className="home-section home-section-sky scroll-mt-24" aria-labelledby="como-titulo">
      <div className="site-container">
        <SectionHeading
          title="Una plataforma, dos experiencias"
          description="Diseñada para quienes aprenden y para quienes enseñan."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <ExperiencePanel
            tone="student"
            title="Para estudiantes"
            steps={studentSteps}
            image={studentImage}
            imageAlt="Estudiante con computadora portátil"
            ctaTo={coursePath}
            ctaLabel="Explorar cursos"
          />
          <ExperiencePanel
            tone="teacher"
            title="Para docentes"
            steps={teacherSteps}
            image={teacherImage}
            imageAlt="Docente de bioquímica con tableta"
            ctaTo="/registro"
            ctaLabel="Comenzar como docente"
          />
        </div>
      </div>
    </section>

    <section className="home-section home-section-mint" aria-labelledby="videos-titulo">
      <div className="site-container">
        <SectionHeading
          eyebrow="Aprende en minutos"
          title="Videos cortos para reforzar conceptos"
          description="Contenido breve creado por la docente para aprender, repasar y descubrir nuevos temas."
        />
        <ul className="home-reels">
          {videos.map(({ title, duration, tone, icon: Icon }) => (
            <li key={title}>
              <article className="home-reel">
                <div className={`home-reel-thumb home-reel-${tone}`}>
                  <Icon size={44} strokeWidth={1.25} aria-hidden="true" className="home-reel-mark opacity-30" />
                  <span className="home-reel-play"><Play size={16} aria-hidden="true" className="translate-x-px" /></span>
                </div>
                <h3 className="home-reel-title">{title}</h3>
                <p className="home-reel-meta"><Clock size={13} aria-hidden="true" />{duration}</p>
              </article>
            </li>
          ))}
        </ul>
        <div className="mt-9 text-center">
          <Button to="/videos" size="lg" icon={ArrowRight} iconPosition="end" className="home-cta-green home-arrow-cta">Ver todos los videos</Button>
        </div>
      </div>
    </section>

    <section className="home-section home-section-sky" aria-labelledby="simulacion-titulo">
      <div className="site-container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="home-eyebrow">Simulación interactiva</p>
          <h2 className="mt-3 text-[1.7rem] font-semibold leading-[1.15] tracking-tight text-[#173b6c] sm:text-[2.05rem] lg:text-[2.3rem]">Aprende conversando</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-[#5c6f82]">Cada simulación te guía con preguntas, pistas y retroalimentación para ayudarte a razonar.</p>
          <Button to={coursePath} size="lg" className="mt-7">Explorar simulaciones</Button>
        </div>
        <div className="home-chat" aria-hidden="true">
          {conversation.map((message, index) => {
            const isStudent = message.role === 'student';
            return (
              <div key={index} className={`home-chat-row ${isStudent ? 'home-chat-row-student' : ''}`}>
                {isStudent
                  ? <span className="home-chat-avatar home-chat-avatar-fallback">Tú</span>
                  : <img src={yuliaAvatar} alt="" className="home-chat-avatar home-chat-avatar-tutor" />}
                <div className={`home-chat-bubble ${isStudent ? 'home-chat-bubble-student' : 'home-chat-bubble-tutor'}`}>
                  {isStudent ? null : <span className="home-chat-label">Yulia · Tutora</span>}
                  {message.text}
                </div>
              </div>
            );
          })}
          <div className="home-chat-input">
            <span>Escribe tu razonamiento…</span>
            <span className="home-chat-send"><Send size={14} aria-hidden="true" /></span>
          </div>
        </div>
      </div>
    </section>

    <section className="home-section home-section-green" aria-labelledby="docentes-titulo">
      <div className="site-container">
        <div className="home-teacher">
          <div>
            <p className="home-eyebrow home-eyebrow-amber">Para docentes</p>
            <h2 className="mt-3 text-[1.6rem] font-semibold leading-[1.2] tracking-tight text-[#173b6c] sm:text-[1.9rem] lg:text-[2.1rem]">Crea experiencias de aprendizaje que van más allá de una clase</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#5c6f82]">Organiza cursos, diseña casos, publica simulaciones y comparte contenido con tus estudiantes desde un mismo lugar.</p>
            <ul className="home-check-list">
              {teacherBenefits.map((benefit) => (
                <li key={benefit} className="home-check">
                  <span className="home-check-icon"><Check size={12} aria-hidden="true" /></span>
                  {benefit}
                </li>
              ))}
            </ul>
            <Button to="/acceso" size="lg" className="home-cta-green-dark mt-8">Crear contenido</Button>
          </div>
          <figure className="home-teacher-figure">
            <span className="home-teacher-glow" aria-hidden="true" />
            <span className="home-teacher-accent" aria-hidden="true" />
            <img src={teacherImage} alt="Docente de bioquímica con tableta" loading="lazy" className="home-teacher-img" />
          </figure>
        </div>
      </div>
    </section>

    <section className="home-section" aria-labelledby="cierre-titulo">
      <div className="site-container">
        <div className="home-final">
          <Leaf size={120} strokeWidth={0.9} className="home-final-leaf home-final-leaf-left" aria-hidden="true" />
          <Leaf size={96} strokeWidth={0.9} className="home-final-leaf home-final-leaf-right" aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-[1.75rem] font-semibold leading-[1.18] tracking-tight text-[#173b6c] sm:text-[2.1rem] lg:text-[2.35rem]">Aprender nutrición también puede ser una experiencia</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#5c6f82]">Explora cursos, practica con casos y descubre una forma más activa de aprender.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to="/acceso" size="lg" className="home-cta-green w-full sm:w-auto">Comenzar</Button>
              <Button to={coursePath} variant="secondary" size="lg" className="home-cta-outline w-full sm:w-auto">Explorar cursos</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>;
}
