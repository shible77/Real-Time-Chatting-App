import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { db } from "../db/setup";
import { rooms } from "../db/schema/rooms";
import { roomMembers } from "../db/schema/roomMembers";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function createRoom(req: AuthRequest, res: Response) {
  const roomCode = uuid().slice(0, 8);

  const [result] = await db.insert(rooms).values({ roomCode, createdBy: req.user!.userId });

  await db.insert(roomMembers).values({
    roomId: result.insertId,
    userId: req.user!.userId,
  });

  res.status(201).json({ roomCode });
}

export async function getMyRooms(req: AuthRequest, res: Response) {
  const rooms = await db
    .select()
    .from(roomMembers)
    .where(eq(roomMembers.userId, req.user!.userId));

  res.json(rooms);
}

export async function leaveRoom(req: AuthRequest, res: Response) {
  const { roomId } = req.params;

  await db
    .delete(roomMembers)
    .where(eq(roomMembers.roomId, Number(roomId)));

  res.json({ message: "LEFT_ROOM" });
}
