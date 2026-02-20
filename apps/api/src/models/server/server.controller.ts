import { createServer, joinServer } from "./server.service";
import type { Request,Response } from "express";

export async function handleCreateServer(req:Request,res:Response){
  try{
    const {name,description}=req.body;
    const ownerId=req.userId;
    if(!name){
      return res.status(400).json({
        message:"Server name is required"
      })
    }
    if(!ownerId){
      return res.status(400).json({
        message:"Unauthorized for this shit sir"
      })
    }
    const server=await createServer(name,description,ownerId.toString());
    return res.status(200).json({
      message:"The required server was created successfully sir"
    })
  }catch(error){
    return res.status(400).json({
      message:`There was as error :${error}`
    })
  }
}

export async function handleJoinServer(req:Request,res:Response){
  try{
    const {inviteCode}=req.body;
    if(!inviteCode){
      return res.status(400).json({
        message:"Provide the required invite Code"
      })
    }
    const userId=req.userId;
    if(!userId){
      return res.status(400).json({
        message:"You are unauthorized for this action"
      })
    }
    const server=await joinServer(inviteCode,userId.toString());
    return res.status(200).json({
      message:"Joined the required group sirrrrrr"
    })
  }catch(error){
    return res.status(400).json({
      message:`Error:${error}`
    })
  }
}