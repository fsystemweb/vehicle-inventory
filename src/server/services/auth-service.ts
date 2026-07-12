import {
  getCurrentUser as getCurrentUserFromRepo,
  signInWithPassword,
  signOut as signOutFromRepo,
  signUpWithPassword,
} from "@/server/repositories/auth-repository";
import type { User } from "@supabase/supabase-js";

export type AuthActionResult =
  { success: true } | { success: false; error: string };

export type SignupResult =
  | { success: true; needsEmailConfirmation: boolean }
  | { success: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches Supabase Auth's default minimum password length.
const MIN_PASSWORD_LENGTH = 6;

function validateCredentials(email: string, password: string): string | null {
  if (!email || !EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return null;
}

function mapSignupError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("already registered")) {
    return "An account with this email already exists.";
  }

  if (lower.includes("rate limit")) {
    return "Too many attempts. Please try again in a few minutes.";
  }

  return "Unable to create account. Please try again.";
}

/**
 * Signs a user in with an email/password pair. Returns a normalized result
 * so callers never need to inspect Supabase-specific error shapes.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const validationError = validateCredentials(email, password);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const { error } = await signInWithPassword(email, password);
  if (error) {
    return { success: false, error: "Invalid email or password." };
  }

  return { success: true };
}

/**
 * Creates a new account. `needsEmailConfirmation` tells the caller whether
 * Supabase requires the user to confirm their email before a session exists.
 */
export async function signup(
  email: string,
  password: string,
): Promise<SignupResult> {
  const validationError = validateCredentials(email, password);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const { data, error } = await signUpWithPassword(email, password);
  if (error) {
    return { success: false, error: mapSignupError(error.message) };
  }

  const needsEmailConfirmation = data?.session == null;

  return { success: true, needsEmailConfirmation };
}

/**
 * Ends the current session.
 */
export async function logout(): Promise<AuthActionResult> {
  const { error } = await signOutFromRepo();
  if (error) {
    return { success: false, error: "Unable to sign out. Please try again." };
  }

  return { success: true };
}

/**
 * Returns the currently authenticated user, or null if there isn't one.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await getCurrentUserFromRepo();
  return data ?? null;
}
