import mongoose, { Mongoose, Schema } from 'mongoose'

const UserSchema= new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
     createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('User',UserSchema)