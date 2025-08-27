import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => { if (!token) setUser(null); }, [token]);

  const register = (payload) => api.post('/auth/register', payload).then(r => r.data);
  const confirm  = (token)   => api.get(`/auth/confirm/${token}`).then(r => r.data);

  //
  const forgot   = (email)                 => api.post('/auth/forgot', { email }).then(r => r.data);
  const reset    = (token, password)       => api.post('/auth/reset', { token, password }).then(r => r.data);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token); localStorage.setItem('token', data.token); setUser(data.user);
    return data.user;
  };

  const logout = () => { setUser(null); setToken(null); localStorage.removeItem('token'); };

  return (
    <AuthContext.Provider value={{ user, token, register, confirm, forgot, reset, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth(){ return useContext(AuthContext); }
