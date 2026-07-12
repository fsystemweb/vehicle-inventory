"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  type LoginActionState,
} from "@/server/actions/login-action";

const initialLoginState: LoginActionState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginState,
  );

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
          autoComplete="current-password"
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
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-violet hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
