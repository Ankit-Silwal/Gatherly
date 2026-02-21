import type { Request, Response } from "express";
import { getMembers, changeRole, kickMember } from "./member.service";

export async function handleGetMembers(
  req: Request,
  res: Response
)
{
  try
  {
    const rawServerId = req.params.serverId;
    const serverId = Array.isArray(rawServerId) ? rawServerId[0] : rawServerId;

    if (!serverId)
    {
      return res.status(400).json({ message: "serverId is required" });
    }

    const members = await getMembers(serverId);

    return res.status(200).json(members);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}
export async function handleChangeRole(
  req: Request,
  res: Response
)
{
  try
  {
    const rawServerId = req.params.serverId;
    const userId = req.userId;
    const serverId = Array.isArray(rawServerId) ? rawServerId[0] : rawServerId;
    const { role } = req.body;

    if (!serverId || !userId)
    {
      return res.status(400).json({ message: "serverId and userId are required" });
    }

    const requesterId = req.userId!;
    const result = await changeRole(
      serverId,
      userId,
      role,
      requesterId
    );

    return res.status(200).json(result);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}

export async function handleKickMember(
  req: Request,
  res: Response
)
{
  try
  {
    const rawServerId = req.params.serverId;
    const rawUserId = req.params.userId;
    const serverId = Array.isArray(rawServerId) ? rawServerId[0] : rawServerId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!serverId || !userId)
    {
      return res.status(400).json({ message: "serverId and userId are required" });
    }

    const requesterId = req.userId!;

    const result = await kickMember(
      serverId,
      userId,
      requesterId
    );

    return res.status(200).json(result);
  }
  catch (err: any)
  {
    return res.status(400).json({ message: err.message });
  }
}