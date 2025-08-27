// src/routers/auth_routes.js
import { Router } from 'express';
import {
  login,
  registro,
  confirmar,
  solicitarReset,
  resetearPassword
} from '../controllers/auth_controller.js';

const r = Router();

r.post('/register', registro);
r.post('/login', login);
r.get('/confirm/:token', confirmar);

r.post('/forgot', solicitarReset);
r.post('/reset', resetearPassword);

export default r;
