import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { name: "asc" },
    include: {
      track: { select: { slug: true, name: true } },
      _count: { select: { runs: true, systems: true } },
    },
  });
  return NextResponse.json({ count: tasks.length, tasks });
}
