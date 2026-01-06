import { api } from "./client";

export async function joinRoomApi(roomCode: string) {
  await api.post("/rooms/join", { roomCode });
}

export async function getMyRoomsApi() {
  const res = await api.get("/rooms/my");
  return res.data;
}
