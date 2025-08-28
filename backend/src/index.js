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

// --- Config desde .env con defaults sensatos ---
const JSON_LIMIT       = process.env.JSON_LIMIT || '2mb';
const TRUST_PROXY      = String(process.env.TRUST_PROXY ?? 'false') === 'true';
const CORS_CREDENTIALS = String(process.env.CORS_CREDENTIALS ?? 'true') === 'true';

// .env de ejemplo:
// CORS_ORIGIN=https://kprueba.vercel.app,http://localhost:5173
// CORS_ORIGIN_WILDCARDS=*.vercel.app
// CORS_LOCALHOST_PORTS=5173,4173
// CORS_ALLOW_NULL_ORIGIN=true

const parseList = (v = '') =>
  v.split(',').map(s => s.trim()).filter(Boolean);

const ORIGINS_RAW        = (process.env.CORS_ORIGIN || '').trim();
const WILDCARDS_RAW      = (process.env.CORS_ORIGIN_WILDCARDS || '').trim();
const LOCALHOST_PORTS    = parseList(process.env.CORS_LOCALHOST_PORTS || '5173');
const ALLOW_NULL_ORIGIN  = String(process.env.CORS_ALLOW_NULL_ORIGIN ?? 'true') === 'true';

const ALLOWED_ORIGINS = parseList(ORIGINS_RAW).map(s => s.replace(/\/$/, '')); // exactos
const WILDCARD_HOSTS = parseList(WILDCARDS_RAW); // ej: ["*.vercel.app"]

const toURL = (origin) => {
  try { return new URL(origin); } catch { return null; }
};

const getHost = (origin) => {
  const u = toURL(origin);
  return u ? u.hostname.toLowerCase() : '';
};

const globToRegex = (glob) => {
  // "*.vercel.app" -> /^([a-z0-9-]+\.)*vercel\.app$/i
  const esc = glob.trim().toLowerCase()
    .replace(/(^\*\.)/g, '([a-z0-9-]+\\.)*')   // *.dominio
    .replace(/\./g, '\\.');
  return new RegExp('^' + esc.replace(/^\(\[\w-]\+\.\)\*/, '([a-z0-9-]+\\.)*') + '$', 'i');
};

const WILDCARD_REGEX = WILDCARD_HOSTS.map(globToRegex);

const isAllowedLocalhost = (origin) => {
  const u = toURL(origin);
  if (!u) return false;
  const isLocal = ['localhost', '127.0.0.1'].includes(u.hostname);
  const port = u.port || (u.protocol === 'https:' ? '443' : '80');
  return isLocal && (LOCALHOST_PORTS.length === 0 || LOCALHOST_PORTS.includes(String(port)));
};

const isWildcardAllowed = (origin) => {
  const host = getHost(origin);
  return WILDCARD_REGEX.some(rx => rx.test(host));
};

// --- Middlewares base ---
app.disable('x-powered-by');
if (TRUST_PROXY) app.set('trust proxy', 1);

// Siempre variar por Origin (evita caches incorrectos)
app.use((req, res, next) => { res.header('Vary', 'Origin'); next(); });

// CORS robusto con lista blanca + comodines + localhost
const corsOptions = {
  origin(origin, cb) {
    // Permite llamadas sin Origin (health checks, cron internos, curl) si lo decides
    if (!origin) {
      if (ALLOW_NULL_ORIGIN) return cb(null, true);
      return cb(new Error('Origen nulo no permitido por CORS'));
    }

    const clean = origin.replace(/\/$/, '');
    const allow =
      ALLOWED_ORIGINS.includes(clean) ||
      isWildcardAllowed(clean) ||
      isAllowedLocalhost(clean);

    if (allow) return cb(null, true);

    // Log útil en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[CORS] Bloqueado: ${origin}`);
      console.warn(`[CORS] Permitidos exactos: ${ALLOWED_ORIGINS.join(', ') || '(vacío)'}`);
      console.warn(`[CORS] Comodines: ${WILDCARD_HOSTS.join(', ') || '(ninguno)'}`);
      console.warn(`[CORS] Localhost puertos: ${LOCALHOST_PORTS.join(', ') || '(ninguno)'}`);
    }

    return cb(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: CORS_CREDENTIALS,
  optionsSuccessStatus: 204,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  exposedHeaders: ['Content-Disposition'], // útil para descargas
};

app.use(cors(corsOptions));
// Responder preflight explícitamente (algunos proxies lo requieren)
app.options('*', cors(corsOptions));


// Parsers
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

// --- Helpers ---
const mongoStateText = (state) =>
  (['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown');

// --- Rutas públicas básicas ---
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

// --- API ---
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/tickets', ticketsRoutes);

// --- 404 y errores ---
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado', path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  // Si el error viene de CORS, responde 403 para que sea claro en el front
  if (String(err.message || '').startsWith('Origen no permitido por CORS')) {
    return res.status(403).json({ error: err.message });
  }

  console.error('❌ Error no controlado:', err);
  const status = Number(err.status || 500);
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    status,
  });
});

export default app;
