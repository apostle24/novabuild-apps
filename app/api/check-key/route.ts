import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;

  return NextResponse.json({
    keyLoaded: Boolean(key),
    keyLength: key?.length ?? 0,
    startsCorrectly: key?.startsWith("sk-or-v1-") ?? false,
  });
}