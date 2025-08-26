import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


mongoose.set('strictQuery', true);


const connection = async () => {
try {
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ MongoDB conectado');
} catch (error) {
console.error('❌ Error al conectar MongoDB:', error.message);
process.exit(1);
}
};
export default connection;