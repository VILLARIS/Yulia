/** Contenedor de superficie con borde y sombra discreta. */
export function Card({ as: Component = 'div', className = '', children, ...rest }) {
  return (
    <Component
      className={`rounded-panel border border-slate-200 bg-white shadow-panel ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Encabezado de tarjeta con título, descripción y acciones opcionales.
 * `level` debe ser un nombre de elemento en mayúscula (`level: Level`) para que
 * JSX lo interprete como encabezado. Por defecto es `h2`: el título de una
 * tarjeta suele ser el encabezado principal de su sección, y así la jerarquía
 * h1 → h2 → h3 del documento no se rompe. Solo usar `h3` cuando la tarjeta
 * esté anidada dentro de otra sección que ya aporta su `h2`.
 */
export function CardHeader({ title, description, actions, id, level: Level = 'h2' }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <Level id={headingId} className="text-lg font-semibold text-navy">
          {title}
        </Level>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function CardBody({ className = '', children, ...rest }) {
  return (
    <div className={`px-5 py-5 sm:px-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...rest }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}
