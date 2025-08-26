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
const PORT = process.env.PORT ?? 3000;

// --- Middlewares base ---
app.set('trust proxy', 1); // útil si vas detrás de proxy/reverse-proxy
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// --- Rutas ---
app.get('/', (_req, res) => res.send('API funcionando 🚀'));
app.get('/health', (_req, res) => {
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbState = mongoose.connection.readyState;
  res.json({
    ok: dbState === 1,
    dbState,
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/tickets', ticketsRoutes);

// --- Manejo de 404 y errores generales ---
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((err, _req, res, _next) => {
  console.error('❌ Error no controlado:', err);
  const status = err.status ?? 500;
  res.status(status).json({
    error: err.message ?? 'Error interno del servidor',
  });
});

let server;

// --- Bootstrap asíncrono: conecta DB y luego levanta servidor ---
async function start() {
  try {
    await connection(); // asegúrate de que arroje si falla
    server = app.listen(PORT, () =>
      console.log(`✅ Server ok en http://localhost:${PORT}`)
    );
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
    // cierra servidor HTTP
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    // cierra conexión a Mongo
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
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

// Captura errores no manejados para evitar estados zombies
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  // cierra con código distinto para que un orquestador (pm2/docker) reinicie
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  shutdown('uncaughtException');
});

export default app; // útil para pruebas/integración
