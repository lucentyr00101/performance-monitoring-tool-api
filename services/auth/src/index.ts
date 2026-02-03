import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import mongoose from 'mongoose';
import { authRoutes } from '@auth/routes/index.js';
import { 
  requestIdMiddleware,
  errorHandler,
  corsConfig,
} from '@pmt/shared';
import 'dotenv/config';

const app = new Hono();

// Global middleware
app.use('*', cors(corsConfig));
app.use('*', requestIdMiddleware);
app.use('*', logger());
app.use('*', errorHandler);

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    service: 'auth',
    timestamp: new Date().toISOString() 
  });
});

// Mount auth routes
app.route('/api/v1/auth', authRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    { 
      success: false, 
      error: { 
        code: 'NOT_FOUND', 
        message: 'Route not found' 
      },
      meta: { timestamp: new Date().toISOString() }
    }, 
    404
  );
});

// Connect to MongoDB and start server
async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'auth_db';
  const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
  
  // Build connection string with authSource if credentials are in URI
  const hasCredentials = mongoUri.includes('@');
  const connectionString = hasCredentials 
    ? `${mongoUri}/${dbName}?authSource=${authSource}`
    : `${mongoUri}/${dbName}`;

  try {
    await mongoose.connect(connectionString);
    console.log(`✅ Connected to MongoDB: ${dbName}`);

    const port = parseInt(process.env.PORT || '4001');
    console.log(`🚀 Auth Service starting on port ${port}`);

    serve({
      fetch: app.fetch,
      port,
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

start();
