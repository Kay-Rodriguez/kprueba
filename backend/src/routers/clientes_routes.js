import express from "express";
import {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente
} from "../controllers/clientes_controller.js";
import { verificarAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verificarAuth, crearCliente);
router.get("/", verificarAuth, listarClientes);
router.get("/:id", verificarAuth, obtenerCliente);
router.put("/:id", verificarAuth, actualizarCliente);
router.delete("/:id", verificarAuth, eliminarCliente);

export default router;
