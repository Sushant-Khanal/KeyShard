import express from 'express'
import dotenv from 'dotenv'
import connectdb from './middleware/dbConnection.js'
import userSignupRoute from './routes/userSignUp.js'
import userLoginRoute from './routes/userLogin.js'
import passwordFetchRoute from './routes/password.js'
import testRoute from './routes/test.js'
import redis from './middleware/redis-client.js'
import challengeCreateRoute from './middleware/challenge.js'
import healthCheckRoute from './routes/healthCheck.js'
import mongoose from 'mongoose'
 dotenv.config()


const requiredEnvVars= ['PORT',
                        'MONGO_URL',
                        'REDIS_USERNAME',
                        'REDIS_PASSWORD',
                        'REDIS_HOST',
                        'REDIS_PORT']


for(const envVar of requiredEnvVars){
    if(!process.env[envVar]){
        console.log(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}


const app= express()
app.set("trust proxy", true);


const PORT= process.env.PORT
app.use(express.json({ limit: '10kb' }))



app.use('/api',userSignupRoute)
app.use('/api',userLoginRoute)
app.use('/api',passwordFetchRoute)
app.use('/api',testRoute)
app.use('/api',challengeCreateRoute)
app.use('/api',healthCheckRoute)

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: true, message: 'Endpoint not found' })
})

// Global error handler 
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: true, message: 'Internal server error' })
})

async function startServer(){
    try{
        await connectdb()
        await redis.connect()

            const server= app.listen(PORT,()=>{
        console.log(`Server starting in port ${PORT}`)
        })

        async function shutdown(signal){
            console.log(`${signal} received,shutting down gracefully`)

            server.close(async()=>{
                console.log('Http server closed')
                try{
                await redis.quit()
                console.log(`Redis connection closed`)
            }catch(e){
                console.error('Error closing Redis:',e)
            }

            try{
                await mongoose.connection.close()
                console.log('MongoDb connection closed')
            }catch(e){
                console.error('Error closing MongoDb:',e)
            }

            process.exit(0) // 0 means no error
            })

        // Force shutdown after 10 seconds
                setTimeout(() => {
                    console.error('Forced shutdown after timeout')
                    process.exit(1)
                }, 10000)
            }

            process.on('SIGTERM',()=>{
                shutdown('SIGTERM')
            })
            process.on('SIGINT', ()=>{
                shutdown('SIGINT')
            })

    }catch(error){
         console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer();


