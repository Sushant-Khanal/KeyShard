import express from 'express'
import redis from './redis-client.js'
import crypto from 'crypto'


  function emailValidator(email){
        const correctEmail=email.toLowerCase()
        return crypto.createHash('sha256').update(correctEmail).digest('hex')
    }

function emailRateLimiter({secondWindow,allowedHits}){

    return async function (req,res,next){

        try{

       
       const {email}= req.body
       if (!email) return res.status(400).json({ error: true, message: "Email required" })
       const emailHash= emailValidator(email)
        const requests= await redis.incr(`rate:email:${emailHash}`)

        let ttl
        if(requests===1){
            await redis.expire(`rate:email:${emailHash}`,secondWindow)
              ttl = secondWindow
        }else {
            ttl=await redis.ttl(`rate:email:${emailHash}`)
        }

        if (ttl === -1) {
          await redis.expire(`rate:email:${emailHash}`, secondWindow)
          ttl = secondWindow
        }

        if(requests>allowedHits){
           return  res.status(429).json({error:true,message:`Too many requests, wait before sending any requests TTL:${ttl}`})
        
        }else {
            next()
        }

         }catch(error){
                 return next()
        }

        

    }

}

export default emailRateLimiter