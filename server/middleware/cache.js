import redisClient from '../config/redis.js';

export const cache = (duration) => {
    return async (req, res, next) => {
        if (!redisClient?.isReady) {
            return next();
        }

        try {
            const key = `cache:${req.originalUrl || req.url}:${req.user?._id}`;
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                return res.json(JSON.parse(cachedResponse));
            }

            const originalJson = res.json;
            res.json = async function(data) {
                try {
                    await redisClient.setEx(key, duration, JSON.stringify(data));
                } catch (error) {
                    console.error('Redis cache error:', error);
                }
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

export const clearCache = async (pattern) => {
    if (!redisClient?.isReady) {
        return;
    }

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error('Clear cache error:', error);
    }
};