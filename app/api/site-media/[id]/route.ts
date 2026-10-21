import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { siteMedia } from "@/lib/db/schema";
import { isSafeStaticPath, isUuid } from "@/lib/content/validation";

function resolveStaticMedia(staticPath: string): string | null {
  const webp = staticPath.replace(/\.(jpe?g|png)$/i, ".webp");
  const candidates = webp === staticPath ? [staticPath] : [staticPath, webp];

  for (const candidate of candidates) {
    if (!isSafeStaticPath(candidate)) continue;
    const abs = path.join(process.cwd(), "public", candidate.replace(/^\//, ""));
    if (existsSync(abs)) return candidate;
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const db = getDb();
    if (!db) {
      return new NextResponse(null, { status: 404 });
    }

    const [row] = await db
      .select()
      .from(siteMedia)
      .where(eq(siteMedia.id, id))
      .limit(1);
    if (!row) {
      return new NextResponse(null, { status: 404 });
    }

    if (row.source === "static" && row.staticPath && isSafeStaticPath(row.staticPath)) {
      const resolved = resolveStaticMedia(row.staticPath);
      if (!resolved) {
        return new NextResponse(null, { status: 404 });
      }
      return NextResponse.redirect(new URL(resolved, request.url), 302);
    }

    if (row.source === "db" && row.bytes) {
      const body = new Uint8Array(row.bytes);
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": row.mime,
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error("[site-media]", error);
    return new NextResponse(null, { status: 502 });
  }
}
