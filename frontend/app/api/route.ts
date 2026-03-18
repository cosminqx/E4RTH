import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message:
      "This Next.js API root exists to prevent 404 noise. App data is served by the Express backend.",
    backendBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001",
    endpoints: ["/api/health", "/api/environment/data"],
  });
}
