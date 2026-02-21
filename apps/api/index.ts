import { createServer } from "node:http";
import app from "./app";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { registerMessageSocket } from "./src/modules/messages/message.socket";

dotenv.config();
const PORT=process.env.PORT;
const httpServer=createServer(app);

export const io=new Server(httpServer,{
  cors:{
    origin:"*"
  }
});

registerMessageSocket(io);

httpServer.listen(PORT,()=>{
  console.log(`The Server is running at port no ${PORT}`);
});

