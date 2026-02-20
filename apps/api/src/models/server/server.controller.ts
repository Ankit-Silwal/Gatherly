import { createServer } from "./server.service";
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

