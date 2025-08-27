import mongoose from 'mongoose';

const toJSONOpts = {
virtuals: true,
versionKey: false,
transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
};

const schema = new mongoose.Schema({
codigo: { type: String, required: true, unique: true },
descripcion: String,
id_tecnico: { type: mongoose.Schema.Types.ObjectId, ref: 'Tecnico' },
id_cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
estado: { type: String, enum: ['ABIERTO', 'EN_PROCESO', 'CERRADO'], default: 'ABIERTO' },
fecha: { type: Date, default: Date.now }
}, { timestamps: true });


schema.set('toJSON', toJSONOpts);
export default mongoose.model('Ticket', schema);