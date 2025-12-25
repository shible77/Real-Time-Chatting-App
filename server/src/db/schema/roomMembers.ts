import {
  mysqlTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const roomMembers = mysqlTable(
  "room_members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    roomId: varchar("room_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    role: varchar("role", { length: 20 }).default("member").notNull(),
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
