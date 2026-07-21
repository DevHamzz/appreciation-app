import React, { useState, useEffect, useCallback } from "react";
import { Heart, Send, Sparkles, Lock, Trash2, Download, LogOut, RefreshCw, ChevronLeft } from "lucide-react";

/* ============================================================
   CONFIG — tweak these to personalize the page
   ============================================================ */
const CONFIG = {
  subtitle: "Only I will read these. Be as honest as you like.",
};

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:4000/api";

const TOKEN_KEY = "aw_admin_token";

const CATEGORIES = [
  { id: "love", label: "Something I love", emoji: "❤️", color: "#B4573F" },
  { id: "wish", label: "A wish for you", emoji: "✨", color: "#6B8F71" },
  { id: "memory", label: "A memory", emoji: "📸", color: "#C9A467" },
  { id: "growth", label: "Room to grow", emoji: "🌱", color: "#5B7553" },
  { id: "cherish", label: "What I cherish", emoji: "💎", color: "#7C5C9C" },
  { id: "note", label: "Just because", emoji: "💌", color: "#8A7A6D" },
];

// The five fixed parts of the public form — each becomes its own
// tagged note when submitted, so the admin side can still filter by
// category without any backend changes.
const PARTS = [
  { id: "love", num: 1, emoji: "❤️", label: "Love", hint: "What do you appreciate about me?", color: "#B4573F" },
  { id: "wish", num: 2, emoji: "✨", label: "Wish", hint: "What do you hope for my future?", color: "#6B8F71" },
  { id: "growth", num: 3, emoji: "🔄", label: "Change", hint: "What would you like me to improve?", color: "#C9A467" },
  { id: "memory", num: 4, emoji: "📸", label: "Memory", hint: "Describe our fondest moment.", color: "#5B7553" },
  { id: "cherish", num: 5, emoji: "💎", label: "Cherish", hint: "What would you miss most about me?", color: "#7C5C9C" },
];

function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

/* ============================================================
   Global styles — liquid glass system
   ============================================================ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }
      body { margin: 0; }

      .aw-root {
        font-family: 'Inter', -apple-system, sans-serif;
        background: linear-gradient(160deg, #FBF3EA 0%, #F3E6D8 45%, #ECD9C4 100%);
        min-height: 100vh;
        color: #3B1F2B;
        position: relative;
        overflow-x: hidden;
      }
      .aw-serif { font-family: 'Fraunces', serif; }

      .aw-orbs { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
      .aw-orb {
        position: absolute; border-radius: 50%; filter: blur(70px);
        opacity: 0.55; animation: aw-drift 22s ease-in-out infinite;
      }
      .aw-orb.o1 { width: 380px; height: 380px; top: -120px; left: -80px; background: radial-gradient(circle, #E7B98A, transparent 70%); }
      .aw-orb.o2 { width: 320px; height: 320px; top: 10%; right: -100px; background: radial-gradient(circle, #C98BA0, transparent 70%); animation-delay: -6s; }
      .aw-orb.o3 { width: 300px; height: 300px; bottom: -80px; left: 8%; background: radial-gradient(circle, #9FBF9A, transparent 70%); animation-delay: -12s; }
      .aw-orb.o4 { width: 260px; height: 260px; bottom: 12%; right: 10%; background: radial-gradient(circle, #C6A5DC, transparent 70%); animation-delay: -18s; }
      @keyframes aw-drift {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(24px, -18px) scale(1.06); }
        66% { transform: translate(-18px, 20px) scale(0.96); }
      }
      @media (prefers-reduced-motion: reduce) {
        .aw-orb, .aw-floaters span { animation: none !important; }
      }

      .aw-floaters { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
      .aw-floaters span {
        position: absolute; font-size: 20px; opacity: 0.16;
        animation: aw-float 14s ease-in-out infinite; user-select: none;
        filter: drop-shadow(0 1px 1px rgba(255,255,255,0.4));
      }
      @keyframes aw-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-26px) rotate(8deg); }
      }

      .aw-wrap { max-width: 620px; margin: 0 auto; padding: 64px 20px 80px; position: relative; z-index: 1; }
      .aw-admin-shell { max-width: 780px; }

      .aw-hero { text-align: center; margin-bottom: 40px; }
      .aw-hero .aw-icon-wrap {
        width: 60px; height: 60px; margin: 0 auto 20px; border-radius: 50%;
        background: linear-gradient(150deg, #E9C88F, #B4573F 75%);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 10px 26px -8px rgba(180,87,63,0.55), inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.15);
        position: relative;
      }
      .aw-hero .aw-icon-wrap::after {
        content: ''; position: absolute; top: 5px; left: 12px; width: 18px; height: 10px;
        border-radius: 50%; background: rgba(255,255,255,0.55); filter: blur(2px);
      }
      .aw-hero h1 { font-size: clamp(32px, 6vw, 46px); font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 14px; color: #2E1620; }
      .aw-hero h1 .aw-accent {
        background: linear-gradient(120deg, #B4573F, #C9A467);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .aw-hero p { color: #6E5A4E; font-size: 16px; max-width: 420px; margin: 0 auto; line-height: 1.5; }

      .aw-glass {
        position: relative;
        background: linear-gradient(160deg, rgba(255,255,255,0.62), rgba(255,255,255,0.28));
        backdrop-filter: blur(22px) saturate(180%);
        -webkit-backdrop-filter: blur(22px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.55);
        border-radius: 26px;
        box-shadow:
          0 20px 50px -24px rgba(59,31,43,0.45),
          inset 0 1px 0 rgba(255,255,255,0.7),
          inset 0 -1px 0 rgba(59,31,43,0.06);
        overflow: hidden;
      }
      .aw-glass::before {
        content: '';
        position: absolute; top: -60%; left: -25%;
        width: 65%; height: 220%;
        background: linear-gradient(115deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%);
        transform: rotate(12deg);
        pointer-events: none;
      }
      .aw-glass > * { position: relative; z-index: 1; }

      .aw-card { padding: 32px; }
      .aw-name-card { padding: 22px 24px; margin-bottom: 20px; }
      .aw-part-card { padding: 24px; margin-bottom: 20px; border-top: 2px solid; }

      .aw-field { margin-bottom: 22px; }
      .aw-label { display: block; font-size: 13px; font-weight: 600; color: #6E5A4E; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
      .aw-input, .aw-textarea {
        width: 100%; border: 1.5px solid rgba(59,31,43,0.12); background: rgba(255,255,255,0.55);
        backdrop-filter: blur(6px);
        border-radius: 14px; padding: 13px 16px; font-size: 15px; font-family: inherit; color: #2E1620;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      }
      .aw-input:focus, .aw-textarea:focus { outline: none; border-color: #C9A467; background: rgba(255,255,255,0.85); box-shadow: 0 0 0 4px rgba(201,164,103,0.22); }
      .aw-textarea { min-height: 90px; resize: vertical; line-height: 1.6; }

      .aw-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .aw-chip {
        border: 1.5px solid rgba(255,255,255,0.55);
        background: rgba(255,255,255,0.45);
        backdrop-filter: blur(10px);
        border-radius: 999px;
        padding: 8px 14px; font-size: 13.5px; font-weight: 500; cursor: pointer;
        display: flex; align-items: center; gap: 6px; transition: all 0.15s; color: #4A3A32;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
      }
      .aw-chip:hover { border-color: rgba(180,87,63,0.4); transform: translateY(-1px); }
      .aw-chip.active { color: white; border-color: transparent; box-shadow: 0 6px 16px -6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4); }

      .aw-submit {
        width: 100%; border: none; border-radius: 16px; padding: 15px; font-size: 15.5px; font-weight: 600;
        color: white;
        background: linear-gradient(150deg, #DDA96C, #B4573F 80%);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: transform 0.15s, box-shadow 0.15s;
        box-shadow: 0 14px 34px -12px rgba(180,87,63,0.65), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.12);
        position: relative; overflow: hidden;
      }
      .aw-submit::before {
        content: ''; position: absolute; top: -80%; left: -20%; width: 50%; height: 260%;
        background: linear-gradient(115deg, rgba(255,255,255,0.5), transparent 60%);
        transform: rotate(12deg); pointer-events: none;
      }
      .aw-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 40px -12px rgba(180,87,63,0.75), inset 0 1px 0 rgba(255,255,255,0.55); }
      .aw-submit:active:not(:disabled) { transform: translateY(0px) scale(0.99); }
      .aw-submit:disabled { opacity: 0.55; cursor: not-allowed; }

      .aw-footnote { text-align: center; margin-top: 22px; font-size: 12.5px; color: #A18F82; }

      .aw-seal-wrap { text-align: center; padding: 46px 20px; animation: aw-fadein 0.4s ease; }
      .aw-envelope { width: 84px; height: 60px; margin: 0 auto 26px; position: relative; animation: aw-seal-pop 0.6s cubic-bezier(.34,1.56,.64,1); }
      .aw-envelope svg { width: 100%; height: 100%; filter: drop-shadow(0 8px 14px rgba(180,87,63,0.35)); }
      @keyframes aw-seal-pop {
        0% { transform: scale(0.4) rotate(-8deg); opacity: 0; }
        60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes aw-fadein { from { opacity: 0; } to { opacity: 1; } }
      .aw-seal-wrap h2 { font-size: 24px; margin-bottom: 8px; color: #2E1620; }
      .aw-seal-wrap p { color: #6E5A4E; font-size: 14.5px; }
      .aw-again-btn {
        margin-top: 24px; border: 1.5px solid rgba(59,31,43,0.16); background: rgba(255,255,255,0.4);
        backdrop-filter: blur(8px); border-radius: 999px;
        padding: 10px 22px; font-size: 13.5px; font-weight: 600; color: #6E5A4E; cursor: pointer;
        transition: all 0.15s;
      }
      .aw-again-btn:hover { border-color: #C9A467; color: #B4573F; transform: translateY(-1px); }

      .aw-error { color: #A23B2E; font-size: 13px; margin-top: -12px; margin-bottom: 18px; text-align: center; }
      .aw-spin { animation: aw-spin 0.9s linear infinite; }
      @keyframes aw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      .aw-part-head { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 16px; color: #2E1620; }
      .aw-part-num {
        width: 32px; height: 32px; border-radius: 50%; color: white;
        display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
        position: relative;
        box-shadow: inset 0 2px 3px rgba(255,255,255,0.55), inset 0 -3px 5px rgba(0,0,0,0.18), 0 4px 10px -4px rgba(0,0,0,0.35);
      }
      .aw-part-num::after {
        content: ''; position: absolute; top: 3px; left: 6px; width: 9px; height: 5px;
        border-radius: 50%; background: rgba(255,255,255,0.65); filter: blur(1px);
      }
      .aw-part-hint { color: #8A7A6D; font-size: 13.5px; margin: 8px 0 12px 44px; }
      .aw-part-card textarea { width: 100%; }

      .aw-admin-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
      .aw-admin-topbar h1 { font-size: 24px; font-weight: 600; color: #2E1620; display: flex; align-items: center; gap: 10px; margin: 0; }
      .aw-icon-btn {
        border: 1.5px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.4); backdrop-filter: blur(10px);
        border-radius: 12px; padding: 9px 14px;
        font-size: 13px; font-weight: 600; color: #4A3A32; cursor: pointer;
        display: flex; align-items: center; gap: 6px; transition: all 0.15s;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
      }
      .aw-icon-btn:hover { border-color: #B4573F; color: #B4573F; transform: translateY(-1px); }

      .aw-stats-row { display: flex; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
      .aw-stat { padding: 12px 18px; min-width: 90px; border-radius: 16px; }
      .aw-stat .n { font-size: 22px; font-weight: 700; color: #2E1620; }
      .aw-stat .l { font-size: 11.5px; color: #8A7A6D; text-transform: uppercase; letter-spacing: 0.04em; }

      .aw-note-card { border-left-width: 5px; padding: 20px; margin-bottom: 14px; transition: box-shadow 0.2s, transform 0.2s; border-radius: 18px; }
      .aw-note-card:hover { transform: translateY(-2px); }
      .aw-note-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
      .aw-note-tag { font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 4px; }
      .aw-note-meta { font-size: 12px; color: #A18F82; }
      .aw-note-body { color: #3B1F2B; line-height: 1.65; font-size: 15px; white-space: pre-wrap; word-break: break-word; }
      .aw-del-btn { background: none; border: none; color: #C9BBB0; cursor: pointer; padding: 4px; }
      .aw-del-btn:hover { color: #A23B2E; }

      .aw-empty { text-align: center; padding: 60px 20px; color: #A18F82; border-radius: 20px; }

      .aw-login-box { max-width: 340px; margin: 100px auto 0; padding: 36px 30px; text-align: center; }
      .aw-login-box .lock-wrap {
        width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(150deg, #4A2E38, #241019);
        color: #E9C88F; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px;
        box-shadow: inset 0 2px 3px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.4), 0 8px 20px -8px rgba(0,0,0,0.5);
      }
      .aw-login-box h2 { font-size: 19px; margin-bottom: 18px; color: #2E1620; }
      .aw-back-link { display: inline-flex; align-items: center; gap: 4px; color: #A18F82; font-size: 13px; text-decoration: none; cursor: pointer; background: none; border: none; margin-bottom: 18px; }
      .aw-back-link:hover { color: #6E5A4E; }

      @media (max-width: 480px) {
        .aw-card { padding: 24px 18px; }
        .aw-part-card { padding: 20px 18px; }
        .aw-part-hint { margin-left: 0; }
        .aw-admin-topbar { flex-direction: column; align-items: flex-start; }
        .aw-glass { backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); }
      }

      button:focus-visible, input:focus-visible, textarea:focus-visible {
        outline: 2px solid #B4573F; outline-offset: 2px;
      }
    `}</style>
  );
}

function AmbientOrbs() {
  return (
    <div className="aw-orbs" aria-hidden="true">
      <div className="aw-orb o1" />
      <div className="aw-orb o2" />
      <div className="aw-orb o3" />
      <div className="aw-orb o4" />
    </div>
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

function PublicForm() {
  const [name, setName] = useState("");
  const [values, setValues] = useState({ love: "", wish: "", growth: "", memory: "", cherish: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const updatePart = (id, val) => setValues((prev) => ({ ...prev, [id]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toSend = PARTS.filter((p) => values[p.id].trim());
    if (toSend.length === 0) {
      setError("Write at least one part before sending.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const results = await Promise.all(
        toSend.map((p) =>
          fetch(`${API_URL}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category: p.id, message: values[p.id] }),
          })
        )
      );

      const failed = results.some((r) => !r.ok);
      if (failed) throw new Error("Something went wrong");

      setSent(true);
      setName("");
      setValues({ love: "", wish: "", growth: "", memory: "", cherish: "" });
    } catch (err) {
      setError("That didn't send. Mind giving it another try?");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="aw-glass aw-card aw-seal-wrap">
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
    <form onSubmit={handleSubmit}>
      <div className="aw-glass aw-name-card">
        <label className="aw-label" htmlFor="aw-name">Your name (optional)</label>
        <input
          id="aw-name"
          className="aw-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Stay anonymous, or say hi"
          maxLength={60}
        />
      </div>

      {PARTS.map((p) => (
        <div className="aw-glass aw-part-card" key={p.id} style={{ borderTopColor: p.color }}>
          <div className="aw-part-head">
            <span className="aw-part-num" style={{ background: `linear-gradient(150deg, ${p.color}, ${p.color}dd)` }}>{p.num}</span>
            <span>{p.emoji} {p.label}</span>
          </div>
          <p className="aw-part-hint">{p.hint}</p>
          <textarea
            className="aw-textarea"
            rows={2}
            value={values[p.id]}
            onChange={(e) => updatePart(p.id, e.target.value)}
            maxLength={2000}
          />
        </div>
      ))}

      {error && <p className="aw-error">{error}</p>}

      <div className="aw-glass aw-card" style={{ textAlign: "center" }}>
        <button className="aw-submit" type="submit" disabled={submitting}>
          {submitting ? (<><RefreshCw size={17} className="aw-spin" /> Sending…</>) : (<><Send size={17} /> Send all 5 parts</>)}
        </button>
        <p className="aw-footnote">I'm the only one that's gonna see it, Write freely 💛</p>
      </div>
    </form>
  );
}

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
    <div className="aw-glass aw-login-box">
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
        <div className="aw-glass aw-stat"><div className="n">{notes.length}</div><div className="l">Total notes</div></div>
        {CATEGORIES.map((c) => {
          const count = notes.filter((n) => n.category === c.id).length;
          if (count === 0) return null;
          return (
            <div className="aw-glass aw-stat" key={c.id}>
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
        <div className="aw-glass aw-empty"><p>Nothing here yet. Once notes come in, they'll show up in this space.</p></div>
      ) : (
        visible.map((n) => {
          const meta = categoryMeta(n.category);
          return (
            <div className="aw-glass aw-note-card" key={n.id} style={{ borderLeftColor: meta.color }}>
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
      <AmbientOrbs />
      <Floaters />
      <div className={route === "admin" ? "aw-wrap aw-admin-shell" : "aw-wrap"}>
        {route === "public" && (
          <>
            <div className="aw-hero">
              <div className="aw-icon-wrap"><Heart size={24} color="white" fill="white" /></div>
              <h1 className="aw-serif">Tell me in <span className="aw-accent">5 parts</span> 🧩</h1>
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