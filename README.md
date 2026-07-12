# Vehicle Inventory — DMS Module

Foundations for the Vehicle Inventory module of the DMS system. This phase is infrastructure and scaffolding only — see `CLAUDE.md` for architecture rules. No Vehicle Inventory features are implemented yet.

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
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000. `http://localhost:3000/api/health` should return `{"status":"ok","timestamp":"..."}`.

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
