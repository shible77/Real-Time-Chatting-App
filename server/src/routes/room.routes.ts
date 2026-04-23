import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createRoom, getMyRooms, leaveRoom, getRoomInfo, joinRoomByCode } from "../controllers/room.controller";

const roomRouter = Router();

roomRouter.post("/", authMiddleware, createRoom);
roomRouter.post("/join", authMiddleware, joinRoomByCode);
roomRouter.get("/my", authMiddleware, getMyRooms);
roomRouter.delete("/:roomId", authMiddleware, leaveRoom);
roomRouter.get("/:roomId", authMiddleware, getRoomInfo);

export default roomRouter;