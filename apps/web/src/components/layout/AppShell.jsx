import { Outlet } from 'react-router-dom';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

/**
 * Cascarón de la aplicación: enlace de salto, cabecera, contenido principal y
 * pie. El `min-h` flexible mantiene el pie al fondo aunque la página sea corta.
 */
export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>
      <AppHeader />
      <main id="contenido-principal" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
