import express from 'express'
const router= express.Router()
import User from '../schema/User.js'
import Vault from '../schema/Vault.js'
import mongoose from 'mongoose'

router.post('/login', async (req,res)=>{
   
    try{
        const {email}=req.body
        if(!email) {
           return  res.status(409).json({message:"Email is required",error:true})
        }

        const vault = await User.findOne({
            email:email
        })

        if(!vault){
            return res.status(404).json({error:true,message:"The email is not registered"})
        }


        return res.status(201).json({error:false,message:vault.encryptedVault})

    }catch(error){
        return res.status(500).json({error:true,message:"Internal Server Error"})
    }
})