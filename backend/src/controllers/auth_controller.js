import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generarToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

export const registro = async (req,res) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    if(!nombre || !email || !password) return res.status(400).json({ msg:'Faltan datos' });
    const existe = await Usuario.findOne({ email });
    if(existe) return res.status(400).json({ msg:'Usuario ya existe' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await Usuario.create({ nombre, apellido, email, password: hashed });
    res.status(201).json({ user: { id: user._id, email: user.email, nombre: user.nombre }, token: generarToken(user._id) });
  } catch(error) { res.status(500).json({ msg: error.message }); }
};

export const login = async (req,res) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ email });
    if(!user) return res.status(400).json({ msg:'Usuario o contraseña incorrectos' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ msg:'Usuario o contraseña incorrectos' });
    res.json({ token: generarToken(user._id), user: { id:user._id, nombre:user.nombre, email:user.email } });
  } catch(error){ res.status(500).json({ msg: error.message }); }
};
