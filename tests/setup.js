import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import buffer from 'node:buffer';
buffer.SlowBuffer = buffer.Buffer;

let mongoServer;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGOCONNECT = mongoUri;
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_SECRET_REFRESH = 'test-secret-refresh';
  process.env.AWS_REGION = 'us-east-1';
  process.env.AWS_ACCESS_KEY_ID = 'test-access';
  process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
  process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
};

export const teardownTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};
