# Vehicle Inventory — Foundations Scaffold

Date: 2026-07-12
Status: Approved

## Purpose

Stand up the foundational codebase for the DMS Vehicle Inventory module:
project scaffolding, tooling, CI/CD, and the Claude Code agent harness. No
Vehicle Inventory business logic (CRUD, forms, listing pages) is implemented
in this phase — this is infrastructure only.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (free tier, not provisioned by this scaffold) |
| Hosting | Vercel (free tier, not provisioned by this scaffold) |
| Package manager | npm |
| Test runner | Vitest |
| CI | GitHub Actions |

## Architecture: FE/BE Boundary

Next.js is full-stack — there is no separate backend server or repo.
"Frontend/backend separation" means strict internal import boundaries within
a single app:

```
src/
  app/                       # routes, layouts, pages — FRONTEND
    (dashboard)/             # placeholder route group, empty
    api/                     # route handlers — thin, delegate to server/
      health/route.ts        # example: proves the thin-route pattern
  components/                # UI components — FRONTEND (empty, .gitkeep)
  server/                    # BACKEND: all business logic & data access
    services/                # business logic
      health-service.ts      # example: getHealthStatus()
    repositories/            # Supabase queries live only here (empty, .gitkeep)
    actions/                 # Server Actions ("use server") (empty, .gitkeep)
  lib/
    supabase/
      client.ts              # browser client (createBrowserClient)
      server.ts              # server client (createServerClient, cookies-based)
  types/                     # shared types (empty, .gitkeep)
```

Rules (documented in `CLAUDE.md`, enforced via ESLint where possible):

1. Components/pages never import the Supabase client directly — all data
   access goes through `server/services` or `server/actions`.
2. `server/repositories` is the only layer allowed to call Supabase directly.
3. API routes (`app/api/**`) stay thin — validate input, call a service,
   return a response.

### Example wiring (health check)

To give the boundary rule something real to lint and prove the pattern
works end-to-end:

- `src/server/services/health-service.ts` exports `getHealthStatus()`,
  returning a static status object. No Supabase call — just proves the
  service-layer pattern.
- `src/app/api/health/route.ts` is a thin GET handler that calls
  `getHealthStatus()` and returns it as JSON.
- One Vitest test covers `getHealthStatus()`.

This is the only "feature-shaped" code in the whole scaffold, and it exists
solely to validate the architecture, not as a real health-check endpoint.

## Supabase Client Scaffolding

Using `@supabase/ssr`:

- `src/lib/supabase/client.ts` — `createBrowserClient(url, anonKey)` for
  Client Components.
- `src/lib/supabase/server.ts` — `createServerClient(url, anonKey, { cookies })`
  for Server Components / Route Handlers / Server Actions.
- `.env.example` documents `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, with a comment pointing at the Supabase
  dashboard's API settings page.

No real Supabase project is created by this work. No schema, no auth flow,
no data model. The user connects their own project by populating
`.env.local` after this phase lands.

## ESLint Boundary Rule

Enforced via `no-restricted-imports` (no extra dependency), scoped to
`src/app/**` and `src/components/**` via an ESLint flat-config override,
blocking imports matching `@/lib/supabase/*` and `@/server/repositories/*`.
`src/server/**` itself is exempt from the override (it's allowed to import
Supabase — that's its job).

## Claude Code Harness

Draft (not polished, but usable) versions of:

```
.claude/
  commands/
    create-module.md      # scaffolds a new server/services + repositories + actions + route slice
    review-ui.md           # reviews a component/page against the FE/BE boundary rules
    generate-tests.md      # generates Vitest tests for a service/repository
  agents/
    build-feature.md       # implements a feature end-to-end respecting the boundary
    code-review.md         # reviews a diff for boundary violations and correctness
    migration.md            # drafts/applies Supabase schema migrations
  skills/
    scaffold-crud.md        # scaffolds CRUD across server/services + repositories + actions
    react-form.md            # builds a form component wired to a Server Action
    api-endpoint.md          # builds a thin API route + backing service
```

Each references the boundary rules in `CLAUDE.md` and points at the correct
`server/*` subdirectory for its concern, so future feature work (out of
scope for this phase) is guided into the right layers automatically.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml`, triggered on `push` and `pull_request`:

1. Checkout, setup Node, `npm ci`
2. `npm run lint` (ESLint, includes the boundary rule)
3. `npm run format:check` (Prettier `--check`)
4. `npm run test` (Vitest, includes the one placeholder test)

All four steps must pass; the pipeline is red until real code + config
exist to satisfy them (i.e., this scaffold must make CI green from the
first commit).

## Docs

- `README.md` — stack table, setup steps (`npm install`, env vars, "create
  your own Supabase project and `vercel link` — not provisioned by this
  scaffold"), folder structure explanation, how to run lint/format/test.
- `CLAUDE.md` — the FE/BE boundary rules verbatim (source of truth), plus a
  short pointer to the `.claude/` harness and when to use each piece.

## Deployment

Vercel is not provisioned in this phase. The scaffold must be
deploy-ready (standard `next build` succeeds, no Vercel-specific config
needed beyond the default) so that connecting the repo to Vercel later is a
zero-config "Import Project" flow. No `vercel.json` is added unless a
default Next.js deploy requires it (it doesn't).

## Git / Repository

- Remote: `https://github.com/fsystemweb/vehicle-inventory.git` (existing,
  empty, no commits).
- `git init` locally, single initial commit containing the full scaffold,
  authored as the repo owner (git already configured locally as
  `fsystemweb` / `facu.cappella@gmail.com`).
- Push happens only after explicit user confirmation at the end of
  implementation (shared/hard-to-reverse action).

## Out of Scope (unchanged from brief)

- Vehicle Inventory data model / schema
- Any UI pages or components for inventory
- Any real API endpoints or services beyond the `health` example
- Real Supabase/Vercel account provisioning
