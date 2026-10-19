import { ArrowRight, BookOpen, Check, FlaskConical, GraduationCap, Leaf, MessageCircle, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from './AuthContext';

const highlights = [
  { tone: 'green', icon: MessageCircle, title: 'Simulaciones conversacionales', text: 'Practica casos reales guiado por Yulia, la tutora IA.' },
  { tone: 'blue', icon: ShieldCheck, title: 'Contenido de especialistas', text: 'Cursos y videos creados y revisados por docentes.' },
  { tone: 'green', icon: Sparkles, title: 'Aprendizaje activo', text: 'Razonas, decides y recibes retroalimentación al instante.' },
];

const principles = [
  { icon: FlaskConical, title: 'Del concepto a la decisión', text: 'Cada tema baja a la práctica: interpretar datos, resolver casos y justificar cada decisión.' },
  { icon: MessageCircle, title: 'Enseñar preguntando', text: 'La tutora IA no da la respuesta: conduce con preguntas y pistas para que llegues a ella.' },
  { icon: Leaf, title: 'Cercana y rigurosa', text: 'Un lenguaje claro y cálido, respaldado por el rigor de la bromatología y la nutrición.' },
];

const features = [
  { tone: 'green', icon: BookOpen, title: 'Cursos estructurados', text: 'Recorridos claros, con objetivos y contenido contextualizado.' },
  { tone: 'blue', icon: MessageCircle, title: 'Casos y simulaciones', text: 'Escenarios guiados que entrenan el razonamiento clínico.' },
  { tone: 'mint', icon: Play, title: 'Videos cortos', text: 'Conceptos clave explicados en pocos minutos.' },
  { tone: 'sky', icon: GraduationCap, title: 'Materias docentes', text: 'Herramientas para crear y publicar experiencias propias.' },
];

const studentPoints = ['Explora cursos y simulaciones', 'Practica casos a tu ritmo', 'Refuerza con videos breves'];
const teacherPoints = ['Crea cursos y casos', 'Diseña simulaciones guiadas', 'Comparte contenido con tu grupo'];

/*
 * Tailwind purga las clases construidas con plantillas (`about-feature-${tone}`),
 * así que los nombres completos se resuelven con estos mapas literales.
 */
const featureTone = { green: 'about-feature-green', blue: 'about-feature-blue', mint: 'about-feature-mint', sky: 'about-feature-sky' };
const statTone = { green: 'about-stat-icon-green', blue: 'about-stat-icon-blue' };
const audienceTone = { student: 'about-audience-student', teacher: 'about-audience-teacher' };

function AudienceCard({ tone, title, points }) {
  return (
    <article className={`about-audience-card ${audienceTone[tone]}`}>
      <span className="about-audience-tag">
        <GraduationCap size={14} aria-hidden="true" />
        {tone === 'student' ? 'Estudiantes' : 'Docentes'}
      </span>
      <h3 className="about-audience-title">{title}</h3>
      <ul className="about-audience-list">
        {points.map((point) => (
          <li key={point}>
            <span className="about-audience-check" aria-hidden="true"><Check size={12} /></span>
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function AboutPage() {
  const { user } = useAuth();
  const coursePath = user ? user.role === 'teacher' ? '/docente' : '/estudiante' : '/acceso';

  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="acerca-titulo">
        <div className="site-container about-hero-inner">
          <div className="about-hero-copy">
            <p className="home-eyebrow">Acerca de</p>
            <h1 id="acerca-titulo" className="about-title">Aprender nutrición con casos que se sienten reales</h1>
            <p className="about-lead">Yulia reúne cursos, simulaciones conversacionales y contenido breve en una sola experiencia de bromatología y nutrición, pensada para aprender aplicando.</p>
            <div className="about-hero-actions">
              <Button to={coursePath} size="lg" className="home-cta-green">Explorar cursos</Button>
              <Button to="/acceso" variant="secondary" size="lg">Comenzar ahora</Button>
            </div>
          </div>
          <aside className="about-hero-card" aria-label="La plataforma en breve">
            {highlights.map(({ tone, icon: Icon, title, text }) => (
              <div key={title} className="about-stat">
                <span className={`about-stat-icon ${statTone[tone]}`} aria-hidden="true"><Icon size={20} strokeWidth={1.9} /></span>
                <div>
                  <p className="about-stat-title">{title}</p>
                  <p className="about-stat-text">{text}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="about-section about-section-cream" aria-labelledby="propuesta-titulo">
        <div className="site-container">
          <div className="about-intro">
            <p className="home-eyebrow">Nuestra propuesta</p>
            <h2 id="propuesta-titulo" className="about-h2">Comprender para decidir mejor</h2>
            <p className="about-text">Estudiar nutrición no es solo memorizar datos: es saber qué preguntar, cómo interpretar una muestra y por qué elegir una respuesta. Por eso diseñamos cada experiencia alrededor de la práctica.</p>
          </div>
          <div className="about-principles">
            {principles.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="about-principle">
                <span className="about-principle-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="about-principle-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.9} /></span>
                <h3 className="about-principle-title">{title}</h3>
                <p className="about-principle-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-sky" aria-labelledby="pilares-titulo">
        <div className="site-container">
          <div className="about-intro">
            <p className="home-eyebrow">Cómo se aprende aquí</p>
            <h2 id="pilares-titulo" className="about-h2">Cuatro formas de aprender haciendo</h2>
            <p className="about-text">Se combinan para que puedas entrar por donde prefieras y avanzar a tu ritmo.</p>
          </div>
          <div className="about-features">
            {features.map(({ tone, icon: Icon, title, text }) => (
              <article key={title} className={`about-feature ${featureTone[tone]}`}>
                <span className="about-feature-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.9} /></span>
                <h3 className="about-feature-title">{title}</h3>
                <p className="about-feature-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-mint" aria-labelledby="audiencia-titulo">
        <div className="site-container">
          <div className="about-intro">
            <p className="home-eyebrow">Una plataforma, dos recorridos</p>
            <h2 id="audiencia-titulo" className="about-h2">Para quienes aprenden y para quienes enseñan</h2>
          </div>
          <div className="about-audience">
            <AudienceCard tone="student" title="Para estudiantes" points={studentPoints} />
            <AudienceCard tone="teacher" title="Para docentes" points={teacherPoints} />
          </div>
        </div>
      </section>

      <section className="about-section about-section-cream" aria-labelledby="acerca-cierre">
        <div className="site-container">
          <div className="about-final">
            <Leaf size={110} strokeWidth={0.9} className="about-final-leaf about-final-leaf-left" aria-hidden="true" />
            <Leaf size={88} strokeWidth={0.9} className="about-final-leaf about-final-leaf-right" aria-hidden="true" />
            <div className="relative z-10">
              <h2 id="acerca-cierre" className="about-final-title">Empieza a aprender nutrición de otra manera</h2>
              <p className="about-final-text">Explora los cursos, entra a una simulación y descubre lo que se siente razonar un caso real.</p>
              <div className="about-final-actions">
                <Button to={coursePath} size="lg" className="home-cta-green">Explorar cursos</Button>
                <Button to="/acceso" variant="secondary" size="lg" icon={ArrowRight} iconPosition="end">Comenzar</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
