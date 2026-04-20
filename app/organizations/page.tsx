import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OrganizationsIndex() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { systems: true, datasets: true, sources: true } },
    },
    orderBy: { name: "asc" },
    take: 500,
  });

  return (
    <>
      <PageHeader
        eyebrow="Labs"
        title="Contributing laboratories"
        description="Organizations are listed when linked to source-backed registry records."
      />
      <Container>
        {orgs.length === 0 ? (
          <EmptyState
            title="No organizations registered"
            body="Organizations will appear after source-backed records are curated."
            primaryHref="/submit"
            primaryLabel="Submit"
          />
        ) : (
          <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--surface-alt)] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Institution</th>
                  <th className="px-4 py-3 font-medium">PI</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium text-right">Sources</th>
                  <th className="px-4 py-3 font-medium text-right">Datasets</th>
                  <th className="px-4 py-3 font-medium text-right">Systems</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => (
                  <tr key={o.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3">
                      <Link href={`/organizations/${o.id}`} className="font-medium hover:underline">{o.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{o.institution ?? "-"}</td>
                    <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{o.pi ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{o.country ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{o._count.sources}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{o._count.datasets}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{o._count.systems}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
      <div className="h-16" />
    </>
  );
}
