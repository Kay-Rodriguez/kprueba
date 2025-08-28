// src/server.js
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './index.js';
import connection from './config/database.js';

// ------------------------------------------------------
function assertEnv(name, { required = false } = {}) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    const msg = `${required ? 'FALTA' : 'Aviso'} variable ${name} en .env`;
    required ? console.error('❌', msg) : console.warn('⚠️', msg);
    if (required) process.exit(1);
  }
}

// Críticas para arrancar; las demás solo avisan
assertEnv('MONGO_URI', { required: true });
assertEnv('JWT_SECRET', { required: true });
['MONGO_DB_NAME', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'URL_FRONTEND'].forEach(k =>
  assertEnv(k, { required: false })
);

// Ajustes Mongoose por entorno
mongoose.set('strictQuery', true);
if (process.env.NODE_ENV === 'production') {
  mongoose.set('autoIndex', false); 
}
const allowed = (process.env.CORS_ORIGIN || process.env.URL_FRONTEND || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowed, methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));

// --- Config de servidor ----------------------------------------
const PORT = Number(process.env.PORT ?? 3000);
const HOST = '0.0.0.0'; 
let server;

// 
app.get('/health', (_req, res) => {
  const s = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', mongo: s, uptime: process.uptime() });
});

async function start() {
  try {
    console.log(`🌱 Iniciando en ${process.env.NODE_ENV || 'development'}…`);
    await connection(); 

    server = app.listen(PORT, HOST, () => {
      const hostShown = HOST === '0.0.0.0' ? 'localhost' : HOST;
      console.log(`✅ Backend escuchando en http://${hostShown}:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Fallo al iniciar la app:', err?.message || err);
    process.exit(1);
  }
}

start();

// ---------------------------------------------
async function shutdown(signal) {
  console.log(`\n Señal ${signal} recibida. Cerrando con gracia...`);
  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    console.log('👋 Recursos liberadoS!');
    process.exit(0);
  } catch (err) {
    console.error('¡ Error al cerrar:', err);
    process.exit(1);
  }
}

process.on('SIGINT',    () => shutdown('SIGINT'));
process.on('SIGTERM',   () => shutdown('SIGTERM'));
process.on('SIGUSR2',   () => shutdown('SIGUSR2')); // nodemon
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
  shutdown('uncaughtException');
});
