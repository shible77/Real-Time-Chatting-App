import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, type JSX } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import ChatRoom from "./pages/ChatRoom";
import { getToken } from "./auth/auth.store";
import { connectSocket } from "./sockets/socket";
import { setAuthToken } from "./api/client";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const token = getToken();
  useEffect(() => {
    if (!token) return;

    setAuthToken(token);
    connectSocket(token);
  }, [token]);

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
        path="/rooms/:roomId"
        element={
          <ProtectedRoute>
            <ChatRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={token ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}
