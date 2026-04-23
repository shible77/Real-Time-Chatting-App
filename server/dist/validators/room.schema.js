"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomInfoSchema = exports.leaveSocketRoomSchema = exports.joinSocketRoomSchema = exports.leaveRoomSchema = exports.joinRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
exports.createRoomSchema = zod_1.z.object({
    roomName: zod_1.z.string().min(1).max(100),
});
exports.joinRoomSchema = zod_1.z.object({
    roomCode: zod_1.z.string().min(4).max(32),
});
exports.leaveRoomSchema = zod_1.z.object({
    roomId: zod_1.z.coerce.number().int().positive(),
});
exports.joinSocketRoomSchema = zod_1.z.object({
    roomId: zod_1.z.number().int().positive(),
    roomCode: zod_1.z.string().min(4).max(32),
});
exports.leaveSocketRoomSchema = zod_1.z.object({
    roomId: zod_1.z.number().int().positive(),
});
exports.getRoomInfoSchema = zod_1.z.object({
    roomId: zod_1.z.coerce.number().int().positive(),
});
