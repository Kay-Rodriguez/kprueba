import Tecnico from "../models/Tecnico.js";

// Crear técnico
export const crearTecnico = async (req, res) => {
  try {
    const tecnico = new Tecnico(req.body);
    await tecnico.save();
    res.json({ msg: "Técnico creado correctamente", tecnico });
  } catch (error) {
    res.status(400).json({ msg: "Error al crear técnico", error });
  }
};

// Listar
export const listarTecnicos = async (req, res) => {
  try {
    const tecnicos = await Tecnico.find();
    res.json(tecnicos);
  } catch (error) {
    res.status(400).json({ msg: "Error al listar técnicos", error });
  }
};

// Obtener uno
export const obtenerTecnico = async (req, res) => {
  try {
    const tecnico = await Tecnico.findById(req.params.id);
    if (!tecnico) return res.status(404).json({ msg: "Técnico no encontrado" });
    res.json(tecnico);
  } catch (error) {
    res.status(400).json({ msg: "Error al obtener técnico", error });
  }
};

// Actualizar
export const actualizarTecnico = async (req, res) => {
  try {
    const tecnico = await Tecnico.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tecnico) return res.status(404).json({ msg: "Técnico no encontrado" });
    res.json({ msg: "Técnico actualizado", tecnico });
  } catch (error) {
    res.status(400).json({ msg: "Error al actualizar técnico", error });
  }
};

// Eliminar
export const eliminarTecnico = async (req, res) => {
  try {
    const tecnico = await Tecnico.findByIdAndDelete(req.params.id);
    if (!tecnico) return res.status(404).json({ msg: "Técnico no encontrado" });
    res.json({ msg: "Técnico eliminado" });
  } catch (error) {
    res.status(400).json({ msg: "Error al eliminar técnico", error });
  }
};
