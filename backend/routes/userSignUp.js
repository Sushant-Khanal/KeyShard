import express from 'express'
import User from '../schema/User.js'
import mongoose from 'mongoose'
import Vault from '../schema/Vault.js'

const router = express.Router()


router.post('/signup',async (req,res)=>{
    const session= await mongoose.startSession();
    try{
        const {email, encryptedVault}= req.body

        if(!email || !encryptedVault){
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
                email:email
            }],{session})

             const vault = await Vault.create([{
             userId:user._id,
             encryptedVault: encryptedVault

             
            
        }],{session})
            await session.commitTransaction()
          res.status(201).json({error:false,message:"Created sucessfully"})
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