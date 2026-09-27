import { Link } from 'react-router-dom';
import { ArrowLeft, UserCog, UserRound } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { Message } from '../ui/Message';

/**
 * Cascarón de las pantallas de acceso: columna de presentación y columna de
 * formulario. Reutilizable por inicio de sesión, registro y recuperación.
 */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16 lg:py-16">
      <div className="max-w-xl">
        <Link
          to={APP_ROUTES.home}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 underline-offset-4 transition-colors hover:text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-navy lg:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p> : null}

        <div className="mt-8 rounded-panel border border-amber-200 bg-amber-50/70 px-4 py-4">
          <p className="text-sm font-semibold text-warning">Autenticación no implementada</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            Esta pantalla valida el formulario en el navegador, pero no existe servicio de
            identidad en esta versión. No se envían credenciales, no se generan tokens y no se
            almacena nada. Puedes explorar las interfaces desde los accesos de abajo.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <DemoAccessLink
            to={APP_ROUTES.studentDashboard}
            icon={UserRound}
            title="Vista estudiante"
            description="Panel, actividades y simulador"
          />
          <DemoAccessLink
            to={APP_ROUTES.teacherDashboard}
            icon={UserCog}
            title="Vista docente"
            description="Actividades, prompt y seguimiento"
          />
        </div>
      </div>

      <div className="w-full">
        <div className="rounded-panel border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
          {children}
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-slate-600">{footer}</div> : null}
      </div>
    </div>
  );
}

function DemoAccessLink({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="flex min-h-20 items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-action hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
    >
      <Icon size={19} aria-hidden="true" className="mt-0.5 shrink-0 text-action" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-navy">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-600">{description}</span>
      </span>
    </Link>
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
