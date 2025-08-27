import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export async function setupTestDB() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES = '1h';

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  return {
    async cleanup() {
      await mongoose.connection.dropDatabase();
    },
    async teardown() {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  };
}
