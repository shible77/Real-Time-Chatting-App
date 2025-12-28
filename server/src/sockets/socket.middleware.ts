// src/sockets/socket.middleware.ts
import { Socket } from "socket.io";
import { verifyToken } from "../config/jwt";
import { AuthenticatedSocket } from "../types/socket";

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error("NO_TOKEN");

    const payload = verifyToken(token);

    (socket as AuthenticatedSocket).userId = payload.userId;
    (socket as AuthenticatedSocket).role = payload.role;

    socket.data.rooms = new Map<number, string>();

    next();
  } catch {
    next(new Error("UNAUTHORIZED"));
  }
}
