import { describe, expect, it } from "vitest";
import { createClient } from "@/lib/supabase/server";

describe("createClient (server)", () => {
  it("is a function", () => {
    expect(typeof createClient).toBe("function");
  });
});
