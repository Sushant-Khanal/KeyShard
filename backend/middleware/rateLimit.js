import express from 'express'
import redis from './redis-client.js'


  function ipValidator(ip){
        return ip.startsWith('::ffff:')?ip.replace('::ffff:',""):ip
    }

function rateLimiter({secondWindow,allowedHits}){
    console.log("ratelimiter hit ip based")
    return async function (req,res,next){

        try{

       
        const ip= ipValidator(req.ip)
        const requests= await redis.incr(`rate:ip:${ip}`)

        let ttl
        if(requests===1){
            await redis.expire(`rate:ip:${ip}`,secondWindow)
              ttl = secondWindow
        }else {
            ttl=await redis.ttl(`rate:ip:${ip}`)
        }

        if (ttl === -1) {
          await redis.expire(`rate:ip:${ip}`, secondWindow)
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

export default rateLimiter