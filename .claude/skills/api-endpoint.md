---
name: api-endpoint
description: Build a thin API route handler backed by a service function. Use when a feature needs an HTTP endpoint under app/api (e.g. for external consumers or webhooks) rather than a Server Action.
---

# API Endpoint

Most internal data needs are served by Server Actions, not API routes — prefer the `react-form` skill plus a Server Action unless there's a reason external code needs an HTTP endpoint (webhooks, external integrations, non-form clients).

When an API route is the right call:

1. Create `src/app/api/<path>/route.ts`.
2. Export the HTTP method(s) needed (`GET`, `POST`, etc.) as named functions.
3. Parse and validate the request (query params, JSON body) at the top of the handler.
4. Call exactly one `server/services` function with the validated input — no business logic in the route file itself.
5. Return a `NextResponse` with an explicit status code, including for error cases (don't let unhandled errors fall through to a generic 500 without a clear message).
6. Never import `@/lib/supabase/*` or `@/server/repositories/*` directly — go through the service. See `src/app/api/health/route.ts` for the minimal reference shape.
