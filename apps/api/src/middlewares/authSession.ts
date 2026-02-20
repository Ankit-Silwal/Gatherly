import type { NextFunction, Request, Response } from "express";
import REDIS_CLIENT from "../config/redis.js";

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const sessionId = req.cookies?.sessionId as string | undefined;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: session not found",
    });
  }

  const sessionKey = `session:${sessionId}`;
  const rawSession = await REDIS_CLIENT.get(sessionKey);

  if (!rawSession) {
    res.clearCookie("sessionId");
    return res.status(401).json({
      success: false,
      message: "Unauthorized: session expired",
    });
  }

  const sessionData = JSON.parse(rawSession) as { userId?: string };

  if (!sessionData.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid session",
    });
  }

  req.userId = sessionData.userId;
  next();
}
