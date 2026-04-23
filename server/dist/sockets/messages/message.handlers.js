"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMessageHandlers = registerMessageHandlers;
const message_events_1 = require("./message.events");
const message_service_1 = require("../../services/message.service");
const validate_1 = require("../../utils/validate");
const message_schema_1 = require("../../validators/message.schema");
function registerMessageHandlers(io, socket) {
    socket.on(message_events_1.MESSAGE_EVENTS.SEND, (payload) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { roomId, content, username } = (0, validate_1.validate)(message_schema_1.sendMessageSchema, payload);
            const roomCode = socket.data.rooms.get(roomId);
            if (!roomCode)
                throw new Error();
            const messageId = yield (0, message_service_1.sendMessage)(roomId, socket.userId, content);
            io.to(roomCode).emit(message_events_1.MESSAGE_EVENTS.RECEIVE, {
                senderName: username,
                content,
                id: messageId
            });
        }
        catch (_a) {
            socket.emit("error", { message: "MESSAGE_FORBIDDEN" });
        }
    }));
}
