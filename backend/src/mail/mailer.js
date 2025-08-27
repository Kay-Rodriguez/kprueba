import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT) || 465,
secure: String(process.env.SMTP_SECURE) === 'true',
auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});


export const sendMail = async ({ to, subject, html }) => {
const info = await transporter.sendMail({
from: process.env.MAIL_FROM || process.env.SMTP_USER,
to,
subject,
html
});
return info.messageId;
};


export const sendVerification = async (email, token) => {
const url = `${process.env.URL_FRONTEND}confirm/${token}`;
return sendMail({
to: email,
subject: 'prueba – Verifica tu cuenta',
html: `<h2>Confirma tu cuenta</h2>
<p>Para activar tu usuario, haz clic en el siguiente enlace:</p>
<p><a href="${url}">${url}</a></p>
<p>Si no creaste esta cuenta, ignora este mensaje.</p>`
});
};
//  correo de recuperación
export const sendPasswordReset = async (email, token) => {
  const url = `${process.env.URL_FRONTEND}reset/${token}`;
  return sendMail({
    to: email,
    subject: "prueba – Recuperar contraseña",
    html: `<h2>Recupera tu acceso</h2>
      <p>Usa este enlace para crear una nueva contraseña (10 dígitos):</p>
      <p><a href="${url}">${url}</a></p>`
  });
};