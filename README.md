# RolloutBoard

Live overview board for PC rollouts. PCs report their setup steps via HTTP
POST (from ACMP client commands); a big-monitor page shows one tile per PC.
See `docs/PRD.md`.

```
PC (ACMP client command) --POST--> Supabase Edge Function `report`
   --> table `events` --realtime--> React page on GitHub Pages
```

## 1. What to fill into the ACMP client command

| Field | Value |
|---|---|
| URL | `https://<project-ref>.supabase.co/functions/v1/report` |
| Method | `POST` |
| Header | `Content-Type: application/json` |
| Body | see below |

Body template (use the ACMP variable that holds the computer name in place of
`%COMPUTERNAME%`):

```json
{"client":"%COMPUTERNAME%","text":"Installing TeamViewer","state":"running"}
```

| Field | Required | Meaning |
|---|---|---|
| `client` | yes | PC ID, normally the computer name (max 100 chars) |
| `text` | yes | What happens (max 500 chars) |
| `state` | no (`running`) | `running`, `done` (step OK), `error` (step failed), `finished` (whole PC done, tile turns green and leaves the board) |

Reply: `200 {"ok":true}` or `400 {"ok":false,"error":"..."}`.

**If the ACMP command cannot send a body**, use query parameters instead
(URL-encode spaces as `%20`):

```
https://<project-ref>.supabase.co/functions/v1/report?client=%COMPUTERNAME%&text=Installing%20TeamViewer&state=running
```

### Test with curl

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/report" \
  -H "Content-Type: application/json" \
  -d '{"client":"PC-01","text":"Installing TeamViewer","state":"running"}'
```

### PowerShell backup

```powershell
Invoke-RestMethod -Method Post -Uri "https://<project-ref>.supabase.co/functions/v1/report" `
  -ContentType "application/json" `
  -Body (@{ client = $env:COMPUTERNAME; text = "Installing TeamViewer"; state = "running" } | ConvertTo-Json)
```

## 2. Supabase setup (once)

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push                 # creates table `events` + RLS + realtime
npx supabase functions deploy report # verify_jwt = false is set in supabase/config.toml
```

The edge function uses the service key that Supabase injects itself. It is
never in this repo.

## 3. Run locally

```bash
cp .env.example .env.local   # fill in URL + publishable anon key
npm install
npm run dev
```

## 4. Deploy (GitHub Pages)

In the GitHub repo: *Settings → Pages → Source: GitHub Actions*, and under
*Settings → Secrets and variables → Actions* add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` (publishable anon key only – never the service_role
key). Every push to `main` builds and deploys to
`https://diewahrepalme.github.io/RolloutBoard/`.

## Board colors

Blue = working · red = last event is `error` · green = `finished` (disappears
after ~10 s unless "Fertige zeigen") · grey = no event for 30+ min (a countdown "ruhig in m:ss" runs on working tiles).
"Board leeren" hides everything older than now in this browser only.
