import { createLogger,transports,format } from "winston";
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import winston from 'winston'
import  'winston-daily-rotate-file';
dotenv.config()
const logDirectory= process.env.LOG_DIR

let dir=logDirectory?? 'logs'
if (!dir) dir=path.resolve('logs')

    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }

const logLevel= process.env.LOG_LEVEL==="development"? "debug" : "warn"

const dailyRotateFile= new winston.transports.DailyRotateFile({
    level: logLevel,
    filename: `${dir}/%DATE%-results.log`,
    datePattern:'YYYY-MM-DD',
    zippedArchive: true,
    handleExceptions: true,
    maxSize:'20m',
    maxFiles:'14d',
    format: format.combine(
        format.errors({stack:true}),
        
        format.timestamp(),
        format.json(),
   
        

    )
})

export default createLogger({
    transports:[
        new transports.Console({
            level: logLevel,
            format: format.combine (
                format.errors({stack:true}),
                format.colorize(),
                format.prettyPrint()
            )
        }),
        dailyRotateFile
    ],
    exceptionHandlers:[dailyRotateFile],
    exitOnError:false
})