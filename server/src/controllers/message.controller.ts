import { Response } from "express";
import { messages } from "../db/schema/messages";
import { users } from "../db/schema/users";
import { eq, asc } from "drizzle-orm";
import { db } from "../db/setup";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getMessagesSchema } from "../validators/message.schema";
import { validate } from "../utils/validate";

export async function getMessagesController(req: AuthRequest, res: Response) {
    const { roomId } = validate(getMessagesSchema, req.params);
    //console.log("Fetching messages for roomId:", roomId);
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: "UNAUTHORIZED" });
    }
    try {
        const result = await db
            .select({
                id: messages.id,
                content: messages.content,
                senderName: users.name,
            })
            .from(messages)
            .innerJoin(users, eq(messages.senderId, users.id))
            .where(eq(messages.roomId, roomId))
            .orderBy(asc(messages.createdAt));
        if (result.length < 1) {
            return res.status(200).json({ status: false, message: "No messages found" });
        }
        return res.status(200).json(result);
    } catch {
        throw new Error("Unable to get messages");
    }
}