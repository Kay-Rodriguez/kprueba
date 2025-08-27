// src/models/Usuario.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { toJSONOpts } from './helpers.js';

const schema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  rol: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

schema.set('toJSON', toJSONOpts);

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

schema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('Usuario', schema);
