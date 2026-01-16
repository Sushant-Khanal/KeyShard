import express from 'express'
import redis from './redis-client.js'
import crypto from 'crypto'
import User from '../schema/User.js'
import { ed } from './signatureEd.js'
import { auditLog, EVENTS } from '../core/auditLogger.js'

const router= express.Router()


router.post('/challengeCreate',async(req,res)=>{
    try{
        const {userHash}=req.body

        const user= await User.findOne({userHash:userHash})
        if(!user)
        {
            auditLog(EVENTS.CHALLENGE_FAILED, {
                userHash: userHash,
                ip: req.ip,
               
                metadata: { reason: 'user_not_found' }
            })
            return res.status(404).json({error:true,message:'User doesnot exist'})
        }
        
        const challenge= crypto.randomBytes(32)
        const challengeId= crypto.randomBytes(32)
        const challengeBase64= challenge.toString('base64')
        const challengeIdBase64 = challengeId.toString('base64')

        await redis.set(
            `challengeId:${challengeIdBase64}`,
            JSON.stringify({challengeB64:challengeBase64,userHash}),
            'EX',
            60
        )

        auditLog(EVENTS.CHALLENGE_CREATED, {
            userHash: userHash,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        })

        return res.status(200).json({error:false,message:{challengeB64:challengeBase64,challengeIdB64:challengeIdBase64}})


    }catch(error){
        auditLog(EVENTS.SERVER_ERROR, {
            ip: req.ip,
           
            metadata: { route: '/challengeCreate', error: error.message }
        })
        return res.status(500).json({error:true,message:"Internal Server Error"})
    }
})

export default router


