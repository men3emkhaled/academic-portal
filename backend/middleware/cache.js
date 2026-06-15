const { getCache, setCache, deleteCache, clearCachePattern } = require('../utils/cache');

const isRedisAvailable = () => {
  try {
    const { redis } = require('../utils/cache');
    return redis.status === 'ready';
  } catch {
    return false;
  }
};

const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (!isRedisAvailable()) return next();

    if (req.method !== 'GET') return next();

    const key = `cache:${req.originalUrl}`;
    const cached = await getCache(key);
    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      setCache(key, body, ttlSeconds);
      originalJson(body);
    };
    next();
  };
};

const invalidateCache = async (pattern) => {
  if (!isRedisAvailable()) return;
  await clearCachePattern(pattern);
};

const invalidatePrefix = async (prefix) => {
  if (!isRedisAvailable()) return;
  await clearCachePattern(`cache:${prefix}*`);
};

const invalidateOnWrite = (prefixes = []) => {
  return (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode < 400) {
          prefixes.forEach(p => invalidatePrefix(p));
        }
        originalJson(body);
      };
    }
    next();
  };
};

module.exports = { cacheMiddleware, invalidateCache, invalidatePrefix, invalidateOnWrite };
