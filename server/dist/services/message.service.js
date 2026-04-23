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
exports.sendMessage = sendMessage;
const setup_1 = require("../db/setup");
const messages_1 = require("../db/schema/messages");
const roomMembers_1 = require("../db/schema/roomMembers");
const drizzle_orm_1 = require("drizzle-orm");
function sendMessage(roomId, senderId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const member = yield setup_1.db
            .select()
            .from(roomMembers_1.roomMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.roomId, roomId), (0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.userId, senderId)))
            .limit(1);
        if (!member.length)
            throw new Error("FORBIDDEN");
        const [result] = yield setup_1.db.insert(messages_1.messages).values({
            roomId,
            senderId,
            content,
        }).$returningId();
        return result.id;
    });
}
