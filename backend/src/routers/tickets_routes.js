import express from "express";
import {
  crearTicket,
  listarTickets,
  obtenerTicket,
  actualizarTicket,
  eliminarTicket
} from "../controllers/tickets_controller.js";
import { verificarAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verificarAuth, crearTicket);
router.get("/", verificarAuth, listarTickets);
router.get("/:id", verificarAuth, obtenerTicket);
router.put("/:id", verificarAuth, actualizarTicket);
router.delete("/:id", verificarAuth, eliminarTicket);

export default router;
