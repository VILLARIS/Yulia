/** Iniciales de una persona. El color se deriva del nombre de forma estable. */
const PALETTE = [
  'bg-blue-100 text-action',
  'bg-emerald-100 text-success',
  'bg-amber-100 text-warning',
  'bg-slate-200 text-navy',
  'bg-blue-50 text-navy',
];

function paletteFor(seed = '') {
  let total = 0;
  for (let index = 0; index < seed.length; index += 1) {
    total += seed.charCodeAt(index);
  }
  return PALETTE[total % PALETTE.length];
}

export function Avatar({ initials, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-14 text-lg',
  };

  return (
    <span
      aria-hidden="true"
      title={name}
      className={`grid shrink-0 place-items-center rounded-full font-bold ${sizes[size] ?? sizes.md} ${paletteFor(name ?? initials)} ${className}`}
    >
      {initials}
    </span>
  );
}
