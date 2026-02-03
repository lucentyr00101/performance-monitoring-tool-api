import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import mongoose from 'mongoose';
import { employeeRoutes, departmentRoutes } from '@employees/routes/index.js';
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
    service: 'employees',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.route('/api/v1/employees', employeeRoutes);
app.route('/api/v1/departments', departmentRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
      meta: { timestamp: new Date().toISOString() },
    },
    404
  );
});

// Connect to MongoDB and start server
async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'employee_db';

  try {
    await mongoose.connect(`${mongoUri}/${dbName}`);
    console.log(`✅ Connected to MongoDB: ${dbName}`);

    const port = parseInt(process.env.PORT || '4002');
    console.log(`🚀 Employee Service starting on port ${port}`);

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

export default app;
