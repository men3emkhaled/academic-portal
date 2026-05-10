const Redis = require('ioredis');

// Configure Redis Client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  retryStrategy: (times) => {
    // Reconnect after
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis cache successfully.');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Parsed JSON object or null
 */
const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`⚡ Cache HIT for key: ${key}`);
      return JSON.parse(data);
    }
    console.log(`🐢 Cache MISS for key: ${key}`);
    return null;
  } catch (error) {
    console.error('❌ Redis GET Error:', error.message);
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 1 hour)
 */
const setCache = async (key, value, ttlSeconds = 3600) => {
  try {
    const stringValue = JSON.stringify(value);
    await redis.setex(key, ttlSeconds, stringValue);
  } catch (error) {
    console.error('❌ Redis SET Error:', error.message);
  }
};

/**
 * Delete data from cache
 * @param {string} key - Cache key
 */
const deleteCache = async (key) => {
  try {
    await redis.del(key);
    console.log(`🧹 Cache cleared for key: ${key}`);
  } catch (error) {
    console.error('❌ Redis DELETE Error:', error.message);
  }
};

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., 'courses:*')
 */
const clearCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('❌ Redis CLEAR PATTERN Error:', error.message);
  }
};

module.exports = {
  redis,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
};
