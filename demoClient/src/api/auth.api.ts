import { api } from "./client";

export async function loginApi(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function signUpApi(email: string, name: string, password: string) {
  const res = await api.post("/auth/signup", { email, name, password });
  return res.data;
}