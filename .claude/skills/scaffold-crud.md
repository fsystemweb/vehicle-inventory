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
