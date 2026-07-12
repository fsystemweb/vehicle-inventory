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
5. (Optional) Run the test suites:
   ```bash
   npm run test      # Vitest — unit/service tests
   npm run test:e2e  # Playwright — real-browser e2e specs under e2e/
   ```
   `test:e2e` starts its own dev server automatically (see `playwright.config.ts`). Flows that require a signed-in user need `QA_TEST_EMAIL`/`QA_TEST_PASSWORD` in `.env.local` — a confirmed Supabase account's credentials (see `.env.example`); without them those specs skip rather than fail.

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

See `CLAUDE.md` for the full architecture boundary rules — components and pages never call Supabase directly; everything goes through `server/services` or `server/actions`. See [`docs/architecture.md`](docs/architecture.md) for a diagram of how the frontend, backend layers, Next.js/Vercel, and Supabase relate.

## Scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server                      |
| `npm run build`        | Production build                          |
| `npm run lint`         | ESLint, including the FE/BE boundary rule |
| `npm run format`       | Prettier — write formatting fixes         |
| `npm run format:check` | Prettier — check only, used in CI         |
| `npm run test`         | Run the Vitest suite                      |
| `npm run test:e2e`     | Run the Playwright e2e suite              |

## Claude Code Harness

`.claude/` contains commands, skills, and agents for feature work in this repo. `CLAUDE.md` documents the conventions they all follow (branching, commit style, boundary rules); this section is a map of what's available and how to run it.

### Commands & skills

| Name              | Defined in                           | Use for                                                            |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------ |
| `/create-module`  | `.claude/commands/create-module.md`  | Scaffold a new repository + service (+ action/route) for a domain  |
| `/generate-tests` | `.claude/commands/generate-tests.md` | Generate Vitest tests for a service/repository/route               |
| `/review-ui`      | `.claude/commands/review-ui.md`      | Check a component/page against the FE/BE boundary rules            |
| `scaffold-crud`   | `.claude/skills/scaffold-crud.md`    | Implementation pattern for CRUD features                           |
| `react-form`      | `.claude/skills/react-form.md`       | Implementation pattern for real-time-validated forms               |
| `api-endpoint`    | `.claude/skills/api-endpoint.md`     | Implementation pattern for thin API routes                         |
| `design-system`   | `.claude/skills/design-system/`      | Visual design system (colors, typography, spacing, radius, motion) |

Invoke a command by typing its slash form (e.g. `/review-ui src/components/VehicleTable.tsx`); skills are pulled in automatically when relevant, or you can name one explicitly.

### Agents

| Agent           | Defined in                        | Day   | Use for                                                                               |
| --------------- | --------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| `build-feature` | `.claude/agents/build-feature.md` | Day 1 | Implement a full vertical slice end-to-end (repository → service → action/route → UI) |
| `migration`     | `.claude/agents/migration.md`     | Day 1 | Draft a Supabase schema migration (SQL, with RLS)                                     |
| `bug-triage`    | `.claude/agents/bug-triage.md`    | Day 2 | Reproduce a reported bug, isolate the root cause, ship the minimal fix                |
| `code-review`   | `.claude/agents/code-review.md`   | Day 2 | Review a diff for boundary violations and correctness before merging                  |
| `qa`            | `.claude/agents/qa.md`            | Day 2 | Real-browser Playwright smoke check — the last gate before pushing                    |

**Running the agents yourself:** agents don't have a slash-command form — you describe the task in plain language and Claude Code spawns the matching agent, or you can name one explicitly if you want to be sure which one runs:

- **`build-feature`** — describe the feature you want end-to-end, e.g. _"Use the build-feature agent to add a CSV export button to the vehicle inventory table."_
- **`bug-triage`** — report the bug and ask for it to be fixed, e.g. _"Pagination requests past the last page return an empty list instead of clamping to it — use the bug-triage agent to find and fix that."_
- **`code-review`** — ask for a review of your current diff before merging, e.g. _"Use the code-review agent to check this branch's diff for boundary violations."_
- **`qa`** — ask for a smoke check before pushing, e.g. _"Run the qa agent against the pagination feature before I push."_ Requires `QA_TEST_EMAIL`/`QA_TEST_PASSWORD` in `.env.local` for any flow that needs a signed-in user (see Getting Started step 5 and `.env.example`).

Each agent follows the Git Workflow in `CLAUDE.md` on its own — it branches off `main`, commits with Conventional Commits — but never pushes to the remote or opens a PR without your explicit confirmation first.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check, and tests on every push and pull request.
