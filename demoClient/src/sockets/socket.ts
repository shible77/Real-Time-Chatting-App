import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  socket = io("http://localhost:5000", {
    auth: { token },
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
}
