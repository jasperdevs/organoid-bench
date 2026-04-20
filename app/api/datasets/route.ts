import { NextResponse } from "next/server";
import { DATASETS } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ count: DATASETS.length, datasets: DATASETS });
}
