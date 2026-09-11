import { NextResponse } from "next/server";
import { buildIcsContent, ICS_FILENAME } from "@/lib/calendar";

export function GET() {
  const body = buildIcsContent();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${ICS_FILENAME}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
