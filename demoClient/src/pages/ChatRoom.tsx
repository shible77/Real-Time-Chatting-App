import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMessagesApi } from "../api/messages.api";
import { getSocket } from "../sockets/socket";

export default function ChatRoom() {
  const { roomId } = useParams();
  const socket = getSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    getMessagesApi(Number(roomId)).then(setMessages);

    socket.emit("room:join_socket", {
      roomId: Number(roomId),
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
  }, [roomId]);

  function sendMessage() {
    socket.emit("message:send", {
      roomId: Number(roomId),
      content: text,
    });
    setText("");
  }

  return (
    <div className="p-6">
      <div className="h-80 overflow-y-auto border mb-4 p-2">
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.senderId}</b>: {m.content}
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
