import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config();
const goDb = axios.create({
  baseURL: process.env.GO_DB_BASE_URL,
  timeout: parseInt(process.env.GO_DB_TIMEOUT || '5000'),
})

export default goDb
