import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { setUpRoutes } from "./routes";
import { connectDB } from "./src/config/db";
import { initRedis } from "./src/config/redis";
import logger from "./src/utils/logger";

const app=express();
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: ["http://localhost:3000"]
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

app.use((err:any, req:Request, res:Response, next:NextFunction) =>
{
  logger.error("Unhandled error", {
    path: req.path,
    method: req.method,
    error: err.message
  });

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

export default app;