import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetExpires: { type: Date, default: null },
  rol: { type: String, enum: ["admin", "user"], default: "user", immutable: true}
}, { timestamps: true });

// virtual id bonito
schema.set('toJSON', {
  virtuals: true, versionKey: false,
  transform: (_d, ret) => { ret.id = ret._id; delete ret._id; }
});

schema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

schema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('Cuentas', schema);
