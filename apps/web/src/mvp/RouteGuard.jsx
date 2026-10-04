import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RouteGuard({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="site-container py-12" role="status">Cargando sesión…</div>;
  if (!user) return <Navigate to="/acceso" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'teacher' ? '/docente' : '/estudiante'} replace />;
  return <Outlet />;
}
