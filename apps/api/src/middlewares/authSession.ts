import type { NextFunction, Request, Response } from "express";
import { getUserSession } from "../utils/session.utils";

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response>
{
  const sessionId = req.cookies?.sessionId;

  if (!sessionId)
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });

  const userId = await getUserSession(sessionId);

  if (!userId)
  {
    res.clearCookie("sessionId");
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  req.userId = userId;
  next();
}