import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { setUpRoutes } from "./routes";
import { connectDB } from "./src/config/db";
import { initRedis } from "./src/config/redis";

const app=express();
app.use(express.json());
app.use(cors({
  credentials:true,
  origin:"*"
}))

app.use(cookieParser());

connectDB();
initRedis();
setUpRoutes(app);
app.get('/health',(req:Request,res:Response)=>{
  res.json({
    success:true,
    message:"I am healthy"
  });
})

export default app;