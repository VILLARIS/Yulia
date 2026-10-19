import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { useAuth } from './AuthContext';

/** Campo de contraseña con alternador de visibilidad accesible y reutilizable. */
function PasswordField({ label, value, onChange, autoComplete, placeholder, minLength, error, show, onToggle }) {
  return (
    <TextField
      label={label}
      icon={LockKeyhole}
      type={show ? 'text' : 'password'}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      minLength={minLength}
      error={error}
      required
      endAction={
        <button
          type="button"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={show}
          onClick={onToggle}
          className="auth-eye flex size-9 items-center justify-center rounded-md"
        >
          {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
}

export function AuthPage({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === 'register';
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  if (user) return <Navigate to={user.role === 'teacher' ? '/docente' : '/estudiante'} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (isRegister && values.password !== values.confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.');
      return;
    }
    setConfirmError('');
    setBusy(true);
    try {
      const current = isRegister
        ? await register({ name: values.name, email: values.email, password: values.password, role: 'student' })
        : await login(values.email, values.password);
      navigate(current.role === 'teacher' ? '/docente' : '/estudiante', { replace: true });
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  return (
    <AuthLayout
      mode={mode}
      title={isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
      subtitle={isRegister
        ? 'Regístrate como estudiante y comienza tu experiencia de aprendizaje.'
        : 'Accede a tu cuenta para continuar tu aprendizaje.'}
      footer={isRegister
        ? <>¿Ya tienes una cuenta? <Link to="/acceso" className="auth-switch font-semibold">Iniciar sesión</Link></>
        : <>¿No tienes una cuenta? <Link to="/registro" className="auth-switch font-semibold">Crear cuenta</Link></>}
    >
      <form onSubmit={submit} className="auth-form space-y-5">
        {error ? <Message tone="error" className="auth-error">{error}</Message> : null}
        {isRegister && (
          <TextField
            label="Nombre completo"
            icon={UserRound}
            autoComplete="name"
            placeholder="Tu nombre completo"
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            minLength={2}
            maxLength={120}
            required
          />
        )}
        <TextField
          label="Correo electrónico"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="tu.correo@ejemplo.com"
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          required
        />
        <PasswordField
          label="Contraseña"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          placeholder="Tu contraseña"
          value={values.password}
          onChange={(event) => setValues({ ...values, password: event.target.value })}
          minLength={isRegister ? 8 : 1}
          show={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
        />
        {isRegister && (
          <PasswordField
            label="Confirmar contraseña"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={values.confirmPassword}
            onChange={(event) => {
              setValues({ ...values, confirmPassword: event.target.value });
              setConfirmError('');
            }}
            minLength={8}
            error={confirmError}
            show={showConfirm}
            onToggle={() => setShowConfirm((current) => !current)}
          />
        )}
        <Button type="submit" disabled={busy} className="auth-submit w-full" size="lg">
          {busy ? 'Procesando…' : isRegister ? 'Crear cuenta' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
