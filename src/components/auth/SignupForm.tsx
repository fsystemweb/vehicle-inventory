"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  signupAction,
  type SignupActionState,
} from "@/server/actions/signup-action";

const initialSignupState: SignupActionState = {
  error: null,
  success: false,
  needsEmailConfirmation: false,
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialSignupState,
  );

  if (state.success) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm text-foreground">
          {state.needsEmailConfirmation
            ? "Account created. Check your email to confirm your address before signing in."
            : "Account created successfully."}
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-violet hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-violet focus:ring-2 focus:ring-violet/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-violet focus:ring-2 focus:ring-violet/20"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-violet hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
