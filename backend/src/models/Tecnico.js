import mongoose from 'mongoose';
import { toJSONOpts } from './helpers.js';


const schema = new mongoose.Schema({
nombre: { type: String, required: true },
apellido: { type: String, required: true },
cedula: { type: String, unique: true },
fecha_nacimiento: Date,
genero: String,
ciudad: String,
direccion: String,
telefono: String,
email: String
}, { timestamps: true });


schema.set('toJSON', toJSONOpts);
export default mongoose.model('Tecnico', schema);