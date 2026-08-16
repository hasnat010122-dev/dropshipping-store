import { NextRequest, NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
  return NextResponse.json(getRecentActivity(limit));
}
