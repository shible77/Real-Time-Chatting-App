import { useEffect, useState } from "react";
import { joinRoomApi, getMyRoomsApi, createRoomApi } from "../api/rooms.api";
import { getSocket } from "../sockets/socket";
import { useNavigate } from "react-router-dom";
import CreateRoomModal from "../components/CreateRoomModal";

type room = {
  roomId: number;
  roomName: string;
  roomCode: string;
};

export default function Dashboard() {
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<room[]>([]);
  const socket = getSocket();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
     getMyRoomsApi().then(setRooms)
     .catch((err) => {
        //alert("Failed to fetch rooms");
        console.error({"Failed to fetch rooms" : err});
     });
  }, []);

  useEffect(() => {
     socket.on("room:join_socket", (room) => {
      setRooms((prev) => [...prev, room]);
    });

    return () => {
      socket.off("room:join_socket");
    };
  }, [socket]);

  async function joinRoom() {
    try {
      await joinRoomApi(roomCode);
      setRoomCode("");
    } catch {
      alert("Failed to join room");
    }
  }
  async function handleCreateRoom(roomName: string) {
    try {
      await createRoomApi(roomName);
      alert("Room created successfully!");
      // later you will auto-refresh room list via socket
    } catch {
      alert("Room creation failed");
    }
  }

  return (
    <div className="min-h-full justify-center items-center">
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
        <h1 className="text-xl font-bold mb-4">Join a Room</h1>

        <div className="flex gap-2 mb-6">
          <input
            className="border p-2"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom} className="bg-green-600 text-white px-4">
            Join
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Create Room
          </button>
        </div>

        <h2 className="font-semibold mb-2">My Rooms</h2>

        {rooms.map((room) => (
          <div
            key={room.roomCode}
            onClick={() => navigate(`/rooms`, { state: { roomId: room.roomId, roomCode: room.roomCode } })}
            className="border p-3 mb-2 cursor-pointer hover:bg-gray-100"
          >
            {room.roomName}
          </div>
        ))}
        <CreateRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateRoom}
        />
      </div>
    </div>
  );
}
