import express from 'express'
const router= express.Router()
import mongoose, { mongo } from 'mongoose'
import redis from '../middleware/redis-client.js'


router.get('/healthCheck', async (req,res)=>{
    try{
        const mongoStatus= mongoose.connection.readyState===1? 'connected' : 'disconnected'

        let redisStatus='disconnected'
        try{
            redis.ping()
            redisStatus='connected'
        }catch(error){
            redisStatus='disconnected'
        }

        const isHealthy= mongoStatus === 'connected' && redisStatus==='connected'

        res.status(isHealthy? 200: 503).json({
            status:isHealthy?'Healthy':'UnHealthy',
            timeStamp: new Date().toISOString(),
            services:{
                mongoDb:mongoStatus,
                redisStatus: redisStatus
            }
        })
    }catch(error){
        res.status(503).json({
            status:'unhealthy',
            timeStamp: new Date().toISOString(),
            error: 'Health check failed'
        })
    }
})


export default router