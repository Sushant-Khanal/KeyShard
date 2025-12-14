import mongoose from "mongoose";
import User from "./User.js";


const VaultSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true

    },

    encryptedVault:{
        type:String,
        required:true
    },

     updatedAt: {
    type: Date,
    default: Date.now,
  },

})

export default mongoose.model('Vault',VaultSchema)
