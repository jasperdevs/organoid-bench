import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { EmptyState, StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DatasetsIndex() {
  const datasets = await prisma.dataset.findMany({
    include: {
      organization: { select: { id: true, name: true } },
      source: { select: { title: true, doi: true, url: true, kind: true } },
      _count: { select: { systems: true, files: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        eyebrow="Datasets"
        title="Benchmark-linked datasets"
        description="Datasets are indexed by source, modality, license, and access status. Only datasets pointing to a real source URL or DOI can be ingested."
      />
      <Container>
        {datasets.length === 0 ? (
          <EmptyState
            title="No datasets ingested yet"
            body="Run one of the ingest:* scripts against a real Zenodo, Figshare, DANDI, or GitHub record. Datasets without a verified source will never appear here."
            primaryHref="/docs"
            primaryLabel="Read API docs"
            secondaryHref="/submit"
            secondaryLabel="Submit an entry"
          />
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="text-left bg-[color:var(--surface-alt)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Dataset</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Modality</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Raw / Proc / Code</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={d.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3">
                      <Link href={`/datasets/${d.slug}`} className="font-medium hover:underline">{d.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{d.organization?.name ?? "-"}</td>
                    <td className="px-4 py-3">
                      {d.source?.url ? (
                        <a className="hover:underline" href={d.source.url} target="_blank" rel="noopener noreferrer">
                          {(d.source.title ?? d.source.kind).slice(0, 36)}
                        </a>
                      ) : (
                        <span className="text-[color:var(--foreground-muted)]">no source</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{d.modality ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.accessStatus}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {d.rawDataAvailable ? "Y" : "-"} / {d.processedDataAvailable ? "Y" : "-"} / {d.codeAvailable ? "Y" : "-"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={d.verificationStatus} /></td>
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
