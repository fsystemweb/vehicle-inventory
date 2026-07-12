---
description: Generate Vitest tests for a service or repository function
argument-hint: <file path>
---

Generate Vitest unit tests for the file at `$ARGUMENTS`.

1. Read the target file and identify each exported function.
2. Place the test file next to the source file, as `<name>.test.ts` (this matches the existing convention — see `src/server/services/health-service.test.ts`).
3. For `server/services/*`: test business logic and edge cases directly. Mock the repository layer (`vi.mock`) rather than hitting Supabase — repositories are the only layer that should touch the database.
4. For `server/repositories/*`: do not hit a real Supabase project in unit tests. Mock the Supabase client (`@/lib/supabase/server`) and assert the repository builds the expected query. Integration tests against a real (local/test) Supabase instance are a separate concern, out of scope for this command.
5. For `app/api/**/route.ts`: import the exported HTTP method handlers (e.g. `GET`, `POST`) directly and invoke them with a constructed `Request`, asserting on `response.status` and `await response.json()`. See `src/app/api/health/route.test.ts` for the pattern.
6. Use `describe`/`it` from `vitest`, one `describe` block per exported function, one `it` per behavior (happy path + at least one edge case).
7. Run `npm run test -- <path to new test file>` and confirm it passes before finishing.
