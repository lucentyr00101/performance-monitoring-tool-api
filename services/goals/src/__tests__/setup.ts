import { beforeAll, afterEach, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Schema } from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

// Setup before all tests
beforeAll(async () => {
  // Set test environment variables first
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes';
  process.env.BCRYPT_ROUNDS = '4';

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Register a minimal Employee model for population purposes
  if (!mongoose.models.Employee) {
    mongoose.model('Employee', new Schema({
      firstName: String,
      lastName: String,
      email: String,
    }));
  }
});

// Cleanup after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      try {
        await collection.deleteMany({});
      } catch {
        // Ignore errors during cleanup
      }
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch {
    // Ignore errors during cleanup
  }
});
