import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { env } from "./config/env";
import { registerSockets } from "./sockets";
import { initSocket } from "./sockets/socket.instance";

const httpServer = createServer(app);

const io = initSocket(httpServer);
registerSockets(io);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
