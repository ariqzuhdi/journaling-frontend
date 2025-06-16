// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { storage } from "../storage"; // tempat ambil user/session

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies.session_id;
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const user = await storage.getUserById(session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Inject user ke request
    (req as any).user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
