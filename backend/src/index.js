// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connection from './config/database.js';

import authRoutes from './routers/auth_routes.js';
import clientesRoutes from './routers/clientes_routes.js';
import tecnicosRoutes from './routers/tecnicos_routes.js';
import ticketsRoutes from './routers/tickets_routes.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const JSON_LIMIT = process.env.JSON_LIMIT || '2mb';
const TRUST_PROXY = process.env.TRUST_PROXY === 'true'; // p.ej. detrás de Nginx
const CORS_ORIGIN = process.env.CORS_ORIGIN || true;   // origin específico o true
const CORS_CREDENTIALS = String(process.env.CORS_CREDENTIALS ?? 'true') === 'true';

// --- Middlewares base ---
if (TRUST_PROXY) app.set('trust proxy', 1);
app.use(cors({ origin: CORS_ORIGIN, credentials: CORS_CREDENTIALS }));
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

// --- Utilidades ---
const mongoStateText = (state) =>
  (['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown');

// --- Rutas ---
app.get('/', (_req, res) => res.send('API funcionando 🚀'));

app.get('/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  const payload = {
    ok: state === 1,
    dbState: state,
    dbStateText: mongoStateText(state),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
  };

  // Si estamos conectados, intentamos un ping real a MongoDB
  if (state === 1 && mongoose.connection.db?.admin) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().command({ ping: 1 });
      payload.mongoPingMs = Date.now() - start;
    } catch (e) {
      payload.ok = false;
      payload.mongoPingError = e.message;
    }
  }

  res.status(payload.ok ? 200 : 503).json(payload);
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/tickets', ticketsRoutes);

// --- Manejo de 404 y errores generales ---
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado', path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error('❌ Error no controlado:', err);
  const status = Number(err.status || 500);
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    status,
  });
});

let server;

// --- Bootstrap asíncrono: conecta DB y luego levanta servidor ---
async function start() {
  try {
    console.log(`🌱 Iniciando en ${process.env.NODE_ENV || 'development'}…`);
    await connection(); // debe lanzar si falla
    server = app.listen(PORT, () => {
      console.log(`✅ Server ok en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Fallo al iniciar la app:', err?.message || err);
    process.exit(1);
  }
}
start();

// --- Apagado elegante ---
async function shutdown(signal) {
  console.log(`\n🛑 Recibido ${signal}. Cerrando con gracia...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    // cierra conexión a Mongo de forma explícita
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log('👋 Recursos liberados. Bye!');
    process.exit(0);
  } catch (err) {
    console.error('⚠️ Error al cerrar:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  shutdown('uncaughtException');
});

export default app; // útil para pruebas/integración
