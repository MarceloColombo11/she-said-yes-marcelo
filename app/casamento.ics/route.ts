import { NextResponse } from "next/server";
import { buildIcsContent, ICS_FILENAME } from "@/lib/calendar";
import { getPublicSiteContent } from "@/lib/content/public";

export const revalidate = 60;

export async function GET() {
  const { weddingEvent } = await getPublicSiteContent();
  const body = buildIcsContent(weddingEvent);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${ICS_FILENAME}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
