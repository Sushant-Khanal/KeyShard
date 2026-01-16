import express from 'express'
//import User from '../schema/User.js'
//import mongoose from 'mongoose'
//import Vault from '../schema/Vault.js'
import { sha256 } from '@noble/hashes/sha2.js';
import  goDB  from '../middleware/dbConnection.js';

const router = express.Router()


router.post('/signup',async (req,res)=>{
    //const session= await mongoose.startSession();
    try{
        const {email, encryptedVault,iv,tag,userHash,salt,publicKeyBase64}= req.body
        console.log('publicKeyBase64backend:',publicKeyBase64)

        if(!email || !encryptedVault || !userHash ){
          return  res.status(400).json({
            error:true,
            message:"Vault and Email must be provided"
        })
        }


        //session.startTransaction()

        const userCheck= await goDB.get('/user/get',{
        params: { email }
        }).catch(()=>null)

        if(userCheck?.data){
           // await session.abortTransaction()
          return  res.status(409).json({error:true,message:"Email is already registered"})
        }
             
        const response= await goDB.post('/user', {
      email,
      encryptedVault,
      iv,
      tag,
      salt,
      userHash,
      publicKeyBase64
    }).catch((err) => {
      console.error('GoDB /user POST error:', err.response?.data || err.message)
      return null
    })

        

            // await session.commitTransaction()
          res.status(201).json({error:false,message:"Vault Created Sucessfully"})
        
    }catch(error){
      //  await session.abortTransaction()
        console.log(error)
        res.status(500).json({
            error: true,
            message: "Internal server error"
        })
    }
})


export default router