import { createClient } from "@/lib/supabase/server";
import type { AuthError, Session, User } from "@supabase/supabase-js";

export type AuthResult<T> = {
  data: T | null;
  error: AuthError | null;
};

/**
 * Attempts to sign in a user with an email/password pair.
 * This is the only layer allowed to call the Supabase client directly.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Creates a new account with an email/password pair. Depending on the
 * project's Supabase Auth settings, a session may or may not be returned
 * immediately (email confirmation may be required first).
 */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

/**
 * Ends the current user's session.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  return { error };
}

/**
 * Returns the currently authenticated user, if any.
 */
export async function getCurrentUser(): Promise<AuthResult<User>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return { data: data.user, error };
}
