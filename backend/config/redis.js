const redis = require('redis');
const { RateLimiterRedis } = require('rate-limit-redis');

let client;

if (process.env.REDIS_URL) {
    client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
            tls: true,
            rejectUnauthorized: false
        }
    });
    client.connect().catch(console.error);
}

module.exports = client ? new RateLimiterRedis({
    storeClient: client,
    points: 5,
    duration: 900, // 15 دقيقة بالثواني
}) : null;