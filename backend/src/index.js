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

/* ---------------------- Config desde .env ---------------------- */
// .env (producción) ejemplos:
// CORS_ORIGIN=https://kprueba.vercel.app,https://tu-front.vercel.app
// CORS_WILDCARD=*.vercel.app
// CORS_LOCALHOST_PORTS=5173,4173
// CORS_ALLOW_NULL_ORIGIN=true

const JSON_LIMIT = process.env.JSON_LIMIT || '2mb';
const TRUST_PROXY = String(process.env.TRUST_PROXY ?? 'false') === 'true';
const CORS_CREDENTIALS = String(process.env.CORS_CREDENTIALS ?? 'true') === 'true';

const parseList = (v = '') => v.split(',').map(s => s.trim()).filter(Boolean);

const EXACT_ORIGINS     = parseList(process.env.CORS_ORIGIN || '').map(s => s.replace(/\/$/, ''));
const WILDCARD_PATTERN  = (process.env.CORS_WILDCARD || '').trim();       // ej: *.vercel.app
const LOCALHOST_PORTS   = parseList(process.env.CORS_LOCALHOST_PORTS || '');
const ALLOW_NULL_ORIGIN = String(process.env.CORS_ALLOW_NULL_ORIGIN ?? 'true') === 'true';

/* ---------------------- Helpers CORS ---------------------- */
const toURL = (origin) => { try { return new URL(origin); } catch { return null; } };

const isLocalhostAllowed = (origin) => {
  const u = toURL(origin);
  if (!u) return false;
  const host = u.hostname;
  const port = u.port || (u.protocol === 'https:' ? '443' : '80');
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  return isLocal && (LOCALHOST_PORTS.length === 0 || LOCALHOST_PORTS.includes(String(port)));
};

const matchesWildcard = (origin) => {
  if (!WILDCARD_PATTERN) return false;
  const u = toURL(origin);
  if (!u) return false;
  const host = u.hostname.toLowerCase();
  const base = WILDCARD_PATTERN.replace(/^\*\.\s*/, '').toLowerCase(); // "*.vercel.app" -> "vercel.app"
  return host === base || host.endsWith(`.${base}`);
};

/* ---------------------- Middlewares base ---------------------- */
app.disable('x-powered-by');
if (TRUST_PROXY) app.set('trust proxy', 1);

// Evita caches erróneos por Origin/Headers variables
app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin, Access-Control-Request-Headers');
  next();
});

// CORS centralizado (¡no setear A-C-A-O en otro sitio!)
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return ALLOW_NULL_ORIGIN ? cb(null, true) : cb(new Error('Origen nulo no permitido por CORS'));
    const clean = origin.replace(/\/$/, '');
    const allowed =
      EXACT_ORIGINS.includes(clean) ||
      matchesWildcard(clean) ||
      isLocalhostAllowed(clean);
    if (allowed) return cb(null, true);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[CORS] Bloqueado: ${origin}`);
      console.warn(`[CORS] Exactos: ${EXACT_ORIGINS.join(', ') || '(vacío)'}`);
      console.warn(`[CORS] Wildcard: ${WILDCARD_PATTERN || '(ninguno)'}`);
      console.warn(`[CORS] Localhost puertos: ${LOCALHOST_PORTS.join(', ') || '(ninguno)'}`);
    }
    return cb(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: CORS_CREDENTIALS,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight explícito

// 🔧 SANEADOR OPCIONAL: garantiza un solo valor en A-C-A-O (por si otro middleware lo ensució)
app.use((req, res, next) => {
  const h = res.getHeader('Access-Control-Allow-Origin');
  if (typeof h === 'string' && h.includes(',')) {
    const origin = (req.headers.origin || '').replace(/\/$/, '');
    const list = h.split(',').map(s => s.trim());
    const pick = origin && list.includes(origin) ? origin : list[0];
    res.setHeader('Access-Control-Allow-Origin', pick);
  }
  next();
});

/* ---------------------- Parsers ---------------------- */
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

/* ---------------------- Helpers ---------------------- */
const mongoStateText = (state) =>
  (['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown');

/* ---------------------- Rutas públicas ---------------------- */
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

/* ---------------------- API ---------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/tickets', ticketsRoutes);

/* ---------------------- 404 y errores ---------------------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado', path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  if (String(err.message || '').startsWith('Origen no permitido por CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('❌ Error no controlado:', err);
  const status = Number(err.status || 500);
  res.status(status).json({ error: err.message || 'Error interno del servidor', status });
});

export default app;
