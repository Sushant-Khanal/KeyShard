import express from 'express'
import dotenv from 'dotenv'
import connectdb from './middleware/dbConnection.js'
import userSignupRoute from './routes/userSignUp.js'
import userLoginRoute from './routes/userLogin.js'
import passwordFetchRoute from './routes/password.js'
import testRoute from './routes/test.js'
import redis from './middleware/redis-client.js'
import challengeCreateRoute from './middleware/challenge.js'
import mongoose from 'mongoose'
dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URL', 'REDIS_HOST', 'REDIS_PORT']
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`)
        process.exit(1)
    }
}

const app = express()
const PORT = process.env.PORT

// Trust proxy for accurate IP detection behind load balancers
app.set("trust proxy", true)

// Limit request body size for security
app.use(express.json({ limit: '10kb' }))

// Health check endpoint for monitoring and load balancers
// Note: Not rate-limited intentionally - health checks need to be available
// for load balancers and monitoring systems to frequently poll
app.get('/health', async (req, res) => {
    try {
        // Check MongoDB connection
        const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        
        // Check Redis connection
        let redisStatus = 'disconnected'
        try {
            await redis.ping()
            redisStatus = 'connected'
        } catch (e) {
            redisStatus = 'disconnected'
        }

        const isHealthy = mongoStatus === 'connected' && redisStatus === 'connected'
        
        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                mongodb: mongoStatus,
                redis: redisStatus
            }
        })
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        })
    }
})

// API routes
app.use('/api', userSignupRoute)
app.use('/api', userLoginRoute)
app.use('/api', passwordFetchRoute)
app.use('/api', testRoute)
app.use('/api', challengeCreateRoute)

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: true, message: 'Endpoint not found' })
})

// Global error handler (next parameter required by Express for error middleware signature)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: true, message: 'Internal server error' })
})

// Initialize database and Redis connections, then start server
async function startServer() {
    try {
        await connectdb()
        await redis.connect()
        
        const server = app.listen(PORT, () => {
            console.log(`Server starting in port ${PORT}`)
        })

        // Graceful shutdown handlers
        const shutdown = async (signal) => {
            console.log(`${signal} received, shutting down gracefully`)
            
            server.close(async () => {
                console.log('HTTP server closed')
                
                try {
                    await redis.quit()
                    console.log('Redis connection closed')
                } catch (e) {
                    console.error('Error closing Redis:', e)
                }
                
                try {
                    await mongoose.connection.close()
                    console.log('MongoDB connection closed')
                } catch (e) {
                    console.error('Error closing MongoDB:', e)
                }
                
                process.exit(0)
            })

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout')
                process.exit(1)
            }, 10000)
        }

        process.on('SIGTERM', () => shutdown('SIGTERM'))
        process.on('SIGINT', () => shutdown('SIGINT'))

    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()