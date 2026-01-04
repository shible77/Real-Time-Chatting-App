import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  int,
} from "drizzle-orm/mysql-core";

export const roomMembers = mysqlTable(
  "room_members",
  {
    id: int("id").primaryKey().autoincrement(),
    roomId: int("room_id").notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    role: varchar("role", { length: 20 }).default("MEMBER").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    roomUserUniqueIdx: uniqueIndex("room_user_unique_idx").on(
      table.roomId,
      table.userId
    ),
    roomIdx: index("room_members_room_idx").on(table.roomId),
    userIdx: index("room_members_user_idx").on(table.userId),
  })
);
