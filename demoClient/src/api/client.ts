import axios from "axios";

export const api = axios.create({
  baseURL: "https://real-time-chatting-app-lmo8.onrender.com/api",
});

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
