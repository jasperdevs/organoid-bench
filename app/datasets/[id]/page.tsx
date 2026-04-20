import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function fmtBytes(bytes: bigint | null): string {
  if (bytes == null) return "-";
  const n = Number(bytes);
  if (!Number.isFinite(n)) return String(bytes);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dataset = await prisma.dataset.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      organization: true,
      source: true,
      files: { orderBy: { path: "asc" } },
      systems: {
        select: { id: true, slug: true, name: true, verificationStatus: true },
      },
      provenanceEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!dataset) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Dataset"
        title={dataset.name}
        description={dataset.description ?? undefined}
        right={<StatusBadge status={dataset.verificationStatus} />}
      />

      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-[12px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]">
          <Stat label="Modality" value={dataset.modality ?? "-"} />
          <Stat label="Access" value={dataset.accessStatus} />
          <Stat label="License" value={dataset.licenseName ?? "-"} />
          <Stat label="Size" value={fmtBytes(dataset.sizeBytes)} />
        </div>
      </Container>

      <Section title="Source">
        {dataset.source ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="font-medium">{dataset.source.title}</div>
            <div className="text-sm text-[color:var(--foreground-muted)] mt-1">
              {dataset.source.kind}
              {dataset.source.year ? ` · ${dataset.source.year}` : ""}
              {dataset.source.venue ? ` · ${dataset.source.venue}` : ""}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {dataset.source.doi && (
                <span className="font-mono text-xs">DOI {dataset.source.doi}</span>
              )}
              {dataset.source.url && (
                <a className="hover:underline" href={dataset.source.url} target="_blank" rel="noopener noreferrer">
                  Open source
                </a>
              )}
              {dataset.dataUrl && (
                <a className="hover:underline" href={dataset.dataUrl} target="_blank" rel="noopener noreferrer">
                  Open data
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--foreground-muted)]">
            No source cited. Datasets without sources cannot be ingested or scored.
          </div>
        )}
      </Section>

      <Section title="Data availability">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Avail k="Raw data" v={dataset.rawDataAvailable} />
          <Avail k="Processed data" v={dataset.processedDataAvailable} />
          <Avail k="Metadata" v={dataset.metadataAvailable} />
          <Avail k="Code" v={dataset.codeAvailable} />
        </div>
      </Section>

      <Section title="Files">
        {dataset.files.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No file listing ingested.
          </div>
        ) : (
          <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--surface-alt)] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">Format</th>
                  <th className="px-4 py-3 font-medium text-right">Size</th>
                </tr>
              </thead>
              <tbody>
                {dataset.files.map((f) => (
                  <tr key={f.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3 font-mono text-xs">{f.path}</td>
                    <td className="px-4 py-3 font-mono text-xs">{f.format ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{fmtBytes(f.sizeBytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Linked systems">
        {dataset.systems.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No systems reference this dataset yet.
          </div>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {dataset.systems.map((s) => (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <Link href={`/systems/${s.slug}`} className="font-medium hover:underline">{s.name}</Link>
                <StatusBadge status={s.verificationStatus} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {dataset.limitations && (
        <Section title="Known limitations">
          <p className="text-sm text-[color:var(--foreground-muted)] max-w-3xl whitespace-pre-line">{dataset.limitations}</p>
        </Section>
      )}

      <div className="h-16" />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[color:var(--surface)] p-4">
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold font-mono truncate">{value}</div>
    </div>
  );
}

function Avail({ k, v }: { k: string; v: boolean }) {
  return (
    <div className={`rounded-[12px] border p-4 ${v ? "border-[color:var(--foreground)]" : "border-[color:var(--border)] bg-[color:var(--surface)]"}`}>
      <div className="text-xs text-[color:var(--foreground-muted)]">{k}</div>
      <div className="mt-1 font-mono text-sm">{v ? "available" : "not reported"}</div>
    </div>
  );
}
