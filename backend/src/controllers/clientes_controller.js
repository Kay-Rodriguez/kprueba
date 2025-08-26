import Cliente from "../models/Cliente.js";

// Crear cliente
export const crearCliente = async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.json({ msg: "Cliente creado correctamente", cliente });
  } catch (error) {
    res.status(400).json({ msg: "Error al crear cliente", error });
  }
};

// Listar todos
export const listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(400).json({ msg: "Error al listar clientes", error });
  }
};

// Obtener uno
export const obtenerCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ msg: "Error al obtener cliente", error });
  }
};

// Actualizar
export const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    res.json({ msg: "Cliente actualizado", cliente });
  } catch (error) {
    res.status(400).json({ msg: "Error al actualizar cliente", error });
  }
};

// Eliminar
export const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    res.json({ msg: "Cliente eliminado" });
  } catch (error) {
    res.status(400).json({ msg: "Error al eliminar cliente", error });
  }
};
