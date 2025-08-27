// src/server.js
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './index.js';
import connection from './config/database.js';

const PORT = Number(process.env.PORT ?? 3000);
let server;

async function start() {
  try {
    console.log(`🌱 Iniciando en ${process.env.NODE_ENV || 'development'}…`);
    await connection(); // conecta a Mongo, lanza error si falla
    server = app.listen(PORT, () => {
      console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Fallo al iniciar la app:', err?.message || err);
    process.exit(1);
  }
}
start();

// --- Apagado elegante ---
async function shutdown(signal) {
  console.log(`\n🛑 Señal ${signal} recibida. Cerrando con gracia...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
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
