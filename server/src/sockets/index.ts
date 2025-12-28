import { Server } from "socket.io";
import chatSocket from "./chat.socket";
import { socketAuthMiddleware } from "./socket.middleware";

export function registerSockets(io: Server) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    chatSocket(io, socket as any);
  });
}
