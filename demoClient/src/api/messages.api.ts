import { api } from "./client";

export async function getMessagesApi(roomId: number) {
  const res = await api.get(`/messages/${roomId}`);
  if(res.status === 200){
    if(res.data.status === false){
      return [];
    }else{
      return res.data;
    }
  }
  throw new Error("Failed to fetch messages");
}
