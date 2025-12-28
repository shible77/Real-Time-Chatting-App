import { db } from "../db/setup";
import { messages } from "../db/schema/messages";
import { roomMembers } from "../db/schema/roomMembers";
import { eq, and } from "drizzle-orm";

export async function sendMessage(roomId: string, senderId: string, content: string) {
  const member = await db
    .select()
    .from(roomMembers)
    .where(
      and(
        eq(roomMembers.roomId, roomId),
        eq(roomMembers.userId, senderId)
      )
    )
    .limit(1);

  if (!member.length) throw new Error("FORBIDDEN");

  await db.insert(messages).values({
    roomId,
    senderId,
    content,
  });
}
