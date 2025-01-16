import { createClient } from 'redis';

let redisClient = null;

try {
    redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        legacyMode: false
    });

    redisClient.on('error', (err) => {
        console.log('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
        console.log('Redis Client Connected');
    });

    await redisClient.connect();
} catch (error) {
    console.error('Redis connection error:', error);
}

export default redisClient;