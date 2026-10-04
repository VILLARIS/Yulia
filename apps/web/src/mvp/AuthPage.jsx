import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { useAuth } from './AuthContext';

export function AuthPage({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  if (user) return <Navigate to={user.role === 'teacher' ? '/docente' : '/estudiante'} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const current = mode === 'register'
        ? await register(values)
        : await login(values.email, values.password);
      navigate(current.role === 'teacher' ? '/docente' : '/estudiante', { replace: true });
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  return (
    <AuthLayout
      mode={mode}
      title={mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
      subtitle={mode === 'register' ? 'Regístrate para empezar tu experiencia.' : 'Accede a tu cuenta para continuar.'}
      footer={mode === 'register'
        ? <>¿Ya tienes una cuenta? <Link to="/acceso" className="auth-switch font-semibold text-action">Iniciar sesión</Link></>
        : <>¿No tienes una cuenta? <Link to="/registro" className="auth-switch font-semibold text-action">Crear cuenta</Link></>}
    >
      <form onSubmit={submit} className="auth-form space-y-4">
        {error && <Message tone="error" className="auth-error">{error}</Message>}
        {mode === 'register' && (
          <>
            <TextField label="Nombre" icon={UserRound} autoComplete="name" placeholder="Tu nombre" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} minLength={2} maxLength={120} required />
            <fieldset>
              <legend className="text-sm font-medium text-navy">Quiero entrar como</legend>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <label className={`auth-role flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 text-sm font-medium ${values.role === 'student' ? 'border-action bg-blue-50 text-action' : 'border-slate-200 bg-white text-slate-600'}`}>
                  <input type="radio" name="role" value="student" checked={values.role === 'student'} onChange={(event) => setValues({ ...values, role: event.target.value })} className="sr-only" />
                  <GraduationCap size={18} aria-hidden="true" />Estudiante
                </label>
                <label className={`auth-role flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 text-sm font-medium ${values.role === 'teacher' ? 'border-brand-ink bg-emerald-50 text-brand-ink' : 'border-slate-200 bg-white text-slate-600'}`}>
                  <input type="radio" name="role" value="teacher" checked={values.role === 'teacher'} onChange={(event) => setValues({ ...values, role: event.target.value })} className="sr-only" />
                  <BookOpen size={18} aria-hidden="true" />Docente
                </label>
              </div>
            </fieldset>
          </>
        )}
        <TextField label="Correo electrónico" icon={Mail} type="email" autoComplete="email" placeholder="tu.correo@ejemplo.com" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required />
        <TextField
          label="Contraseña"
          icon={LockKeyhole}
          type={showPassword ? 'text' : 'password'}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          placeholder="Tu contraseña"
          value={values.password}
          onChange={(event) => setValues({ ...values, password: event.target.value })}
          minLength={mode === 'register' ? 8 : 1}
          endAction={<button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} onClick={() => setShowPassword((current) => !current)} className="auth-eye flex size-9 items-center justify-center rounded-md text-slate-500 hover:text-action">{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>}
          required
        />
        <Button type="submit" disabled={busy} className="auth-submit w-full" size="lg">{busy ? 'Procesando…' : mode === 'register' ? 'Crear cuenta' : 'Entrar'}</Button>
      </form>
    </AuthLayout>
  );
}
