import { Link } from 'react-router-dom';
import { APP_ROUTES, FOOTER_SECTIONS } from '@bioquimica/shared/routes';
import yuliaLogo from '../../assets/yulia/logo-yulia.jpeg';

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img
                src={yuliaLogo}
                alt=""
                className="size-9 shrink-0 rounded-xl border border-slate-200 object-cover"
              />
              <span className="min-w-0">
                <strong className="block truncate text-sm font-bold tracking-[0.1em] text-navy">
                  BIOQUÍMICA NUTRICIONAL
                </strong>
                <span className="block truncate text-sm text-slate-500">
                  Decide ConCiencia con Yulia
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Plataforma académica para practicar razonamiento clínico y bioquímico sobre
              escenarios definidos por el profesorado.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-semibold text-navy">{section.title}</h2>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-600 underline-offset-4 transition-colors hover:text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Versión 0.2 · Interfaz de demostración sin datos reales
          </p>
          <p className="text-sm text-slate-500">
            ¿Necesitas entrar?{' '}
            <Link
              to={APP_ROUTES.login}
              className="font-medium text-action underline underline-offset-4 hover:text-action-strong"
            >
              Ir a acceso
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
