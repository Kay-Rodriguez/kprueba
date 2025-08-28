// src/models/Clientes.js
import mongoose from 'mongoose';

const toJSONOpts = {
    virtuals: true,
    versionKey: false,
    transform: (_d, ret) => { ret.id = ret._id; delete ret._id; }
};

const emptyToUndef = v => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const schema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true, set: emptyToUndef },
    apellido: { type: String, trim: true, set: emptyToUndef },

    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: v => /^\d{10}$/.test(v),
            message: 'La cédula debe tener 10 dígitos'
        },
        set: v => (v ? String(v).trim() : v)
    },

    ciudad: { type: String, trim: true, set: emptyToUndef },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
        set: v => (v ? String(v).trim().toLowerCase() : v)
    },

    direccion: { type: String, required: true, trim: true, set: emptyToUndef },

    telefono: {
        type: String,
        required: true,
        trim: true,
        
        match: [/^\+?\d{7,15}$/, 'Teléfono inválido'],
        set: v => (v ? String(v).trim() : v)
    },

    fecha_nacimiento: {
        type: Date,
        required: true
    },

    dependencia: { type: String, required: true, trim: true, set: emptyToUndef }

}, { timestamps: true });



schema.set('toJSON', toJSONOpts);

export default mongoose.model('Clientes', schema);
