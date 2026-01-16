import express from 'express'
import User from '../schema/User.js'
import mongoose from 'mongoose'
import Vault from '../schema/Vault.js'
import { sha256 } from '@noble/hashes/sha2.js';
import { auditLog, EVENTS } from '../core/auditLogger.js'

const router = express.Router()


router.post('/signup',async (req,res)=>{
    const session= await mongoose.startSession();
    try{
        const {email, encryptedVault,iv,tag,userHash,salt,publicKeyBase64}= req.body

        if(!email || !encryptedVault || !userHash ){
            auditLog(EVENTS.SIGNUP_FAILED, {
                ip: req.ip,
                
                metadata: { reason: 'missing_fields' }
            })
          return  res.status(400).json({
            error:true,
            message:"Vault and Email must be provided"
        })
        }


        session.startTransaction()

        const userCheck= await User.findOne(
            {email:email},
            null,
            {session})

        if(userCheck){
            await session.abortTransaction()
            auditLog(EVENTS.SIGNUP_FAILED, {
                ip: req.ip,
                
                metadata: { reason: 'email_exists' }
            })
          return  res.status(409).json({error:true,message:"Email is already registered"})
        }else {
            const [user]= await User.create([{
                email:email,
                 encryptedVault: encryptedVault,
                 iv:iv,
                 userHash:userHash,
                 tag:tag,
                 salt:salt,
                 publicKeyBase64:publicKeyBase64
            }],{session})

       
            await session.commitTransaction()
            auditLog(EVENTS.SIGNUP_SUCCESS, {
                userHash: userHash,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            })
          res.status(201).json({error:false,message:"Vault Created Sucessfully"})
        }

    }catch(error){
        await session.abortTransaction()
        auditLog(EVENTS.SERVER_ERROR, {
            ip: req.ip,
            
            metadata: { route: '/signup', error: error.message }
        })
        res.status(500).json({
            error: true,
            message: "Internal server error"
        })
    }finally{
        session.endSession()
    }
})


export default router