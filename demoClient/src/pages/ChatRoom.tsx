import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMessagesApi } from "../api/messages.api";
import { getSocket } from "../sockets/socket";
import { getUserName } from "../auth/auth.store";

type message = {
  senderName: string,
  content: string,
  id: number
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
  const [text, setText] = useState("");
  const username = getUserName();

  useEffect(() => {
    getMessagesApi(Number(roomId)).then(setMessages);

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
