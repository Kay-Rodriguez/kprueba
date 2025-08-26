
import { Router } from 'express';
import { login, registro, confirmar } from '../controllers/auth_controller.js';
const r = Router();


r.post('/register', registro);
r.post('/login', login);
r.get('/confirm/:token', confirmar);


export default r;