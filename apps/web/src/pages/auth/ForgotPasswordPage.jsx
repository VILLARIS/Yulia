import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Send } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { Message } from '../../components/ui/Message';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(email) {
  if (!email.trim()) {
    return 'Indica el correo con el que registraste la cuenta.';
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'El formato del correo no es válido.';
  }
  return null;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = 'Recuperar contraseña · Bioquímica Nutricional';
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(email);
    setError(found);
    if (found) return;
    setDone(true);
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Indica el correo asociado a tu cuenta. El envío de un enlace de recuperación estará disponible cuando la plataforma conecte su servicio de autenticación."
      footer={
        <>
          ¿Recordaste la contraseña?{' '}
          <Link to={APP_ROUTES.login} className="font-semibold text-action underline underline-offset-4 hover:text-action-strong">
            Volver al acceso
          </Link>
        </>
      }
    >
      {done ? (
        <div className="space-y-5">
          <Message tone="info" title="Recuperación no disponible todavía">
            <p>
              El correo se ha validado correctamente, pero no se ha enviado ningún mensaje:
              todavía no hay servicio de correo conectado a la plataforma.
            </p>
            <p className="mt-2">
              Puedes{' '}
              <Link to={APP_ROUTES.login} className="font-semibold text-action underline underline-offset-4">
                volver al acceso
              </Link>{' '}
              o explorar las vistas de demostración.
            </p>
          </Message>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => setDone(false)}>
            Usar otro correo
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
              <KeyRound size={16} aria-hidden="true" className="mt-1 shrink-0 text-slate-400" />
              <span>
                Por protección de la privacidad, la respuesta real no confirmará si la cuenta
                existe. Ese comportamiento se implementará con el servicio de identidad.
              </span>
            </p>
          </div>

          <TextField
            label="Correo institucional"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nombre@institucion.edu"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            error={error}
            required
          />

          <Button type="submit" size="lg" icon={Send} className="w-full">
            Enviar enlace de recuperación
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
