import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { env } from "./config/env";
import { registerSockets } from "./sockets";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

registerSockets(io);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
