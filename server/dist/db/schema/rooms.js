"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.rooms = (0, mysql_core_1.mysqlTable)("rooms", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    roomCode: (0, mysql_core_1.varchar)("room_code", { length: 20 }).notNull(),
    roomName: (0, mysql_core_1.varchar)("room_name", { length: 100 }).notNull(),
    createdBy: (0, mysql_core_1.varchar)("created_by", { length: 36 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    roomCodeIdx: (0, mysql_core_1.uniqueIndex)("rooms_room_code_idx").on(table.roomCode),
    createdByIdx: (0, mysql_core_1.index)("rooms_created_by_idx").on(table.createdBy),
}));
