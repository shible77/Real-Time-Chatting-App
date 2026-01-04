import { z } from "zod";

export const joinRoomSchema = z.object({
    roomCode: z.string().min(4).max(32),
})

export const leaveRoomSchema = z.object({
    roomId: z.coerce.number().int().positive(),
});

export const joinSocketRoomSchema = z.object({
    roomId: z.number().int().positive(),
    roomCode: z.string().min(4).max(32),
    roomName: z.string().min(1).max(100),
});

export const leaveSocketRoomSchema = z.object({
  roomId: z.number().int().positive(),
});
