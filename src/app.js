import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials:true
    }
))
app.use(express.json({limit:"16kb"}))// used take data in json format
app.use(express.urlencoded({limit:"16kb"}))// to take data from url
app.use(express.static("public")) // used  to images and files in my server 
app.use(cookieParser())

//routes import 
import userRouter from './routes/user.routes.js';

app.use("/api/v1/users",userRouter)


export {app}