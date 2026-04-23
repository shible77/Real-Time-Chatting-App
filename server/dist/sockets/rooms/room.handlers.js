"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoomHandlers = registerRoomHandlers;
const room_events_1 = require("./room.events");
const validate_1 = require("../../utils/validate");
const room_schema_1 = require("../../validators/room.schema");
function registerRoomHandlers(io, socket) {
    socket.on(room_events_1.ROOM_EVENTS.JOIN_SOCKET, (payload) => {
        const { roomId, roomCode } = (0, validate_1.validate)(room_schema_1.joinSocketRoomSchema, payload);
        socket.join(roomCode);
        socket.data.rooms.set(roomId, roomCode);
    });
    socket.on(room_events_1.ROOM_EVENTS.LEAVE_SOCKET, (payload) => {
        const { roomId } = (0, validate_1.validate)(room_schema_1.leaveSocketRoomSchema, payload);
        const roomCode = socket.data.rooms.get(roomId);
        if (!roomCode)
            return;
        socket.leave(roomCode);
        socket.data.rooms.delete(roomId);
    });
}
