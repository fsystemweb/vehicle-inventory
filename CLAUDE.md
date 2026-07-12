# CLAUDE.md

This file documents the conventions and architecture rules for the DMS Vehicle Inventory module. Read this before making changes.

## Stack

Next.js (App Router, TypeScript) on Vercel, Supabase for database and auth, Tailwind for styling, Vitest for tests, GitHub Actions for CI.

## Architecture: FE/BE Boundary

Next.js is full-stack — there is no separate backend server or repo. "Frontend/backend separation" here means strict internal import boundaries within one app, not separate deployments.

```
src/
  app/                    # routes, layouts, pages — FRONTEND
    (dashboard)/
    api/                  # route handlers — thin, delegate to server/
  components/             # UI components — FRONTEND
  server/                 # BACKEND: all business logic & data access
    services/             # business logic
    repositories/         # Supabase queries live only here
    actions/               # Server Actions ("use server")
  lib/
    supabase/
      client.ts            # browser client
      server.ts             # server client
  types/                    # shared types
```

**Rules (enforced by ESLint where possible — see `eslint.config.mjs`):**

1. Components and pages (`src/app/**`, `src/components/**`) never import the Supabase client directly. All data access goes through `server/services` or `server/actions`.
2. `server/repositories` is the only layer allowed to call Supabase directly.
3. API routes (`src/app/api/**`) stay thin: validate input, call a service, return a response. No business logic, no direct Supabase/repository imports.

If you hit a lint error from `no-restricted-imports` on a Supabase or repository import, that's the boundary rule working as intended — fix the layering, don't disable the rule.

## Git Workflow

All feature work — whether done directly or by a subagent — uses standard branching and Conventional Commits. This applies to the `build-feature` and `migration` agents in particular, since they're the ones that write code and schema changes.

**Branches:** create a branch off `main` before starting work, named `<type>/<short-kebab-description>`, e.g. `feat/vehicle-listing-page`, `fix/vehicle-status-filter`, `chore/update-eslint-config`. Never commit feature work directly to `main`.

**Commits:** use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`, where `<scope>` is optional (e.g. the module/domain, like `vehicles` or `auth`). Common types:

- `feat` — a new feature or capability
- `fix` — a bug fix
- `chore` — tooling, config, dependency, or non-source changes
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or correcting tests
- `docs` — documentation only

Keep commits scoped to one logical change; don't bundle an unrelated fix into a feature commit.

**Pushing:** creating a branch and committing locally doesn't require asking first, but pushing to the remote or opening a PR does — confirm with the user before either, per the harness's default caution around actions visible to others.

## Using the Claude Code Harness

- `/create-module <domain>` — scaffold a new repository + service (+ action/route) for a domain.
- `/review-ui [files]` — check a component/page against the boundary rules above.
- `/generate-tests <file>` — generate Vitest tests for a service/repository/route.
- `build-feature` agent — implements a full vertical slice end-to-end.
- `code-review` agent — reviews a diff for boundary violations and correctness.
- `migration` agent — drafts Supabase schema migrations (SQL, with RLS).
- `qa` agent — runs a real-browser Playwright smoke check of a feature before it's pushed; the last gate after lint/test/build.
- `scaffold-crud`, `react-form`, `api-endpoint` skills — implementation patterns for CRUD, forms, and API routes respectively.
- `design-system` skill — the visual design system (colors, typography, spacing, radius, motion, components) all UI work in this repo should follow.

These are draft/initial versions written during the foundations phase, before any Vehicle Inventory feature work has started. Expect to refine them as real features are built.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint (includes the boundary rule)
- `npm run format` / `npm run format:check` — Prettier
- `npm run test` — Vitest
- `npm run test:e2e` — Playwright (real-browser e2e specs under `e2e/`)
