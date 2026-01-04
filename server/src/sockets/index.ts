import { Server } from "socket.io";
import { socketAuthMiddleware } from "./socket.auth";
import { AuthenticatedSocket } from "./socket.types";
import { registerRoomHandlers } from "./rooms/room.handlers";
import { registerMessageHandlers } from "./messages/message.handlers";

export function registerSockets(io: Server) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const s = socket as AuthenticatedSocket;

    socket.join(`user:${s.userId}`);

    registerRoomHandlers(io, s);
    registerMessageHandlers(io, s);
  });
}
