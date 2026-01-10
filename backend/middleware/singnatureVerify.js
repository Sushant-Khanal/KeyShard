import express from 'express'
import redis from './redis-client.js'
import crypto from 'crypto'
import User from '../schema/User.js'
import { ed } from './signatureEd.js'


export function SignatureChecker(){
    return async function (req,res,next){
        try{

            console.log("Signature hittt")
    const {signatureB64,challengeIdB64,userHash} = req.body

   

    if (!signatureB64 || !challengeIdB64 || !userHash) {
        return res.status(401).json({ error: true,mesage:"Not authorized" })
      }
      
      
      const entry = await redis.get(`challengeId:${challengeIdB64}`)

      if (!entry) {
        return res.status(401).json({ error: true,message:"TimeOut "})
      }

      const { challengeB64, userHash: storedUserHash } = JSON.parse(entry)

      if (storedUserHash !== userHash) {
  return res.status(401).json({ error: true,message:'Could not perform the action' })
}
   

    const challenge= Buffer.from(challengeB64,'base64')
    const user= await User.findOne({userHash:userHash})
    if(!user){
        return res.json({error:true,message:'Could not perform the action'})
    }
    const publicKeyB64= user.publicKeyBase64
    console.log("publicKeyB64",publicKeyB64)
    const publicKey= Buffer.from(publicKeyB64,'base64')


    const signature= Buffer.from(signatureB64,'base64')
    console.log("signatureB64",signatureB64)
    const isValid = await ed.verifyAsync(signature, challenge, publicKey);

    console.log("backendisvalid: ",isValid)

    if(!isValid){
        return res.status(401).json({error:true,message:"Not authorized to perfrom this action"})
    }

    await redis.del(`challengeId:${challengeIdB64}`)
    return next()

         }catch(error){
            console.log(error)
                return res.status(500).json({error:true,message:"Internal Server Error"})
        }
}
}
