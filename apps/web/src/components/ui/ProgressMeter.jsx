/**
 * Medidor de avance. Se reserva para progreso de interfaz (por ejemplo, la
 * completitud de un perfil). NO debe usarse para representar notas ni resultados
 * académicos: esos vendrán de la rúbrica que defina la docente.
 */
export function ProgressMeter({ value, label, valueLabel, tone = 'action' }) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  const tones = {
    action: 'bg-action',
    success: 'bg-success',
    warning: 'bg-warning',
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-navy">{valueLabel ?? `${percent} %`}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div className={`h-full rounded-full ${tones[tone] ?? tones.action}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
