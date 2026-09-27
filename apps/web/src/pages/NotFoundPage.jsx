import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Compass, LayoutDashboard } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionNarrow } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

const SUGGESTIONS = [
  { to: APP_ROUTES.simulations, label: 'Catálogo de simulaciones', icon: BookOpen },
  { to: APP_ROUTES.studentDashboard, label: 'Mi aprendizaje', icon: LayoutDashboard },
  { to: APP_ROUTES.teacherDashboard, label: 'Espacio docente', icon: Compass },
];

export function NotFoundPage() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Página no encontrada · Bioquímica Nutricional';
  }, []);

  return (
    <>
      <PageHeader
        title="Página no encontrada"
        description="La dirección solicitada no corresponde a ninguna pantalla de la plataforma."
        breadcrumbs={[{ label: 'Inicio', to: APP_ROUTES.home }, { label: 'Error 404' }]}
      />

      <SectionNarrow>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Error 404</p>
            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              No se ha encontrado ningún contenido en{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.8rem] text-navy">
                {location.pathname}
              </code>
              . Es posible que el enlace esté mal escrito o que la actividad ya no esté publicada.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={APP_ROUTES.home} icon={ArrowLeft}>
                Volver al inicio
              </Button>
              <Button to={APP_ROUTES.simulations} variant="secondary">
                Ver el catálogo
              </Button>
            </div>
          </CardBody>
        </Card>

        <nav aria-label="Secciones sugeridas" className="mt-6">
          <h2 className="text-sm font-semibold text-navy">Otras secciones</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {SUGGESTIONS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex min-h-11 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-navy transition-colors hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
                >
                  <Icon size={16} aria-hidden="true" className="shrink-0 text-slate-400" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SectionNarrow>
    </>
  );
}
