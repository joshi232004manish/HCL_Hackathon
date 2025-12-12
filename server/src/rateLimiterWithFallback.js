// src/rateLimiterWithFallback.js
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';
import pino from 'pino';

const logger = pino({ name: 'rate-limiter' });

/**
 * Configuration - can be controlled via environment variables
 */
const REDIS_URL = process.env.REDIS_URL || null;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DISABLED = (process.env.REDIS_DISABLED === '1' || process.env.USE_REDIS === 'false');

const POINTS = parseInt(process.env.RL_POINTS || '100', 10);      // default number of requests allowed
const DURATION = parseInt(process.env.RL_DURATION || `${15 * 60}`, 10); // seconds (default 15 minutes)
const BLOCK_DURATION = parseInt(process.env.RL_BLOCK || `${15 * 60}`, 10); // seconds to block when abused

/**
 * In-memory fallback using LRU cache
 * Value stored: { consumed: number, expiresAt: timestamp_ms }
 */
const fallbackCache = new LRUCache({
  max: 50000,
  ttl: (DURATION + 10) * 1000 // ttl slightly larger than window
});

/**
 * Globals that will hold Redis client and limiter (if initialized)
 */
let redisClient = null;
let redisRateLimiter = null;

/**
 * Async initialization block: try to create redis client & RateLimiterRedis.
 * Supports ioredis-mock when NODE_ENV === 'test'.
 *
 * NOTE: This uses top-level await (ESM). Node 16+ supports it.
 */
if (!REDIS_DISABLED) {
  try {
    // If tests or explicit flag, try to use ioredis-mock for in-process Redis-like behavior
    if (process.env.NODE_ENV === 'test' || process.env.USE_REDIS === 'false') {
      // dynamic import so it doesn't fail in environments where the mock isn't installed
      try {
        // eslint-disable-next-line no-await-in-loop
        const mod = await import('ioredis-mock').catch(() => null);
        if (mod && mod.default) {
          const RedisMock = mod.default;
          redisClient = new RedisMock();
          logger.info('Using ioredis-mock as Redis client (NODE_ENV=test or USE_REDIS=false)');
        } else {
          logger.warn('ioredis-mock not available; falling back to real ioredis client attempt');
        }
      } catch (e) {
        logger.warn({ e }, 'Failed to import ioredis-mock; will attempt real Redis');
      }
    }

    // If redisClient is still null, create real ioredis client
    if (!redisClient) {
      if (REDIS_URL) {
        redisClient = new Redis(REDIS_URL, { maxRetriesPerRequest: 1 });
      } else {
        redisClient = new Redis({
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD,
          maxRetriesPerRequest: 1
        });
      }
    }

    // Listen for errors to log them (non-fatal here; we fallback on errors)
    redisClient.on && redisClient.on('error', (err) => {
      logger.warn({ err: err?.message || err }, 'Redis client emitted an error');
    });

    // Create a RateLimiterRedis only if redisClient was created successfully
    if (redisClient) {
      redisRateLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        points: POINTS,
        duration: DURATION,
        blockDuration: BLOCK_DURATION,
        keyPrefix: 'rlflx'
      });
      logger.info({ points: POINTS, duration: DURATION }, 'Redis-backed rate limiter initialized');
    } else {
      logger.warn('Redis client not created; running with fallback-only limiter');
    }
  } catch (err) {
    // If any error during init, log and fall back to in-memory limiter
    logger.warn({ err: err?.message || err }, 'Failed to initialize Redis rate limiter; using fallback-only');
    redisClient = null;
    redisRateLimiter = null;
  }
} else {
  logger.info('REDIS_DISABLED set - running rate limiter in fallback-only mode');
}

/**
 * In-memory fallback consume function.
 * Returns: { consumedPoints, remaining, msBeforeNext }
 */
function fallbackConsume(key, points = 1) {
  const now = Date.now();
  const raw = fallbackCache.get(key);
  let entry;
  if (!raw || raw.expiresAt <= now) {
    entry = { consumed: 0, expiresAt: now + DURATION * 1000 };
  } else {
    entry = raw;
  }
  entry.consumed += points;
  fallbackCache.set(key, entry);
  const remaining = Math.max(0, POINTS - entry.consumed);
  const msBeforeNext = Math.max(0, entry.expiresAt - now);
  return { consumedPoints: entry.consumed, remaining, msBeforeNext };
}

/**
 * Middleware factory
 *
 * options:
 *  - getKey: function(req) -> string (defaults to req.user?.id || req.ip)
 *  - points: how many points to consume for this call (defaults to 1)
 */
export function rateLimiterMiddleware({ getKey = (req) => (req.user?.id || req.ip), points = 1 } = {}) {
  return async (req, res, next) => {
    const rawKey = getKey(req);
    const key = String(rawKey || req.ip || 'unknown');

    // 1) Try Redis-based limiter if available
    if (redisRateLimiter) {
      try {
        const rlRes = await redisRateLimiter.consume(key, points);
        // success
        res.setHeader('X-RateLimit-Limit', POINTS);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, POINTS - rlRes.consumedPoints));
        res.setHeader('X-RateLimit-Reset', Math.ceil(rlRes.msBeforeNext / 1000));
        return next();
      } catch (err) {
        // If err.msBeforeNext is present, it's a rejection due to exceeding the limit
        if (err && typeof err.msBeforeNext === 'number') {
          res.setHeader('Retry-After', Math.ceil(err.msBeforeNext / 1000));
          res.status(429).json({ message: 'Too many requests' });
          return;
        }
        // For other Redis errors (connection, parse, etc), log and fall through to fallback
        logger.warn({ err: err?.message || err, key }, 'Redis rate limiter failed — falling back to in-memory limiter');
        // continue to fallback below
      }
    }

    // 2) Fallback LRU-based limiter (per-instance)
    try {
      const info = fallbackConsume(key, points);
      res.setHeader('X-RateLimit-Limit', POINTS);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, info.remaining));
      res.setHeader('X-RateLimit-Reset', Math.ceil(info.msBeforeNext / 1000));
      if (info.consumedPoints > POINTS) {
        res.setHeader('Retry-After', Math.ceil(info.msBeforeNext / 1000));
        return res.status(429).json({ message: 'Too many requests (fallback)' });
      }
      return next();
    } catch (fallbackErr) {
      // Very unlikely — fail open to preserve availability
      logger.error({ fallbackErr: fallbackErr?.message || fallbackErr }, 'Fallback limiter failed — allowing request');
      return next();
    }
  };
}

/**
 * Close function for graceful shutdown
 */
export async function closeRateLimiter() {
  if (!redisClient) return;
  try {
    if (typeof redisClient.quit === 'function') {
      await redisClient.quit();
      logger.info('Redis client quit successfully');
    } else if (typeof redisClient.disconnect === 'function') {
      await redisClient.disconnect();
      logger.info('Redis client disconnected successfully');
    }
  } catch (e) {
    logger.warn({ e: e?.message || e }, 'Error closing Redis client (best-effort)');
    try {
      if (typeof redisClient.disconnect === 'function') await redisClient.disconnect();
    } catch (_) {
      // ignore
    }
  }
}

