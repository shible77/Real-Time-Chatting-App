"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
const jwt_1 = require("../config/jwt");
function socketAuthMiddleware(socket, next) {
    var _a;
    try {
        const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
        if (!token)
            throw new Error("NO_TOKEN");
        const payload = (0, jwt_1.verifyToken)(token);
        socket.userId = payload.userId;
        socket.data.rooms = new Map();
        next();
    }
    catch (_b) {
        next(new Error("UNAUTHORIZED"));
    }
}
