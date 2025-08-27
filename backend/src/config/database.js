// config/database.js
import mongoose from 'mongoose';

let cached = global.__mongoose; // cache global para evitar múltiples conexiones con nodemon
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

// Buenas prácticas globales
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);
// mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'true');

function maskMongoUri(uri) {
  try {
    const u = new URL(uri);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+(@)/i, '$1***$2');
  }
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME?.trim();

  if (!uri) throw new Error('Falta la variable MONGO_URI en .env');
  if (!dbName) console.warn('⚠️  Falta la variable MONGO_DB_NAME en .env. Usando la DB por defecto de Mongoose.');

  if (cached.conn) return cached.conn; // ya conectados
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 7000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      retryWrites: true,
      ...(dbName ? { dbName } : {}), // fuerza la DB si está definida
    };

    console.log('⏳ Conectando a MongoDB:', maskMongoUri(uri), dbName ? ` (dbName=${dbName})` : '');

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      const conn = mongooseInstance.connection;

      conn.on('disconnected', () => console.warn('⚠️  MongoDB desconectado'));
      conn.on('reconnected', () => console.log('🔄 MongoDB reconectado'));
      conn.on('error', (err) => console.error('❌ MongoDB error:', err?.message || err));

      console.log('✅ MongoDB conectado', dbName ? `→ DB: ${dbName}` : '(sin nombre explícito)');
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('👋 MongoDB desconectado');
  }
}

export function mongoState() {
  const state = mongoose.connection.readyState;
  const text = ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown';
  return { state, text };
}

export default connectDB;
