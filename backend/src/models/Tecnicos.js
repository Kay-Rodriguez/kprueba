import mongoose from 'mongoose';

const toJSONOpts = {
virtuals: true,
versionKey: false,
transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
};

const schema = new mongoose.Schema({
nombre: { type: String, required: true },
apellido: { type: String, required: true },
cedula: { type: String,required: true, unique: true },
fecha_nacimiento: Date,
genero: String,
ciudad: String,
direccion: String,
telefono: String,
email: String
}, { timestamps: true });


schema.set('toJSON', toJSONOpts);
export default mongoose.model('Tecnicos', schema);