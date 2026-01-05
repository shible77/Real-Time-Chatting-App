import { useEffect, useState } from "react";
import { api } from "../api/client";
import { getSocket } from "../sockets/socket";
import type { RoomPayload } from "../types/state.types";

export default function Chat() {
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<RoomPayload[]>([]);
  const socket = getSocket();

  useEffect(() => {
    socket.on("room:join_socket", (room) => {
      console.log("Joined room realtime:", room);
      setRooms((prev) => [...prev, room]);
    });
    return () => {
      socket.off("room:join_socket");
    };
  }, []);

  async function joinRoom() {
    await api.post("/rooms/join", { roomCode });
  }

     return (
    <div className="p-4">
      <div className="flex gap-2">
        <input
          className="border p-2"
          placeholder="room code"
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={joinRoom} className="bg-green-600 text-white px-4">
          Join Room
        </button>
      </div>

      <h2 className="mt-4 font-bold">My Rooms</h2>
      {rooms.map((r) => (
        <div key={r.id} className="border p-2 mt-2">
          {r.roomName}
        </div>
      ))}
    </div>
  );
}
