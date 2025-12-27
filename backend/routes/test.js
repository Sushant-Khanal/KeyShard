import {rateLimit} from 'express-rate-limit'
import express from 'express'
import rateLimiter from '../middleware/rateLimit.js'
import emailRateLimiter from '../middleware/emailRareLimit.js'

const router= express.Router()

router.post('/rateLimit', emailRateLimiter({secondWindow:1*60*1000,allowedHits:5}) ,async(req,res)=>{
    try{
        const ipAddress= req.ip
        console.log(ipAddress)
        res.json(ipAddress)
    }catch(error){
        console.log(error)
    }
})

export default router

