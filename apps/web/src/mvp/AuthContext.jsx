import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { clearGeminiKey } from './geminiKey';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api('/auth/me').then(({ user: current }) => {
      if (mounted) setUser(current);
    }).catch(() => {
      if (mounted) setUser(null);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    const { user: current } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    clearGeminiKey();
    setUser(current);
    return current;
  };
  const register = async (input) => {
    const { user: current } = await api('/auth/register', { method: 'POST', body: JSON.stringify(input) });
    clearGeminiKey();
    setUser(current);
    return current;
  };
  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    clearGeminiKey();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requiere AuthProvider');
  return context;
}
