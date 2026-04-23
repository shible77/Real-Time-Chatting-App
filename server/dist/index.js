"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const sockets_1 = require("./sockets");
const socket_instance_1 = require("./sockets/socket.instance");
const httpServer = (0, http_1.createServer)(app_1.app);
const io = (0, socket_instance_1.initSocket)(httpServer);
(0, sockets_1.registerSockets)(io);
httpServer.listen(env_1.env.PORT, () => {
    console.log(`Server is running on http://localhost:${env_1.env.PORT}`);
});
