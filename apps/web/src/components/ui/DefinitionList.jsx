/**
 * Lista de pares término/valor para fichas de detalle. Los valores pueden ser
 * texto, o un elemento cuando requieren énfasis (por ejemplo, un estado vacío).
 */
export function DefinitionList({ items, columns = 2, className = '' }) {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <dl
      className={`grid gap-x-8 gap-y-5 ${columns === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'} ${className}`}
    >
      {visible.map((item) => (
        <div key={item.term} className="min-w-0">
          <dt className="text-sm text-slate-500">{item.term}</dt>
          <dd className="mt-1 text-sm font-medium leading-6 text-navy">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
