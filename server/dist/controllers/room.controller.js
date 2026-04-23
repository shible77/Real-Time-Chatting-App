"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.joinRoomByCode = joinRoomByCode;
exports.getMyRooms = getMyRooms;
exports.leaveRoom = leaveRoom;
exports.getRoomInfo = getRoomInfo;
const setup_1 = require("../db/setup");
const rooms_1 = require("../db/schema/rooms");
const roomMembers_1 = require("../db/schema/roomMembers");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const validate_1 = require("../utils/validate");
const room_schema_1 = require("../validators/room.schema");
const socket_instance_1 = require("../sockets/socket.instance");
const room_events_1 = require("../sockets/rooms/room.events");
const users_1 = require("../db/schema/users");
function createRoom(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const io = (0, socket_instance_1.getIO)();
            const roomCode = (0, uuid_1.v4)().slice(0, 8);
            const { roomName } = (0, validate_1.validate)(room_schema_1.createRoomSchema, req.body);
            const [result] = yield setup_1.db
                .insert(rooms_1.rooms)
                .values({ roomCode, roomName, createdBy: req.user.userId });
            yield setup_1.db.insert(roomMembers_1.roomMembers).values({
                roomId: result.insertId,
                userId: req.user.userId,
                role: "ADMIN",
            });
            io.to(`user:${req.user.userId}`).emit(room_events_1.ROOM_EVENTS.JOIN_SOCKET, {
                roomId: result.insertId,
                roomName,
                roomCode
            });
            res.status(201).json({ roomCode });
        }
        catch (err) {
            throw err;
        }
    });
}
function joinRoomByCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { roomCode } = (0, validate_1.validate)(room_schema_1.joinRoomSchema, req.body);
            const userId = req.user.userId;
            const room = yield setup_1.db
                .select()
                .from(rooms_1.rooms)
                .where((0, drizzle_orm_1.eq)(rooms_1.rooms.roomCode, roomCode))
                .limit(1)
                .then((r) => r[0]);
            if (!room) {
                return res.status(404).json({ message: "ROOM_NOT_FOUND" });
            }
            const existing = yield setup_1.db
                .select()
                .from(roomMembers_1.roomMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.roomId, room.id), (0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.userId, userId)))
                .limit(1);
            if (existing.length) {
                return res.status(409).json({ message: "ALREADY_JOINED" });
            }
            yield setup_1.db.insert(roomMembers_1.roomMembers).values({
                roomId: room.id,
                userId,
                role: "MEMBER",
            });
            const io = (0, socket_instance_1.getIO)();
            io.to(`user:${userId}`).emit(room_events_1.ROOM_EVENTS.JOIN_SOCKET, {
                roomId: room.id,
                roomName: room.roomName
            });
            return res.status(200).json({
                message: "ROOM_JOINED",
                roomId: room.id,
                roomCode: room.roomCode,
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function getMyRooms(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const roomList = yield setup_1.db
                .select({ roomId: roomMembers_1.roomMembers.roomId, roomName: rooms_1.rooms.roomName, roomCode: rooms_1.rooms.roomCode })
                .from(roomMembers_1.roomMembers)
                .innerJoin(rooms_1.rooms, (0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.roomId, rooms_1.rooms.id))
                .where((0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.userId, req.user.userId));
            res.status(200).json({ success: true, roomList });
        }
        catch (err) {
            throw err;
        }
    });
}
function leaveRoom(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { roomId } = (0, validate_1.validate)(room_schema_1.leaveRoomSchema, req.params);
            const userId = req.user.userId;
            const result = yield setup_1.db.delete(roomMembers_1.roomMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.roomId, Number(roomId)), (0, drizzle_orm_1.eq)(roomMembers_1.roomMembers.userId, userId)));
            if (!result[0].affectedRows) {
                return res.status(404).json({ success: false, message: "ROOM_NOT_FOUND" });
            }
            res.status(200).json({ success: true, message: "LEFT_ROOM" });
        }
        catch (err) {
            throw err;
        }
    });
}
function getRoomInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { roomId } = (0, validate_1.validate)(room_schema_1.getRoomInfoSchema, req.params);
            const room = yield setup_1.db
                .select({ id: rooms_1.rooms.id, name: rooms_1.rooms.roomName, code: rooms_1.rooms.roomCode, createdBy: users_1.users.name, createdAt: rooms_1.rooms.createdAt })
                .from(rooms_1.rooms)
                .innerJoin(users_1.users, (0, drizzle_orm_1.eq)(rooms_1.rooms.createdBy, users_1.users.id))
                .where((0, drizzle_orm_1.eq)(rooms_1.rooms.id, Number(roomId)))
                .limit(1)
                .then((r) => r[0]);
            if (!room) {
                return res.status(404).json({ success: false, message: "Room not found" });
            }
            return res.status(200).json({ success: true, room });
        }
        catch (err) {
            throw err;
        }
    });
}
