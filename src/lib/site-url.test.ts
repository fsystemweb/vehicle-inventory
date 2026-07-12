import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSiteUrl } from "@/lib/site-url";

const originalEnv = { ...process.env };

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL when set, stripping a trailing slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com/";

    expect(getSiteUrl()).toBe("https://app.example.com");
  });

  it("falls back to VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset", () => {
    process.env.VERCEL_URL = "vehicle-inventory-git-preview.vercel.app";

    expect(getSiteUrl()).toBe(
      "https://vehicle-inventory-git-preview.vercel.app",
    );
  });

  it("falls back to localhost when no env vars are set", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
