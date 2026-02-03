import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { 
  RateLimiter,
  requestIdMiddleware,
  errorHandler,
  corsConfig,
} from '@pmt/shared';
import 'dotenv/config';

const LOG_PREFIX = '[Gateway]';

const app = new Hono();

// Service URLs from environment
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  employees: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:4002',
  goals: process.env.GOALS_SERVICE_URL || 'http://localhost:4003',
  reviews: process.env.REVIEWS_SERVICE_URL || 'http://localhost:4004',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4005',
};

// Rate limiter
const rateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
);

// Global middleware
app.use('*', cors(corsConfig));
app.use('*', requestIdMiddleware);
app.use('*', logger());
app.use('*', errorHandler);
app.use('/api/*', rateLimiter.middleware());

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    service: 'gateway',
    timestamp: new Date().toISOString() 
  });
});

// Proxy function
async function proxyRequest(
  c: any,
  targetUrl: string
): Promise<Response> {
  const url = new URL(c.req.url);
  const targetPath = url.pathname + url.search;
  const target = `${targetUrl}${targetPath}`;
  const startTime = Date.now();
  const requestId = c.get('requestId');

  console.info(`${LOG_PREFIX} Proxying request`, {
    requestId,
    method: c.req.method,
    target,
  });

  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value: string, key: string) => {
    if (key.toLowerCase() !== 'host') {
      headers[key] = value;
    }
  });

  // Add request ID
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  try {
    const body = ['GET', 'HEAD'].includes(c.req.method) 
      ? undefined 
      : await c.req.text();

    const response = await fetch(target, {
      method: c.req.method,
      headers,
      body,
    });

    const duration = Date.now() - startTime;
    console.info(`${LOG_PREFIX} Proxy response received`, {
      requestId,
      status: response.status,
      duration,
      target,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} Proxy error`, {
      requestId,
      target,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return c.json(
      { 
        success: false, 
        error: { 
          code: 'SERVICE_UNAVAILABLE', 
          message: 'Service temporarily unavailable' 
        },
        meta: { timestamp: new Date().toISOString() }
      }, 
      503
    );
  }
}

// Auth routes
app.all('/api/v1/auth/*', (c) => proxyRequest(c, SERVICES.auth));

// Employee routes
app.all('/api/v1/employees/*', (c) => proxyRequest(c, SERVICES.employees));
app.all('/api/v1/departments/*', (c) => proxyRequest(c, SERVICES.employees));

// Goals routes
app.all('/api/v1/goals/*', (c) => proxyRequest(c, SERVICES.goals));

// Reviews routes
app.all('/api/v1/review-cycles/*', (c) => proxyRequest(c, SERVICES.reviews));
app.all('/api/v1/reviews/*', (c) => proxyRequest(c, SERVICES.reviews));
app.all('/api/v1/adhoc-reviews/*', (c) => proxyRequest(c, SERVICES.reviews));
app.all('/api/v1/review-forms/*', (c) => proxyRequest(c, SERVICES.reviews));

// Analytics routes
app.all('/api/v1/analytics/*', (c) => proxyRequest(c, SERVICES.analytics));

// 404 for unknown routes
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

// Start server
const port = parseInt(process.env.PORT || '4000');

console.info(`${LOG_PREFIX} Starting API Gateway`, { port, services: SERVICES });

serve({
  fetch: app.fetch,
  port,
});

