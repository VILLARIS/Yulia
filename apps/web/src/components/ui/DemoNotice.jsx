import { Info } from 'lucide-react';

/**
 * Aviso permanente de demostración. Aparece en las pantallas que muestran datos
 * ficticios para que nadie pueda confundir una captura con un resultado real.
 */
export function DemoNotice({ title, message, className = '', compact = false }) {
  return (
    <div
      role="note"
      className={`flex gap-3 rounded-panel border border-blue-100 bg-blue-50/70 ${compact ? 'px-4 py-3' : 'px-4 py-4 sm:px-5'} ${className}`}
    >
      <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-action" />
      <div className="min-w-0 text-sm leading-6">
        <p className="font-semibold text-action">{title}</p>
        <p className="mt-0.5 text-slate-700">{message}</p>
      </div>
    </div>
  );
}
