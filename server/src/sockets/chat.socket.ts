import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import { joinRoom } from "../services/room.service";
import { sendMessage } from "../services/message.service";

export default function chatSocket(io: Server, socket: AuthenticatedSocket) {
  socket.on("join_room", async ({ roomCode }) => {
    try {
      const room = await joinRoom(roomCode, socket.userId);

      socket.join(room.roomCode);
      socket.data.rooms.set(room.id, room.roomCode);

      socket.emit("joined_room", room);
    } catch {
      socket.emit("error", { message: "JOIN_FAILED" });
    }
  });

  socket.on("send_message", async ({ roomId, content }) => {
    try {
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
