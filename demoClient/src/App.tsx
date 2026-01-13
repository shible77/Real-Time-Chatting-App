import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import ChatRoom from "./pages/ChatRoom";
import { getToken } from "./auth/auth.store";
import { connectSocket } from "./sockets/socket";
import { setAuthToken } from "./api/client";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = useState<string | null>(getToken());
  console.log("App render with token:", token);

  useEffect(() => {
    if (!token) return;

    setAuthToken(token);
    connectSocket(token);
  }, [token]);

  // Listen for token changes (after login)
  useEffect(() => {
    const handleStorage = () => {
      setToken(getToken());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

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
