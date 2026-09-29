# RolloutBoard

Live overview board for PC rollouts. PCs report their setup steps via HTTP
POST (from ACMP client commands); a big-monitor page shows one tile per PC.

What we are building and why:
@docs/PRD.md

Where we left off last time (read first):
@docs/HANDOFF.md

## About the user

Moritz is not a professional developer. He often writes from his phone
(Remote Control), in German or English – reply in his language. Explain
simply and give exact commands to paste.

## Stack

- Vite + React + TypeScript (frontend), plain CSS is fine.
- Supabase: Postgres table `events`, Edge Function `report`, realtime.
  Use `npx supabase ...` (the CLI is not installed globally).
- GitHub Pages via GitHub Actions, public repo `DieWahrePalme/RolloutBoard`.

## Rules

- **Never put the Supabase service_role key** in the frontend, the repo,
  `.env` files that get committed, or the Pages build secrets. Frontend uses
  only the URL and the publishable anon key.
- The repo is **public**: no real PC names, customer data or secrets in code,
  tests, screenshots or commit messages. Use fake names like `PC-01`.
- Commit in small steps with clear messages. Ask Moritz before pushing,
  creating repos, or changing GitHub/Supabase settings.
- Run `npx tsc --noEmit` and `npm run build` before saying something works.
- Keep the MVP small (PRD §3). Ideas outside the scope go into PRD §8.
- **Before Moritz ends a session** (or when he says "handoff"), update docs/HANDOFF.md: replace it with the current state, keep it short. It is loaded automatically at the next start.

## Reference material

`.claude/agents/`, `.claude/skills/` and `.claude/rules/ecc/` are copied
from the DoYouKnow project (a curated subset of github.com/affaan-m/ecc).
Some files mention React Native/Expo – ignore those parts here. Not
auto-loaded: read the relevant file for reviews, security or git/GitHub work.
