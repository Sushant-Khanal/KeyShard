import express from 'express'
import User from '../schema/User.js'

const router= express.Router()


router.post('/editpass', async(req,res)=>{
    try{
        const {userHash,encryptedVault,tag,iv,action}=req.body

        if(!userHash || !encryptedVault || !tag || !iv){
            return res.status(400).json({error:true,message:'Missing Fields, Please provide all the required items'})
        }

        const user= await User.findOne({
            userHash:userHash
        })

        if(!user){
            return res.status(404).json({error:true,message:"Could not find such user"})
        }
        if (!['edit', 'delete'].includes(action)) {
  return res.status(400).json({
    error: true,
    message: 'Invalid action'
  })
}

        if(action==='edit'){
            const edit= await User.updateOne(
                {userHash},
                {
                    $set:{
                        iv:iv,
                        encryptedVault:encryptedVault,
                        tag:tag
                    }
                }
            )

               if(edit.matchedCount===0){
            return res.status(404).json({error:true,message:"Could not complete the action"})
        }
        }else{
            const remove= await User.findOneAndDelete({userHash:userHash})
            if(!remove){
                return res.status(404).json({error:true,message:"Could not complete the action"})
            }
        }

            res.status(200).json({error:false,message:'Action Successful'})

    }catch(error){
        return res.status(500).json({error:true,message:"Internal Server Error"})
    }
})