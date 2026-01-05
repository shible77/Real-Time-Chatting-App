import { useState } from "react";
import { api, setAuthToken } from "../api/client";
import { saveToken } from "../auth/auth.store";
import { connectSocket } from "../sockets/socket";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data.token;

    saveToken(token);
    setAuthToken(token);
    connectSocket(token);

    onLogin();
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 border rounded w-80">
        <input
          className="border p-2 w-full mb-2"
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-black text-white p-2 w-full" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}
