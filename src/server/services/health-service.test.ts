import { describe, expect, it } from "vitest";
import { getHealthStatus } from "@/server/services/health-service";

describe("getHealthStatus", () => {
  it("returns an ok status with an ISO timestamp", () => {
    const result = getHealthStatus();

    expect(result.status).toBe("ok");
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
