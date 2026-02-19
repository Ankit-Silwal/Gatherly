import { createServer } from "node:http";
import app from "./app";
import dotenv from "dotenv";
dotenv.config();
const PORT=process.env.PORT;
const httpServer=createServer(app);

httpServer.listen(PORT,()=>{
  console.log(`The Server is running at port no ${PORT}`);
});

