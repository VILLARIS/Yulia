import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { AuthLayout, PendingActionNote } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { CheckboxField, TextAreaField, TextField } from '../../components/ui/Field';
import { ErrorSummary } from '../../components/ui/Message';
import { countWords } from '../../utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;
const MAX_BIO = 600;

const INITIAL_VALUES = {
  displayName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  cohort: '',
  bio: '',
  acceptTerms: false,
};

function validate(values) {
  const errors = {};

  if (!values.displayName.trim()) {
    errors.displayName = 'Indica tu nombre y apellidos.';
  } else if (values.displayName.trim().length < 3) {
    errors.displayName = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!values.email.trim()) {
    errors.email = 'Necesitamos un correo para tu cuenta.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'El formato del correo no es válido.';
  }

  if (!values.password) {
    errors.password = 'Elige una contraseña.';
  } else if (values.password.length < MIN_PASSWORD) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Combina al menos una letra y un número.';
  }

  if (!values.passwordConfirm) {
    errors.passwordConfirm = 'Repite la contraseña.';
  } else if (values.passwordConfirm !== values.password) {
    errors.passwordConfirm = 'Las contraseñas no coinciden.';
  }

  if (countWords(values.bio) > MAX_BIO) {
    errors.bio = `Reduce la presentación a ${MAX_BIO} palabras como máximo.`;
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = 'Debes aceptar las condiciones para continuar.';
  }

  return errors;
}

export function RegisterPage() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    document.title = 'Crear cuenta · Bioquímica Nutricional';
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
      title="Crear una cuenta"
      subtitle="Completa los datos para preparar tu acceso a las actividades de tu curso."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to={APP_ROUTES.login} className="font-semibold text-action underline underline-offset-4 hover:text-action-strong">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div ref={summaryRef}>
          {submitted && Object.keys(errors).length > 0 ? <ErrorSummary errors={errors} /> : null}
        </div>

        <TextField
          label="Nombre y apellidos"
          name="displayName"
          autoComplete="name"
          placeholder="Ana Moreno Prasad"
          value={values.displayName}
          onChange={handleChange('displayName')}
          error={errors.displayName}
          required
        />

        <TextField
          label="Correo institucional"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nombre@institucion.edu"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Contraseña"
            type="password"
            name="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
            hint={`Mínimo ${MIN_PASSWORD} caracteres, con letras y números.`}
            required
          />
          <TextField
            label="Repetir contraseña"
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
            value={values.passwordConfirm}
            onChange={handleChange('passwordConfirm')}
            error={errors.passwordConfirm}
            required
          />
        </div>

        <TextField
          label="Curso o grupo"
          name="cohort"
          placeholder="Curso 2025-2026 · Grupo A"
          value={values.cohort}
          onChange={handleChange('cohort')}
          hint="Opcional. Permite al profesorado organizar la actividad."
        />

        <TextAreaField
          label="Presentación breve"
          name="bio"
          rows={4}
          placeholder="Qué te interesa de la bioquímica aplicada a la nutrición."
          value={values.bio}
          onChange={handleChange('bio')}
          error={errors.bio}
          counter={`${countWords(values.bio)} / ${MAX_BIO} palabras`}
          hint="Opcional. No se publica en ningún perfil."
        />

        <CheckboxField
          label="Acepto las condiciones de uso y la política de datos de la plataforma"
          name="acceptTerms"
          checked={values.acceptTerms}
          onChange={handleChange('acceptTerms')}
          error={errors.acceptTerms}
        />

        <Button type="submit" size="lg" icon={UserPlus} className="w-full">
          Crear cuenta
        </Button>

        <PendingActionNote>
          El formulario no crea ninguna cuenta. No hay servicio de registro conectado, de modo
          que los datos escritos aquí se descartan al salir de la página.
        </PendingActionNote>
      </form>
    </AuthLayout>
  );
}
