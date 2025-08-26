import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Usuario from '../models/Usuario.js';
import { sendVerification } from '../mail/mailer.js';


const generarToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });


const esClaveValida = (pwd) => /^[0-9]{10}$/.test(pwd); // 10 dígitos exactos


export const registro = async (req, res) => {
try {
const { nombre, apellido, email, password } = req.body;
if (!nombre || !apellido || !email || !password) return res.status(400).json({ msg: 'Faltan datos' });
if (!esClaveValida(password)) return res.status(400).json({ msg: 'La clave debe tener exactamente 10 dígitos numéricos' });


const existe = await Usuario.findOne({ email });
if (existe) return res.status(400).json({ msg: 'El usuario ya existe' });


const verificationToken = crypto.randomBytes(24).toString('hex');
const user = await Usuario.create({ nombre, apellido, email, password, verificationToken, verified: false });


await sendVerification(user.email, verificationToken);
return res.status(201).json({ msg: 'Registrado. Revisa tu correo para confirmar la cuenta.' });
} catch (e) {
return res.status(500).json({ msg: e.message });
}
};


export const confirmar = async (req, res) => {
try {
const { token } = req.params;
const user = await Usuario.findOne({ verificationToken: token });
if (!user) return res.status(400).json({ msg: 'Token inválido o expirado' });
user.verified = true; user.verificationToken = null; await user.save();
return res.json({ msg: 'Cuenta verificada correctamente' });
} catch (e) {
return res.status(500).json({ msg: e.message });
}
};


export const login = async (req, res) => {
try {
const { email, password } = req.body;
const user = await Usuario.findOne({ email });
if (!user) return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' });
if (!user.verified) return res.status(403).json({ msg: 'Debe confirmar su correo antes de iniciar sesión' });
const ok = await user.matchPassword(password);
if (!ok) return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' });
return res.json({ token: generarToken(user.id), user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email } });
} catch (e) {
return res.status(500).json({ msg: e.message });
}
};
