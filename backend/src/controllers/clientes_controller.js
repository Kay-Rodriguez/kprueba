import Cliente from '../models/Cliente.js';


export const crear = async (req, res) => {
    try { const c = await Cliente.create(req.body); return res.json(c); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const listar = async (_req, res) => {
    try { const r = await Cliente.find(); return res.json(r); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const obtener = async (req, res) => {
    try { const r = await Cliente.findById(req.params.id); if (!r) return res.status(404).json({ msg: 'No encontrado' }); return res.json(r); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const actualizar = async (req, res) => {
    try { const r = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!r) return res.status(404).json({ msg: 'No encontrado' }); return res.json(r); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const eliminar = async (req, res) => {
    try { const r = await Cliente.findByIdAndDelete(req.params.id); if (!r) return res.status(404).json({ msg: 'No encontrado' }); return res.json({ msg: 'Eliminado' }); } catch (e) { return res.status(400).json({ msg: e.message }); }
};