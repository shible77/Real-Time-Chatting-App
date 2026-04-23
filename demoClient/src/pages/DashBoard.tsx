import { useEffect, useState } from "react";
import { joinRoomApi, getMyRoomsApi, createRoomApi } from "../api/rooms.api";
import { getSocket } from "../sockets/socket";
import { useNavigate } from "react-router-dom";
import { getUserName } from "../auth/auth.store";
import { motion, AnimatePresence } from "framer-motion";

type Room = {
  roomId: number;
  roomName: string;
  roomCode: string;
};

// ── Icons ────────────────────────────────────────────────────────────────────
const HashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const ChatIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const XIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const InboxIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const LogoutIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const AlertIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function getRoomColor(name: string): string {
  const colors = [
    "linear-gradient(135deg,#6ee7f7,#818cf8)",
    "linear-gradient(135deg,#f472b6,#818cf8)",
    "linear-gradient(135deg,#4ade80,#6ee7f7)",
    "linear-gradient(135deg,#fb923c,#f472b6)",
    "linear-gradient(135deg,#facc15,#4ade80)",
    "linear-gradient(135deg,#818cf8,#f472b6)",
  ];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

// ── Create Room Modal ────────────────────────────────────────────────────────
function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!roomName.trim()) {
      setError("Room name can't be empty.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onCreate(roomName.trim());
      setRoomName("");
      onClose();
    } catch {
      setError("Failed to create room. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRoomName("");
      setError(null);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              background: "rgba(18,18,28,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "32px 28px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              position: "relative",
            }}
          >
            {/* shimmer top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(110,231,247,0.4),rgba(129,140,248,0.4),transparent)",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#f0f0f0",
                  margin: 0,
                }}
              >
                New Room
              </h2>
              <motion.button
                whileTap={{ scale: 0.85, rotate: 90 }}
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.4)",
                  padding: 4,
                  display: "flex",
                }}
              >
                <XIcon />
              </motion.button>
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Room Name
            </label>
            <input
              className="dash-input"
              placeholder="e.g. Design Team, Study Group…"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden", marginTop: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      color: "#fb7185",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    <AlertIcon />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="dash-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <motion.button
                className="dash-btn-primary"
                onClick={handleCreate}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "linear",
                      }}
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(10,10,15,0.3)",
                        borderTopColor: "#0a0a0f",
                        borderRadius: "50%",
                      }}
                    />
                    Creating…
                  </span>
                ) : (
                  "Create Room"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const socket = getSocket();
  const navigate = useNavigate();
  const username = getUserName();

  useEffect(() => {
    document.title = "Chitchat | Dashboard";
  }, []);

  useEffect(() => {
    setRoomsLoading(true);
    getMyRoomsApi()
      .then(setRooms)
      .catch((err) => console.error("Failed to fetch rooms:", err))
      .finally(() => setRoomsLoading(false));
  }, []);

  useEffect(() => {
    socket.on("room:join_socket", (room: Room) => {
      setRooms((prev) => {
        const exists = prev.some((r) => r.roomCode === room.roomCode);
        return exists ? prev : [...prev, room];
      });
    });
    return () => {
      socket.off("room:join_socket");
    };
  }, [socket]);

  async function joinRoom() {
    if (!roomCode.trim()) {
      setJoinError("Enter a room code first.");
      return;
    }
    setJoinLoading(true);
    setJoinError(null);
    try {
      await joinRoomApi(roomCode.trim());
      setRoomCode("");
    } catch {
      setJoinError("Invalid code or you're already a member.");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleCreateRoom(roomName: string) {
    await createRoomApi(roomName);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  }

  const initials = username
    ? username
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0a0a0f 0%,#0f0f1a 40%,#0a1020 100%)",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}

        .dash-input{
          width:100%;padding:13px 16px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px;color:#f0f0f0;font-size:14px;
          font-family:'DM Sans',sans-serif;outline:none;
          transition:border-color .25s,background .25s,box-shadow .25s;
          caret-color:#6ee7f7;
        }
        .dash-input::placeholder{color:rgba(255,255,255,0.25);}
        .dash-input:focus{
          border-color:rgba(110,231,247,0.5);
          background:rgba(110,231,247,0.05);
          box-shadow:0 0 0 3px rgba(110,231,247,0.08);
        }

        .dash-btn-primary{
          padding:13px 20px;
          background:linear-gradient(135deg,#6ee7f7 0%,#818cf8 100%);
          border:none;border-radius:12px;color:#0a0a0f;
          font-size:14px;font-weight:600;font-family:'Space Grotesk',sans-serif;
          cursor:pointer;transition:opacity .2s,transform .15s;
          letter-spacing:.02em;
        }
        .dash-btn-primary:hover:not(:disabled){opacity:.9;transform:translateY(-1px);}
        .dash-btn-primary:active:not(:disabled){transform:translateY(0);opacity:.8;}
        .dash-btn-primary:disabled{opacity:.45;cursor:not-allowed;}

        .dash-btn-ghost{
          padding:13px 18px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px;color:rgba(255,255,255,0.6);
          font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:background .2s,border-color .2s;
        }
        .dash-btn-ghost:hover{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.18);}

        .room-card{
          padding:16px 18px;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:16px;cursor:pointer;
          transition:background .2s,border-color .2s,transform .2s,box-shadow .2s;
          display:flex;align-items:center;gap:14px;
          text-decoration:none;
        }
        .room-card:hover{
          background:rgba(255,255,255,0.06);
          border-color:rgba(110,231,247,0.2);
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(0,0,0,0.3);
        }

        @keyframes floatParticle{
          0%,100%{transform:translateY(0) translateX(0);opacity:.3;}
          33%{transform:translateY(-20px) translateX(10px);opacity:.55;}
          66%{transform:translateY(10px) translateX(-8px);opacity:.15;}
        }
        @keyframes shimmer{
          0%{background-position:-200% center;}
          100%{background-position:200% center;}
        }
        .skeleton{
          background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);
          background-size:200% 100%;
          animation:shimmer 1.6s infinite;
          border-radius:10px;
        }

        @media(max-width:640px){
          .join-row{flex-direction:column !important;}
          .join-row .dash-btn-primary{width:100%;}
        }
      `}</style>

      {/* Background particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "fixed",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background:
              p.id % 3 === 0
                ? "#6ee7f7"
                : p.id % 3 === 1
                  ? "#818cf8"
                  : "#f472b6",
            animation: `floatParticle ${p.duration}s ${p.delay}s infinite ease-in-out`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
      {/* Glow orbs */}
      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle,rgba(110,231,247,0.05) 0%,transparent 70%)",
          borderRadius: "50%",
          top: "-10%",
          left: "-10%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle,rgba(129,140,248,0.06) 0%,transparent 70%)",
          borderRadius: "50%",
          bottom: "-15%",
          right: "-5%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Top Nav ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(10,10,15,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background:
                "linear-gradient(135deg,rgba(110,231,247,0.15),rgba(129,140,248,0.15))",
              border: "1px solid rgba(110,231,247,0.2)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6ee7f7",
            }}
          >
            <ChatIcon />
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: "#f0f0f0",
              letterSpacing: "-0.01em",
            }}
          >
            Chitchat
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6ee7f7,#818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#0a0a0f",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {username ?? "User"}
          </span>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleLogout}
            title="Logout"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 9,
              cursor: "pointer",
              color: "rgba(255,255,255,0.45)",
              padding: "6px 8px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontFamily: "'DM Sans',sans-serif",
              transition: "background .2s,color .2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(251,113,133,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fb7185";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.45)";
            }}
          >
            <LogoutIcon />
            <span style={{ display: "none" }} className="logout-label">
              Logout
            </span>
          </motion.button>
        </div>
      </motion.header>

      {/* ── Main content ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 720,
          margin: "0 auto",
          padding: "36px 20px 60px",
        }}
      >
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 36 }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: 700,
              color: "#f0f0f0",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Hey, {username ?? "there"} 👋
          </h1>
          <p
            style={{ color: "rgba(255,255,255,0.38)", fontSize: 15, margin: 0 }}
          >
            {rooms.length > 0
              ? `You're in ${rooms.length} room${rooms.length !== 1 ? "s" : ""}. Jump back in or start a new one.`
              : "No rooms yet — join or create one to get started."}
          </p>
        </motion.div>

        {/* ── Action cards row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            marginBottom: 36,
            alignItems: "end",
          }}
        >
          {/* Join by code */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 10,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Join by Code
            </label>
            <div className="join-row" style={{ display: "flex", gap: 10 }}>
              <input
                className="dash-input"
                placeholder="Paste invite code…"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setJoinError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                style={{ flex: 1 }}
              />
              <motion.button
                className="dash-btn-primary"
                onClick={joinRoom}
                disabled={joinLoading}
                whileTap={{ scale: 0.97 }}
                style={{
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {joinLoading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(10,10,15,0.3)",
                      borderTopColor: "#0a0a0f",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <ArrowRightIcon />
                )}
                Join
              </motion.button>
            </div>
            <AnimatePresence>
              {joinError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden", marginTop: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      alignItems: "center",
                      color: "#fb7185",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    <AlertIcon />
                    {joinError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create room button */}
          <motion.button
            className="dash-btn-primary"
            onClick={() => setIsModalOpen(true)}
            whileTap={{ scale: 0.96 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "20px 22px",
              borderRadius: 18,
              height: "100%",
              minHeight: 92,
              fontSize: 13,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "rgba(10,10,15,0.25)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusIcon />
            </div>
            <span>New Room</span>
          </motion.button>
        </motion.div>

        {/* ── Room list ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.75)",
                margin: 0,
              }}
            >
              My Rooms
            </h2>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6ee7f7",
                background: "rgba(110,231,247,0.1)",
                border: "1px solid rgba(110,231,247,0.2)",
                borderRadius: 20,
                padding: "2px 10px",
              }}
            >
              {rooms.length}
            </span>
          </div>

          {/* Skeleton loading */}
          {roomsLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 68, borderRadius: 16 }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!roomsLoading && rooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                textAlign: "center",
                padding: "52px 20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 20,
              }}
            >
              <div
                style={{ color: "rgba(255,255,255,0.12)", marginBottom: 14 }}
              >
                <InboxIcon />
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 15,
                  fontWeight: 500,
                  margin: "0 0 6px",
                }}
              >
                No rooms yet
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 13,
                  margin: 0,
                }}
              >
                Join with a code or create your first room above.
              </p>
            </motion.div>
          )}

          {/* Room cards */}
          {!roomsLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <AnimatePresence initial={false}>
                {rooms.map((room, idx) => (
                  <motion.div
                    key={room.roomCode}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      delay: idx * 0.06,
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div
                      className="room-card"
                      onClick={() =>
                        navigate("/rooms", {
                          state: {
                            roomId: room.roomId,
                            roomCode: room.roomCode,
                          },
                        })
                      }
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: getRoomColor(room.roomName),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Space Grotesk',sans-serif",
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#0a0a0f",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                      >
                        {room.roomName.slice(0, 2).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "'Space Grotesk',sans-serif",
                            fontWeight: 600,
                            fontSize: 15,
                            color: "#f0f0f0",
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {room.roomName}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 4,
                            color: "rgba(255,255,255,0.3)",
                            fontSize: 12,
                          }}
                        >
                          <HashIcon />
                          <span
                            style={{
                              fontFamily: "monospace",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {room.roomCode}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          color: "rgba(255,255,255,0.2)",
                          flexShrink: 0,
                          transition: "color .2s",
                        }}
                        className="room-arrow"
                      >
                        <ArrowRightIcon />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      {/* Modal */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
}
