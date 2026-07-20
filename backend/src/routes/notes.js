import { Router } from "express";
import crypto from "crypto";
import { run } from "../db.js";

const router = Router();

const ALLOWED_CATEGORIES = ["love", "wish", "memory", "growth", "cherish", "note"];

// POST /api/notes — anyone can submit a note. No auth required.
router.post("/", (req, res) => {
  const { name, category, message } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: "Your message can't be empty." });
  }

  const safeCategory = ALLOWED_CATEGORIES.includes(category) ? category : "note";

  const note = {
    id: crypto.randomUUID(),
    name: (name && String(name).trim().slice(0, 60)) || "Someone",
    category: safeCategory,
    message: String(message).trim().slice(0, 2000),
    created_at: new Date().toISOString(),
  };

  run(
    "INSERT INTO notes (id, name, category, message, created_at) VALUES (?, ?, ?, ?, ?)",
    [note.id, note.name, note.category, note.message, note.created_at]
  );

  res.status(201).json({ ok: true });
});

export default router;
