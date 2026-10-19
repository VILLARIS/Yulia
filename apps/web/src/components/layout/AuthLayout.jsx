import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FlaskConical, Target } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { Message } from '../ui/Message';
import yuliaLogo from '../../assets/yulia/logo-yulia.jpeg';
import loginImage from '../../assets/yulia/login/login.png';
import registerImage from '../../assets/yulia/login/register.png';

/**
 * Contenido de la columna visual. La marca y el titular acompañan a la
 * ilustración, pero el texto vive fuera de la imagen para no depender de un
 * recorte concreto y mantenerse legible en cualquier pantalla.
 */
const VISUALS = {
  login: {
    image: loginImage,
    alt: 'Yulia, docente de bromatología y nutrición',
    headline: 'Tu aprendizaje va más allá',
    description: 'Explora bromatología y nutrición mediante cursos, casos y simulaciones interactivas.',
    benefits: [
      { icon: BookOpen, label: 'Cursos interactivos' },
      { icon: FlaskConical, label: 'Casos y simulaciones' },
      { icon: Target, label: 'Aprendizaje práctico' },
    ],
  },
  register: {
    image: registerImage,
    alt: 'Yulia te invita a comenzar tu aprendizaje',
    headline: 'Comienza hoy tu aprendizaje',
    description: 'Crea tu cuenta y accede a cursos, simulaciones y contenido creado para estudiantes.',
    benefits: [
      { icon: BookOpen, label: 'Cursos interactivos' },
      { icon: FlaskConical, label: 'Simulaciones realistas' },
      { icon: Target, label: 'Aprendizaje a tu ritmo' },
    ],
  },
};

/** Composición compartida por acceso y registro: visual a la izquierda, formulario a la derecha. */
export function AuthLayout({ mode = 'login', title, subtitle, children, footer }) {
  const visual = VISUALS[mode] ?? VISUALS.login;

  return (
    <div className="auth-page flex min-h-screen w-full flex-col md:grid md:grid-cols-2">
      <aside className="auth-visual relative hidden min-h-screen overflow-hidden md:flex md:flex-col md:justify-end">
        <img src={visual.image} alt={visual.alt} className="absolute inset-0 size-full object-cover object-top" />
        <div className="auth-visual-overlay absolute inset-0" aria-hidden="true" />
        <div className="auth-visual-content relative z-10 p-8 lg:p-12">
          <p className="auth-visual-eyebrow">YULIA · Bromatología y Nutrición</p>
          <h2 className="auth-visual-title mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight lg:text-[2rem]">
            {visual.headline}
          </h2>
          <p className="auth-visual-text mt-3 max-w-md text-sm leading-6 lg:text-base lg:leading-7">
            {visual.description}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
            {visual.benefits.map(({ icon: Icon, label }) => (
              <li key={label} className="auth-benefit inline-flex items-center gap-2 text-sm font-medium">
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 md:px-10 lg:px-14">
          <div className="w-full max-w-[440px]">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <Link to={APP_ROUTES.home} className="inline-flex items-center gap-2.5 rounded-lg">
                <img src={yuliaLogo} alt="" className="size-9 rounded-lg border border-[#dce8d8] object-cover" />
                <span className="flex flex-col leading-tight">
                  <strong className="auth-brand-name text-base tracking-[0.08em]">YULIA</strong>
                  <small className="auth-brand-sub text-[10px] font-semibold tracking-[0.04em]">Bromatología y Nutrición</small>
                </span>
              </Link>
              <Link to={APP_ROUTES.home} className="auth-return inline-flex items-center gap-1.5 text-sm">
                <ArrowLeft size={15} aria-hidden="true" />
                Volver al inicio
              </Link>
            </div>
            <h1 className="auth-title mt-9 text-3xl font-semibold tracking-tight sm:text-[2.15rem]">{title}</h1>
            {subtitle ? <p className="auth-subtitle mt-2 text-base leading-7">{subtitle}</p> : null}
            <div className="mt-8">{children}</div>
            {footer ? <div className="auth-footer mt-6 text-center text-sm">{footer}</div> : null}
          </div>
        </div>
        <p className="auth-copy px-5 pb-5 text-center text-xs">© 2026 Yulia Bromatología y Nutrición.</p>
      </div>

      <div className="auth-mobile-banner relative h-56 overflow-hidden md:hidden">
        <img src={visual.image} alt={visual.alt} className="size-full object-cover object-[35%_center]" />
        <div className="auth-visual-overlay absolute inset-0" aria-hidden="true" />
        <p className="auth-visual-eyebrow absolute inset-x-0 bottom-4 px-6 text-center">{visual.headline}</p>
      </div>
    </div>
  );
}

/** Nota reutilizable para acciones de formulario que no pueden completarse. */
export function PendingActionNote({ children }) {
  return (
    <Message tone="warning" title="Acción no disponible en esta versión">
      {children}
    </Message>
  );
}
