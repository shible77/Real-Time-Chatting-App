import { useState } from "react";
import { loginApi } from "../api/auth.api";
import { saveToken } from "../auth/auth.store";
import { setAuthToken } from "../api/client";
import { connectSocket } from "../sockets/socket";
import { Link, useNavigate } from "react-router-dom";
import { saveUserName } from "../auth/auth.store";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login() {
    const { token, userName } = await loginApi(email, password);

    saveToken(token);
    saveUserName(userName);
    setAuthToken(token);
    connectSocket(token);

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="border p-6 w-80 rounded">
        <h2 className="text-lg font-bold mb-4">Login</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-black text-white w-full p-2"
        >
          Login
        </button>
        <p className="text-sm mt-2">Don't have an account? <Link to="/signup" className="text-blue-500 hover:cursor-pointer">click here!</Link></p>
      </div>
    </div>
  );
}
