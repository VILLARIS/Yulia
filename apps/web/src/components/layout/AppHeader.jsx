import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, matchPath } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { APP_ROUTES, PUBLIC_NAVIGATION, ROUTE_DEFINITIONS, ROUTE_GROUPS, STUDENT_NAVIGATION, TEACHER_NAVIGATION } from '@bioquimica/shared/routes';
import yuliaLogo from '../../assets/yulia/logo-yulia.jpeg';

/**
 * Determina a qué espacio pertenece una ruta a partir del contrato compartido.
 * `matchPath` recibe primero el patrón y después la ruta real, y `end: true`
 * exige coincidencia completa: sin esta última opción, la raíz `/` capturaría
 * cualquier ruta y todo se clasificaría como público.
 */
export function resolveSpace(pathname) {
  const match = ROUTE_DEFINITIONS.find((definition) =>
    matchPath(
      {
        path: APP_ROUTES[definition.key],
        end: true,
      },
      pathname,
    ),
  );
  return match?.group ?? ROUTE_GROUPS.public;
}

const NAVIGATION_BY_SPACE = {
  [ROUTE_GROUPS.public]: PUBLIC_NAVIGATION,
  [ROUTE_GROUPS.student]: STUDENT_NAVIGATION,
  [ROUTE_GROUPS.teacher]: TEACHER_NAVIGATION,
};

const SPACE_LABELS = {
  [ROUTE_GROUPS.public]: 'Plataforma',
  [ROUTE_GROUPS.student]: 'Espacio estudiante',
  [ROUTE_GROUPS.teacher]: 'Espacio docente',
};

/** Etiquetas abreviadas para el intervalo md–lg, donde la fila completa no cabe. */
const SPACE_LABELS_SHORT = {
  [ROUTE_GROUPS.public]: 'Público',
  [ROUTE_GROUPS.student]: 'Estudiante',
  [ROUTE_GROUPS.teacher]: 'Docente',
};

/**
 * Identidad pública de la plataforma. El archivo de logo tiene fondo blanco, así
 * que se apoya directamente sobre la barra blanca con un borde suave que lo
 * delimita, sin el cuadrado oscuro que ocultaría la ilustración.
 *
 * El enlace lleva `aria-label` y la imagen `alt=""`: el nombre accesible lo
 * aporta el enlace, y el texto visible repite el nombre de la plataforma. El
 * logo mide 44 px y el bloque de texto unos 36 px (14 px + 12 px en interlineado
 * cerrado), así que manda el logo y el conjunto queda por debajo de los 60–64 px
 * de la barra: la marca no crece hacia arriba ni descuadra el centrado vertical.
 * El subtítulo se oculta por debajo de `sm`, donde no cabe sin recortar.
 */
function Wordmark() {
  return (
    <Link
      to={APP_ROUTES.home}
      className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
      aria-label="Decide ConCiencia, Bioquímica Nutricional. Ir al inicio"
    >
      <img
        src={yuliaLogo}
        alt=""
        className="size-11 shrink-0 rounded-xl border border-slate-200 object-cover"
      />
      <span className="min-w-0">
        <strong className="block truncate text-sm font-semibold leading-tight tracking-[0.08em] text-navy">
          BIOQUÍMICA NUTRICIONAL
        </strong>
        <span className="hidden truncate text-xs leading-tight text-slate-500 sm:block">
          Decide ConCiencia con Yulia
        </span>
      </span>
    </Link>
  );
}

export function AppHeader() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const space = resolveSpace(pathname);
  const navigation = NAVIGATION_BY_SPACE[space];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // El menú móvil es un disclosure, no un diálogo: no usa aria-modal ni trampa de
  // foco. Escape sí lo cierra y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-900/[0.07] bg-white/95 backdrop-blur-sm">
      <div className="site-container flex min-h-[3.75rem] items-center justify-between gap-4 sm:min-h-16">
        <Wordmark />

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
          {navigation.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
          {space === ROUTE_GROUPS.public ? (
            <NavLink to={APP_ROUTES.login} className={navLinkClass}>
              Acceso
            </NavLink>
          ) : null}
        </nav>

        <div className="hidden items-center md:flex">
          <span className="whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
            <span className="hidden lg:inline">{SPACE_LABELS[space]}</span>
            <span className="lg:hidden">{SPACE_LABELS_SHORT[space]}</span>
          </span>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="navegacion-movil"
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-slate-300 text-navy transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 md:hidden"
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          <span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>
      </div>

      {menuOpen ? (
        <div id="navegacion-movil" className="border-t border-slate-900/[0.07] bg-white md:hidden">
          <nav aria-label="Navegación principal móvil" className="site-container py-3">
            <ul className="space-y-0.5">
              {navigation.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium transition-colors ${
                        isActive ? 'bg-blue-50 font-semibold text-action' : 'text-slate-700 hover:bg-blue-50/70'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              {space === ROUTE_GROUPS.public ? (
                <li>
                  <NavLink
                    to={APP_ROUTES.login}
                    className="block rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium text-slate-700 transition-colors hover:bg-blue-50/70"
                  >
                    Acceso
                  </NavLink>
                </li>
              ) : null}
            </ul>
            <p className="mt-3 border-t border-slate-900/[0.07] px-3 pt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {SPACE_LABELS[space]}
            </p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
