import { NextResponse } from "next/server";

const UPLOAD_URL = process.env.GOOGLE_APPS_SCRIPT_UPLOAD_URL ?? "";

export async function GET() {
  return NextResponse.json({ enabled: !!UPLOAD_URL });
}
