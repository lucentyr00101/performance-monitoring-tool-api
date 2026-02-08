import { beforeAll, afterEach, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Schema } from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Register minimal models for cross-service population
  if (!mongoose.models.Employee) {
    mongoose.model('Employee', new Schema({
      firstName: String,
      lastName: String,
      email: String,
      jobTitle: String,
      department: { type: Schema.Types.ObjectId, ref: 'Department' },
      status: String,
    }, { collection: 'employees', strict: false }));
  }

  if (!mongoose.models.User) {
    mongoose.model('User', new Schema({
      firstName: String,
      lastName: String,
      email: String,
      role: String,
    }, { collection: 'users', strict: false }));
  }

  if (!mongoose.models.Department) {
    mongoose.model('Department', new Schema({
      name: String,
      description: String,
    }, { collection: 'departments', strict: false }));
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
