// config/database.js
import mongoose from 'mongoose';

let cached = global.__mongoose; // cache global para evitar múltiples conexiones con nodemon
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

// Opcionales globales de Mongoose (buenas prácticas)
mongoose.set('strictQuery', true);           // filtra queries no definidos en el schema
mongoose.set('sanitizeFilter', true);        // evita inyecciones en filtros
// mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'true'); // activa logs de queries si lo necesitas

function redactMongoUri(uri) {
  try {
    const u = new URL(uri);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '<invalid MONGO_URI>';
  }
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Falta la variable MONGO_URI en .env');

  if (cached.conn) return cached.conn; // ya conectados
  if (!cached.promise) {
    const opts = {
      // Ajusta según tu entorno/Atlas
      serverSelectionTimeoutMS: 7000, // falla rápido si no hay cluster
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      retryWrites: true,
      // heartbeatFrequencyMS: 10000, // opcional
      // readPreference: 'primary',   // opcional
    };

    console.log('⏳ Conectando a MongoDB:', redactMongoUri(uri));
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      // Eventos útiles (se registran una vez)
      const conn = mongooseInstance.connection;
      conn.on('disconnected', () => console.warn('⚠️  MongoDB desconectado'));
      conn.on('reconnected', () => console.log('🔄 MongoDB reconectado'));
      conn.on('error', (err) => console.error('❌ MongoDB error:', err?.message || err));
      console.log('✅ MongoDB conectado');
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

// Útil para /health o logs
export function mongoState() {
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const state = mongoose.connection.readyState;
  const text = ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown';
  return { state, text };
}

export default connectDB;
