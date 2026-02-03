import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import mongoose from 'mongoose';
import { 
  reviewCycleRoutes, 
  reviewRoutes, 
  adhocReviewRoutes, 
  reviewFormRoutes 
} from '@reviews/routes/index.js';
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
    service: 'reviews',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.route('/api/v1/review-cycles', reviewCycleRoutes);
app.route('/api/v1/reviews', reviewRoutes);
app.route('/api/v1/adhoc-reviews', adhocReviewRoutes);
app.route('/api/v1/review-forms', reviewFormRoutes);

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
  const dbName = process.env.DB_NAME || 'reviews_db';

  try {
    await mongoose.connect(`${mongoUri}/${dbName}`);
    console.log(`✅ Connected to MongoDB: ${dbName}`);

    const port = parseInt(process.env.PORT || '4004');
    console.log(`🚀 Reviews Service starting on port ${port}`);

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
