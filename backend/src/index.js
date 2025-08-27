// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routers/auth_routes.js';
import clientesRoutes from './routers/clientes_routes.js';
import tecnicosRoutes from './routers/tecnicos_routes.js';
import ticketsRoutes from './routers/tickets_routes.js';

const app = express();

// Config desde .env con defaults sensatos
const JSON_LIMIT = process.env.JSON_LIMIT || '2mb';
const TRUST_PROXY = String(process.env.TRUST_PROXY ?? 'false') === 'true';
const CORS_ORIGIN = process.env.CORS_ORIGIN || true;
const CORS_CREDENTIALS = String(process.env.CORS_CREDENTIALS ?? 'true') === 'true';

// --- Middlewares base ---
if (TRUST_PROXY) app.set('trust proxy', 1);
app.use(cors({ origin: CORS_ORIGIN, credentials: CORS_CREDENTIALS }));
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

// --- Helpers ---
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

  if (state === 1 && mongoose.connection.db?.admin) {
    try {
      const t0 = Date.now();
      await mongoose.connection.db.admin().command({ ping: 1 });
      payload.mongoPingMs = Date.now() - t0;
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

// --- 404 y errores ---
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

export default app;
