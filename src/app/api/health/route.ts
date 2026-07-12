import { NextResponse } from "next/server";
import { getHealthStatus } from "@/server/services/health-service";

export async function GET() {
  return NextResponse.json(getHealthStatus());
}
