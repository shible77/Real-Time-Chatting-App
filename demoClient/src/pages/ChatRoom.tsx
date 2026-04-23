import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMessagesApi } from "../api/messages.api";
import { getSocket } from "../sockets/socket";
import { getUserName } from "../auth/auth.store";
import { getRoomInfoApi, leaveRoomApi } from "../api/rooms.api";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  senderName: string;
  content: string;
  id: number;
};

type RoomInfo = {
  id: number;
  code: string;
  name: string;
  createdBy: string;
  createdAt: string;
};

type RoomState = {
  roomId: number;
  roomCode: string;
};

// ── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const SendIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const DotsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
const HashIcon = () => (
  <svg
    width="14"
    height="14"
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
const LogOutIcon = () => (
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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const InfoIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ChatIcon = () => (
  <svg
    width="20"
    height="20"
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function getAvatarGradient(name: string): string {
  const gradients = [
    "linear-gradient(135deg,#6ee7f7,#818cf8)",
    "linear-gradient(135deg,#f472b6,#818cf8)",
    "linear-gradient(135deg,#4ade80,#6ee7f7)",
    "linear-gradient(135deg,#fb923c,#f472b6)",
    "linear-gradient(135deg,#facc15,#4ade80)",
    "linear-gradient(135deg,#818cf8,#f472b6)",
    "linear-gradient(135deg,#6ee7f7,#4ade80)",
    "linear-gradient(135deg,#fb923c,#6ee7f7)",
  ];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return gradients[hash % gradients.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Leave Confirmation Modal ──────────────────────────────────────────────────
function LeaveModal({
  isOpen,
  roomName,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  roomName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: "rgba(18,18,28,0.97)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "28px 24px",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
              position: "relative",
            }}
          >
            {/* red shimmer top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(251,113,133,0.5),transparent)",
              }}
            />

            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(251,113,133,0.12)",
                border: "1px solid rgba(251,113,133,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fb7185",
                marginBottom: 16,
              }}
            >
              <LogOutIcon />
            </div>

            <h3
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#f0f0f0",
                margin: "0 0 8px",
              }}
            >
              Leave Room?
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 14,
                lineHeight: 1.6,
                margin: "0 0 24px",
              }}
            >
              You're about to leave{" "}
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                {roomName}
              </strong>
              . You'll need an invite code to rejoin.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'DM Sans',sans-serif",
                  cursor: "pointer",
                  transition: "background .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "linear-gradient(135deg,#fb7185,#f43f5e)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk',sans-serif",
                  cursor: "pointer",
                  transition: "opacity .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Leave Room
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── ChatRoom ─────────────────────────────────────────────────────────────────
export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, roomCode } = location.state as RoomState;
  const socket = getSocket();
  const username = getUserName() ?? "You";

  const [messages, setMessages] = useState<Message[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [text, setText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `Chitchat | ${roomInfo ? roomInfo.name : "Chat Room"}`;
  }, [roomInfo]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch room info + messages, join socket room
  useEffect(() => {
    getRoomInfoApi(Number(roomId)).then(setRoomInfo).catch(console.error);

    getMessagesApi(Number(roomId))
      .then((data) => {
        setMessages(data);
        setIsLoadingMessages(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoadingMessages(false);
      });

    socket.emit("room:join_socket", { roomId: Number(roomId), roomCode });

    socket.on("message:receive", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("room:leave_socket", { roomId: Number(roomId) });
      socket.off("message:receive");
    };
  }, [roomId, roomCode, socket]);

  // Auto-resize textarea
  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;
    socket.emit("message:send", {
      username,
      roomId: Number(roomId),
      content: trimmed,
    });
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleLeaveConfirm() {
    leaveRoomApi(Number(roomId))
      .then(() => {
        setIsLeaveModalOpen(false);
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error("Failed to leave room:", err);
      });
  }

  // Group consecutive messages from the same sender
  type MessageGroup = {
    senderName: string;
    messages: Message[];
    isOwn: boolean;
  };

  const groupedMessages: MessageGroup[] = [];
  for (const msg of messages) {
    const isOwn = msg.senderName === username;
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.senderName === msg.senderName) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({
        senderName: msg.senderName,
        messages: [msg],
        isOwn,
      });
    }
  }

  // Assign a timestamp to each group (using index as a proxy since no timestamp in data)
  const now = new Date();

  return (
    <div
      style={{
        height: "100dvh",
        background:
          "linear-gradient(135deg,#0a0a0f 0%,#0f0f1a 40%,#0a1020 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}

        .msg-bubble{
          padding:10px 14px;
          border-radius:18px;
          font-size:14.5px;
          line-height:1.55;
          color:#f0f0f0;
          word-break:break-word;
          white-space:pre-wrap;
          max-width:100%;
        }
        .msg-bubble.own{
          background:linear-gradient(135deg,rgba(110,231,247,0.18),rgba(129,140,248,0.18));
          border:1px solid rgba(110,231,247,0.2);
          border-bottom-right-radius:5px;
        }
        .msg-bubble.other{
          background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.08);
          border-bottom-left-radius:5px;
        }
        .msg-bubble:not(:last-child){
          border-radius:18px;
          margin-bottom:2px;
        }

        .chat-textarea{
          flex:1;resize:none;
          background:transparent;border:none;outline:none;
          color:#f0f0f0;font-size:15px;
          font-family:'DM Sans',sans-serif;
          line-height:1.5;padding:0;
          caret-color:#6ee7f7;
          min-height:24px;max-height:120px;
          overflow-y:auto;
        }
        .chat-textarea::placeholder{color:rgba(255,255,255,0.2);}
        .chat-textarea::-webkit-scrollbar{width:4px;}
        .chat-textarea::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}

        .messages-scroll::-webkit-scrollbar{width:5px;}
        .messages-scroll::-webkit-scrollbar-track{background:transparent;}
        .messages-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:4px;}
        .messages-scroll::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.13);}

        .menu-item{
          display:flex;align-items:center;gap:10px;
          padding:10px 14px;border-radius:10px;
          font-size:14px;font-weight:500;
          cursor:pointer;transition:background .15s;
          border:none;width:100%;text-align:left;
          font-family:'DM Sans',sans-serif;
          background:none;
        }
        .menu-item:hover{background:rgba(255,255,255,0.06);}
        .menu-item.danger{color:#fb7185;}
        .menu-item.danger:hover{background:rgba(251,113,133,0.1);}
        .menu-item.normal{color:rgba(255,255,255,0.65);}

        @keyframes floatParticle{
          0%,100%{transform:translateY(0) translateX(0);opacity:.25;}
          50%{transform:translateY(-16px) translateX(8px);opacity:.5;}
        }
        @keyframes shimmer{
          0%{background-position:-200% center;}
          100%{background-position:200% center;}
        }
        .skeleton{
          background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 75%);
          background-size:200% 100%;
          animation:shimmer 1.8s infinite;
          border-radius:14px;
        }
      `}</style>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          height: 64,
          flexShrink: 0,
          background: "rgba(10,10,15,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          zIndex: 20,
        }}
      >
        {/* Back */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate("/dashboard")}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10,
            cursor: "pointer",
            color: "rgba(255,255,255,0.55)",
            padding: "7px 9px",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            transition: "background .2s,color .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.09)";
            e.currentTarget.style.color = "#f0f0f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(255,255,255,0.55)";
          }}
        >
          <ArrowLeftIcon />
        </motion.button>

        {/* Room avatar */}
        {roomInfo && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              flexShrink: 0,
              background: getAvatarGradient(roomInfo.name),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#0a0a0f",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {getInitials(roomInfo.name)}
          </div>
        )}
        {!roomInfo && (
          <div
            className="skeleton"
            style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0 }}
          />
        )}

        {/* Room name + code */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {roomInfo ? (
            <>
              <p
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#f0f0f0",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {roomInfo.name}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 1,
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}
                >
                  <HashIcon />
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 12,
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {roomCode}
                </span>
              </div>
            </>
          ) : (
            <>
              <div
                className="skeleton"
                style={{ height: 14, width: 120, marginBottom: 5 }}
              />
              <div className="skeleton" style={{ height: 11, width: 80 }} />
            </>
          )}
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setIsMenuOpen((v) => !v)}
            style={{
              background: isMenuOpen
                ? "rgba(255,255,255,0.09)"
                : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              cursor: "pointer",
              color: isMenuOpen ? "#f0f0f0" : "rgba(255,255,255,0.55)",
              padding: "7px 9px",
              display: "flex",
              alignItems: "center",
              transition: "background .2s,color .2s",
            }}
          >
            <DotsIcon />
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 220,
                  zIndex: 50,
                  background: "rgba(18,18,28,0.97)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  padding: "6px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                  transformOrigin: "top right",
                }}
              >
                {/* Room info item */}
                <button
                  className="menu-item normal"
                  onClick={() => {
                    copyRoomCode();
                    setIsMenuOpen(false);
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    {copied ? <CheckIcon /> : <CopyIcon />}
                  </span>
                  <span>{copied ? "Copied!" : "Copy invite code"}</span>
                </button>

                <button
                  className="menu-item normal"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    <InfoIcon />
                  </span>
                  <span>Room info</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.2)",
                    }}
                  >
                    Soon
                  </span>
                </button>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.07)",
                    margin: "4px 0",
                  }}
                />

                {/* Leave */}
                <button
                  className="menu-item danger"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLeaveModalOpen(true);
                  }}
                >
                  <LogOutIcon />
                  <span>Leave room</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* ── Messages ── */}
      <div
        className="messages-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Loading skeletons */}
        {isLoadingMessages && (
          <>
            {[80, 140, 60, 200, 100].map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 10,
                  justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
                }}
              >
                {i % 2 === 0 && (
                  <div
                    className="skeleton"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div
                  className="skeleton"
                  style={{ height: 40, width: w, borderRadius: 14 }}
                />
              </div>
            ))}
          </>
        )}

        {/* Empty state */}
        {!isLoadingMessages && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              margin: "auto",
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "rgba(110,231,247,0.08)",
                border: "1px solid rgba(110,231,247,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(110,231,247,0.4)",
                margin: "0 auto 16px",
              }}
            >
              <ChatIcon />
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 15,
                fontWeight: 500,
                margin: "0 0 6px",
              }}
            >
              No messages yet
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.18)",
                fontSize: 13,
                margin: 0,
              }}
            >
              Say hello and start the conversation!
            </p>
          </motion.div>
        )}

        {/* Message groups */}
        {!isLoadingMessages &&
          groupedMessages.map((group, gi) => (
            <motion.div
              key={gi}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(gi * 0.03, 0.3), duration: 0.35 }}
              style={{
                display: "flex",
                flexDirection: group.isOwn ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              {/* Avatar */}
              {!group.isOwn && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: getAvatarGradient(group.senderName),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    color: "#0a0a0f",
                    alignSelf: "flex-end",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {getInitials(group.senderName)}
                </div>
              )}

              <div
                style={{
                  maxWidth: "70%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: group.isOwn ? "flex-end" : "flex-start",
                }}
              >
                {/* Sender name */}
                {!group.isOwn && (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.38)",
                      marginBottom: 3,
                      paddingLeft: 4,
                      fontFamily: "'Space Grotesk',sans-serif",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {group.senderName}
                  </span>
                )}

                {/* Bubbles */}
                {group.messages.map((msg, mi) => (
                  <div
                    key={msg.id ?? mi}
                    className={`msg-bubble ${group.isOwn ? "own" : "other"}`}
                    style={{
                      borderTopLeftRadius:
                        !group.isOwn && mi === 0 ? 5 : undefined,
                      borderTopRightRadius:
                        group.isOwn && mi === 0 ? 5 : undefined,
                    }}
                  >
                    {msg.content}
                  </div>
                ))}

                {/* Timestamp */}
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.2)",
                    marginTop: 2,
                    paddingLeft: group.isOwn ? 0 : 4,
                    paddingRight: group.isOwn ? 4 : 0,
                  }}
                >
                  {formatTime(now)}
                </span>
              </div>
            </motion.div>
          ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Composer ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          padding: "12px 16px 16px",
          background: "rgba(10,10,15,0.85)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 18,
            padding: "10px 10px 10px 16px",
            transition: "border-color .25s,box-shadow .25s",
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "rgba(110,231,247,0.35)";
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 0 0 3px rgba(110,231,247,0.07)";
          }}
          onBlurCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "rgba(255,255,255,0.09)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Message…"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={sendMessage}
            disabled={!text.trim()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              flexShrink: 0,
              background: text.trim()
                ? "linear-gradient(135deg,#6ee7f7,#818cf8)"
                : "rgba(255,255,255,0.06)",
              border: "none",
              cursor: text.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: text.trim() ? "#0a0a0f" : "rgba(255,255,255,0.2)",
              transition: "background .25s,color .25s",
            }}
          >
            <SendIcon />
          </motion.button>
        </div>

        <p
          style={{
            margin: "6px 0 0",
            textAlign: "center",
            fontSize: 11.5,
            color: "rgba(255,255,255,0.15)",
          }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </motion.div>

      {/* Leave confirmation modal */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        roomName={roomInfo?.name ?? "this room"}
        onCancel={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeaveConfirm}
      />
    </div>
  );
}
