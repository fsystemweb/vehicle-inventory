import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCurrentUser,
  login,
  logout,
  signup,
} from "@/server/services/auth-service";
import * as authRepository from "@/server/repositories/auth-repository";

vi.mock("@/server/repositories/auth-repository");

const mockedRepo = vi.mocked(authRepository);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("login", () => {
  it("rejects an invalid email without calling the repository", async () => {
    const result = await login("not-an-email", "password123");

    expect(result).toEqual({
      success: false,
      error: "Enter a valid email address.",
    });
    expect(mockedRepo.signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than the minimum length", async () => {
    const result = await login("driver@example.com", "short");

    expect(result.success).toBe(false);
    expect(mockedRepo.signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns success when the repository signs in without error", async () => {
    mockedRepo.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    const result = await login("driver@example.com", "password123");

    expect(result).toEqual({ success: true });
    expect(mockedRepo.signInWithPassword).toHaveBeenCalledWith(
      "driver@example.com",
      "password123",
    );
  });

  it("normalizes a Supabase auth error into a generic message", async () => {
    mockedRepo.signInWithPassword.mockResolvedValue({
      data: null,
      error: {
        name: "AuthApiError",
        message: "Invalid login credentials",
      } as never,
    });

    const result = await login("driver@example.com", "wrong-password");

    expect(result).toEqual({
      success: false,
      error: "Invalid email or password.",
    });
  });
});

describe("signup", () => {
  it("rejects invalid credentials without calling the repository", async () => {
    const result = await signup("not-an-email", "password123");

    expect(result.success).toBe(false);
    expect(mockedRepo.signUpWithPassword).not.toHaveBeenCalled();
  });

  it("flags that email confirmation is needed when no session is returned", async () => {
    mockedRepo.signUpWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    const result = await signup("driver@example.com", "password123");

    expect(result).toEqual({ success: true, needsEmailConfirmation: true });
  });

  it("does not require email confirmation when a session is returned", async () => {
    mockedRepo.signUpWithPassword.mockResolvedValue({
      data: { user: null, session: {} as never },
      error: null,
    });

    const result = await signup("driver@example.com", "password123");

    expect(result).toEqual({ success: true, needsEmailConfirmation: false });
  });

  it("maps a duplicate account error to a friendly message", async () => {
    mockedRepo.signUpWithPassword.mockResolvedValue({
      data: null,
      error: {
        name: "AuthApiError",
        message: "User already registered",
      } as never,
    });

    const result = await signup("driver@example.com", "password123");

    expect(result).toEqual({
      success: false,
      error: "An account with this email already exists.",
    });
  });
});

describe("logout", () => {
  it("returns success when sign out succeeds", async () => {
    mockedRepo.signOut.mockResolvedValue({ error: null });

    const result = await logout();

    expect(result).toEqual({ success: true });
  });

  it("returns a friendly error when sign out fails", async () => {
    mockedRepo.signOut.mockResolvedValue({
      error: { name: "AuthApiError", message: "network error" } as never,
    });

    const result = await logout();

    expect(result).toEqual({
      success: false,
      error: "Unable to sign out. Please try again.",
    });
  });
});

describe("getCurrentUser", () => {
  it("returns the user from the repository", async () => {
    const user = { id: "123", email: "driver@example.com" } as never;
    mockedRepo.getCurrentUser.mockResolvedValue({ data: user, error: null });

    const result = await getCurrentUser();

    expect(result).toBe(user);
  });

  it("returns null when there is no authenticated user", async () => {
    mockedRepo.getCurrentUser.mockResolvedValue({ data: null, error: null });

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});
