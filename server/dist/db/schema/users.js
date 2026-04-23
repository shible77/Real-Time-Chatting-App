"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull(),
    passwordHash: (0, mysql_core_1.varchar)("password_hash", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    emailIdx: (0, mysql_core_1.uniqueIndex)("users_email_idx").on(table.email),
}));
