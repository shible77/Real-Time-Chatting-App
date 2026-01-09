import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { registerSockets } from "./sockets";
import { initSocket } from "./sockets/socket.instance";

const httpServer = createServer(app);

const io = initSocket(httpServer);
registerSockets(io);

httpServer.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
