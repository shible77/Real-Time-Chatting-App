import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  int,
} from "drizzle-orm/mysql-core";

export const rooms = mysqlTable(
  "rooms",
  {
    id: int("id").primaryKey().autoincrement(),
    roomCode: varchar("room_code", { length: 20 }).notNull(),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    roomCodeIdx: uniqueIndex("rooms_room_code_idx").on(table.roomCode),
    createdByIdx: index("rooms_created_by_idx").on(table.createdBy),
  })
);
