// src/utils/mailer.js
import nodemailer from 'nodemailer';

const isProd = String(process.env.NODE_ENV).trim() === 'production';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_SECURE ?? 'true') === 'true' || Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER, // tu cuenta Gmail
    pass: process.env.SMTP_PASS  // app password, NO la clave normal
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  // Útil en entornos con proxies/IPv6 raros; puedes quitar si no lo necesitas
  tls: {
    // servername: process.env.SMTP_HOST, // opcional
    // rejectUnauthorized: true,         // por defecto true
  },
  logger: !isProd
});

// Verificación del transporte solo en desarrollo (evita ruido en producción)
if (!isProd) {
  transporter.verify()
    .then(() => console.log('📮 SMTP listo para enviar'))
    .catch(err => console.error('⚠️  Fallo verificación SMTP:', err?.message || err));
}

// ---------- helpers ----------
const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';

// Une base + path sin dobles barras ni pérdidas de slash
const joinUrl = (base = '', path = '') => {
  const b = String(base).trim();
  const p = String(path).trim();
  if (!b) return `/${p.replace(/^\/+/, '')}`;
  return `${b.replace(/\/+$/, '')}/${p.replace(/^\/+/, '')}`;
};

// Construye URL para confirmación apuntando al FRONT si existe,
// y si no, hace fallback al endpoint directo del BACK.
const buildConfirmUrl = (token) => {
  const front = process.env.URL_FRONTEND;     // ej: https://kprueba.vercel.app
  const back  = process.env.URL_BACKEND;      // ej: https://gestion-tickets-api.onrender.com/
  if (front) return joinUrl(front, `confirm/${token}`);
  if (back)  return joinUrl(back, `api/auth/confirm/${token}`);
  // último recurso (local)
  return `/api/auth/confirm/${token}`;
};

const buildResetUrl = (token) => {
  const front = process.env.URL_FRONTEND;
  const back  = process.env.URL_BACKEND;
  if (front) return joinUrl(front, `reset/${token}`);
  if (back)  return joinUrl(back, `api/auth/reset/${token}`);
  return `/api/auth/reset/${token}`;
};

// ---------- API ----------
export const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text
    });
    return info.messageId;
  } catch (err) {
    // Log limpio y rethrow para que el caller decida qué hacer
    console.error('✉️  Error enviando correo:', err?.message || err);
    throw err;
  }
};

export const sendVerification = async (email, token) => {
  const url = buildConfirmUrl(token);
  const subject = 'Verifica tu cuenta · GestionTickets';
  const html = `
    <h2>Confirma tu cuenta</h2>
    <p>Para activar tu usuario, haz clic en el siguiente enlace:</p>
    <p><a href="${url}">${url}</a></p>
    <p>Si no creaste esta cuenta, ignora este mensaje.</p>
  `;
  const text = `Confirma tu cuenta visitando: ${url}`;
  return sendMail({ to: email, subject, html, text });
};

export const sendPasswordReset = async (email, token) => {
  const url = buildResetUrl(token);
  const subject = 'Recupera tu contraseña · GestionTickets';
  const html = `
    <h2>Recupera tu acceso</h2>
    <p>Usa este enlace para crear una nueva contraseña:</p>
    <p><a href="${url}">${url}</a></p>
    <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
  `;
  const text = `Recupera tu acceso visitando: ${url}`;
  return sendMail({ to: email, subject, html, text });
};
