import React, { useState, useEffect, useCallback } from "react";
import { Heart, Send, Sparkles, Lock, Trash2, Download, LogOut, RefreshCw, ChevronLeft } from "lucide-react";

/* ============================================================
   CONFIG — tweak these to personalize the page
   ============================================================ */
const CONFIG = {
  title: "Tell Me Something",
  subtitle: "Whatever's on your heart — I'd love to hear it.",
};

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:4000/api";

const TOKEN_KEY = "aw_admin_token";

const CATEGORIES = [
  { id: "love", label: "Something I love", emoji: "❤️", color: "#B4573F" },
  { id: "wish", label: "A wish for you", emoji: "✨", color: "#6B8F71" },
  { id: "memory", label: "A memory", emoji: "📸", color: "#C9A467" },
  { id: "growth", label: "Room to grow", emoji: "🌱", color: "#5B7553" },
  { id: "cherish", label: "What I cherish", emoji: "💎", color: "#7C5C9C" },
  { id: "note", label: "Just because", emoji: "💌", color: "#8A7A6D" },
];

function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

/* ============================================================
   Global styles
   ============================================================ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }
      body { margin: 0; }

      .aw-root {
        font-family: 'Inter', -apple-system, sans-serif;
        background: radial-gradient(circle at 20% 0%, #FBF3EA 0%, #F3E6D8 55%, #EFDDC9 100%);
        min-height: 100vh;
        color: #3B1F2B;
        position: relative;
        overflow-x: hidden;
      }
      .aw-serif { font-family: 'Fraunces', serif; }

      .aw-noise {
        position: absolute; inset: 0; pointer-events: none; opacity: 0.35;
        background-image: radial-gradient(#3B1F2B11 1px, transparent 1px);
        background-size: 22px 22px;
      }

      .aw-floaters span {
        position: absolute; font-size: 22px; opacity: 0.18;
        animation: aw-float 14s ease-in-out infinite; user-select: none;
      }
      @keyframes aw-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-26px) rotate(8deg); }
      }

      .aw-wrap { max-width: 620px; margin: 0 auto; padding: 64px 20px 80px; position: relative; z-index: 1; }
      .aw-admin-shell { max-width: 760px; }

      .aw-hero { text-align: center; margin-bottom: 40px; }
      .aw-hero .aw-icon-wrap {
        width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%;
        background: linear-gradient(135deg, #C9A467, #B4573F);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 24px -8px rgba(180,87,63,0.55);
      }
      .aw-hero h1 { font-size: clamp(32px, 6vw, 46px); font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 14px; color: #2E1620; }
      .aw-hero p { color: #6E5A4E; font-size: 16px; max-width: 420px; margin: 0 auto; line-height: 1.5; }

      .aw-card {
        background: rgba(255,252,247,0.75); backdrop-filter: blur(14px);
        border: 1px solid rgba(59,31,43,0.08); border-radius: 24px; padding: 32px;
        box-shadow: 0 20px 60px -30px rgba(59,31,43,0.35);
      }

      .aw-field { margin-bottom: 22px; }
      .aw-label { display: block; font-size: 13px; font-weight: 600; color: #6E5A4E; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
      .aw-input, .aw-textarea {
        width: 100%; border: 1.5px solid rgba(59,31,43,0.14); background: #FFFCF8;
        border-radius: 14px; padding: 13px 16px; font-size: 15px; font-family: inherit; color: #2E1620;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .aw-input:focus, .aw-textarea:focus { outline: none; border-color: #C9A467; box-shadow: 0 0 0 4px rgba(201,164,103,0.18); }
      .aw-textarea { min-height: 150px; resize: vertical; line-height: 1.6; }

      .aw-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .aw-chip {
        border: 1.5px solid rgba(59,31,43,0.14); background: #FFFCF8; border-radius: 999px;
        padding: 8px 14px; font-size: 13.5px; font-weight: 500; cursor: pointer;
        display: flex; align-items: center; gap: 6px; transition: all 0.15s; color: #4A3A32;
      }
      .aw-chip:hover { border-color: rgba(59,31,43,0.3); }
      .aw-chip.active { color: white; border-color: transparent; }

      .aw-submit {
        width: 100%; border: none; border-radius: 14px; padding: 15px; font-size: 15.5px; font-weight: 600;
        color: white; background: linear-gradient(135deg, #C9A467, #B4573F); cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 10px 30px -10px rgba(180,87,63,0.6);
      }
      .aw-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 36px -10px rgba(180,87,63,0.7); }
      .aw-submit:disabled { opacity: 0.55; cursor: not-allowed; }

      .aw-footnote { text-align: center; margin-top: 22px; font-size: 12.5px; color: #A18F82; }

      .aw-seal-wrap { text-align: center; padding: 46px 20px; animation: aw-fadein 0.4s ease; }
      .aw-envelope { width: 84px; height: 60px; margin: 0 auto 26px; position: relative; animation: aw-seal-pop 0.6s cubic-bezier(.34,1.56,.64,1); }
      .aw-envelope svg { width: 100%; height: 100%; }
      @keyframes aw-seal-pop {
        0% { transform: scale(0.4) rotate(-8deg); opacity: 0; }
        60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes aw-fadein { from { opacity: 0; } to { opacity: 1; } }
      .aw-seal-wrap h2 { font-size: 24px; margin-bottom: 8px; color: #2E1620; }
      .aw-seal-wrap p { color: #6E5A4E; font-size: 14.5px; }
      .aw-again-btn {
        margin-top: 24px; border: 1.5px solid rgba(59,31,43,0.16); background: transparent; border-radius: 999px;
        padding: 10px 22px; font-size: 13.5px; font-weight: 600; color: #6E5A4E; cursor: pointer;
      }
      .aw-again-btn:hover { border-color: #C9A467; color: #B4573F; }

      .aw-error { color: #A23B2E; font-size: 13px; margin-top: -12px; margin-bottom: 18px; }
      .aw-spin { animation: aw-spin 0.9s linear infinite; }
      @keyframes aw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      .aw-admin-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
      .aw-admin-topbar h1 { font-size: 24px; font-weight: 600; color: #2E1620; display: flex; align-items: center; gap: 10px; margin: 0; }
      .aw-icon-btn {
        border: 1.5px solid rgba(59,31,43,0.14); background: #FFFCF8; border-radius: 12px; padding: 9px 14px;
        font-size: 13px; font-weight: 600; color: #4A3A32; cursor: pointer;
        display: flex; align-items: center; gap: 6px; transition: all 0.15s;
      }
      .aw-icon-btn:hover { border-color: #B4573F; color: #B4573F; }

      .aw-stats-row { display: flex; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
      .aw-stat { background: #FFFCF8; border: 1px solid rgba(59,31,43,0.1); border-radius: 14px; padding: 12px 18px; min-width: 90px; }
      .aw-stat .n { font-size: 22px; font-weight: 700; color: #2E1620; }
      .aw-stat .l { font-size: 11.5px; color: #8A7A6D; text-transform: uppercase; letter-spacing: 0.04em; }

      .aw-note-card { background: #FFFCF8; border: 1px solid rgba(59,31,43,0.1); border-left-width: 5px; border-radius: 16px; padding: 20px; margin-bottom: 14px; transition: box-shadow 0.2s; }
      .aw-note-card:hover { box-shadow: 0 10px 30px -18px rgba(59,31,43,0.4); }
      .aw-note-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
      .aw-note-tag { font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 4px; }
      .aw-note-meta { font-size: 12px; color: #A18F82; }
      .aw-note-body { color: #3B1F2B; line-height: 1.65; font-size: 15px; white-space: pre-wrap; word-break: break-word; }
      .aw-del-btn { background: none; border: none; color: #C9BBB0; cursor: pointer; padding: 4px; }
      .aw-del-btn:hover { color: #A23B2E; }

      .aw-empty { text-align: center; padding: 60px 20px; color: #A18F82; }

      .aw-login-box {
        max-width: 340px; margin: 100px auto 0; background: #FFFCF8; border: 1px solid rgba(59,31,43,0.1);
        border-radius: 20px; padding: 36px 30px; text-align: center; box-shadow: 0 20px 60px -30px rgba(59,31,43,0.35);
      }
      .aw-login-box .lock-wrap { width: 48px; height: 48px; border-radius: 50%; background: #2E1620; color: #E9C88F; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
      .aw-login-box h2 { font-size: 19px; margin-bottom: 18px; color: #2E1620; }
      .aw-back-link { display: inline-flex; align-items: center; gap: 4px; color: #A18F82; font-size: 13px; text-decoration: none; cursor: pointer; background: none; border: none; margin-bottom: 18px; }
      .aw-back-link:hover { color: #6E5A4E; }

      @media (max-width: 480px) {
        .aw-card { padding: 24px 18px; }
        .aw-admin-topbar { flex-direction: column; align-items: flex-start; }
      }
    `}</style>
  );
}

function Floaters() {
  const items = ["❤", "✨", "💌", "🌿", "💫"];
  return (
    <div className="aw-floaters" aria-hidden="true">
      {items.map((it, i) => (
        <span key={i} style={{ left: `${8 + i * 20}%`, top: `${10 + (i % 3) * 26}%`, animationDelay: `${i * 1.3}s` }}>
          {it}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   Public submission form — talks to POST /api/notes
   ============================================================ */
function PublicForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("note");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Don't be shy — write a little something first.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      setSent(true);
      setName("");
      setMessage("");
      setCategory("note");
    } catch (err) {
      setError("That didn't send. Mind giving it another try?");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="aw-card aw-seal-wrap">
        <div className="aw-envelope">
          <svg viewBox="0 0 100 72" fill="none">
            <rect x="2" y="8" width="96" height="62" rx="8" fill="#FFFCF8" stroke="#C9A467" strokeWidth="2" />
            <path d="M4 12 L50 46 L96 12" stroke="#C9A467" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="40" r="13" fill="#B4573F" />
            <path d="M50 33 L53 38 L58.5 38.8 L54.5 42.6 L55.5 48 L50 45.2 L44.5 48 L45.5 42.6 L41.5 38.8 L47 38 Z" fill="#F3D9CE" />
          </svg>
        </div>
        <h2 className="aw-serif">Delivered, sealed, and kept safe 💛</h2>
        <p>Thank you for taking a moment to share that.</p>
        <button className="aw-again-btn" onClick={() => setSent(false)}>Write another note</button>
      </div>
    );
  }

  return (
    <form className="aw-card" onSubmit={handleSubmit}>
      <div className="aw-field">
        <label className="aw-label" htmlFor="aw-name">Your name (optional)</label>
        <input id="aw-name" className="aw-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Stay anonymous, or say hi" maxLength={60} />
      </div>

      <div className="aw-field">
        <label className="aw-label">What kind of note is this?</label>
        <div className="aw-chips">
          {CATEGORIES.map((c) => (
            <button type="button" key={c.id} className={`aw-chip${category === c.id ? " active" : ""}`}
              style={category === c.id ? { background: c.color, borderColor: c.color } : {}}
              onClick={() => setCategory(c.id)}>
              <span>{c.emoji}</span><span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="aw-field">
        <label className="aw-label" htmlFor="aw-message">Your message</label>
        <textarea id="aw-message" className="aw-textarea" value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Say whatever you want to say — sweet, honest, silly, all of it is welcome." maxLength={2000} />
      </div>

      {error && <p className="aw-error">{error}</p>}

      <button className="aw-submit" type="submit" disabled={submitting}>
        {submitting ? (<><RefreshCw size={17} className="aw-spin" /> Sending…</>) : (<><Send size={17} /> Send this note</>)}
      </button>

      <p className="aw-footnote">I'm the only one that's gonna see it, Write freely 💛</p>
    </form>
  );
}

/* ============================================================
   Admin login — talks to POST /api/admin/login
   ============================================================ */
function AdminLogin({ onSuccess, onBack }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect password");
      localStorage.setItem(TOKEN_KEY, data.token);
      onSuccess(data.token);
    } catch (err) {
      setError("That's not quite right.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aw-login-box">
      <button className="aw-back-link" onClick={onBack}><ChevronLeft size={14} /> Back</button>
      <div className="lock-wrap"><Lock size={20} /></div>
      <h2 className="aw-serif">This part's just for you</h2>
      <form onSubmit={handleLogin}>
        <input className="aw-input" type="password" autoComplete="off" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
          style={{ marginBottom: "14px", textAlign: "center" }} autoFocus />
        {error && <p className="aw-error" style={{ marginBottom: "14px" }}>{error}</p>}
        <button className="aw-submit" type="submit" disabled={loading}>
          {loading ? (<><RefreshCw size={16} className="aw-spin" /> Checking…</>) : (<><Lock size={16} /> Unlock</>)}
        </button>
      </form>
    </div>
  );
}

/* ============================================================
   Admin dashboard — talks to the protected /api/admin/* routes
   ============================================================ */
function AdminDashboard({ token, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const authedFetch = useCallback(
    (path, opts = {}) =>
      fetch(`${API_URL}${path}`, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/admin/notes");
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [authedFetch, onLogout]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    await authedFetch(`/admin/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleExport = async () => {
    const res = await authedFetch("/admin/notes/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const visible = filter === "all" ? notes : notes.filter((n) => n.category === filter);

  return (
    <div className="aw-admin-shell">
      <div className="aw-admin-topbar">
        <h1 className="aw-serif"><Sparkles size={20} color="#C9A467" /> Your Vault</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="aw-icon-btn" onClick={refresh}><RefreshCw size={14} /> Refresh</button>
          <button className="aw-icon-btn" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="aw-icon-btn" onClick={onLogout}><LogOut size={14} /> Log out</button>
        </div>
      </div>

      <div className="aw-stats-row">
        <div className="aw-stat"><div className="n">{notes.length}</div><div className="l">Total notes</div></div>
        {CATEGORIES.map((c) => {
          const count = notes.filter((n) => n.category === c.id).length;
          if (count === 0) return null;
          return (
            <div className="aw-stat" key={c.id}>
              <div className="n">{count}</div>
              <div className="l">{c.emoji} {c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="aw-chips" style={{ marginBottom: "20px" }}>
        <button className={`aw-chip${filter === "all" ? " active" : ""}`}
          style={filter === "all" ? { background: "#2E1620", borderColor: "#2E1620" } : {}}
          onClick={() => setFilter("all")}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`aw-chip${filter === c.id ? " active" : ""}`}
            style={filter === c.id ? { background: c.color, borderColor: c.color } : {}}
            onClick={() => setFilter(c.id)}>
            <span>{c.emoji}</span><span>{c.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#A18F82" }}>Loading your notes…</p>
      ) : visible.length === 0 ? (
        <div className="aw-empty"><p>Nothing here yet. Once notes come in, they'll show up in this space.</p></div>
      ) : (
        visible.map((n) => {
          const meta = categoryMeta(n.category);
          return (
            <div className="aw-note-card" key={n.id} style={{ borderLeftColor: meta.color }}>
              <div className="aw-note-head">
                <div>
                  <div className="aw-note-tag" style={{ color: meta.color }}><span>{meta.emoji}</span> {meta.label}</div>
                  <div className="aw-note-meta">From {n.name} · {new Date(n.created_at).toLocaleString()}</div>
                </div>
                <button className="aw-del-btn" onClick={() => handleDelete(n.id)} title="Delete"><Trash2 size={16} /></button>
              </div>
              <p className="aw-note-body">{n.message}</p>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ============================================================
   Root app — routes purely on window.location.hash.
   There is no visible link to the admin area anywhere in the UI.
   Reach it directly at: <your-url>#admin
   ============================================================ */
export default function App() {
  const [route, setRoute] = useState(window.location.hash === "#admin" ? "admin" : "public");
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || null);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash === "#admin" ? "admin" : "public");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const goPublic = () => {
    window.location.hash = "";
    setRoute("public");
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <div className="aw-root">
      <GlobalStyles />
      <Floaters />
      <div className="aw-noise" />
      <div className={route === "admin" ? "aw-wrap aw-admin-shell" : "aw-wrap"}>
        {route === "public" && (
          <>
            <div className="aw-hero">
              <div className="aw-icon-wrap"><Heart size={24} color="white" fill="white" /></div>
              <h1 className="aw-serif">{CONFIG.title}</h1>
              <p>{CONFIG.subtitle}</p>
            </div>
            <PublicForm />
          </>
        )}

        {route === "admin" && !token && <AdminLogin onSuccess={setToken} onBack={goPublic} />}
        {route === "admin" && token && <AdminDashboard token={token} onLogout={goPublic} />}
      </div>
    </div>
  );
}
