import { Router } from "express";
import { run, all } from "../db.js";
import { signAdminToken, requireAdmin } from "../auth.js";

const router = Router();

// POST /api/admin/login — the only unprotected admin route.
router.post("/login", (req, res) => {
  const { password } = req.body || {};

  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.json({ token: signAdminToken() });
  }

  res.status(401).json({ error: "Incorrect password" });
});

// GET /api/admin/notes — list every note, newest first.
router.get("/notes", requireAdmin, (req, res) => {
  const notes = all("SELECT * FROM notes ORDER BY created_at DESC");
  res.json({ notes });
});

// DELETE /api/admin/notes/:id — remove a single note.
router.delete("/notes/:id", requireAdmin, (req, res) => {
  run("DELETE FROM notes WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// GET /api/admin/notes/export — download everything as CSV.
router.get("/notes/export", requireAdmin, (req, res) => {
  const notes = all("SELECT * FROM notes ORDER BY created_at DESC");

  let csv = "Category,Name,Date,Message\n";
  notes.forEach((n) => {
    const msg = n.message.replace(/"/g, '""').replace(/\n/g, " ");
    csv += `"${n.category}","${n.name}","${n.created_at}","${msg}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="notes.csv"');
  res.send(csv);
});

export default router;
