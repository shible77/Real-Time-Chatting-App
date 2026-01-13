import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roomName: string) => void;
};

export default function CreateRoomModal({ isOpen, onClose, onCreate }: Props) {
  const [roomName, setRoomName] = useState("");

  if (!isOpen) return null;

  function handleCreate() {
    if (!roomName.trim()) return;
    onCreate(roomName.trim());
    setRoomName("");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create a Chat Room</h2>

        <input
          className="border w-full p-2 mb-4 rounded"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
