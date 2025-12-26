/**
 * Redis Configuration
 */

require('dotenv').config();

module.exports = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,

    // Connection options
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },

    // Keys TTL (seconds)
    ttl: {
        session: 86400, // 24 hours
        token: 3600, // 1 hour
        cache: 300, // 5 minutes
        deviceStatus: 60 // 1 minute
    }
};