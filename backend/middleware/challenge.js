import express from 'express'
import redis from './redis-client.js'
import crypto from 'crypto'
import User from '../schema/User.js'
import { ed } from './signatureEd.js'

const router= express.Router()


router.post('/challengeCreate',async(req,res)=>{
    try{
        const {userHash}=req.body

        const user= await User.findOne({userHash:userHash})
        if(!user)
        {
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

        return res.status(200).json({error:false,message:{challengeB64:challengeBase64,challengeIdB64:challengeIdBase64}})


    }catch(error){
        console.log(error)
        return res.status(500).json({error:true,message:"Internal Server Error"})
    }
})

export default router


