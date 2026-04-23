"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomMembers = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.roomMembers = (0, mysql_core_1.mysqlTable)("room_members", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    roomId: (0, mysql_core_1.int)("room_id").notNull(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 }).notNull(),
    role: (0, mysql_core_1.varchar)("role", { length: 20 }).default("MEMBER").notNull(),
    joinedAt: (0, mysql_core_1.timestamp)("joined_at").defaultNow().notNull(),
}, (table) => ({
    roomUserUniqueIdx: (0, mysql_core_1.uniqueIndex)("room_user_unique_idx").on(table.roomId, table.userId),
    roomIdx: (0, mysql_core_1.index)("room_members_room_idx").on(table.roomId),
    userIdx: (0, mysql_core_1.index)("room_members_user_idx").on(table.userId),
}));
