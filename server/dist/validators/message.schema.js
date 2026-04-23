"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    roomId: zod_1.z.number().int().positive(),
    username: zod_1.z.string().min(1).max(50),
    content: zod_1.z.string().min(1).max(2000),
});
exports.getMessagesSchema = zod_1.z.object({
    roomId: zod_1.z.coerce.number().int().positive(),
});
