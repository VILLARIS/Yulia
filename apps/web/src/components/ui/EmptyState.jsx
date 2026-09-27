/**
 * Estado vacío reutilizable. Se usa cuando una lista no tiene elementos por
 * motivos legítimos (aún no hay datos), nunca como sustituto de un error.
 */
export function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-panel border border-dashed border-slate-300 bg-slate-50/60 text-center ${compact ? 'px-5 py-8' : 'px-6 py-12'}`}
    >
      {Icon ? (
        <span className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400">
          <Icon size={20} aria-hidden="true" />
        </span>
      ) : null}
      <h3 className={`mt-4 font-semibold text-navy ${compact ? 'text-base' : 'text-lg'}`}>{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
