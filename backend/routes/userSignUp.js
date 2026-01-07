import express from 'express'
import User from '../schema/User.js'
import mongoose from 'mongoose'
import Vault from '../schema/Vault.js'
import { sha256 } from '@noble/hashes/sha2.js';

const router = express.Router()


router.post('/signup',async (req,res)=>{
    const session= await mongoose.startSession();
    try{
        const {email, encryptedVault,iv,tag,userHash,salt,publicKeyBase64}= req.body
        console.log('publicKeyBase64backend:',publicKeyBase64)

        if(!email || !encryptedVault || !userHash ){
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
          res.status(201).json({error:false,message:"Vault Created Sucessfully"})
        }

    }catch(error){
        await session.abortTransaction()
        console.log(error)
        res.status(500).json({
            error: true,
            message: "Internal server error"
        })
    }finally{
        session.endSession()
    }
})


export default router