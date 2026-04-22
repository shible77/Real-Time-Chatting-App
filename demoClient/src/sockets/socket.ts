import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  // If a socket already exists and is connected, reuse it.
  if (socket && socket.connected) return socket;

  // If a socket exists but is disconnected, clean it up first.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

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

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}