import { Server } from "socket.io";
import { AuthenticatedSocket } from "../socket.types";
import { MESSAGE_EVENTS } from "./message.events";
import { sendMessage } from "../../services/message.service";
import { validate } from "../../utils/validate";
import { sendMessageSchema } from "../../validators/message.schema";

export function registerMessageHandlers(io: Server, socket: AuthenticatedSocket) {
  socket.on(MESSAGE_EVENTS.SEND, async (payload) => {
    try {
      const { roomId, content } = validate(sendMessageSchema, payload);
      const roomCode = socket.data.rooms.get(roomId);
      if (!roomCode) throw new Error();

      await sendMessage(roomId, socket.userId, content);

      io.to(roomCode).emit(MESSAGE_EVENTS.RECEIVE, {
        senderId: socket.userId,
        content,
        createdAt: new Date(),
      });
    } catch {
      socket.emit("error", { message: "MESSAGE_FORBIDDEN" });
    }
  });
}
