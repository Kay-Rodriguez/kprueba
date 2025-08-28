// src/api.js
import axios from 'axios';

// Recomendado: en Vercel usar VITE_API_URL=https://gestion-tickets-api.onrender.com/api
// (incluye /api). En local: http://localhost:3000/api
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Si usas cookies/sesiones, habilita esto y pon VITE_WITH_CREDENTIALS=true
  // withCredentials: import.meta.env.VITE_WITH_CREDENTIALS === 'true',
});

// Adjunta token si existe (sin sobrescribir si ya viene uno)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normaliza errores (propaga message, status y data)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = data?.error || data?.message || error.message || 'Request failed';
    const err = new Error(message);
    err.status = status;
    err.data = data;
    return Promise.reject(err);
  }
);

export default api;

// Helpers opcionales por si te sirven
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};
export const clearAuthToken = () => localStorage.removeItem('token');
