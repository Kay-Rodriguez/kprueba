import Tecnico from '../models/Tecnicos.js';


export const crear = async (req, res) => {
try { const r = await Tecnico.create(req.body); return res.json(r); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const listar = async (_req, res) => {
try { const r = await Tecnico.find(); return res.json(r); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const obtener = async (req, res) => {
try { const r = await Tecnico.findById(req.params.id); if (!r) return res.status(404).json({ msg: 'No encontrado' }); return res.json(r); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const actualizar = async (req, res) => {
try { const r = await Tecnico.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!r) return res.status(404).json({ msg: 'No encontrado' }); return res.json(r); } catch (e) { return res.status(400).json({ msg: e.message }); }
};
export const eliminar = async (req, res) => {
try { const r = await Tecnico.findByIdAndDelete(req.params.id); if (!r) return res.status(404).json({ msg: 'No encontrado' }); return res.json({ msg: 'Eliminado' }); } catch (e) { return res.status(400).json({ msg: e.message }); }
};