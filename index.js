import express from "express";
import { dbConnection } from "./db/dbconnection.js";
import router from "./route/routes.js";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors"

const app = express();
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5000;

console.log(process.env.DATABASE)
app.use('/api',router)

dbConnection()

app.get('/', (req,res)=>{
    res.send('hello world')
})

app.listen(port,()=>{
    console.log(`app listening on port: ${port}`)
})