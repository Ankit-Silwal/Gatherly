import { createServer, joinServer, getAllServers } from "./server.service";
import type { Request, Response } from "express";

export async function handleCreateServer(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const ownerId = req.userId;

    if (!name) {
      return res.status(400).json({
        message: "Server name is required",
      });
    }

    if (!ownerId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const server = await createServer(name, description, ownerId.toString());
    return res.status(201).json({
      message: "Server created successfully",
      server,
    });
  } catch (error) {
    return res.status(500).json({
      message: `There was an error: ${error}`,
    });
  }
}

export async function handleJoinServer(req: Request, res: Response) {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({
        message: "Provide the required invite code",
      });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const server = await joinServer(inviteCode, userId.toString());
    return res.status(200).json({
      message: "Joined server successfully",
      server,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error: ${error}`,
    });
  }
}

export async function handleGetAllServers(req: Request, res: Response) {
  const userId = req.userId;

  try {
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const servers = await getAllServers(userId.toString());
    return res.status(200).json({
      servers,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
}
