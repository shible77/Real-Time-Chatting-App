import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import { getRoomIfMember } from "../services/room.service";
import { sendMessage } from "../services/message.service";
import { validate } from "../utils/validate";
import { joinRoomSchema } from "../validators/room.schema";
import { sendMessageSchema } from "../validators/message.schema";

export default function chatSocket(io: Server, socket: AuthenticatedSocket) {
  socket.on("join_room", async (payload) => {
    try {
      const { roomCode } = validate(joinRoomSchema, payload);
      const room = await getRoomIfMember(roomCode, socket.userId);
      socket.join(room.roomCode);
      socket.data.rooms.set(room.id, room.roomCode);

      socket.emit("joined_room", room);
    } catch {
      socket.emit("error", { message: "JOIN_FAILED" });
    }
  });

  socket.on("send_message", async (payload) => {
    try {
      const { roomId, content } = validate(sendMessageSchema, payload);
      const roomCode = socket.data.rooms.get(roomId);
      if (!roomCode) throw new Error();

      await sendMessage(roomId, socket.userId, content);

      io.to(roomCode).emit("receive_message", {
        senderId: socket.userId,
        content,
        createdAt: new Date(),
      });
    } catch {
      socket.emit("error", { message: "MESSAGE_FORBIDDEN" });
    }
  });
}
