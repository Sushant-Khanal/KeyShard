import express from 'express'
//import User from '../schema/User.js'
import axios from 'axios'
import redis from '../middleware/redis-client.js';
import crypto from 'crypto'
import { SignatureChecker } from '../middleware/signatureVerify.js';
import goDB from '../middleware/dbConnection.js';
const router= express.Router();


router.post('/passFetch',async(req,res)=>{
    try{
        const {userHash}= req.body

        if(!userHash){
          return  res.status(400).json({error:true,message:"Failed to fetch the vault"})
        }

      const response = await goDB.get('/user/get', {
            params: { userHash }
        }).catch(() => null)
          const user = response.data

        if(!user){
            return res.status(404).json({error:true,message:"Could not find the vault"})
        }

        res.status(200).json({error:false,message:{
            encryptedVault:user.encryptedVault,
            iv:user.iv,
            tag:user.tag
        }})





    }catch(error){
      return  res.status(500).json({error:true,message:"Internal Server Error"})
    }
})




router.post('/newPassword',SignatureChecker(),async(req,res)=>{


    console.log("newpassroutehit")
    try{
        const {userHash,encryptedVault,tag,iv}= req.body

       


        if(!userHash && !encryptedVault && !tag && !iv){
          return  res.status(400).json({error:true,message:"Failed to fetch the vault"})
        }
const response1 = await goDB.get('/user/get', {
            params: { userHash }
        }).catch(() => null)
          const user = response1.data

        if(!user){
            return res.status(404).json({error:true,message:"Could not find the vault"})
        }
       const email= user.email
        const salt= user.salt
        const publicKeyBase64= user.publicKeyBase64
       const response = await goDB.post('/user', {
            email,
            encryptedVault,
            iv,
            tag,
            salt,
            userHash,
            publicKeyBase64,
        }).catch(() => null)
if (!response || response.status !== 200) {
            return res.status(404).json({ error: true, message: "Could not update the vault" })
        }

        res.status(200).json({ error: false, message: "Vault Updated Successfully" })


    }catch(error){
      return  res.status(500).json({error:true,message:"Internal Server Error"})
    }
})


export default router