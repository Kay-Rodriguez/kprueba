import express from "express";
import {crearTecnico, listarTecnicos,obtenerTecnico,actualizarTecnico, eliminarTecnico
} from "../controllers/tecnicos_controller.js";
import { verificarAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verificarAuth, crearTecnico);
router.get("/", verificarAuth, listarTecnicos);
router.get("/:id", verificarAuth, obtenerTecnico);
router.put("/:id", verificarAuth, actualizarTecnico);
router.delete("/:id", verificarAuth, eliminarTecnico);

export default router;
