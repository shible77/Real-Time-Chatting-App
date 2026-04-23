"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.messages = (0, mysql_core_1.mysqlTable)("messages", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    roomId: (0, mysql_core_1.int)("room_id").notNull(),
    senderId: (0, mysql_core_1.varchar)("sender_id", { length: 36 }).notNull(),
    content: (0, mysql_core_1.text)("content").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    roomIdx: (0, mysql_core_1.index)("messages_room_idx").on(table.roomId),
    senderIdx: (0, mysql_core_1.index)("messages_sender_idx").on(table.senderId),
    roomTimeIdx: (0, mysql_core_1.index)("messages_room_time_idx").on(table.roomId, table.createdAt),
}));
