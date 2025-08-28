import axios from 'axios';

const RAW = import.meta.env.VITE_API_URL || 'https://gestion-tickets-api.onrender.com/api';
const API_BASE = RAW.trim().split(',')[0].replace(/\/$/, ''); 

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.msg || data?.error || data?.message || error.message || 'Request failed';
    const err = new Error(message);
    err.status = status;
    err.data = data;
    return Promise.reject(err);
  }
);

export default api;

export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};
export const clearAuthToken = () => localStorage.removeItem('token');
