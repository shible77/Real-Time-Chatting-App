import { useEffect, useState } from "react";
import { joinRoomApi, getMyRoomsApi } from "../api/rooms.api";
import { getSocket } from "../sockets/socket";
import { useNavigate } from "react-router-dom";

type room = {
  id: number,
  roomName: string
}

export default function Dashboard() {
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<room[]>([]);
  const socket = getSocket();
  const navigate = useNavigate();

  useEffect(() => {
    getMyRoomsApi().then(setRooms);

    socket.on("room:join_socket", (room) => {
      setRooms((prev) => [...prev, room]);
    });

    return () => {
      socket.off("room:join_socket");
    };
  }, [socket]);

  async function joinRoom() {
    await joinRoomApi(roomCode);
    setRoomCode("");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Join a Room</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border p-2"
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button
          onClick={joinRoom}
          className="bg-green-600 text-white px-4"
        >
          Join
        </button>
      </div>

      <h2 className="font-semibold mb-2">My Rooms</h2>

      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => navigate(`/rooms/${room.id}`)}
          className="border p-3 mb-2 cursor-pointer hover:bg-gray-100"
        >
          {room.roomName}
        </div>
      ))}
    </div>
  );
}
