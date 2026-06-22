const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Connected to Redis cache');
});

redis.on('error', (err) => {
  logger.error({ err: err.message }, 'Redis Connection Error');
});

const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    logger.error({ err: error.message, key }, 'Redis GET Error');
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 3600) => {
  try {
    const stringValue = JSON.stringify(value);
    await redis.setex(key, ttlSeconds, stringValue);
  } catch (error) {
    logger.error({ err: error.message, key }, 'Redis SET Error');
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.error({ err: error.message, key }, 'Redis DELETE Error');
  }
};

const clearCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info({ count: keys.length, pattern }, 'Cleared cache keys');
    }
  } catch (error) {
    logger.error({ err: error.message, pattern }, 'Redis CLEAR PATTERN Error');
  }
};

module.exports = {
  redis,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
};
