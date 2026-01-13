import { z } from "zod";

export const sendMessageSchema = z.object({
  roomId: z.number().int().positive(),
  username: z.string().min(1).max(50),
  content: z.string().min(1).max(2000),
});

export const getMessagesSchema = z.object({
  roomId: z.coerce.number().int().positive(),
})