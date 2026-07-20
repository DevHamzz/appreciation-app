import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { initDb } from "./db.js";
import notesRouter from "./routes/notes.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "https://netlify.app"] }));

app.use("/api/notes", notesRouter);
app.use("/api/admin", adminRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start();
