import { db } from "../db/setup";
import { rooms } from "../db/schema/rooms";
import { roomMembers } from "../db/schema/roomMembers";
import { eq, and } from "drizzle-orm";

export async function getRoomIfMember(roomCode: string, userId: string) {
  const room = await db
    .select()
    .from(rooms)
    .innerJoin(
      roomMembers,
      and(
        eq(roomMembers.roomId, rooms.id),
        eq(roomMembers.userId, userId)
      )
    )
    .where(eq(rooms.roomCode, roomCode))
    .limit(1);

  if (!room.length) throw new Error("NOT_A_MEMBER");

  return room[0].rooms;
}


export async function joinRoom(roomCode: string, userId: string) {
  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomCode, roomCode))
    .limit(1);

  if (!room.length) throw new Error("ROOM_NOT_FOUND");

  const exists = await db
    .select()
    .from(roomMembers)
    .where(
      and(
        eq(roomMembers.roomId, room[0].id),
        eq(roomMembers.userId, userId)
      )
    )
    .limit(1);

  if (!exists.length) {
    await db.insert(roomMembers).values({
      roomId: room[0].id,
      userId: userId,
    });
  }

  return room[0];
}
