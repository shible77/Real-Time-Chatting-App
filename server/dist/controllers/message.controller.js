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
exports.getMessagesController = getMessagesController;
const messages_1 = require("../db/schema/messages");
const users_1 = require("../db/schema/users");
const drizzle_orm_1 = require("drizzle-orm");
const setup_1 = require("../db/setup");
const message_schema_1 = require("../validators/message.schema");
const validate_1 = require("../utils/validate");
function getMessagesController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { roomId } = (0, validate_1.validate)(message_schema_1.getMessagesSchema, req.params);
        //console.log("Fetching messages for roomId:", roomId);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: "UNAUTHORIZED" });
        }
        try {
            const result = yield setup_1.db
                .select({
                id: messages_1.messages.id,
                content: messages_1.messages.content,
                senderName: users_1.users.name,
            })
                .from(messages_1.messages)
                .innerJoin(users_1.users, (0, drizzle_orm_1.eq)(messages_1.messages.senderId, users_1.users.id))
                .where((0, drizzle_orm_1.eq)(messages_1.messages.roomId, roomId))
                .orderBy((0, drizzle_orm_1.asc)(messages_1.messages.createdAt));
            if (result.length < 1) {
                return res.status(200).json({ status: false, message: "No messages found" });
            }
            return res.status(200).json(result);
        }
        catch (_b) {
            throw new Error("Unable to get messages");
        }
    });
}
