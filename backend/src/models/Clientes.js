import mongoose from 'mongoose';

const toJSONOpts = {
virtuals: true,
versionKey: false,
transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
};

const schema = new mongoose.Schema({
nombre: { type: String, required: true, trim: true },
apellido: { type: String, trim: true },
cedula: { type: String, required: true, trim: true },
ciudad: { type: String, trim: true },
email: { type: String, required: true, trim: true, unique: true },
direccion: { type: String, required: true, trim: true },
telefono: { type: String, required: true, trim: true },
fecha_nacimiento: { type: Date, required: true },
dependencia: { type: String, required: true, trim: true }
}, { timestamps: true });


schema.set('toJSON', toJSONOpts);
export default mongoose.model('Clientes', schema);
