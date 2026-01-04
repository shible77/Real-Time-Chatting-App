import { Server } from "socket.io";
import { AuthenticatedSocket } from "../socket.types";
import { ROOM_EVENTS } from "./room.events";
import { validate } from "../../utils/validate";
import { joinSocketRoomSchema, leaveSocketRoomSchema } from "../../validators/room.schema";

export function registerRoomHandlers(io: Server, socket: AuthenticatedSocket) {
  socket.on(ROOM_EVENTS.JOIN_SOCKET, (payload) => {
    const { roomId, roomCode, roomName } = validate(joinSocketRoomSchema, payload);
    socket.join(roomCode);
    socket.data.rooms.set(roomId, roomCode);
  });

  socket.on(ROOM_EVENTS.LEAVE_SOCKET, (payload) => {
    const { roomId } = validate(leaveSocketRoomSchema, payload);

    const roomCode = socket.data.rooms.get(roomId);
    if (!roomCode) return;

    socket.leave(roomCode);
    socket.data.rooms.delete(roomId);
  });
}
