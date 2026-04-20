import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const source = await prisma.source.findFirst({
    where: { OR: [{ id }, { doi: id }] },
    include: {
      organization: true,
      datasets: {
        select: { id: true, slug: true, name: true, modality: true, accessStatus: true, verificationStatus: true },
      },
      systems: {
        select: { id: true, slug: true, name: true, verificationStatus: true },
      },
      provenanceEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!source) notFound();

  const authors: string[] = (() => {
    if (!source.authors) return [];
    try {
      const parsed = JSON.parse(source.authors);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  })();

  return (
    <>
      <PageHeader
        eyebrow="Source"
        title={source.title}
        description={[source.kind, source.year, source.venue].filter(Boolean).join(" · ")}
        right={<StatusBadge status={source.reviewStatus ?? "draft"} />}
      />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Panel title="Identifiers">
            <dl className="text-sm space-y-1 font-mono">
              {source.doi && (
                <div>
                  <dt className="inline text-[color:var(--foreground-muted)]">DOI </dt>
                  <dd className="inline">{source.doi}</dd>
                </div>
              )}
              {source.url && (
                <div>
                  <dt className="inline text-[color:var(--foreground-muted)]">URL </dt>
                  <dd className="inline">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {source.url}
                    </a>
                  </dd>
                </div>
              )}
              {source.repositoryType && (
                <div>
                  <dt className="inline text-[color:var(--foreground-muted)]">Repository </dt>
                  <dd className="inline">{source.repositoryType}</dd>
                </div>
              )}
              {source.licenseName && (
                <div>
                  <dt className="inline text-[color:var(--foreground-muted)]">License </dt>
                  <dd className="inline">{source.licenseName}</dd>
                </div>
              )}
            </dl>
          </Panel>
          <Panel title="Organization">
            {source.organization ? (
              <Link href={`/organizations/${source.organization.id}`} className="font-medium hover:underline">
                {source.organization.name}
              </Link>
            ) : (
              <span className="text-[color:var(--foreground-muted)]">unspecified</span>
            )}
            {source.organization?.pi && (
              <div className="text-sm text-[color:var(--foreground-muted)] mt-1">PI: {source.organization.pi}</div>
            )}
            {source.organization?.institution && (
              <div className="text-sm text-[color:var(--foreground-muted)]">{source.organization.institution}</div>
            )}
          </Panel>
        </div>
      </Container>

      {authors.length > 0 && (
        <Section title="Authors">
          <div className="flex flex-wrap gap-2 text-sm">
            {authors.map((a, i) => (
              <span key={i} className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1">
                {String(a)}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Linked datasets">
        {source.datasets.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No datasets ingested from this source yet.
          </div>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {source.datasets.map((d) => (
              <li key={d.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                <Link href={`/datasets/${d.slug}`} className="font-medium hover:underline truncate">{d.name}</Link>
                <div className="flex items-center gap-2 shrink-0">
                  {d.modality && <span className="font-mono text-xs text-[color:var(--foreground-muted)]">{d.modality}</span>}
                  <span className="font-mono text-xs text-[color:var(--foreground-muted)]">{d.accessStatus}</span>
                  <StatusBadge status={d.verificationStatus} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Linked systems">
        {source.systems.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No systems cite this source yet.
          </div>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {source.systems.map((s) => (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <Link href={`/systems/${s.slug}`} className="font-medium hover:underline">{s.name}</Link>
                <StatusBadge status={s.verificationStatus} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Provenance">
        {source.provenanceEvents.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No provenance events.
          </div>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {source.provenanceEvents.map((ev) => (
              <li key={ev.id} className="px-4 py-3 text-sm flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-[color:var(--foreground-muted)]">{ev.eventType}</div>
                  <div className="mt-0.5">{ev.message ?? "-"}</div>
                  {ev.actor && <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">{ev.actor}</div>}
                </div>
                <div className="font-mono text-xs text-[color:var(--foreground-muted)] shrink-0">
                  {ev.createdAt.toISOString().slice(0, 10)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="h-16" />
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}
