import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createRoom, getMyRooms, leaveRoom } from "../controllers/room.controller";

const roomRouter = Router();

roomRouter.post("/", authMiddleware, createRoom);
roomRouter.get("/my", authMiddleware, getMyRooms);
roomRouter.delete("/:roomId", authMiddleware, leaveRoom);

export default roomRouter;