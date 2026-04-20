import { prisma } from "@/lib/db";
import { cachedJson, noStoreJson } from "@/lib/http-cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ version: string }> },
) {
  const { version } = await params;
  const methodology = await prisma.methodologyVersion.findUnique({ where: { version } });
  if (!methodology) {
    return noStoreJson({ error: "not_found", version }, { status: 404 });
  }
  return cachedJson({ methodology }, { profile: "long" });
}
