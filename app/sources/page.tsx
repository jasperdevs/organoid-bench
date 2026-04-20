import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SourcesIndex() {
  const sources = await prisma.source.findMany({
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { datasets: true, systems: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        eyebrow="Sources"
        title="Papers, preprints, and data records"
        description="Every benchmark entry links to a source record: a paper, preprint, Zenodo/Figshare/DANDI record, or formal lab submission. No source, no entry."
      />
      <Container>
        {sources.length === 0 ? (
          <EmptyState
            title="No sources ingested yet"
            body="Sources enter through npm run ingest:zenodo, ingest:figshare, ingest:github, or ingest:source. Each ingestion stores exactly what the public API returns."
            primaryHref="/docs"
            primaryLabel="Read docs"
          />
        ) : (
          <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--surface-alt)] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">DOI</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium text-right">Datasets</th>
                  <th className="px-4 py-3 font-medium text-right">Systems</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3">
                      <Link href={`/sources/${s.id}`} className="font-medium hover:underline">{s.title}</Link>
                      {s.year && <span className="text-[color:var(--foreground-muted)]"> ({s.year})</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.kind}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.doi ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.reviewStatus ?? "-"}</td>
                    <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{s.organization?.name ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{s._count.datasets}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{s._count.systems}</td>
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
