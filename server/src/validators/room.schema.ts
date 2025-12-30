import { z } from "zod";

export const joinRoomSchema = z.object({
  roomCode: z.string().min(4).max(32),
});

export const leaveRoomSchema = z.object({
  roomId: z.coerce.number().int().positive(),
});
