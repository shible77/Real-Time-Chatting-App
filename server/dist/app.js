"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: "http://localhost:5173/",
    credentials: true
}));
exports.app.use(express_1.default.json());
exports.app.use(error_middleware_1.errorHandler);
exports.app.use("/api/auth", auth_routes_1.default);
exports.app.use("/api/rooms", room_routes_1.default);
exports.app.use("/api/messages", message_routes_1.default);
exports.app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});
