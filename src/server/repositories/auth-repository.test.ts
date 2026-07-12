import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCurrentUser,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from "@/server/repositories/auth-repository";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

const originalEnv = { ...process.env };

function mockSupabaseClient() {
  const client = {
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  };
  mockedCreateClient.mockResolvedValue(client as never);
  return client;
}

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("signUpWithPassword", () => {
  it("passes emailRedirectTo built from the configured site URL, not a hardcoded host", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com";
    const client = mockSupabaseClient();

    await signUpWithPassword("driver@example.com", "password123");

    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: "driver@example.com",
      password: "password123",
      options: {
        emailRedirectTo: "https://app.example.com/login",
      },
    });
  });

  it("falls back to localhost only when no site URL env var is configured", async () => {
    const client = mockSupabaseClient();

    await signUpWithPassword("driver@example.com", "password123");

    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: "driver@example.com",
      password: "password123",
      options: {
        emailRedirectTo: "http://localhost:3000/login",
      },
    });
  });
});

describe("signInWithPassword", () => {
  it("delegates to the Supabase client", async () => {
    const client = mockSupabaseClient();

    await signInWithPassword("driver@example.com", "password123");

    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "driver@example.com",
      password: "password123",
    });
  });
});

describe("signOut", () => {
  it("delegates to the Supabase client", async () => {
    const client = mockSupabaseClient();

    await signOut();

    expect(client.auth.signOut).toHaveBeenCalled();
  });
});

describe("getCurrentUser", () => {
  it("returns the user from the Supabase client", async () => {
    const client = mockSupabaseClient();
    const user = { id: "123" };
    client.auth.getUser.mockResolvedValue({ data: { user }, error: null });

    const result = await getCurrentUser();

    expect(result).toEqual({ data: user, error: null });
  });
});
