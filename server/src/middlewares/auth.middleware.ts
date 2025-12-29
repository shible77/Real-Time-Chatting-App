import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
    user?: { userId: string};
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "UNAUTHORIZED" });

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as any;
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ message: "INVALID_TOKEN" });
    }
}
