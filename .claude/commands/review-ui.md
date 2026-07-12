---
description: Review a component or page against the FE/BE boundary rules in CLAUDE.md
argument-hint: [file paths] (defaults to the current diff)
---

Review the files in `$ARGUMENTS` (or, if empty, the files changed in the current diff) against the FE/BE boundary rules in `CLAUDE.md`:

1. No file under `src/app/**` or `src/components/**` may import `@/lib/supabase/*` or `@/server/repositories/*`. This is enforced by ESLint's `no-restricted-imports` rule, but check for it explicitly anyway — flag any violation and suggest routing through `@/server/services` or `@/server/actions` instead.
2. Server Components fetching data should call a `server/services` function directly, not fetch from an API route in the same app.
3. Client Components needing data should call a Server Action from `server/actions`, not hit Supabase or a repository directly, and not call an internal API route as a substitute for a Server Action.
4. Forms should submit through a Server Action, not a hand-rolled client-side `fetch` to an internal API route, unless there's a documented reason (e.g. an endpoint also serves external webhook consumers).
5. Flag business logic (validation, calculations, branching on domain rules) living in a component — it belongs in `server/services`.

Report violations with `file:line` references and the specific rule broken. If nothing is wrong, say so explicitly instead of inventing issues.
