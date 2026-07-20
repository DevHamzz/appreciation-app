import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "notes.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

/*
  sql.js runs SQLite compiled to WebAssembly — there is nothing to
  compile on your machine, so it installs and runs the same way on
  Windows, Mac, and Linux regardless of Node version. The tradeoff is
  that it keeps the database in memory and we write it to disk
  ourselves after every change (see persist() below), instead of the
  OS handling that automatically like a native SQLite driver would.
*/
export async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  persist();
}

function persist() {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

// Use for INSERT / DELETE / UPDATE — no rows returned.
export function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

// Use for SELECT — returns an array of plain row objects.
export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/*
  ============================================================
  Swapping this out for PostgreSQL in production
  ============================================================
  If you later move this behind a real Postgres database (e.g. on
  Railway, Render, or Supabase):

    npm install pg
    import pg from "pg";
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  Then replace run()/all() above with pool.query(...) calls. The
  table shape stays identical, so routes/notes.js and
  routes/admin.js barely need to change.
*/
