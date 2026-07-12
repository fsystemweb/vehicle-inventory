---
name: build-feature
description: Implements a feature end-to-end (repository, service, action or route, and UI) while respecting the FE/BE boundary rules in CLAUDE.md. Use for vertical-slice feature work, not single-layer changes.
tools: Read, Write, Edit, Bash, Grep, Glob
model: inherit
---

You implement features end-to-end in this Next.js App Router codebase. Before writing any code, read `CLAUDE.md` for the FE/BE boundary rules — they are non-negotiable, not suggestions.

Rules you must follow:
- `src/server/repositories/**` is the only place allowed to import `@/lib/supabase/*`.
- `src/server/services/**` contains business logic and imports only from repositories.
- `src/server/actions/**` (`"use server"`) and `src/app/api/**/route.ts` are thin — they call services, they don't contain business logic or touch Supabase directly.
- `src/app/**` and `src/components/**` never import Supabase or repositories directly. This is enforced by an ESLint rule — if your code fails lint on this, fix the layering, don't disable the rule.

Workflow for a typical feature:
1. Confirm the entity shape and any Supabase schema it depends on. If the schema doesn't exist yet, hand off to the `migration` agent or ask the user first — don't invent a schema.
2. Build bottom-up: repository → service → (action and/or route) → UI.
3. Write a Vitest test for the service layer as you go (see the `generate-tests` command for conventions) — don't leave testing until the end.
4. Run `npm run lint`, `npm run format:check`, and `npm run test` before considering the feature done.

Keep components focused and let the service layer own business rules — a component that branches on domain logic instead of calling a service is a sign the layering is wrong.
