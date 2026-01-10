import express from 'express'
import dotenv from 'dotenv'
import connectdb from './middleware/dbConnection.js'
import userSignupRoute from './routes/userSignUp.js'
import userLoginRoute from './routes/userLogin.js'
import passwordFetchRoute from './routes/password.js'
import testRoute from './routes/test.js'
import redis from './middleware/redis-client.js'
import challengeCreateRoute from './middleware/challenge.js'
dotenv.config()

const app= express()
app.set("trust proxy", true);
connectdb()
await redis.connect()
const PORT= process.env.PORT
app.use(express.json())
app.use('/api',userSignupRoute)
app.use('/api',userLoginRoute)
app.use('/api',passwordFetchRoute)
app.use('/api',testRoute)
app.use('/api',challengeCreateRoute)




app.listen(PORT,()=>{
    console.log(`Server starting in port ${PORT}`)
})