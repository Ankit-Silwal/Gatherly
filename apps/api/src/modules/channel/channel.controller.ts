import type { Request, Response } from "express";
import {
  createChannel,
  getChannels,
  renameChannel,
  deleteChannel
} from "./channel.service";

type ServerRouteParams = {
  serverId: string;
};

type ChannelRouteParams = {
  serverId: string;
  channelId: string;
};

export async function handleCreateChannel(
  req: Request<ServerRouteParams>,
  res: Response
)
{
  try
  {
    const { serverId } = req.params;
    const { name, type } = req.body;
    const userId = req.userId!;

    const channel = await createChannel(
      serverId,
      name,
      type || "text",
      userId
    );

    return res.status(201).json(channel);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}

export async function handleGetChannels(
  req: Request<ServerRouteParams>,
  res: Response
)
{
  try
  {
    const { serverId } = req.params;
    const userId = req.userId!;

    const channels = await getChannels(serverId, userId);

    return res.status(200).json(channels);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}

export async function handleRenameChannel(
  req: Request<ChannelRouteParams>,
  res: Response
)
{
  try
  {
    const { channelId } = req.params;
    const { name } = req.body;
    const userId = req.userId!;

    const result = await renameChannel(
      channelId,
      name,
      userId
    );

    return res.status(200).json(result);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}

export async function handleDeleteChannel(
  req: Request<ChannelRouteParams>,
  res: Response
)
{
  try
  {
    const { channelId } = req.params;
    const userId = req.userId!;

    const result = await deleteChannel(
      channelId,
      userId
    );

    return res.status(200).json(result);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}