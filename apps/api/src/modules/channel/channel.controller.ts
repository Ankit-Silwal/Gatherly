import { createChannel } from "./channel.service";
import type { Request, Response } from "express";
export async function handleCreateChannel(req:Request,res:Response){
  try{
    const userId=req.userId;
    const rawServerId=req.params.serverId;
    const serverId=Array.isArray(rawServerId)?rawServerId[0]:rawServerId;
    const {name,type="text"}=req.body;
    if(!name){
      return res.status(400).json({
        message:"Provide the name please"
      })
    }
    if(!userId){
      return res.status(400).json({
        message:"You arent the part of this server"
      })
    }
    if(!serverId){
      return res.status(400).json({
        message:"Pass on the server Id"
      })
    }
    await createChannel(serverId,name,type);
    return res.status(200).json({
      message:"The channel was created succesfully"
    })
  }catch(error){
    return res.status(500).json({
      error
    })
  }
}