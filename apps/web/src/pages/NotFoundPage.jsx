import { useLocation } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionNarrow } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export function NotFoundPage() {
  const location = useLocation();
  return <>
    <PageHeader title="Página no encontrada" description="La dirección solicitada no corresponde a una pantalla de la plataforma." />
    <SectionNarrow><Card><CardBody>
      <p className="break-words text-sm text-slate-600">No encontramos <code>{location.pathname}</code>.</p>
      <Button to="/" className="mt-5">Volver al inicio</Button>
    </CardBody></Card></SectionNarrow>
  </>;
}
