import {
  createServer,
  joinServer,
  getAllServers,
  getServerDetails,
  deleteServer,
} from "./server.service";
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

export async function handleServerDetails(req: Request, res: Response) {
  try {
    const rawServerId = req.params.serverId;
    const serverId = Array.isArray(rawServerId) ? rawServerId[0] : rawServerId;
    if (!serverId) {
      return res.status(400).json({
        message: "Server id is required",
      });
    }

    const details = await getServerDetails(serverId);
    const memberCount = Number(details.rows[0]?.member_count ?? 0);

    if (memberCount === 0) {
      return res.status(404).json({
        message: "The server doesn't exist",
      });
    }

    return res.status(200).json({
      members: memberCount,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
}

export async function handleDeleteServer(req: Request, res: Response) {
  try {
    const rawSessionId = req.params.sessionId;
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
    const userId = req.userId;
    if (!sessionId) {
      return res.status(400).json({
        message: "Session id is required",
      });
    }
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const result = await deleteServer(sessionId, userId.toString());
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Server not found") {
      return res.status(404).json({
        message,
      });
    }

    if (message === "Unauthorized") {
      return res.status(403).json({
        message,
      });
    }

    return res.status(500).json({
      message: `Error: ${message}`,
    });
  }
}
