import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMessagesApi } from "../api/messages.api";
import { getSocket } from "../sockets/socket";
import { getUserName } from "../auth/auth.store";
import { getRoomInfoApi } from "../api/rooms.api";

type message = {
  senderName: string,
  content: string,
  id: number
}

type roomInfo = {
  id: number,
  code: string,
  name: string,
  createdBy: string, 
  createdAt: string
}
type RoomState = {
  roomId: number;
  roomCode: string;
};

export default function ChatRoom() {
  const location = useLocation();
  const { roomId, roomCode } = location.state as RoomState
  //console.log(roomId)
  const socket = getSocket();
  const [messages, setMessages] = useState<message[]>([]);
  const [roomInfo, setRoomInfo] = useState<roomInfo | null>(null);
  const [text, setText] = useState("");
  const username = getUserName();

  useEffect(() => {
    getRoomInfoApi(Number(roomId))
      .then((data) => {
        setRoomInfo(data);
      })
      .catch((err) => {
        console.error("Failed to fetch room info:", err);
        // Consider setting an error state to display to the user
      });
    
    getMessagesApi(Number(roomId))
      .then(setMessages)
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
        // Consider setting an error state to display to the user
      });
    socket.emit("room:join_socket", {
      roomId: Number(roomId),
      roomCode: roomCode!
    });

    socket.on("message:receive", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("room:leave_socket", {
        roomId: Number(roomId),
      });
      socket.off("message:receive");
    };
  }, [roomId, roomCode, socket]);

  function sendMessage() {
    socket.emit("message:send", {
      username,
      roomId: Number(roomId),
      content: text,
    });
    setText("");
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Chat Room: {roomInfo ? roomInfo.name : "Loading..."}</h2>
      <div className="h-80 overflow-y-auto border mb-4 p-2">
        {messages.length===0 ? "No Message" : messages.map((m, i) => (
          <div key={i}>
            <b>{m.senderName}</b>: {m.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4"
        >
          Send
        </button>
      </div>
    </div>
  );
}
