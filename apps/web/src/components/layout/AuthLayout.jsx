import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { Message } from '../ui/Message';
import yuliaLogo from '../../assets/yulia/logo-yulia.jpeg';
import loginImage from '../../assets/yulia/login/login.png';
import registerImage from '../../assets/yulia/login/register.png';

/** Composición compartida por acceso y registro; el formulario queda sobre blanco. */
export function AuthLayout({ mode = 'login', title, subtitle, children, footer }) {
  const isRegister = mode === 'register';
  return (
    <div className="auth-page grid min-h-screen w-full bg-white md:grid-cols-[40%_60%] lg:grid-cols-2">
      <div className="relative hidden min-h-screen overflow-hidden bg-[#f4f9ff] md:block">
        <img
          src={isRegister ? registerImage : loginImage}
          alt={isRegister ? 'Yulia te invita a comenzar con cursos y simulaciones' : 'Yulia te da la bienvenida para continuar aprendiendo'}
          className="auth-visual-image absolute inset-0 size-full object-cover object-[30%_center] lg:object-top"
        />
      </div>
      <div className="flex min-h-screen min-w-0 flex-col bg-white">
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 md:px-8 lg:px-12">
          <div className="w-full max-w-[460px]">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <Link to={APP_ROUTES.home} className="inline-flex items-center gap-2.5 rounded-lg">
                <img src={yuliaLogo} alt="" className="size-9 rounded-lg border border-slate-200 object-cover" />
                <span className="flex flex-col leading-tight">
                  <strong className="text-base tracking-[0.08em] text-navy">YULIA</strong>
                  <small className="text-[9px] font-semibold tracking-[0.08em] text-slate-500">BIOQUÍMICA NUTRICIONAL</small>
                </span>
              </Link>
              <Link to={APP_ROUTES.home} className="auth-return inline-flex items-center gap-1.5 text-sm text-slate-600">
                <ArrowLeft size={15} aria-hidden="true" />
                Volver al inicio
              </Link>
            </div>
            <h1 className="mt-9 text-3xl font-semibold tracking-tight text-navy sm:text-[2.15rem]">{title}</h1>
            {subtitle ? <p className="mt-2 text-base leading-7 text-slate-600">{subtitle}</p> : null}
            <div className="mt-8">
          {children}
            </div>
            {footer ? <div className="mt-6 text-center text-sm text-slate-600">{footer}</div> : null}
          </div>
        </div>
        <p className="px-5 pb-5 text-center text-xs text-slate-500">© 2026 Yulia Bioquímica Nutricional.</p>
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
