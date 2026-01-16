import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()

async function connectdb(){
    try{
        const connect= await mongoose.connect(process.env.MONGO_URL,{
            maxPoolSize:10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log("Database Connected", connect.connection.host,connect.connection.name)
        
        mongoose.connection.on('error',(error)=>{
            console.error('MongoDb connection error',error)
        })

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected')
        })

         mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected')
        })

    }catch(error){
        console.error("Database connection failed:", error)
        throw error

    }
}

export default connectdb