import { NextRequest, NextResponse } from "next/server";
import { resolvePublicVerification } from "@/lib/public-verification";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const forwarded = request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const result = await resolvePublicVerification(token, forwarded);
  const status = result.status === "SERVICE_UNAVAILABLE" ? 503 : result.status === "RATE_LIMITED" ? 429 : 200;
  return NextResponse.json({ ...result, disclaimer: "Private Company Certificate – Not a Government Document" }, {
    status,
    headers: { "Cache-Control": "no-store, private", ...(status === 429 ? { "Retry-After": "60" } : {}) },
  });
}
