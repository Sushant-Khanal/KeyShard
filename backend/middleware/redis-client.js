import { createClient } from 'redis';
import dotenv from 'dotenv'

dotenv.config()

const redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port:process.env.REDIS_PORT
    }
});

redis.on('connect', () => {
  console.log('Redis connected')
})

redis.on('error', err => console.log('Redis redis Error', err));




export default redis

