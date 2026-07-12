---
name: react-form
description: Build a form Client Component wired to a Server Action, following this project's FE/BE boundary. Use when a feature needs a create/edit form.
---

# React Form

Build a form that submits through a Server Action, never through a client-side `fetch` to a hand-rolled API route.

1. The Server Action lives in `src/server/actions/<domain>-actions.ts` (see the `scaffold-crud` skill) — reuse it if it exists, create it if not.
2. The form component lives in `src/components/<domain>/<Name>Form.tsx`. It imports the Server Action and passes it to the `<form action={...}>` prop (or calls it from an event handler for client-side cases needing `useTransition`).
3. Add real-time client-side validation: a framework-agnostic helper in `src/lib/<domain>-form-validation.ts` that mirrors the service layer's rules, called from the form's `onChange`/`onBlur` handlers to show inline per-field errors and to disable the submit button until the form is valid. This is a UX layer only — the Server Action must still independently validate via the service layer, since the form is not the only caller. See `src/lib/vehicle-form-validation.ts` and `src/components/vehicles/VehicleForm.tsx` for a reference implementation.
4. Use `useActionState` (or `useFormStatus` for pending/submit UI) for pending and error states rather than hand-rolled loading flags, unless the form's interaction is simple enough not to need it.
5. Never import `@/lib/supabase/*` or `@/server/repositories/*` in the component — the ESLint boundary rule will fail the build if you do.
