import { createServer } from "node:http";
import app from "./app";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { registerMessageSocket } from "./src/modules/messages/message.socket";
import cookie from "cookie";
import { getUserFromSession } from "./src/utils/session.utils";
import logger from "./src/utils/logger";


dotenv.config();
const PORT=process.env.PORT;
const httpServer=createServer(app);

export const io=new Server(httpServer,{
  cors:{
    origin:"*"
  }
});
io.use(async (socket,next)=>{
  try{
    const rawCookie=socket.handshake.headers.cookie;
    if(!rawCookie){
      return next (new Error("Unauthorized"))
    }

    const parsed=cookie.parse(rawCookie);
    const sessionId=parsed.sessionId;
    if(!sessionId){
      return next(new Error("unauthorized still "))
    }
    const userId=await getUserFromSession(sessionId)
    if(!userId){
      return next(new Error("Unauthorized"));
    }
    socket.data.userId=userId;
    next();
  }catch(error:any){
    next(new Error(error));
  }
})
registerMessageSocket(io);

httpServer.listen(PORT,()=>{
  logger.info("Server Started ",{
    port:PORT
  });
});

