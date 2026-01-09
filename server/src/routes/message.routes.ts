import { Router } from "express";
import { getMessagesController } from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const messageRouter = Router();

messageRouter.get("/:roomId", authMiddleware,getMessagesController);

export default messageRouter;