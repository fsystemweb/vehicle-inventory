# Vehicle Inventory Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the foundational Next.js + Supabase + Vercel + CI + Claude Code harness scaffold for the DMS Vehicle Inventory module, with no feature/business logic beyond a single wiring example.

**Architecture:** A single Next.js App Router app with a strict internal FE/BE boundary — `src/app/**` and `src/components/**` (frontend) may never import Supabase or repositories directly; all data access flows through `src/server/services` or `src/server/actions`, with `src/server/repositories` as the only layer allowed to call Supabase. The boundary is documented in `CLAUDE.md` and enforced by an ESLint `no-restricted-imports` override.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, npm, Vitest, `@supabase/ssr`, ESLint 9 flat config, Prettier, GitHub Actions.

## Global Constraints

- Package manager: npm (not pnpm/yarn).
- Next.js App Router, TypeScript, `src/` directory, `@/*` import alias.
- Node >=20 (pin via `package.json` `engines`).
- Styling: Tailwind CSS.
- Test runner: Vitest.
- ESLint boundary rule implemented as `no-restricted-imports`, scoped via a `files` override to `src/app/**` and `src/components/**` only — `src/server/**` is exempt.
- No real Supabase or Vercel account/project is provisioned by this work. Only client scaffolding, env var placeholders, and deploy-readiness.
- Git remote is already configured: `https://github.com/fsystemweb/vehicle-inventory.git` (empty, no commits). Do not push until the user explicitly confirms at the end of the plan.
- CI (`.github/workflows/ci.yml`) must be green from the first commit that adds it: `npm ci` → `npm run lint` → `npm run format:check` → `npm run test`.
- No Vehicle Inventory business logic, schema, or UI — the only "feature-shaped" code allowed is the `health` example proving the FE/BE wiring.

---

### Task 1: Bootstrap the Next.js scaffold

**Files:**
- Create: `.gitignore`, `eslint.config.mjs`, `next.config.ts`, `package.json`, `package-lock.json`, `postcss.config.mjs`, `tsconfig.json`, `public/*.svg`, `src/app/favicon.ico`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Produces: a building Next.js app (`npm run build` succeeds) with scripts `dev`, `build`, `start`, `lint` in `package.json`, and the `@/*` → `./src/*` path alias in `tsconfig.json`. Later tasks add `test`, `format`, `format:check` scripts to the same `package.json`.

- [ ] **Step 1: Generate a fresh scaffold in a temp directory**

```bash
rm -rf /tmp/vi-nextjs-scaffold
npx --yes create-next-app@latest /tmp/vi-nextjs-scaffold \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --disable-git --yes
```

Expected: ends with `Success! Created vi-nextjs-scaffold at /tmp/vi-nextjs-scaffold`.

- [ ] **Step 2: Copy the generated files into the project root**

The project root already has `.git/` and `docs/` from the design-spec commit — copy only the scaffold's output files in, don't let `create-next-app` run in-place.

```bash
cd /home/fed/Documents/experiments/vehicle-inventory
cp /tmp/vi-nextjs-scaffold/.gitignore .
cp /tmp/vi-nextjs-scaffold/eslint.config.mjs .
cp /tmp/vi-nextjs-scaffold/next.config.ts .
cp /tmp/vi-nextjs-scaffold/package.json .
cp /tmp/vi-nextjs-scaffold/package-lock.json .
cp /tmp/vi-nextjs-scaffold/postcss.config.mjs .
cp /tmp/vi-nextjs-scaffold/tsconfig.json .
cp -r /tmp/vi-nextjs-scaffold/public .
mkdir -p src/app
cp /tmp/vi-nextjs-scaffold/src/app/favicon.ico src/app/
cp /tmp/vi-nextjs-scaffold/src/app/globals.css src/app/
cp /tmp/vi-nextjs-scaffold/src/app/layout.tsx src/app/
cp /tmp/vi-nextjs-scaffold/src/app/page.tsx src/app/
```

Do not copy `AGENTS.md`, `CLAUDE.md`, or `README.md` from the scaffold — this project writes its own in Task 8.

- [ ] **Step 3: Patch `package.json`** — rename, pin Node, fix the lint script to target all files

Replace the full file with:

```json
{
  "name": "vehicle-inventory",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

(If `create-next-app` in Step 1 pinned different exact versions than shown above, keep whatever versions it actually wrote for `next`/`react`/`react-dom`/`eslint-config-next` — copy those four values from the scaffold's `package.json` instead of the literals above. Everything else in this file should match exactly.)

- [ ] **Step 4: Patch `.gitignore`** so `.env.example` (added in Task 3) won't be ignored

Find this block:

```
# env files (can opt-in for committing if needed)
.env*
```

Replace with:

```
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

- [ ] **Step 5: Replace the placeholder homepage**

Replace `src/app/page.tsx` entirely with:

```tsx
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold">Vehicle Inventory</h1>
      <p className="text-sm text-neutral-500">
        DMS module foundations — no feature UI yet.
      </p>
    </main>
  );
}
```

- [ ] **Step 6: Update the page title in `src/app/layout.tsx`**

In the `metadata` export, change:

```tsx
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```

to:

```tsx
export const metadata: Metadata = {
  title: "Vehicle Inventory — DMS",
  description: "Vehicle Inventory module foundations",
};
```

- [ ] **Step 7: Install dependencies**

```bash
npm install
```

Expected: exits 0, `node_modules/` created.

- [ ] **Step 8: Verify the app builds**

```bash
npm run build
```

Expected: exit code 0, output includes `Compiled successfully`.

- [ ] **Step 9: Commit**

```bash
git add .gitignore eslint.config.mjs next.config.ts package.json package-lock.json \
  postcss.config.mjs tsconfig.json public src
git commit -m "Bootstrap Next.js App Router scaffold with Tailwind and TypeScript"
```

---

### Task 2: Configure Vitest and add the health-service example (TDD)

**Files:**
- Create: `vitest.config.ts`, `src/server/services/health-service.test.ts`, `src/server/services/health-service.ts`
- Modify: `package.json` (add `vitest` devDependency, add `test` script)

**Interfaces:**
- Consumes: `@/*` alias from `tsconfig.json` (Task 1).
- Produces: `getHealthStatus(): HealthStatus` from `@/server/services/health-service`, where `HealthStatus = { status: "ok"; timestamp: string }`. Task 4 (the API route) imports this exact function and type.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add `vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Add the `test` script to `package.json`**

In the `scripts` block, add (keep the existing four scripts as-is):

```json
    "test": "vitest run"
```

- [ ] **Step 4: Write the failing test**

Create `src/server/services/health-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getHealthStatus } from "@/server/services/health-service";

describe("getHealthStatus", () => {
  it("returns an ok status with an ISO timestamp", () => {
    const result = getHealthStatus();

    expect(result.status).toBe("ok");
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
```

- [ ] **Step 5: Run the test and confirm it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module '@/server/services/health-service'` (or similar resolution error), since `health-service.ts` doesn't exist yet.

- [ ] **Step 6: Implement the minimal service**

Create `src/server/services/health-service.ts`:

```ts
export type HealthStatus = {
  status: "ok";
  timestamp: string;
};

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}
```

- [ ] **Step 7: Run the test and confirm it passes**

```bash
npm run test
```

Expected: PASS — 1 test passed.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/server/services
git commit -m "Configure Vitest and add health-service example"
```

---

### Task 3: Supabase client scaffolding and remaining boundary directories

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/client.test.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/server.test.ts`, `.env.example`, `src/components/.gitkeep`, `src/server/repositories/.gitkeep`, `src/server/actions/.gitkeep`, `src/types/.gitkeep`, `src/app/(dashboard)/.gitkeep`
- Modify: `package.json` (add `@supabase/ssr` dependency)

**Interfaces:**
- Produces: `createClient()` (sync, returns a Supabase browser client) from `@/lib/supabase/client`; `createClient()` (async, returns a Supabase server client) from `@/lib/supabase/server`. Neither is called by any other task in this plan — Task 4's route uses `health-service`, not Supabase.

- [ ] **Step 1: Install `@supabase/ssr`**

```bash
npm install @supabase/ssr
```

- [ ] **Step 2: Write the failing smoke tests**

Create `src/lib/supabase/client.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createClient } from "@/lib/supabase/client";

describe("createClient (browser)", () => {
  it("is a function", () => {
    expect(typeof createClient).toBe("function");
  });
});
```

Create `src/lib/supabase/server.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createClient } from "@/lib/supabase/server";

describe("createClient (server)", () => {
  it("is a function", () => {
    expect(typeof createClient).toBe("function");
  });
});
```

These deliberately only check that the export exists and is callable — actually invoking either `createClient()` would require real Supabase env vars (browser client) or a live Next.js request context (server client, via `next/headers`), neither of which exists in a unit test.

- [ ] **Step 3: Run the tests and confirm they fail**

```bash
npm run test
```

Expected: FAIL — both files error with a module-not-found for `@/lib/supabase/client` and `@/lib/supabase/server`.

- [ ] **Step 4: Implement the browser client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 5: Implement the server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component during a static render —
            // safe to ignore since middleware refreshes the session.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npm run test
```

Expected: PASS — all tests pass (health-service + the two new smoke tests).

- [ ] **Step 7: Add `.env.example`**

```
# Supabase project settings → API
# https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 8: Add the remaining empty boundary directories**

```bash
mkdir -p "src/app/(dashboard)" src/components src/server/repositories src/server/actions src/types
touch "src/app/(dashboard)/.gitkeep" src/components/.gitkeep src/server/repositories/.gitkeep src/server/actions/.gitkeep src/types/.gitkeep
```

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .env.example src/lib src/components src/server src/types "src/app/(dashboard)"
git commit -m "Add Supabase client scaffolding and FE/BE boundary directories"
```

---

### Task 4: Health API route (proves the thin-route pattern)

**Files:**
- Create: `src/app/api/health/route.ts`, `src/app/api/health/route.test.ts`

**Interfaces:**
- Consumes: `getHealthStatus` from `@/server/services/health-service` (Task 2).
- Produces: `GET` handler at `src/app/api/health/route.ts`, reachable at `/api/health`.

- [ ] **Step 1: Write the failing test**

Create `src/app/api/health/route.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns an ok status as JSON", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npm run test
```

Expected: FAIL — `./route` module not found.

- [ ] **Step 3: Implement the route**

Create `src/app/api/health/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getHealthStatus } from "@/server/services/health-service";

export async function GET() {
  return NextResponse.json(getHealthStatus());
}
```

- [ ] **Step 4: Run the test and confirm it passes**

```bash
npm run test
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Manually verify against the dev server**

```bash
npm run dev &
sleep 2
curl -s http://localhost:3000/api/health
kill %1
```

Expected: JSON output like `{"status":"ok","timestamp":"2026-07-12T..."}`

- [ ] **Step 6: Commit**

```bash
git add src/app/api
git commit -m "Add /api/health as a thin-route example over health-service"
```

---

### Task 5: ESLint FE/BE boundary rule and Prettier

**Files:**
- Modify: `eslint.config.mjs`, `package.json` (add `format`/`format:check` scripts, add `prettier` devDependency)
- Create: `.prettierrc.json`, `.prettierignore`

**Interfaces:**
- Produces: `npm run lint` fails on any import of `@/lib/supabase/*` or `@/server/repositories/*` from `src/app/**` or `src/components/**`. `npm run format` / `npm run format:check` scripts.

- [ ] **Step 1: Install Prettier**

```bash
npm install -D prettier
```

- [ ] **Step 2: Add `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "tabWidth": 2
}
```

- [ ] **Step 3: Add `.prettierignore`**

```
node_modules
.next
package-lock.json
```

- [ ] **Step 4: Add `format` and `format:check` scripts to `package.json`**

In the `scripts` block, add:

```json
    "format": "prettier --write .",
    "format:check": "prettier --check ."
```

- [ ] **Step 5: Add the boundary rule to `eslint.config.mjs`**

Replace the full file with:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/supabase", "@/lib/supabase/*"],
              message:
                "Do not import the Supabase client directly in app/ or components/. Go through server/services or server/actions instead.",
            },
            {
              group: ["@/server/repositories", "@/server/repositories/*"],
              message:
                "Do not import repositories directly in app/ or components/. Go through server/services or server/actions instead.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

- [ ] **Step 6: Verify the rule actually catches a violation**

```bash
cat > src/app/_tmp-violation.ts << 'EOF'
import { createClient } from "@/lib/supabase/client";

export const client = createClient();
EOF
npm run lint
```

Expected: FAILS with the `no-restricted-imports` error and the custom message from Step 5, pointing at `src/app/_tmp-violation.ts`.

```bash
rm src/app/_tmp-violation.ts
```

- [ ] **Step 7: Run lint against the real codebase and confirm it's clean**

```bash
npm run lint
```

Expected: exit code 0, no errors.

- [ ] **Step 8: Format the whole codebase and verify format:check passes**

```bash
npm run format
npm run format:check
```

Expected: `format:check` exits 0 with no files needing changes.

- [ ] **Step 9: Re-run the full test suite to confirm formatting didn't break anything**

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Add ESLint FE/BE boundary rule and Prettier formatting"
```

---

### Task 6: GitHub Actions CI pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `lint`, `format:check`, `test` scripts from `package.json` (Tasks 1, 2, 5).

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test
```

- [ ] **Step 2: Simulate the CI steps locally in order**

```bash
rm -rf node_modules
npm ci
npm run lint
npm run format:check
npm run test
```

Expected: every command exits 0, in this exact order — this is what CI will run.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "Add GitHub Actions CI pipeline (lint, format check, test)"
```

---

### Task 7: Claude Code agent harness

**Files:**
- Create: `.claude/commands/create-module.md`, `.claude/commands/review-ui.md`, `.claude/commands/generate-tests.md`, `.claude/agents/build-feature.md`, `.claude/agents/code-review.md`, `.claude/agents/migration.md`, `.claude/skills/scaffold-crud.md`, `.claude/skills/react-form.md`, `.claude/skills/api-endpoint.md`

- [ ] **Step 1: Create `.claude/commands/create-module.md`**

```markdown
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
```

- [ ] **Step 2: Create `.claude/commands/review-ui.md`**

```markdown
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
```

- [ ] **Step 3: Create `.claude/commands/generate-tests.md`**

```markdown
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
```

- [ ] **Step 4: Create `.claude/agents/build-feature.md`**

```markdown
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
```

- [ ] **Step 5: Create `.claude/agents/code-review.md`**

```markdown
---
name: code-review
description: Reviews a diff for FE/BE boundary violations and general correctness in this codebase. Use before merging any change that touches src/app, src/components, or src/server.
tools: Read, Grep, Glob, Bash
model: inherit
---

You review diffs in this codebase for two things, in order:

1. **Boundary violations** (check first, these are hard failures):
   - Any import of `@/lib/supabase/*` outside `src/server/repositories/**`.
   - Any import of `@/server/repositories/*` outside `src/server/services/**` or `src/server/actions/**`.
   - Business logic (validation, branching on domain rules, calculations) inside `src/app/**` or `src/components/**` instead of `src/server/services/**`.
   - API routes under `src/app/api/**` that do more than parse input, call a service, and return a response.

2. **Correctness and quality**: standard review — logic errors, missing error handling at real boundaries (not speculative), untested new business logic, unnecessary complexity.

Report findings as `file:line` — one-sentence problem, one-sentence fix. Do not comment on style choices already enforced by ESLint/Prettier (run `npm run lint` and `npm run format:check` yourself first and don't duplicate what they already catch). If the diff is clean, say so.
```

- [ ] **Step 6: Create `.claude/agents/migration.md`**

```markdown
---
name: migration
description: Drafts and documents Supabase schema migrations (SQL) for a new or changed data model. Use when a feature needs a new table, column, or index and no migration exists yet.
tools: Read, Write, Bash, Grep, Glob
model: inherit
---

You draft Supabase (Postgres) schema migrations for this project. No schema exists yet as of the foundations phase — the first migration for any table starts here.

Conventions:
- Migrations live under `supabase/migrations/` (Supabase CLI convention: `<timestamp>_<description>.sql`). Create that directory the first time it's needed.
- Every table gets Row Level Security enabled (`alter table ... enable row level security;`) and explicit policies — never ship a table without RLS in a Supabase project that has auth enabled.
- Write the migration as plain SQL (`create table`, `alter table`, etc.), not through the Supabase dashboard, so it's reviewable and reproducible.
- After drafting a migration, list the corresponding `src/server/repositories/*` changes needed to use the new schema — but don't write application code changes yourself unless asked; hand off to the `build-feature` agent for that.
- Never apply a migration to a live project without the user's explicit confirmation — drafting and reviewing SQL is your job, running `supabase db push` against a real database is a decision for the user.
```

- [ ] **Step 7: Create `.claude/skills/scaffold-crud.md`**

```markdown
---
name: scaffold-crud
description: Scaffold full CRUD (repository, service, actions) for a domain entity across the server/ layers. Use when a feature needs create/read/update/delete for a new entity.
---

# Scaffold CRUD

Given a domain name and entity shape, generate the full CRUD slice:

1. `src/server/repositories/<domain>-repository.ts` — typed functions `findAll(): Promise<T[]>`, `findById(id: string): Promise<T | null>`, `create(input: NewT): Promise<T>`, `update(id: string, input: Partial<NewT>): Promise<T>`, `remove(id: string): Promise<void>`, each calling `(await createClient()).from('<table>')...` from `@/lib/supabase/server`.
2. `src/server/services/<domain>-service.ts` — same five operations, but validating input and applying business rules before delegating to the repository. This is what everything else calls.
3. `src/server/actions/<domain>-actions.ts` — `"use server"` wrappers around the service functions that forms can call directly (e.g. `createAction(formData: FormData)`).
4. Define the entity's types in `src/types/<domain>.ts` and import them from all three layers above — don't redefine the shape per layer.

Do not generate UI or Supabase schema/migrations as part of this skill — schema comes from the `migration` agent, UI from the `react-form` skill or hand-written components.
```

- [ ] **Step 8: Create `.claude/skills/react-form.md`**

```markdown
---
name: react-form
description: Build a form Client Component wired to a Server Action, following this project's FE/BE boundary. Use when a feature needs a create/edit form.
---

# React Form

Build a form that submits through a Server Action, never through a client-side `fetch` to a hand-rolled API route.

1. The Server Action lives in `src/server/actions/<domain>-actions.ts` (see the `scaffold-crud` skill) — reuse it if it exists, create it if not.
2. The form component lives in `src/components/<domain>/<Name>Form.tsx`. It imports the Server Action and passes it to the `<form action={...}>` prop (or calls it from an event handler for client-side cases needing `useTransition`).
3. Client-side validation is a UX nicety only — the Server Action must independently validate via the service layer, since the form is not the only caller.
4. Use `useActionState` (or `useFormStatus` for pending/submit UI) for pending and error states rather than hand-rolled loading flags, unless the form's interaction is simple enough not to need it.
5. Never import `@/lib/supabase/*` or `@/server/repositories/*` in the component — the ESLint boundary rule will fail the build if you do.
```

- [ ] **Step 9: Create `.claude/skills/api-endpoint.md`**

```markdown
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
```

- [ ] **Step 10: Verify all nine files exist**

```bash
find .claude -type f | sort
```

Expected: exactly the nine files created in Steps 1–9, under `.claude/commands/`, `.claude/agents/`, `.claude/skills/`.

- [ ] **Step 11: Commit**

```bash
git add .claude
git commit -m "Add draft Claude Code agent harness (commands, agents, skills)"
```

---

### Task 8: CLAUDE.md and README.md

**Files:**
- Create: `CLAUDE.md`, `README.md`

- [ ] **Step 1: Create `CLAUDE.md`**

```markdown
# CLAUDE.md

This file documents the conventions and architecture rules for the DMS Vehicle Inventory module. Read this before making changes.

## Stack

Next.js (App Router, TypeScript) on Vercel, Supabase for database and auth, Tailwind for styling, Vitest for tests, GitHub Actions for CI.

## Architecture: FE/BE Boundary

Next.js is full-stack — there is no separate backend server or repo. "Frontend/backend separation" here means strict internal import boundaries within one app, not separate deployments.

\`\`\`
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
\`\`\`

**Rules (enforced by ESLint where possible — see `eslint.config.mjs`):**

1. Components and pages (`src/app/**`, `src/components/**`) never import the Supabase client directly. All data access goes through `server/services` or `server/actions`.
2. `server/repositories` is the only layer allowed to call Supabase directly.
3. API routes (`src/app/api/**`) stay thin: validate input, call a service, return a response. No business logic, no direct Supabase/repository imports.

If you hit a lint error from `no-restricted-imports` on a Supabase or repository import, that's the boundary rule working as intended — fix the layering, don't disable the rule.

## Using the Claude Code Harness

- `/create-module <domain>` — scaffold a new repository + service (+ action/route) for a domain.
- `/review-ui [files]` — check a component/page against the boundary rules above.
- `/generate-tests <file>` — generate Vitest tests for a service/repository/route.
- `build-feature` agent — implements a full vertical slice end-to-end.
- `code-review` agent — reviews a diff for boundary violations and correctness.
- `migration` agent — drafts Supabase schema migrations (SQL, with RLS).
- `scaffold-crud`, `react-form`, `api-endpoint` skills — implementation patterns for CRUD, forms, and API routes respectively.

These are draft/initial versions written during the foundations phase, before any Vehicle Inventory feature work has started. Expect to refine them as real features are built.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint (includes the boundary rule)
- `npm run format` / `npm run format:check` — Prettier
- `npm run test` — Vitest

## Current Status

Foundations phase: scaffolding, tooling, and the harness are in place. No Vehicle Inventory data model, schema, or feature UI exists yet.
```

- [ ] **Step 2: Create `README.md`**

```markdown
# Vehicle Inventory — DMS Module

Foundations for the Vehicle Inventory module of the DMS system. This phase is infrastructure and scaffolding only — see `CLAUDE.md` for architecture rules. No Vehicle Inventory features are implemented yet.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database & Auth | Supabase |
| Hosting | Vercel |
| Tests | Vitest |
| CI | GitHub Actions |

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Create a Supabase project at https://supabase.com/dashboard (free tier), then copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your project's API settings.
3. Run the dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
   Visit http://localhost:3000. `http://localhost:3000/api/health` should return `{"status":"ok","timestamp":"..."}`.

### Deploying to Vercel

This scaffold has no Vercel-specific config — a default `next build` is all Vercel needs. Import the repository in the Vercel dashboard ("Add New Project"), or run `npx vercel link` locally, and set the two Supabase env vars above in the Vercel project settings.

## Folder Structure

\`\`\`
src/
  app/           # routes, layouts, pages, API route handlers — FRONTEND
  components/    # UI components — FRONTEND
  server/
    services/       # business logic
    repositories/    # Supabase queries — the only layer allowed to call Supabase
    actions/          # Server Actions ("use server")
  lib/supabase/       # Supabase client factories (browser + server)
  types/               # shared types
\`\`\`

See `CLAUDE.md` for the full architecture boundary rules — components and pages never call Supabase directly; everything goes through `server/services` or `server/actions`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint, including the FE/BE boundary rule |
| `npm run format` | Prettier — write formatting fixes |
| `npm run format:check` | Prettier — check only, used in CI |
| `npm run test` | Run the Vitest suite |

## Claude Code Harness

`.claude/` contains draft commands, agents, and skills for feature work (e.g. `/create-module`, the `build-feature` agent, the `scaffold-crud` skill). See `CLAUDE.md` for the full list and when to use each.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check, and tests on every push and pull request.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "Add CLAUDE.md and README.md"
```

---

### Task 9: Final integration check and push

**Files:** none created — verification only.

- [ ] **Step 1: Run the full CI sequence one more time, from a clean install**

```bash
rm -rf node_modules .next
npm ci
npm run lint
npm run format:check
npm run test
npm run build
```

Expected: every command exits 0, in order.

- [ ] **Step 2: Confirm the working tree is clean**

```bash
git status
```

Expected: `nothing to commit, working tree clean` (all prior tasks already committed).

- [ ] **Step 3: Show the commit log for a final sanity check**

```bash
git log --oneline
```

Expected: one commit per task (design spec, bootstrap, vitest+health-service, supabase+boundary dirs, health route, eslint+prettier, CI, harness, docs) — 9 commits total, oldest first.

- [ ] **Step 4: Ask the user to confirm before pushing**

Do not run `git push` until the user explicitly confirms — pushing is a shared, hard-to-reverse action per the project's operating rules. Once confirmed:

```bash
git push -u origin main
```

Expected: pushes `main` to `https://github.com/fsystemweb/vehicle-inventory.git` and sets upstream tracking.
