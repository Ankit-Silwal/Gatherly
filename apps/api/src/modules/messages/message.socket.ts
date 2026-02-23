import { Server,Socket } from "socket.io";
import { createMessage, deleteMessage, editMessage, markChannelRead } from "./message.services";
import REDIS_CLIENT from "../../config/redis";
import logger from "../../utils/logger";
const userSocketMap=new Map<string,Set<string>>();
export function registerMessageSocket(io:Server){
  io.on("connection",async (socket:Socket)=>{
    logger.info("Socket connected", {
      userId: socket.data.userId,
      socketId: socket.id
    });
    const userId=socket.data.userId;
    if(typeof userId!=="string"){
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

    socket.on("send_message",async (data:{channelId:string,content:string})=>{
      try{
        const key = `rate:${userId}`;
        const count = await REDIS_CLIENT.incr(key);
        if (count === 1)
        {
          await REDIS_CLIENT.expire(key, 5);
        }
        if (count > 10)
        {
          socket.emit("error_message", "Rate limit exceeded");
          return;
        }
        const message=await createMessage(
          data.channelId,
          data.content,
          userId
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
    socket.on("edit_message",async (data:{messageId:string,content:string})=>{
      try{
        const updated=await editMessage(
          data.messageId,
          data.content,
          userId
        )
        io.to(updated.channel_id).emit("message_updated",updated);
      }catch{
        socket.emit("error_message","Edit failed")
      }
    })

    socket.on("delete_message",async (data:{messageId:string})=>{
      try{
        const deleted=await deleteMessage(
          data.messageId,
          userId
        )
        io.to(deleted.channel_id).emit("message_deleted",deleted.messageId);
      }catch{
        socket.emit("error_message","Delete failed")
      }
    })
    socket.on("mark_read",async (data:{channelId:string,messageId:string})=>{
      await markChannelRead(
        data.channelId,
        data.messageId,
        userId
      )
    })

    socket.on("disconnect",async()=>{
      logger.info("Socket disconnected", {
        userId: socket.data.userId
      });
      const sockets=userSocketMap.get(userId);
      if(!sockets){
        return;
      }
      sockets.delete(socket.id);
      if(sockets.size===0){
        userSocketMap.delete(userId);
        await REDIS_CLIENT.sRem("online-users",userId);
        socket.broadcast.emit("user_offline",userId);
      }
    })

  })
}