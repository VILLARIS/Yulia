import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { AuthLayout, PendingActionNote } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { CheckboxField } from '../../components/ui/Field';
import { ErrorSummary } from '../../components/ui/Message';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = 'Indica el correo institucional con el que te registraste.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'El formato del correo no es válido.';
  }

  if (!values.password) {
    errors.password = 'Escribe tu contraseña.';
  } else if (values.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  }

  return errors;
}

export function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    document.title = 'Acceso · Bioquímica Nutricional';
  }, []);

  const handleChange = (field) => (event) => {
    const { value, checked, type } = event.target;
    setValues((current) => ({ ...current, [field]: type === 'checkbox' ? checked : value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSubmitted(true);
    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
    }
  };

  return (
    <AuthLayout
      title="Acceso a la plataforma"
      subtitle="Introduce tus credenciales institucionales para entrar en tu espacio de trabajo."
      footer={
        <>
          ¿Todavía no tienes cuenta?{' '}
          <Link to={APP_ROUTES.register} className="font-semibold text-action underline underline-offset-4 hover:text-action-strong">
            Crear una
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div ref={summaryRef}>
          {submitted && Object.keys(errors).length > 0 ? <ErrorSummary errors={errors} /> : null}
        </div>

        <TextField
          label="Correo institucional"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="nombre@institucion.edu"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
          required
        />

        <TextField
          label="Contraseña"
          type="password"
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange('password')}
          error={errors.password}
          hint="Mínimo 8 caracteres."
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <CheckboxField
            label="Mantener la sesión abierta"
            name="remember"
            checked={values.remember}
            onChange={handleChange('remember')}
          />
          <Link
            to={APP_ROUTES.forgotPassword}
            className="inline-flex min-h-10 items-center rounded-lg text-sm font-medium text-action underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
          >
            He olvidado mi contraseña
          </Link>
        </div>

        <Button type="submit" size="lg" icon={LogIn} className="w-full">
          Entrar
        </Button>

        <PendingActionNote>
          Al enviar el formulario no se contacta con ningún servidor: la validación es
          enteramente local. En fases posteriores, esta acción delegará el envío de las
          credenciales en la API.
        </PendingActionNote>
      </form>
    </AuthLayout>
  );
}
