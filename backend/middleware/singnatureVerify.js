import express from 'express'
import redis from './redis-client.js'
import crypto from 'crypto'
import User from '../schema/User.js'
import { ed } from './signatureEd.js'
import { auditLog, EVENTS } from '../core/auditLogger.js'


export function SignatureChecker(){
    return async function (req,res,next){
        try{
    const {signatureB64,challengeIdB64,userHash} = req.body

    if (!signatureB64 || !challengeIdB64 || !userHash) {
        auditLog(EVENTS.SIGNATURE_INVALID, {
            ip: req.ip,
            
            metadata: { reason: 'missing_fields' }
        })
        return res.status(401).json({ error: true,mesage:"Not authorized" })
      }
      
      
      const entry = await redis.get(`challengeId:${challengeIdB64}`)

      if (!entry) {
        auditLog(EVENTS.CHALLENGE_FAILED, {
            userHash: userHash,
            ip: req.ip,
            
            metadata: { reason: 'challenge_expired' }
        })
        return res.status(401).json({ error: true,message:"TimeOut "})
      }

      const { challengeB64, userHash: storedUserHash } = JSON.parse(entry)

      if (storedUserHash !== userHash) {
        auditLog(EVENTS.SIGNATURE_INVALID, {
            userHash: userHash,
            ip: req.ip,
            
            metadata: { reason: 'userhash_mismatch' }
        })
        return res.status(401).json({ error: true,message:'Could not perform the action' })
      }
   

    const challenge= Buffer.from(challengeB64,'base64')
    const user= await User.findOne({userHash:userHash})
    if(!user){
        auditLog(EVENTS.SIGNATURE_INVALID, {
            userHash: userHash,
            ip: req.ip,
            
            metadata: { reason: 'user_not_found' }
        })
        return res.json({error:true,message:'Could not perform the action'})
    }
    const publicKeyB64= user.publicKeyBase64
    const publicKey= Buffer.from(publicKeyB64,'base64')


    const signature= Buffer.from(signatureB64,'base64')
    const isValid = await ed.verifyAsync(signature, challenge, publicKey);

    if(!isValid){
        auditLog(EVENTS.SIGNATURE_INVALID, {
            userHash: userHash,
            ip: req.ip,
            
            metadata: { reason: 'invalid_signature' }
        })
        return res.status(401).json({error:true,message:"Not authorized to perfrom this action"})
    }

    auditLog(EVENTS.SIGNATURE_VALID, {
        userHash: userHash,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    })

    await redis.del(`challengeId:${challengeIdB64}`)
    return next()

         }catch(error){
            auditLog(EVENTS.SERVER_ERROR, {
                ip: req.ip,
                
                metadata: { middleware: 'SignatureChecker', error: error.message }
            })
                return res.status(500).json({error:true,message:"Internal Server Error"})
        }
}
}
