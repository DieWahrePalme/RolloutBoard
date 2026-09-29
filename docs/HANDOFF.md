# Handoff (2026-09-29)

Public repo: no keys, no real PC names here.

## Current state

- MVP is built, deployed and working end to end (tested with curl and the demo).
- Board: https://diewahrepalme.github.io/RolloutBoard/ (GitHub Pages, deploys on push to `main`).
  Demo with 30 fake PCs: add `?demo` to the URL.
- Supabase project "RolloutBoard" (region Ireland, not Frankfurt as in the PRD; Moritz accepted
  this for the test). Project ref: see Supabase dashboard or local `.env.local`.
- Table `events` (RLS: anon may only select; realtime on), edge function `report`
  (`verify_jwt = false`, accepts JSON body or query parameters; GET also works).
- Pages secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set by Moritz.
  The Supabase access token used for deploying was revoked.

## Built / decided this session

- Vite + React + TS frontend; live via Supabase realtime, last 24 h loaded on start.
- Fixed grid 6 x 5 = 30 PCs per page, pager in the header for more.
- Tile: name centered, small status dot (blue working, red error, green finished, grey stale),
  up to 8 latest events (clipped by tile height), countdown to "inactive" next to the newest event.
- Stale after 30 min without event (was 15 in the PRD; PRD and README updated).
  Finished tiles fade out after ~10 s unless "Fertige zeigen".
- Look inspired by the Linear DESIGN.md (voltagent/awesome-design-md): near-black canvas,
  hairline borders, lavender accent, system fonts (no external font requests).
- Demo mode `?demo` (`src/lib/demo.ts`) for design work without real data.
- Decided against installing vercel-labs/agent-skills and leonxlnx/taste-skill
  (taste-skill is not meant for dashboards; web-design-guidelines fetches live rules).

## In progress / not tested yet

- **Real ACMP test worked** (Moritz confirmed, 2026-09-29). Earlier the ACMP dialog showed
  "invalid or unknown response" while curl worked; the cause was a VPN on the work PC (board
  showed "getrennt"), fixed by Moritz. Not verified: a full rollout with 20-30 PCs.
- Design was never checked on the real big monitor. Tweaks expected (font size, spacing).

## Next steps (most important first)

1. Try a real batch rollout and collect feedback (tile readability from a distance, stale limit).
2. Add the real ACMP variable for the computer name to the README once Moritz names it.
3. Adjust design after seeing it on the monitor.
4. PRD §8: secret token for reports (anyone who knows the URL can post and read) is the
   first thing to add after the test; automatic cleanup of old events.
5. Open question (PRD §9): is sending PC names and status texts to Supabase OK with the employer?

## Useful commands

```bash
npm run dev                    # local, http://localhost:5173/RolloutBoard/ (add ?demo)
npx tsc --noEmit && npm run build
SUPABASE_ACCESS_TOKEN=<new token> npx supabase functions deploy report
SUPABASE_ACCESS_TOKEN=<new token> npx supabase db push
```

Moritz must run supabase commands himself with the `!` prefix (auto mode blocks them for Claude).
`.env.local` (git-ignored) holds the Supabase URL and publishable anon key for local runs.
