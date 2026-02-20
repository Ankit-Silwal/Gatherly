import type { NextFunction, Request, Response } from "express";
import pool from "../config/db.js";

function normalizeParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function getServerRole(serverId: string, userId: string): Promise<string | null> {
  const result = await pool.query(
    `
    SELECT role
    FROM server_members
    WHERE server_id = $1 AND user_id = $2
    LIMIT 1
    `,
    [serverId, userId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0].role as string;
}

export async function checkServerAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const userId = req.userId;
  const serverId = normalizeParam(req.params.serverId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!serverId) {
    return res.status(400).json({ message: "serverId is required" });
  }

  const role = await getServerRole(serverId, userId);

  if (role !== "admin" && role !== "owner") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

export async function checkServerModerator(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const userId = req.userId;
  const serverId = normalizeParam(req.params.serverId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!serverId) {
    return res.status(400).json({ message: "serverId is required" });
  }

  const role = await getServerRole(serverId, userId);

  if (role !== "moderator") {
    return res.status(403).json({ message: "Moderator access required" });
  }

  next();
}

export async function checkServerAdminOrModerator(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const userId = req.userId;
  const serverId = normalizeParam(req.params.serverId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!serverId) {
    return res.status(400).json({ message: "serverId is required" });
  }

  const role = await getServerRole(serverId, userId);

  if (role !== "admin" && role !== "owner" && role !== "moderator") {
    return res.status(403).json({ message: "Admin or moderator access required" });
  }

  next();
}
