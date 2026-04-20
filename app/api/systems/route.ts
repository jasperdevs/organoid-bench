import { NextResponse } from "next/server";
import { SYSTEMS } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ count: SYSTEMS.length, systems: SYSTEMS });
}
