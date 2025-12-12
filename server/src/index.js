import express from 'express'
import helmet from 'helmet';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import http from './httpClient.js';
import { rateLimiterMiddleware, closeRateLimiter } from './rateLimiterWithFallback.js';
import CircuitBreaker from 'opossum';
import dotenv from 'dotenv'



const logger = pino({ name: 'server', level: process.env.LOG_LEVEL || 'info' });

dotenv.config()



const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE || 'https://jsonplaceholder.typicode.com'; // example
const SERVER_TIMEOUT_MS = parseInt(process.env.SERVER_TIMEOUT_MS || `${30 * 1000}`, 10); // for server.setTimeout




app.use(express.json({ limit: '100kb' }));
app.use(helmet());







app.set('trust proxy', true);

app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  req.log = logger.child({ requestId: id, route: req.path });
  next();
});

app.use(rateLimiterMiddleware());

/**
 * Example circuit-wrapped external call:
 * We'll call `${EXTERNAL_SERVICE_BASE}/posts/:id`
 * Circuit options should be tuned for your environment.
 */
async function fetchExternalPost(id) {
  // http is our axios instance with retries/timeouts
  const res = await http.get(`${EXTERNAL_SERVICE_BASE}/posts/${id}`);
  return res.data;
}

const circuitOptions = {
  timeout: 5000, // if fetchExternalPost doesn't resolve in this ms -> failure for circuit
  errorThresholdPercentage: 50, // percent of failures to open circuit
  resetTimeout: 30_000, // ms to wait before attempting half-open
  rollingCountTimeout: 10_000,
  rollingCountBuckets: 10
};

const postCircuit = new CircuitBreaker(fetchExternalPost, circuitOptions);

postCircuit.on('open', () => logger.warn('Circuit opened for external posts'));
postCircuit.on('halfOpen', () => logger.info('Circuit half-open for external posts'));
postCircuit.on('close', () => logger.info('Circuit closed for external posts'));
postCircuit.on('fallback', () => logger.warn('Circuit fallback hit'));

postCircuit.fallback((id) => {
  // For real apps, return a cached/placeholder response here.
  return { id, title: 'Service temporarily unavailable', body: '' };
});

app.get('/', (req, res) => {
  req.log.info('root hit');
  res.json({ ok: true, message: 'Fault-tolerant API example', requestId: req.requestId });
});

app.get('/healthz', (req, res) => res.json({ ok: true }));

// Readiness: check Redis (via rateLimiter) by peeking fallbackCache or trying a minimal command.
// Simpler: try the circuit state & assume redis client closed in rateLimiter closeRateLimiter handles Redis.
app.get('/ready', async (req, res) => {
  // We check circuit status and respond 503 if it is open and not recovering
  const circuitOpen = postCircuit.opened;
  if (circuitOpen) {
    // still allow but mark not ready — depends on your policy
    return res.status(503).json({ ready: false, reason: 'external service circuit open' });
  }
  return res.json({ ready: true });
});

app.get('/external/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await postCircuit.fire(id);
    // If fallback returns something, it will be returned here
    res.json({ data: result });
  } catch (err) {
    // Could be circuit open, or HTTP failure
    req.log.warn({ err: err?.message || err }, 'external call failed');
    // If circuit is open, opossum throws a specific error
    if (err && err.message && err.message.includes('Breaker is open')) {
      return res.status(503).json({ message: 'Upstream service temporarily unavailable (circuit open)' });
    }
    return next(err);
  }
});

/**
 * Generic error handler
 */
app.use((err, req, res, next) => {
  req.log.error({ err: err?.message || err }, 'unhandled error');
  const status = err && err.statusCode ? err.statusCode : 500;
  res.status(status).json({ message: err?.message || 'Internal server error' });
});



 

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

server.setTimeout(SERVER_TIMEOUT_MS);

/**
 * Graceful shutdown:
 * - stop accepting new connections (server.close)
 * - wait for in-flight requests (server.close's callback)
 * - close resources (rate limiter / redis)
 * - shutdown circuit breaker
 */
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown initiated');

  // stop receiving new connections
  server.close(async (err) => {
    if (err) {
      logger.error({ err }, 'Error closing server');
      process.exit(1);
    }
    // close resources
    try {
      // close redis + anything in rateLimiterWithFallback
      await closeRateLimiter();
    } catch (e) {
      logger.warn({ e }, 'Error closing rate limiter');
    }

    // shutdown circuit and wait for it to stop
    try {
      await postCircuit.shutdown(5000); // wait up to 5s for circuit to finish
    } catch (e) {
      logger.warn({ e }, 'Error shutting down circuit');
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force exit if not finished in N ms
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'uncaughtException — exiting');
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection');
  // Do not necessarily exit — but in many production systems you may choose to restart
});