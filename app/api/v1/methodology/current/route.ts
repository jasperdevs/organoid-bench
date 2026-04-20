import { prisma } from "@/lib/db";
import { cachedJson, noStoreJson } from "@/lib/http-cache";

export async function GET() {
  const methodology = await prisma.methodologyVersion.findFirst({
    where: { isCurrent: true },
    orderBy: { releasedAt: "desc" },
  });
  if (!methodology) {
    return noStoreJson({ error: "no_current_methodology" }, { status: 404 });
  }
  return cachedJson({ methodology }, { profile: "long" });
}
