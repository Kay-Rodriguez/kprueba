import axios from 'axios';

const RAW = import.meta.env.VITE_API_URL || 'https://gestion-tickets-api.onrender.com/api';
const API_BASE = RAW.trim().split(',')[0].replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// ➜ añade token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ➜ convierte cualquier error en un Error con .message legible
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const r = error?.response;
    let message = 'Request failed';

    if (!r) {
      message = 'No se pudo conectar con el servidor (red o CORS).';
    } else {
      let d = r.data;

      // Si viene como Blob (pasa a veces en 4xx/5xx), intenta leerlo como texto
      if (d instanceof Blob) {
        try { d = JSON.parse(await d.text()); }
        catch { d = await d.text(); }
      }

      if (typeof d === 'string' && d.trim()) {
        message = d.trim(); // texto/HTML plano
      } else if (d?.msg) {
        message = d.msg;
      } else if (d?.error) {
        message = d.error;
      } else if (d?.message) {
        message = d.message;
      } else {
        message = `Error ${r.status}`;
      }
    }

    const err = new Error(message);
    err.status = r?.status;
    err.data = r?.data;
    return Promise.reject(err);
  }
);

export default api;

export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};
export const clearAuthToken = () => localStorage.removeItem('token');
