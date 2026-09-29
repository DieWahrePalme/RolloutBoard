# RolloutBoard – PRD (MVP)

Working title was "ACMP_Client_Overview".

## 1. Problem

Moritz sets up 20–30 PCs at once with **ACMP** (Aagon client management).
ACMP shows each client's state, but not as one quick glance for a whole
setup batch. He wants a single big-monitor page that shows every PC in the
current rollout and what it is doing right now.

## 2. Idea

ACMP **client commands** on each PC send small HTTP POST requests
("Installing TeamViewer", "Edge update done", "finished"). RolloutBoard
collects them and shows one tile per PC in a dense grid, like the per-core
view in Windows Task Manager. Data flows one way only: PCs → board.

User: only Moritz. Device: a big desktop monitor. No phone layout needed.

## 3. Goal of the MVP

Answer one question fast: **"Does this work in a real rollout?"**
Build it in one day, try it the next day. Security and polish come later
(see §8).

## 4. Architecture

```
PC (ACMP client command / PowerShell)
   │  POST https://<project>.supabase.co/functions/v1/report
   ▼
Supabase Edge Function `report`  (no JWT required)
   │  insert
   ▼
Supabase Postgres table `events`
   │  realtime (INSERT)
   ▼
React + TypeScript page (Vite) on GitHub Pages
```

- GitHub Pages is static and cannot receive POSTs, so Supabase does the
  receiving and storing.
- Separate Supabase project **RolloutBoard** (region Frankfurt). Not the
  DoYouKnow project.
- Frontend uses only the Supabase URL and the publishable anon key.
  **The service_role key never goes into the frontend, the repo, or GitHub
  secrets used by the Pages build.** The edge function uses the key Supabase
  injects automatically.

## 5. Report API

`POST /functions/v1/report`

Accept **JSON body** and, as a fallback for ACMP limits, **query parameters**
(`?client=PC-01&text=...&state=...`). Allow CORS. No auth header required
(`verify_jwt = false`).

| Field | Required | Meaning |
|---|---|---|
| `client` | yes | Unique PC ID, normally the computer name. Max 100 chars. |
| `text` | yes | What happens, e.g. "Installing TeamViewer". Max 500 chars. |
| `state` | no, default `running` | `running`, `done`, `error`, `finished` |

- `done` = this step finished OK. `error` = this step failed.
- `finished` = the whole PC is done → tile turns green and leaves the board.
- Reply `200 {"ok":true}` or `400` with a short error message.

Table `events`: `id bigint identity`, `client text`, `text text`,
`state text check (state in (...))`, `created_at timestamptz default now()`.
RLS on: anon may `select` only; inserts only via the edge function.

**Decided:** reports are sent by ACMP's own HTTP request in the client
command (more future-proof than scripts). The README must show exactly what
to fill into that command: URL, method POST, header
`Content-Type: application/json`, and a JSON body template such as
`{"client":"%COMPUTERNAME%","text":"Installing TeamViewer","state":"running"}`
(use whatever ACMP variable holds the computer name). Keep the query-parameter
fallback in case the ACMP command can't send a body.

Also include `curl` for testing, and a PowerShell one-liner as a backup:

```powershell
Invoke-RestMethod -Method Post -Uri "https://<project>.supabase.co/functions/v1/report" `
  -ContentType "application/json" `
  -Body (@{ client = $env:COMPUTERNAME; text = "Installing TeamViewer"; state = "running" } | ConvertTo-Json)
```

## 6. Board UI (see `docs/sketch.jpg`, photo is upside down)

- **Header bar**: title, counters (working / error / finished / stale),
  toggle "show finished", button "clear board".
- **Grid of tiles**, dense, many per row, fits 30+ PCs on one screen.
- **Tile**: PC name on top; below, the **last 3 events** as a list with an
  icon each (⏳ running, ✓ done, ✗ error) and time.
- **Colors**: blue = working, red = last event is `error`, green =
  `finished` (fades out after ~10 s unless "show finished" is on),
  grey = no event for 30+ min (countdown shown on working tiles).
- **Click a tile** → detail panel/modal with **all** events of that PC,
  with timestamps.
- **Live**: new events appear without reload (Supabase realtime). Load
  recent events on start (e.g. last 24 h).
- **Clear board**: hides everything older than "now" for this browser
  (store the timestamp in localStorage). Nothing is deleted in the DB.
- Dark theme, readable from a distance.

## 7. Hosting & repo

- Public GitHub repo `DieWahrePalme/RolloutBoard`, main branch `main`.
- GitHub Actions workflow builds with Vite and deploys to GitHub Pages on
  push to `main` (base path `/RolloutBoard/`).
- Build env from repo secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Edge function and SQL live in `supabase/` and are deployed with
  `npx supabase` (CLI is not installed globally).

## 8. Out of scope for MVP (later)

- Auth / secret token for reports (right now anyone who knows the URL can
  post and read). **First thing to add after the test.**
- Deleting old events automatically.
- Multiple rollouts/batches, phone layout, notifications, sounds.

## 9. Open questions

- Is it OK with Moritz's employer to send PC names and status texts to
  Supabase (EU region)?
