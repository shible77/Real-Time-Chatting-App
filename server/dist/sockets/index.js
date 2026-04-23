"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSockets = registerSockets;
const socket_auth_1 = require("./socket.auth");
const room_handlers_1 = require("./rooms/room.handlers");
const message_handlers_1 = require("./messages/message.handlers");
function registerSockets(io) {
    io.use(socket_auth_1.socketAuthMiddleware);
    io.on("connection", (socket) => {
        const s = socket;
        socket.join(`user:${s.userId}`);
        (0, room_handlers_1.registerRoomHandlers)(io, s);
        (0, message_handlers_1.registerMessageHandlers)(io, s);
    });
}
