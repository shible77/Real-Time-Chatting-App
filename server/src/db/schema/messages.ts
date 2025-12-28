import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const messages = mysqlTable(
  "messages",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    roomId: varchar("room_id", { length: 36 }).notNull(),
    senderId: varchar("sender_id", { length: 36 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    roomIdx: index("messages_room_idx").on(table.roomId),
    senderIdx: index("messages_sender_idx").on(table.senderId),
    roomTimeIdx: index("messages_room_time_idx").on(
      table.roomId,
      table.createdAt
    ),
  })
);
