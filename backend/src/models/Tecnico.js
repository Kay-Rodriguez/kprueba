import mongoose from "mongoose";

const TecnicoSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  cedula: { type: String, unique: true },
  fecha_nacimiento: Date,
  genero: String,
  ciudad: String,
  direccion: String,
  telefono: String,
  email: String
}, { timestamps: true });

export default mongoose.model("Tecnico", TecnicoSchema);
