import { Link } from 'react-router-dom';

/**
 * Clases base compartidas. Se declaran completas (no por interpolación) para
 * que el purgado de Tailwind en producción las detecte siempre.
 */
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55';

const VARIANTS = {
  primary: 'bg-action text-white hover:bg-action-strong',
  secondary: 'border border-slate-300 bg-white text-navy hover:bg-slate-50',
  ghost: 'text-action hover:bg-blue-50',
  danger: 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100',
};

const SIZES = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
};

/**
 * Botón único de la plataforma. Renderiza un enlace de React Router cuando
 * recibe `to` y un `<button>` en cualquier otro caso, de modo que la apariencia
 * y el foco accesible sean siempre coherentes y nunca haya botones que aparenten
 * una acción inexistente.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  icon: Icon,
  iconPosition = 'start',
  disabled = false,
  className = '',
  type = 'button',
  ...rest
}) {
  const classes = [BASE, VARIANTS[variant] ?? VARIANTS.primary, SIZES[size] ?? SIZES.md, className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {Icon && iconPosition === 'start' ? (
        <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" className="shrink-0" />
      ) : null}
      <span className="min-w-0">{children}</span>
      {Icon && iconPosition === 'end' ? (
        <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" className="shrink-0" />
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
