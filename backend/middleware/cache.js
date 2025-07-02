import NodeCache from 'node-cache';

// Create a new cache instance with a standard TTL (time to live) of 5 minutes
// and a check period of 1 minute to delete expired entries
const cache = new NodeCache({
    stdTTL: 300, // 5 minutes in seconds
    checkperiod: 60, // 1 minute in seconds
    useClones: false // for better performance with large objects
});

// Middleware to cache responses
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create a unique key for each request
        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // If we have a cached response, send it
            res.send(cachedResponse);
            return;
        } else {
            // If not, override the send method to cache the response
            const originalSend = res.send;
            res.send = (body) => {
                // Only cache successful responses (status 200)
                if (res.statusCode === 200) {
                    cache.set(key, body, duration);
                }
                originalSend.call(res, body);
            };
            next();
        }
    };
};

// Function to clear cache by key pattern
const clearCache = (keyPattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(keyPattern));
    
    if (matchingKeys.length > 0) {
        cache.del(matchingKeys);
        console.log(`Cleared cache for keys matching: ${keyPattern}`);
    }
};

export { cache, cacheMiddleware, clearCache };

// Invalidate cache when product data changes
export const invalidateProductCache = () => {
    clearCache('product:');
};

// Invalidate cache when order data changes
export const invalidateOrderCache = () => {
    clearCache('order:');
};

// Invalidate all cache
export const invalidateAllCache = () => {
    cache.flushAll();
    console.log('All cache has been cleared');
};
