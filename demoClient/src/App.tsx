import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import ChatRoom from "./pages/ChatRoom";
import { getToken} from "./auth/auth.store";
import { connectSocket, getSocket } from "./sockets/socket";
import { setAuthToken } from "./api/client";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

// Read token synchronously so it's available on the very first render.
// This prevents Dashboard (or any protected page) from mounting before
// the socket is initialized when the user refreshes.
function initializeSession(): string | null {
  const token = getToken();
  if (token) {
    setAuthToken(token);       // attach Bearer header to axios
    connectSocket(token);      // boot the socket immediately
  }
  return token;
}

export default function App() {
  // useState with an initializer runs synchronously — token is set before
  // any child renders, so getSocket() in Dashboard never throws on refresh.
  const [token, setToken] = useState<string | null>(initializeSession);

  useEffect(() => {
    // If the token changes (login / logout in another tab), re-sync.
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        const newToken = getToken();
        setToken(newToken);
        if (newToken) {
          setAuthToken(newToken);
          connectSocket(newToken);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // When the token is set after login, make sure axios + socket are in sync.
  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    // connectSocket is idempotent-ish; only create a new socket if one
    // doesn't exist yet (login flow calls it too, so guard against double).
    try {
      getSocket(); // already connected — do nothing
    } catch {
      connectSocket(token);
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login setToken={setToken} />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <ChatRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}