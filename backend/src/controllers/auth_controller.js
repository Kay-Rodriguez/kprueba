import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import Usuario from '../models/Usuarios.js';
import { sendVerification, sendPasswordReset } from '../mail/mailer.js';

const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

const esClaveValida = (pwd) => /^[0-9]{10}$/.test(pwd);
const normalizaEmail = (s = '') => String(s).trim().toLowerCase();
const limpia = (s = '') => String(s).trim();

/** POST /register
 * body: { nombre, apellido, email, password }
 */
export const registro = async (req, res) => {
  try {
    const nombre   = limpia(req.body?.nombre);
    const apellido = limpia(req.body?.apellido);
    const email    = normalizaEmail(req.body?.email);
    const { password } = req.body || {};

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ msg: 'Faltan datos: nombre, apellido, email y password son requeridos' });
    }

    if (!esClaveValida(password)) {
      return res.status(400).json({ msg: 'La clave debe tener exactamente 10 dígitos numéricos' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ msg: 'El usuario ya existe' });

    const verificationToken = crypto.randomBytes(24).toString('hex');

    const user = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      verified: false,
      verificationToken
    });

    await sendVerification(user.email, verificationToken);
    return res.status(201).json({ msg: 'Registrado. Revisa tu correo para confirmar la cuenta.' });
  } catch (e) {
    return res.status(500).json({ msg: e.message });
  }
};

/** POST /login
 * body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const email = normalizaEmail(req.body?.email);
    const { password } = req.body || {};

    const user = await Usuario.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' });
    if (!user.verified) return res.status(403).json({ msg: 'Debe confirmar su correo antes de iniciar sesión' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' });

    return res.json({
      token: generarToken(user.id),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (e) {
    return res.status(500).json({ msg: e.message });
  }
};

/** GET /confirm/:token  — idempotente */
export const confirmar = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await Usuario.findOne({ verificationToken: token });

    if (user) {
      if (!user.verified) {
        user.verified = true;
        user.verificationToken = null; 
        await user.save();
      }
      return res.json({ msg: 'Cuenta verificada correctamente' });
    }

    // Token inexistente
    return res.status(200).json({ msg: 'El enlace ya fue utilizado o la cuenta ya está confirmada.' });
  } catch (e) {
    return res.status(500).json({ msg: e.message });
  }
};

/** POST /forgot
 * body: { email }
 */
export const solicitarReset = async (req, res) => {
  try {
    const email = normalizaEmail(req.body?.email);
    if (!email) return res.status(400).json({ msg: 'email requerido' });

    const user = await Usuario.findOne({ email });
    // respuesta genérica para no filtrar existencia
    if (!user) return res.json({ msg: 'Si el correo existe, enviaremos instrucciones.' });

    const token = crypto.randomBytes(24).toString('hex');
    user.resetToken = token;
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    await sendPasswordReset(email, token);
    return res.json({ msg: 'Hemos enviado un enlace de recuperación.' });
  } catch (e) {
    return res.status(500).json({ msg: e.message });
  }
};

/** POST /reset
 * body: { token, password }
 */
export const resetearPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ msg: 'token y password son requeridos' });

    if (!esClaveValida(password))
      return res.status(400).json({ msg: 'La clave debe tener exactamente 10 dígitos' });

    const user = await Usuario.findOne({
      resetToken: token,
      resetExpires: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ msg: 'Token inválido o expirado' });

    user.password = password;
    user.resetToken = null;
    user.resetExpires = null;
    await user.save();

    return res.json({ msg: 'Contraseña actualizada' });
  } catch (e) {
    return res.status(500).json({ msg: e.message });
  }
};
