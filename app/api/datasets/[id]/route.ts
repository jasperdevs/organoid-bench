import { NextResponse } from "next/server";
import { DATASETS, datasetById } from "@/lib/data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return DATASETS.map((d) => ({ id: d.id }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const d = datasetById(id);
  if (!d) {
    return NextResponse.json({ error: "not_found", id }, { status: 404 });
  }
  return NextResponse.json(d);
}
