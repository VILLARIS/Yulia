import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * Encabezado de página con migas de pan, título, descripción y acciones.
 * Unifica la jerarquía visual de todas las pantallas y evita que cada página
 * defina sus propios estilos de título.
 */
export function PageHeader({ title, description, breadcrumbs = [], actions, children }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-6 lg:px-8 lg:pb-10 lg:pt-8">
        {breadcrumbs.length > 0 ? (
          <nav aria-label="Ruta de navegación" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    {index > 0 ? (
                      <ChevronLeft size={14} aria-hidden="true" className="rotate-180 text-slate-300" />
                    ) : null}
                    {crumb.to && !isLast ? (
                      <Link
                        to={crumb.to}
                        className="underline-offset-4 transition-colors hover:text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-slate-700' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-navy lg:text-4xl">{title}</h1>
            {description ? (
              <p className="mt-3 text-base leading-7 text-slate-600 lg:text-lg">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}
