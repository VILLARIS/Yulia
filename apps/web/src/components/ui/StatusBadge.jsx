/**
 * Indicador de estado. `dot` añade un punto de color para estados que se leen
 * mejor en listas densas; el texto siempre acompaña al color, nunca lo sustituye.
 *
 * Variantes semánticas (las únicas admitidas):
 * - `success`: estado completado, publicado o verificado.
 * - `warning`: estado pendiente que requiere atención.
 * - `info`: estado en curso o informativo.
 * - `neutral`: metadatos sin estado (área, nivel, versión, fecha).
 */
const VARIANTS = {
  success: 'border-emerald-200 bg-emerald-50 text-success',
  warning: 'border-amber-200 bg-amber-50 text-warning',
  info: 'border-blue-200 bg-blue-50 text-action',
  neutral: 'border-slate-200 bg-slate-50 text-slate-500',
};

export function StatusBadge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant] ?? VARIANTS.neutral} ${className}`}
    >
      {dot ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
