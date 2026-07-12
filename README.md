# Vehicle Inventory — DMS Module

The Vehicle Inventory module of the DMS system. See `CLAUDE.md` for architecture rules. Implemented so far: auth (login/signup) and the main inventory dashboard (KPI summary + filterable/sortable/searchable vehicle table).

## Stack

| Layer           | Choice                           |
| --------------- | -------------------------------- |
| Framework       | Next.js (App Router, TypeScript) |
| Styling         | Tailwind CSS                     |
| Database & Auth | Supabase                         |
| Hosting         | Vercel                           |
| Tests           | Vitest                           |
| CI              | GitHub Actions                   |

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project at https://supabase.com/dashboard (free tier), then copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your project's API settings.
3. Apply the database schema. A fresh Supabase project has no tables yet — this repo's schema lives in `supabase/migrations/*.sql`, with demo data in `supabase/seed.sql`. With [Docker](https://docs.docker.com/desktop/) running:
   ```bash
   npx supabase start    # boots a local Postgres + Studio instance
   npx supabase db reset # applies every migration, then seeds ~18 demo vehicles
   ```
   `npx supabase status` prints that local instance's API URL and anon key — point `.env.local` at those if you want to develop against local Postgres instead of your hosted project. To apply this schema to a hosted/shared Supabase project instead (no Docker involved), see the "Database (Supabase)" section in `CLAUDE.md`.
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000. `http://localhost:3000/api/health` should return `{"status":"ok","timestamp":"..."}`. Sign up, then visit `/dashboard` to see the seeded vehicle inventory.

### Deploying to Vercel

This scaffold has no Vercel-specific config — a default `next build` is all Vercel needs. Import the repository in the Vercel dashboard ("Add New Project"), or run `npx vercel link` locally, and set the two Supabase env vars above in the Vercel project settings.

## Folder Structure

```
src/
  app/           # routes, layouts, pages, API route handlers — FRONTEND
  components/    # UI components — FRONTEND
  server/
    services/       # business logic
    repositories/    # Supabase queries — the only layer allowed to call Supabase
    actions/          # Server Actions ("use server")
  lib/supabase/       # Supabase client factories (browser + server)
  types/               # shared types
supabase/
  migrations/           # schema, applied in order — see Getting Started
  seed.sql              # demo data, applied via `db reset` locally
```

See `CLAUDE.md` for the full architecture boundary rules — components and pages never call Supabase directly; everything goes through `server/services` or `server/actions`.

## Scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server                      |
| `npm run build`        | Production build                          |
| `npm run lint`         | ESLint, including the FE/BE boundary rule |
| `npm run format`       | Prettier — write formatting fixes         |
| `npm run format:check` | Prettier — check only, used in CI         |
| `npm run test`         | Run the Vitest suite                      |

## Claude Code Harness

`.claude/` contains draft commands, agents, and skills for feature work (e.g. `/create-module`, the `build-feature` agent, the `scaffold-crud` skill). See `CLAUDE.md` for the full list and when to use each.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check, and tests on every push and pull request.
