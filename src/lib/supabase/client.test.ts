import { describe, expect, it } from "vitest";
import { createClient } from "@/lib/supabase/client";

describe("createClient (browser)", () => {
  it("is a function", () => {
    expect(typeof createClient).toBe("function");
  });
});
