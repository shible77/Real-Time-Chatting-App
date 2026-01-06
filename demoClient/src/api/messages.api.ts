import { api } from "./client";

export async function getMessagesApi(roomId: number) {
  const res = await api.get(`/rooms/${roomId}/messages`);
  return res.data;
}
