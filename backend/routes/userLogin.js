import express from 'express'
const router= express.Router()
import User from '../schema/User.js'
import Vault from '../schema/Vault.js'
import mongoose from 'mongoose'

router.post('/login', async (req,res)=>{
    console.log("Hitttttt")
    try{
        const {email}=req.body
        if(!email) {
           return  res.status(400).json({message:"Invalid credentials",error:true})
        }

        const vault = await User.findOne({
            email:email
        })
        console.log(vault)

        if(!vault){
            return res.status(404).json({error:true,message:"Invalid credentials"})
        }

        if(!req.body.userHash){
            return res.json({error:false,message:{
                salt:vault.salt
            }})
        }

        
        const dbUserHash= vault.userHash

        if(req.body.userHash!==dbUserHash){
            return res.status(401).json({error:true,message:"Invalid credentials"})
        }


        return res.status(200).json({error:false,message:{
            encryptedVault:vault.encryptedVault,
            iv:vault.iv,
            tag:vault.tag,
            
        }})

    }catch(error){
        return res.status(500).json({error:true,message:"Internal Server Error"})
    }
})

export default router