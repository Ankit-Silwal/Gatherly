import { Server,Socket } from "socket.io";
import { createMessage } from "./message.services";

export function registerMessageSocket(io:Server){
  io.on("connection",(socket:Socket)=>{
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

  })
}