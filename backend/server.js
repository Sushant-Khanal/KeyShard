import express from 'express'
import dotenv from 'dotenv'
import connectdb from './middleware/dbConnection.js'
import userSignupRoute from './routes/userSignUp.js'
import userLoginRoute from './routes/userLogin.js'
import passwordFetchRoute from './routes/password.js'
dotenv.config()

const app= express()
connectdb()
const PORT= process.env.PORT
app.use(express.json())
app.use('/api',userSignupRoute)
app.use('/api',userLoginRoute)
app.use('/api',passwordFetchRoute)


app.listen(PORT,()=>{
    console.log(`Server starting in port ${PORT}`)
})