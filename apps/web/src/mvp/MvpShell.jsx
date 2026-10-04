import { Outlet, useLocation } from 'react-router-dom';
import { MvpHeader } from './MvpHeader';
import { Link } from 'react-router-dom';
import yuliaLogo from '../assets/yulia/logo-yulia.jpeg';
import { useAuth } from './AuthContext';

export function MvpShell() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/acceso' || pathname === '/registro';
  const coursePath = user ? user.role === 'teacher' ? '/docente' : '/estudiante' : '/acceso';
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <a className="skip-link" href="#contenido-principal">Saltar al contenido</a>
      {!isAuthPage && <MvpHeader />}
      <main id="contenido-principal" tabIndex={-1} className="flex-1"><Outlet /></main>
      {!isAuthPage && <footer className="mvp-footer relative overflow-hidden border-t border-blue-100/80 py-7">
        <div className="site-container relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={yuliaLogo} alt="" className="size-10 rounded-xl border border-slate-200 object-cover" />
            <span className="flex flex-col leading-tight">
              <strong className="text-base tracking-[0.08em] text-navy">YULIA</strong>
              <small className="text-[9px] font-semibold tracking-[0.08em] text-slate-500">BIOQUÍMICA NUTRICIONAL</small>
            </span>
          </Link>
          <nav aria-label="Navegación del pie" className="mvp-footer-nav flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-700">
            <Link to="/">Inicio</Link>
            <Link to={coursePath}>Cursos</Link>
            <Link to="/#acerca">Acerca de</Link>
          </nav>
          <div className="text-sm leading-6 text-slate-700">
            <p>Aprende mediante casos y simulaciones guiadas.</p>
          </div>
        </div>
        <div className="site-container relative z-10 mt-6 border-t border-blue-100/70 pt-4 text-center text-xs text-slate-600 md:text-left">© 2026 Yulia Bioquímica Nutricional.</div>
      </footer>}
    </div>
  );
}
