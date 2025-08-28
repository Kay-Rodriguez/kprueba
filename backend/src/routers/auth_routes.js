// src/routers/auth_routes.js
import { Router } from 'express';
import {
  login,
  registro,
  confirmar,
  solicitarReset,
  resetearPassword,
  me
} from '../controllers/auth_controller.js';
import { auth } from '../middlewares/auth.js';

const r = Router();

r.post('/register', registro);
r.post('/login', login);
r.get('/confirm/:token', confirmar);

r.post('/forgot', solicitarReset);
r.post('/reset', resetearPassword);

r.get('/me', auth, me);

export default r;
