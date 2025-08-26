import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  descripcion: String,
  id_tecnico: { type: mongoose.Schema.Types.ObjectId, ref: "Tecnico" },
  id_cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente" },
  estado: { type: String, enum: ["abierto", "en_proceso", "cerrado"], default: "abierto" },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Ticket", TicketSchema);
