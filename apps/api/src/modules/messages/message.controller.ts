import type { Request, Response } from "express";
import { createMessage, getMessage } from "./message.services";

type MessageRouteParams = {
  channelId: string;
};

export async function handleCreateMessage(
  req: Request<MessageRouteParams>,
  res: Response
)
{
  try
  {
    const { channelId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;
    if (!content)
      return res.status(400).json({ message: "Content required" });
    const message = await createMessage(
      channelId,
      content,
      userId
    );

    return res.status(201).json(message);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}

export async function handleGetMessages(req:Request,res:Response){
  try{
    const {channelId}=req.params;
    const {cursor,limit}=req.query;
    const userId=req.userId;

    const messages=await getMessage(
      channelId as string,
      userId as string,
      cursor as string,
      limit?Number(limit):20
    );
    return res.status(200).json(messages)
  }catch(error:any){
    return res.status(400).json({
      error:error.message
    })
  }
}