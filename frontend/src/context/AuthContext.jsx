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


  const setAuthToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
  }, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!token) {
          setUser(null);
          return;
        }
        const { data } = await api.get('/auth/me');
        if (alive) setUser(data?.user ?? null);
      } catch {
       if (alive) {
         setUser(null);
         setAuthToken(null);
       }
       if (alive) {
         
         setUser(null);
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
    
    setAuthToken(data.token);
    setUser(data.user ?? null);
    return data.user ?? null;
  };

  const logout = async () => {
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
    setUser,      
    setAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
