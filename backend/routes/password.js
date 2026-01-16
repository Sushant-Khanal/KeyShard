import express from 'express'
import User from '../schema/User.js'

import redis from '../middleware/redis-client.js';
import crypto from 'crypto'
import { SignatureChecker } from '../middleware/singnatureVerify.js';
import { auditLog, EVENTS } from '../core/auditLogger.js'

const router= express.Router();


router.post('/passFetch',async(req,res)=>{
    try{
        const {userHash}= req.body

        if(!userHash){
            auditLog(EVENTS.VAULT_ACCESSED, {
                ip: req.ip,
                
                metadata: { success: false, reason: 'missing_userhash' }
            })
          return  res.status(400).json({error:true,message:"Failed to fetch the vault"})
        }

        const user= await User.findOne({
            userHash:userHash
        })

        if(!user){
            auditLog(EVENTS.VAULT_ACCESSED, {
                userHash: userHash,
                ip: req.ip,
                
                metadata: { success: false, reason: 'user_not_found' }
            })
            return res.status(404).json({error:true,message:"Could not find the vault"})
        }

        auditLog(EVENTS.VAULT_ACCESSED, {
            userHash: userHash,
            ip: req.ip,
            
            metadata: { success: true }
        })

        res.status(200).json({error:false,message:{
            encryptedVault:user.encryptedVault,
            iv:user.iv,
            tag:user.tag
        }})





    }catch(error){
        auditLog(EVENTS.SERVER_ERROR, {
            ip: req.ip,
            
            metadata: { route: '/passFetch', error: error.message }
        })
      return  res.status(500).json({error:true,message:"Internal Server Error"})
    }
})




router.post('/newPassword',SignatureChecker(),async(req,res)=>{
    try{
        const {userHash,encryptedVault,tag,iv}= req.body

        if(!userHash && !encryptedVault && !tag && !iv){
            auditLog(EVENTS.VAULT_UPDATED, {
                ip: req.ip,
                
                metadata: { success: false, reason: 'missing_fields' }
            })
          return  res.status(400).json({error:true,message:"Failed to fetch the vault"})
        }

        const user= await User.updateOne({
            userHash:userHash
        },
        {
        $set:{
            iv:iv,
            encryptedVault:encryptedVault,
            tag:tag
        }
    })

        if(user.matchedCount===0){
            auditLog(EVENTS.VAULT_UPDATED, {
                userHash: userHash,
                ip: req.ip,
                
                metadata: { success: false, reason: 'user_not_found' }
            })
            return res.status(404).json({error:true,message:"Could not find the vault"})
        }

        auditLog(EVENTS.VAULT_UPDATED, {
            userHash: userHash,
            ip: req.ip,
            
            metadata: { success: true }
        })

        res.status(200).json({error:false,message:"Vault Updated Sucessfully"})


    }catch(error){
        auditLog(EVENTS.SERVER_ERROR, {
            ip: req.ip,
            
            metadata: { route: '/newPassword', error: error.message }
        })
      return  res.status(500).json({error:true,message:"Internal Server Error"})
    }
})


export default router