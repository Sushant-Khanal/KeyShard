import express from 'express'
const router= express.Router()
import User from '../schema/User.js'
import Vault from '../schema/Vault.js'
import mongoose from 'mongoose'
import rateLimiter from '../middleware/rateLimit.js'
import emailRateLimiter from '../middleware/emailRareLimit.js'
import { auditLog, EVENTS } from '../core/auditLogger.js'



router.post('/login', rateLimiter({secondWindow:60,allowedHits:20}),emailRateLimiter({secondWindow:60,allowedHits:5}), async (req,res)=>{
    try{
        const {email}=req.body
        if(!email) {
            auditLog(EVENTS.LOGIN_FAILED, {
                ip: req.ip,
                
                metadata: { reason: 'missing_email' }
            })
           return  res.status(400).json({message:"Invalid credentials",error:true})
        }

        const vault = await User.findOne({
            email:email
        })

        if(!vault){
            auditLog(EVENTS.LOGIN_FAILED, {
                ip: req.ip,
                
                metadata: { reason: 'user_not_found' }
            })
            return res.status(404).json({error:true,message:"Invalid credentials"})
        }

        if(!req.body.userHash){
            // First step: returning salt (not a full login yet)
            return res.json({error:false,message:{
                salt:vault.salt
            }})
        }

        
        const dbUserHash= vault.userHash

        if(req.body.userHash!==dbUserHash){
            auditLog(EVENTS.LOGIN_FAILED, {
                userHash: req.body.userHash,
                ip: req.ip,
                
                metadata: { reason: 'invalid_userhash' }
            })
            return res.status(401).json({error:true,message:"Invalid credentials"})
        }

        auditLog(EVENTS.LOGIN_SUCCESS, {
            userHash: dbUserHash,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        })

        return res.status(200).json({error:false,message:{
            encryptedVault:vault.encryptedVault,
            
            iv:vault.iv,
            tag:vault.tag,
            
        }})

    }catch(error){
        auditLog(EVENTS.SERVER_ERROR, {
            ip: req.ip,
            
            metadata: { route: '/login', error: error.message }
        })
        return res.status(500).json({error:true,message:"Internal Server Error"})
    }
})

export default router