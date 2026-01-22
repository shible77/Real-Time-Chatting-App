import { api } from "./client";

export async function createRoomApi(roomName: string) {
  const res = await api.post("/rooms/", { roomName });
  return res.data;
}

export async function joinRoomApi(roomCode: string) {
  await api.post("/rooms/join", { roomCode });
}

export async function getMyRoomsApi() {
  const res = await api.get("/rooms/my");
  if(res.status===200){
    return res.data.roomList;
  }
  throw new Error("Failed to fetch rooms");
}

export async function getRoomInfoApi(roomId: number) {
  const res = await api.get(`/rooms/${roomId}`);
  if(res.status===200){
    return res.data.room;
  }
  throw new Error("Failed to fetch room info");
}
