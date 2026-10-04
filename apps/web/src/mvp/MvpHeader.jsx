import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '../components/ui/Button';
import yuliaLogo from '../assets/yulia/logo-yulia.jpeg';

export function MvpHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const coursePath = user ? user.role === 'teacher' ? '/docente' : '/estudiante' : '/acceso';
  const active = location.pathname === '/' ? location.hash === '#acerca' ? 'about' : 'home' : location.pathname.startsWith('/docente') || location.pathname.startsWith('/estudiante') ? 'courses' : '';
  return (
    <header className="sticky top-0 z-30 border-b border-[#e9eff4] bg-white/95 backdrop-blur-[6px]">
      <div className="site-container flex min-h-[72px] flex-wrap items-center justify-between gap-x-2 gap-y-1.5 py-2 sm:gap-x-5">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-action">
          <img src={yuliaLogo} alt="" className="size-9 shrink-0 rounded-lg border border-slate-200 object-cover" />
          <span className="flex min-w-0 flex-col leading-tight">
            <strong className="text-lg font-bold tracking-[0.08em] text-navy">YULIA</strong>
            <small className="text-[9px] font-semibold tracking-[0.08em] text-slate-500 sm:text-[10px]">BIOQUÍMICA NUTRICIONAL</small>
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="mvp-nav order-3 flex w-full items-center justify-center gap-1 border-t border-slate-100 pt-1 md:order-none md:w-auto md:border-0 md:pt-0">
          <Link to="/" aria-current={active === 'home' ? 'page' : undefined} className={`nav-link ${active === 'home' ? 'nav-link-active' : ''}`}>Inicio</Link>
          <Link to={coursePath} aria-current={active === 'courses' ? 'page' : undefined} className={`nav-link ${active === 'courses' ? 'nav-link-active' : ''}`}>Cursos</Link>
          <Link to="/#acerca" aria-current={active === 'about' ? 'location' : undefined} className={`nav-link ${active === 'about' ? 'nav-link-active' : ''}`}>Acerca de</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user && <button type="button" className="nav-link" onClick={async () => { await logout(); navigate('/acceso'); }}>Salir</button>}
          <Button to="/acceso" size="sm" className="mvp-header-cta">Comenzar</Button>
        </div>
      </div>
    </header>
  );
}
