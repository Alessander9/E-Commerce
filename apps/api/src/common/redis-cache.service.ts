import { Injectable, Logger } from '@nestjs/common';

/**
 * Redis-backed cache service with graceful degradation.
 *
 * When Redis is not configured or unavailable, falls back to
 * in-memory caching so the application continues to work.
 *
 * Usage:
 *   const cached = await this.cache.get('key');
 *   if (!cached) {
 *     const data = await fetchExpensiveData();
 *     await this.cache.set('key', data, 300); // 5 min TTL
 *   }
 */
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger('RedisCacheService');
  private redis: any = null;
  private memoryCache = new Map<string, { value: any; expiresAt: number }>();
  private useRedis = false;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;

    if (!host) {
      this.logger.warn('REDIS_HOST not configured — using in-memory cache');
      return;
    }

    try {
      const Redis = require('ioredis');
      this.redis = new Redis({
        host,
        port,
        password: password || undefined,
        retryStrategy: (times: number) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed after 3 retries — falling back to memory cache');
            return null; // Stop retrying
          }
          return Math.min(times * 200, 2000);
        },
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
      });

      this.redis.on('connect', () => {
        this.useRedis = true;
        this.logger.log('Redis connected successfully');
      });

      this.redis.on('error', (err: any) => {
        if (this.useRedis) {
          this.logger.warn(`Redis error: ${err.message} — using memory cache`);
          this.useRedis = false;
        }
      });

      this.redis.on('reconnecting', () => {
        this.useRedis = false;
      });
    } catch (err: any) {
      this.logger.warn(`Redis not available: ${err.message} — using memory cache`);
    }
  }

  /**
   * Get a cached value by key.
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    }

    // In-memory fallback
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Set a cached value with TTL in seconds.
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        return;
      } catch {
        // Fall through to memory cache
      }
    }

    // In-memory fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // Cleanup expired entries periodically
    if (this.memoryCache.size > 1000) {
      this.cleanupMemoryCache();
    }
  }

  /**
   * Delete a cached value.
   */
  async del(key: string): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        // Ignore
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * Delete all keys matching a pattern.
   * Redis: DEL with pattern via KEYS
   * Memory: iterate and delete
   */
  async delPattern(pattern: string): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        // Ignore
      }
    }

    // In-memory fallback
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Check if a key exists in cache.
   */
  async exists(key: string): Promise<boolean> {
    if (this.useRedis && this.redis) {
      try {
        return (await this.redis.exists(key)) === 1;
      } catch {
        return false;
      }
    }
    return this.memoryCache.has(key) && Date.now() <= (this.memoryCache.get(key)?.expiresAt || 0);
  }

  /**
   * Cleanup expired in-memory cache entries.
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Get cache stats.
   */
  async getStats(): Promise<{ provider: string; keys: number }> {
    if (this.useRedis && this.redis) {
      try {
        const info = await this.redis.dbsize();
        return { provider: 'redis', keys: info };
      } catch {
        return { provider: 'redis (error)', keys: 0 };
      }
    }
    return { provider: 'memory', keys: this.memoryCache.size };
  }
}
