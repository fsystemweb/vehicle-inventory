---
description: Scaffold a new backend module (repository + service + optional action/route) for a domain, respecting the FE/BE boundary
argument-hint: <domain-name> (e.g. vehicles)
---

Scaffold a new backend slice for the domain `$ARGUMENTS`. Follow the FE/BE boundary rules in `CLAUDE.md` — read that file first if you haven't already.

1. **Repository** — create `src/server/repositories/$ARGUMENTS-repository.ts`. This is the only file allowed to import `@/lib/supabase/server`. Export narrow, typed query functions (e.g. `findAll`, `findById`, `create`, `update`, `remove`). No business logic — just Supabase calls and mapping to typed rows.
2. **Service** — create `src/server/services/$ARGUMENTS-service.ts`. Imports only from the repository created above (never Supabase directly). Contains validation and business logic. This is the layer routes, Server Actions, and Server Components call.
3. **Server Action (if needed)** — create `src/server/actions/$ARGUMENTS-actions.ts` with `"use server"` as the first line. Import only from the service layer.
4. **API route (if needed)** — create `src/app/api/$ARGUMENTS/route.ts`. Keep it thin: parse/validate input, call the service, return a `NextResponse`. Never import Supabase or the repository here — the ESLint boundary rule will reject it.
5. Do not create UI in this command — use the `react-form` skill or hand-write components separately.

If the shape of the domain entity (fields, types, required Supabase table) isn't already clear from the conversation, ask before writing repository/service code.
