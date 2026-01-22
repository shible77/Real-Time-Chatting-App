import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { db } from "../db/setup";
import { rooms } from "../db/schema/rooms";
import { roomMembers } from "../db/schema/roomMembers";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { validate } from "../utils/validate";
import { joinRoomSchema, leaveRoomSchema, createRoomSchema, getRoomInfoSchema } from "../validators/room.schema";
import { getIO } from "../sockets/socket.instance";
import { ROOM_EVENTS } from "../sockets/rooms/room.events";
import { users } from "../db/schema/users";

export async function createRoom(req: AuthRequest, res: Response) {
  const io = getIO();
  const roomCode = uuid().slice(0, 8);
  const { roomName } = validate(createRoomSchema, req.body);
  const [result] = await db
    .insert(rooms)
    .values({ roomCode, roomName, createdBy: req.user!.userId });

  await db.insert(roomMembers).values({
    roomId: result.insertId,
    userId: req.user!.userId,
    role: "ADMIN",
  });
  io.to(`user:${req.user!.userId}`).emit(ROOM_EVENTS.JOIN_SOCKET, {
    roomId: result.insertId,
    roomName,
    roomCode
  });
  res.status(201).json({ roomCode });
}

export async function joinRoomByCode(req: AuthRequest, res: Response) {
  const { roomCode } = validate(joinRoomSchema, req.body);
  const userId = req.user!.userId;

  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomCode, roomCode))
    .limit(1)
    .then((r) => r[0]);

  if (!room) {
    return res.status(404).json({ message: "ROOM_NOT_FOUND" });
  }

  const existing = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, room.id), eq(roomMembers.userId, userId)))
    .limit(1);

  if (existing.length) {
    return res.status(409).json({ message: "ALREADY_JOINED" });
  }

  await db.insert(roomMembers).values({
    roomId: room.id,
    userId,
    role: "MEMBER",
  });
  const io = getIO();
  io.to(`user:${userId}`).emit(ROOM_EVENTS.JOIN_SOCKET, {
    roomId: room.id,
    roomName: room.roomName
  });

  return res.status(200).json({
    message: "ROOM_JOINED",
    roomId: room.id,
    roomCode: room.roomCode,
  });
}

export async function getMyRooms(req: AuthRequest, res: Response) {
  const roomList = await db
    .select({ roomId: roomMembers.roomId, roomName: rooms.roomName, roomCode: rooms.roomCode })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
    .where(eq(roomMembers.userId, req.user!.userId));

  res.status(200).json({ success: true, roomList });
}

export async function leaveRoom(req: AuthRequest, res: Response) {
  const { roomId } = validate(leaveRoomSchema, req.params);

  await db.delete(roomMembers).where(eq(roomMembers.roomId, Number(roomId)));

  res.json({ message: "LEFT_ROOM" });
}

export async function getRoomInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { roomId } = validate(getRoomInfoSchema, req.params);
    const room = await db
      .select({id: rooms.id, name: rooms.roomName, code: rooms.roomCode, createdBy: users.name, createdAt: rooms.createdAt})
      .from(rooms)
      .innerJoin(users, eq(rooms.createdBy, users.id))
      .where(eq(rooms.id, Number(roomId)))
      .limit(1)
      .then((r) => r[0]);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    return res.status(200).json({ success: true, room });
  } catch (err) {
    next(err);
  }
}
