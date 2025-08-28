// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  register: async (_p) => {},
  confirm: async (_token) => {},
  forgot: async (_email) => {},
  reset: async (_token, _password) => {},
  login: async (_email, _password) => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper para actualizar token de manera centralizada
  const setAuthToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
  }, []);

  // Hidratación inicial: si hay token intenta obtener /auth/me
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!token) {
          setUser(null);
          return;
        }
        const { data } = await api.get('/auth/me'); // el interceptor ya adjunta Authorization desde localStorage
        if (alive) setUser(data?.user ?? null);
      } catch {
        // token inválido/expirado
        if (alive) {
          setUser(null);
          setAuthToken(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token, setAuthToken]);

  // Sincroniza sesión entre pestañas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') setToken(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // --- API wrappers ---
  const register = (payload) => api.post('/auth/register', payload).then(r => r.data);

  const confirm  = (confirmToken) =>
    api.get(`/auth/confirm/${confirmToken}`).then(r => r.data);

  const forgot   = (email) =>
    api.post('/auth/forgot', { email }).then(r => r.data);

  const reset    = (resetToken, password) =>
    api.post('/auth/reset', { token: resetToken, password }).then(r => r.data);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // Ajusta si tu backend devuelve otros campos:
    // data = { token, user }
    setAuthToken(data.token);
    setUser(data.user ?? null);
    return data.user ?? null;
  };

  const logout = async () => {
    // Si tienes endpoint: await api.post('/auth/logout').catch(()=>{});
    setUser(null);
    setAuthToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    register,
    confirm,
    forgot,
    reset,
    login,
    logout,
    setUser,      // opcional, por si quieres actualizar perfil
    setAuthToken, // opcional, por si renuevas token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
