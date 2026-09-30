import { NextResponse } from "next/server";
import { getAllSitePages } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  return NextResponse.json(await getAllSitePages());
}
