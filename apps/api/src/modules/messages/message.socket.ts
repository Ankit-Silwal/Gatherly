import { Server,Socket } from "socket.io";
import { createMessage } from "./message.services";
import REDIS_CLIENT from "../../config/redis";
const userSocketMap=new Map<string,Set<string>>();
export function registerMessageSocket(io:Server){
  io.on("connection",async (socket:Socket)=>{
    const userId=socket.data.userId;
    if(!userId){
      socket.disconnect();
      return;
    }
    if(!userSocketMap.has(userId)){
      userSocketMap.set(userId,new Set());
      await REDIS_CLIENT.sAdd("online-users",userId);
      socket.broadcast.emit("user-online",userId);
    }
    userSocketMap.get(userId)!.add(socket.id);
    socket.on("join_channel",(channelId:string)=>{
      socket.join(channelId)
    });

    socket.on("leave_channel",(channelId:string)=>{
      socket.leave(channelId);
    })

    socket.on("send_message",async (data:{channelId:string,content:string,userId:string})=>{
      try{
        const message=await createMessage(
          data.channelId,
          data.content,
          data.userId
        );
        io.to(data.channelId).emit("receive_message",message);
      }catch(err){
        socket.emit("error_message",`Message-failed ${err}`)
      }
    })

    socket.on("start_typing",(channelId:string)=>{
      socket.to(channelId).emit("user_typing",{userId});
    })

    socket.on("stop_typing",(channeId:string)=>{
      socket.to(channeId).emit("user_stop_typing",{userId});
    })

    socket.on("disconnect",async()=>{
      const sockets=userSocketMap.get(userId);
      if(!sockets){
        return;
      }
      sockets.delete(socket.id);
      if(sockets.size===0){
        userSocketMap.delete(socket.id);
        await REDIS_CLIENT.sRem("online-users",userId);
        socket.broadcast.emit("user_offline",userId);
      }
    })

  })
}