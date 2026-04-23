"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const messageRouter = (0, express_1.Router)();
messageRouter.get("/:roomId", auth_middleware_1.authMiddleware, message_controller_1.getMessagesController);
exports.default = messageRouter;
