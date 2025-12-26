import express from 'express'
import User from '../schema/User.js'

const router= express.Router();


router.post('/passFetch',async(req,res)=>{
    try{
        const {userHash}= req.body

        if(!userHash){
          return  res.status(400).json({error:true,message:"Failed to fetch the vault"})
        }

        const user= await User.findOne({
            userHash:userHash
        })

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




router.post('/newPassword',async(req,res)=>{

    console.log("newpassroutehit")
    try{
        const {userHash,encryptedVault,tag,iv}= req.body

        if(!userHash && !encryptedVault && !tag && !iv){
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


            console.log("user", user)
        if(user.matchedCount===0){
            return res.status(404).json({error:true,message:"Could not find the vault"})
        }

        res.status(200).json({error:false,message:"Vault Updated Sucessfully"})


    }catch(error){
      return  res.status(500).json({error:true,message:"Internal Server Error"})
    }
})


export default router