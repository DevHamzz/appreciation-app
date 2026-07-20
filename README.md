# Tell Me Something — Appreciation Wall

A full-stack app where anyone can leave you a free-form note (love, a wish,
a memory, feedback, whatever's on their mind), and only you can read them
in a password-protected vault that nobody else knows exists.

```
appreciation-app/
├── backend/     Express + SQLite API
└── frontend/    React + Vite app
```

## How it works

- **Public page** — a single, beautiful form. Anyone with the link can write
  and send a note. No login, no friction.
- **Admin vault** — there is no visible link, button, or hint anywhere on the
  public page pointing to it. You reach it by adding `#admin` to the site's
  URL yourself, then entering the password. Submitters have no way to find it.
- **Real backend** — notes are stored in a real SQLite database on your
  server, not in the browser. The admin routes are protected by a password
  check that issues a short-lived signed token (JWT); every admin action
  (list, delete, export) requires that token.

## 1. Run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your real values:

```
ADMIN_PASSWORD="24434@$$#$"
JWT_SECRET=some-long-random-string-you-make-up
FRONTEND_ORIGIN=http://localhost:5173
```

> ⚠️ The password is quoted in the `.env` file on purpose — without quotes,
> the `#` character gets treated as a comment and silently truncates it.
> Keep the quotes if you change the password to something with `#`, `$`,
> spaces, or similar characters.

Start it:

```bash
npm run dev
```

You should see `Backend running on http://localhost:4000`.

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). That's your
public form.

To open the admin vault, go to `http://localhost:5173/#admin` and enter your
password.

## 3. Deploying it for real

- **Frontend** → build with `npm run build` inside `frontend/`, then deploy
  the `dist/` folder to Netlify, Vercel, or similar. Set the environment
  variable `VITE_API_URL` to your deployed backend's URL before building.
- **Backend** → deploy the `backend/` folder to Render, Railway, or a small
  VPS. Set `PORT`, `ADMIN_PASSWORD`, `JWT_SECRET`, and `FRONTEND_ORIGIN`
  (your deployed frontend's URL) as environment variables there.
- Once both are live, the admin vault is reached the same way: your
  frontend's live URL followed by `#admin`.

## A note on the database

The backend uses `sql.js` — SQLite compiled to WebAssembly — instead of a
native SQLite driver. That's a deliberate choice: native drivers need a C++
build toolchain installed on your machine to compile during `npm install`,
which is a common source of install failures on Windows (missing Visual
Studio Build Tools) or with very new Node versions that don't have
prebuilt binaries yet. `sql.js` needs none of that — `npm install` just
works, on any OS, any Node version.

## Swapping SQLite for PostgreSQL

If you outgrow SQLite and want real PostgreSQL:

1. `npm install pg` in `backend/`.
2. Replace `backend/src/db.js` with a `pg.Pool` connected via a
   `DATABASE_URL` environment variable — full example is commented at the
   bottom of that file.
3. Update the `.prepare(...).run(...)` / `.all()` calls in
   `routes/notes.js` and `routes/admin.js` to `pool.query(...)` calls. The
   table shape (`id`, `name`, `category`, `message`, `created_at`) stays
   identical, so nothing else changes.

## Personalizing it

Edit the `CONFIG` object at the top of `frontend/src/App.jsx` to change the
headline and subtitle. The six note categories (Love, Wish, Memory, Growth,
Cherish, Just Because) live in the `CATEGORIES` array right below it, in
both `App.jsx` and `backend/src/routes/notes.js` — keep both lists in sync
if you add or rename one.
