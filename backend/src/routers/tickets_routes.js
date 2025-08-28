import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { crear, listar, obtener, actualizar, eliminar } from '../controllers/tickets_controller.js';
const r = Router();


r.use(auth);
r.post('/', crear);
r.get('/', listar);
r.get('/:id', obtener);
r.put('/:id', actualizar);
r.delete('/:id', eliminar);


export default r;