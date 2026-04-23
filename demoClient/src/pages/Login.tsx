import { useState, useEffect } from "react";
import { loginApi } from "../api/auth.api";
import { saveToken, saveUserName } from "../auth/auth.store";
import { setAuthToken } from "../api/client";
import { connectSocket } from "../sockets/socket";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const ChatBubbleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const SleepIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const ZapIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ── Floating particles ────────────────────────────────────────────────────────
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

// ── Server Wake-up Warning Modal ──────────────────────────────────────────────
function ServerWakeModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 28 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%", maxWidth: 420,
          background: "rgba(14,14,22,0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 22,
          padding: "32px 28px 28px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Amber shimmer top edge */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.6),rgba(251,146,60,0.6),transparent)",
        }} />

        {/* Pulsing glow behind icon */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.25, 0.12] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{
            position: "absolute", top: -10, left: -10,
            width: 100, height: 100, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(251,191,36,0.4),transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(251,191,36,0.1)",
          border: "1px solid rgba(251,191,36,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fbbf24", marginBottom: 20,
          boxShadow: "0 8px 24px rgba(251,191,36,0.15)",
          position: "relative",
        }}>
          <SleepIcon />
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 21, fontWeight: 700,
          color: "#f0f0f0", margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}>
          Heads up — server is sleeping 😴
        </h2>

        {/* Body copy */}
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.75, margin: "0 0 10px" }}>
          This app runs on a{" "}
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>free-tier server</span> that
          automatically spins down after{" "}
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>30 minutes of inactivity</span>.
        </p>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.75, margin: "0 0 24px" }}>
          Your <strong style={{ color: "#fbbf24", fontWeight: 700 }}>first request may take 30–60 seconds</strong> while
          Render re-allocates the server resources. Everything will be snappy after that first wake-up.
        </p>

        {/* Animated sweep bar */}
        <div style={{
          height: 3, borderRadius: 4,
          background: "rgba(255,255,255,0.05)",
          marginBottom: 20, overflow: "hidden",
        }}>
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 0.3 }}
            style={{
              width: "40%", height: "100%",
              background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.8),transparent)",
              borderRadius: 4,
            }}
          />
        </div>

        {/* Info chips */}
        <div style={{ display: "flex", gap: 7, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "Free tier hosting",   bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  color: "#fbbf24" },
            { label: "Cold start ~30–60s",  bg: "rgba(110,231,247,0.07)", border: "rgba(110,231,247,0.2)", color: "#6ee7f7" },
            { label: "Fast after wake-up",  bg: "rgba(74,222,128,0.07)", border: "rgba(74,222,128,0.2)",  color: "#4ade80" },
          ].map((chip) => (
            <div key={chip.label} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 11px",
              background: chip.bg,
              border: `1px solid ${chip.border}`,
              borderRadius: 20,
              fontSize: 12, fontWeight: 600, color: chip.color,
              letterSpacing: "0.01em",
            }}>
              <ZapIcon />
              {chip.label}
            </div>
          ))}
        </div>

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDismiss}
          style={{
            width: "100%", padding: "13px 20px",
            background: "linear-gradient(135deg,#fbbf24 0%,#fb923c 100%)",
            border: "none", borderRadius: 13,
            color: "#0a0a0f", fontSize: 15, fontWeight: 700,
            fontFamily: "'Space Grotesk',sans-serif",
            cursor: "pointer", letterSpacing: "0.02em",
            transition: "opacity .2s, transform .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.87"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Got it, let's go!
        </motion.button>

        <p style={{
          textAlign: "center", margin: "11px 0 0",
          color: "rgba(255,255,255,0.18)", fontSize: 12,
        }}>
          This notice appears once per browser session.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function Login({ setToken }: { setToken: (token: string | null) => void }) {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showWakeModal, setShowWakeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Chitchat | Sign In";
  }, []);

  // Show once per browser session (survives page refresh, resets when tab is closed)
  useEffect(() => {
    const dismissed = sessionStorage.getItem("serverWakeDismissed");
    if (!dismissed) setShowWakeModal(true);
  }, []);

  function dismissModal() {
    sessionStorage.setItem("serverWakeDismissed", "1");
    setShowWakeModal(false);
  }

  async function login() {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { token, userName } = await loginApi(email, password);
      saveToken(token);
      saveUserName(userName);
      setAuthToken(token);
      connectSocket(token);
      setToken(token);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0a0a0f 0%,#0f0f1a 40%,#0a1020 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        .login-input{
          width:100%;padding:14px 16px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px;color:#f0f0f0;font-size:15px;
          font-family:'DM Sans',sans-serif;outline:none;
          transition:border-color .25s,background .25s,box-shadow .25s;
          caret-color:#6ee7f7;
        }
        .login-input::placeholder{color:rgba(255,255,255,0.25);}
        .login-input.focused{
          border-color:rgba(110,231,247,0.5);
          background:rgba(110,231,247,0.05);
          box-shadow:0 0 0 3px rgba(110,231,247,0.08);
        }
        .login-input.has-error{
          border-color:rgba(251,113,133,0.5);
          box-shadow:0 0 0 3px rgba(251,113,133,0.08);
        }
        .login-btn{
          width:100%;padding:14px;
          background:linear-gradient(135deg,#6ee7f7 0%,#818cf8 100%);
          border:none;border-radius:12px;color:#0a0a0f;
          font-size:15px;font-weight:600;font-family:'Space Grotesk',sans-serif;
          cursor:pointer;transition:opacity .2s,transform .15s;
          letter-spacing:.03em;
        }
        .login-btn:hover:not(:disabled){opacity:.92;transform:translateY(-1px);}
        .login-btn:active:not(:disabled){transform:translateY(0);opacity:.85;}
        .login-btn:disabled{opacity:.5;cursor:not-allowed;}
        .link-text{color:#6ee7f7;text-decoration:none;font-weight:500;transition:opacity .2s;}
        .link-text:hover{opacity:.75;}
        .toggle-password-btn{
          background:none;border:none;cursor:pointer;
          color:rgba(255,255,255,0.35);padding:0;
          display:flex;align-items:center;transition:color .2s;
        }
        .toggle-password-btn:hover{color:rgba(255,255,255,0.75);}
        @keyframes floatParticle{
          0%,100%{transform:translateY(0) translateX(0);opacity:.3;}
          33%{transform:translateY(-20px) translateX(10px);opacity:.6;}
          66%{transform:translateY(10px) translateX(-8px);opacity:.2;}
        }
      `}</style>

      {/* Background particles */}
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%",
          background: p.id % 3 === 0 ? "#6ee7f7" : p.id % 3 === 1 ? "#818cf8" : "#f472b6",
          animation: `floatParticle ${p.duration}s ${p.delay}s infinite ease-in-out`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Glow orbs */}
      <div style={{ position: "absolute", width: 400, height: 400, background: "radial-gradient(circle,rgba(110,231,247,0.06) 0%,transparent 70%)", borderRadius: "50%", top: "5%", left: "-10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 500, height: 500, background: "radial-gradient(circle,rgba(129,140,248,0.07) 0%,transparent 70%)", borderRadius: "50%", bottom: "-10%", right: "-5%", pointerEvents: "none" }} />

      {/* ── Login card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%", maxWidth: 420, margin: "0 16px",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, padding: "40px 36px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.04) inset",
          position: "relative", zIndex: 10,
        }}
      >
        {/* Top shimmer */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(110,231,247,0.4),rgba(129,140,248,0.4),transparent)",
          borderRadius: "0 0 8px 8px",
        }} />

        {/* Logo + heading */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg,rgba(110,231,247,0.15),rgba(129,140,248,0.15))",
            border: "1px solid rgba(110,231,247,0.25)",
            borderRadius: 16, display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            color: "#6ee7f7", marginBottom: 16,
            boxShadow: "0 8px 24px rgba(110,231,247,0.1)",
          }}>
            <ChatBubbleIcon />
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 26, fontWeight: 700, margin: 0,
            color: "#f0f0f0", letterSpacing: "-0.02em",
          }}>
            Welcome back
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "6px 0 0", fontWeight: 400 }}>
            Sign in to continue chatting
          </p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8, scaleY: 0.8, height: 0 }}
              animate={{ opacity: 1, y: 0, scaleY: 1, height: "auto" }}
              exit={{ opacity: 0, y: -8, scaleY: 0.8, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden", marginBottom: 20 }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px",
                background: "rgba(251,113,133,0.1)",
                border: "1px solid rgba(251,113,133,0.25)",
                borderRadius: 12, color: "#fb7185",
                fontSize: 13.5, fontWeight: 500,
              }}>
                <motion.span initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ delay: 0.1 }} style={{ flexShrink: 0 }}>
                  <AlertIcon />
                </motion.span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fields */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Email
            </label>
            <input
              className={`login-input${focusedField === "email" ? " focused" : ""}${error ? " has-error" : ""}`}
              type="email" placeholder="you@example.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              onKeyDown={handleKeyDown} autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                className={`login-input${focusedField === "password" ? " focused" : ""}${error ? " has-error" : ""}`}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown} autoComplete="current-password"
                style={{ paddingRight: 48 }}
              />
              <motion.button
                className="toggle-password-btn"
                onClick={() => setShowPassword((v) => !v)}
                whileTap={{ scale: 0.85 }}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}
                tabIndex={-1} type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={showPassword ? "off" : "on"}
                    initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.7, rotate: 15 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex" }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ marginTop: 4 }}>
            <motion.button
              className="login-btn"
              onClick={login}
              disabled={isLoading}
              whileTap={isLoading ? {} : { scale: 0.98 }}
            >
              {isLoading ? (
                <motion.span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(10,10,15,0.3)", borderTopColor: "#0a0a0f", borderRadius: "50%" }}
                  />
                  Signing in…
                </motion.span>
              ) : "Sign In"}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        </motion.div>

        {/* Sign up link */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          style={{ textAlign: "center", margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 14 }}
        >
          New here?{" "}
          <Link to="/signup" className="link-text">Create an account</Link>
        </motion.p>
      </motion.div>

      {/* ── Server wake-up modal ── */}
      <AnimatePresence>
        {showWakeModal && <ServerWakeModal onDismiss={dismissModal} />}
      </AnimatePresence>
    </div>
  );
}