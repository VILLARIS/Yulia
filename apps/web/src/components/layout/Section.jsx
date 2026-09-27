/** Contenedor de contenido con el ancho máximo y el ritmo vertical del layout. */
export function Section({ children, className = '', as: Component = 'section', ...rest }) {
  return (
    <Component className={`mx-auto w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-12 ${className}`} {...rest}>
      {children}
    </Component>
  );
}

/** Versión estrecha para formularios y fichas que no necesitan ancho completo. */
export function SectionNarrow({ children, className = '', as: Component = 'section', ...rest }) {
  return (
    <Component className={`mx-auto w-full max-w-3xl px-5 py-10 lg:py-12 ${className}`} {...rest}>
      {children}
    </Component>
  );
}

/** Título de sección con subtítulo opcional. */
export function SectionHeading({ title, description, level: Level = 'h2', className = '', children }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0 max-w-2xl">
        <Level className="text-2xl font-semibold tracking-tight text-navy lg:text-3xl">{title}</Level>
        {description ? <p className="mt-2 text-base leading-7 text-slate-600">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}
