import { createClient } from 'redis';
import dotenv from 'dotenv'

dotenv.config()

const redis = createClient({
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redis max reconnection attempts reached')
                return new Error('Redis max reconnection attempts reached')
            }
            // Exponential backoff with max 30 seconds
            return Math.min(retries * 100, 30000)
        }
    }
});

redis.on('connect', () => {
  console.log('Redis connected')
})

redis.on('ready', () => {
  console.log('Redis ready')
})

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...')
})

redis.on('error', err => {
    // Only log if not a connection refused error during startup
    if (err.code !== 'ECONNREFUSED') {
        console.error('Redis error:', err.message)
    }
});




export default redis

