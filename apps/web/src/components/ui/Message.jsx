import { CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react';

const TONES = {
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-warning',
  info: 'border-blue-200 bg-blue-50 text-action',
  success: 'border-emerald-200 bg-emerald-50 text-success',
};

/** Cada tono lleva el icono que le corresponde, no siempre el de advertencia. */
const TONE_ICONS = {
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  success: CheckCircle2,
};

/**
 * Mensaje de error o aviso en línea. `role="alert"` hace que el motor de
 * pantalla lo anuncie en cuanto aparece, lo que importa al validar un formulario.
 */
export function Message({ tone = 'error', title, children, className = '' }) {
  const Icon = TONE_ICONS[tone] ?? TONE_ICONS.error;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-panel border px-4 py-3 ${TONES[tone] ?? TONES.error} ${className}`}
    >
      <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="min-w-0 text-sm leading-6">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? 'mt-0.5' : ''}>{children}</div> : null}
      </div>
    </div>
  );
}

/** Resumen de errores de formulario, enfocado al enviar un envío fallido. */
export function ErrorSummary({ title = 'Revisa estos campos antes de continuar', errors }) {
  const entries = Object.entries(errors ?? {}).filter(([, value]) => Boolean(value));
  if (entries.length === 0) return null;

  return (
    <div
      role="alert"
      tabIndex={-1}
      className="rounded-panel border border-red-200 bg-red-50 px-4 py-4 text-sm"
    >
      <p className="font-semibold text-red-800">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-red-800">
        {entries.map(([key, value]) => (
          <li key={key}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
