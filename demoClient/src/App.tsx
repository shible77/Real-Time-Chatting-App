import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Chat from "./pages/Rooms";
import { getToken } from "./auth/auth.store";
import { setAuthToken } from "./api/client";
import { connectSocket } from "./sockets/socket";

export default function App() {
  const token = getToken();
  const [loggedIn, setLoggedIn] = useState(!!token);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      connectSocket(token);
    }
  }, [token]);

  return loggedIn ? <Chat /> : <Login onLogin={() => setLoggedIn(true)} />;
}
