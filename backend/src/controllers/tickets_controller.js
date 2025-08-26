import Ticket from "../models/Ticket.js";

// Crear ticket
export const crearTicket = async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.json({ msg: "Ticket creado correctamente", ticket });
  } catch (error) {
    res.status(400).json({ msg: "Error al crear ticket", error });
  }
};

// Listar
export const listarTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("id_tecnico").populate("id_cliente");
    res.json(tickets);
  } catch (error) {
    res.status(400).json({ msg: "Error al listar tickets", error });
  }
};

// Obtener uno
export const obtenerTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("id_tecnico").populate("id_cliente");
    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ msg: "Error al obtener ticket", error });
  }
};

// Actualizar
export const actualizarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });
    res.json({ msg: "Ticket actualizado", ticket });
  } catch (error) {
    res.status(400).json({ msg: "Error al actualizar ticket", error });
  }
};

// Eliminar
export const eliminarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });
    res.json({ msg: "Ticket eliminado" });
  } catch (error) {
    res.status(400).json({ msg: "Error al eliminar ticket", error });
  }
};
