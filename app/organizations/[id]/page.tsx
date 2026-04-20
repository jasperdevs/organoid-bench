import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      sources: { select: { id: true, title: true, kind: true, doi: true, year: true, reviewStatus: true } },
      datasets: { select: { id: true, slug: true, name: true, modality: true, accessStatus: true, verificationStatus: true } },
      systems: { select: { id: true, slug: true, name: true, verificationStatus: true } },
    },
  });
  if (!org) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Laboratory"
        title={org.name}
        description={[org.institution, org.country].filter(Boolean).join(" · ") || undefined}
      />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Panel title="Principal investigator">
            {org.pi ? (
              <div className="text-sm">{org.pi}</div>
            ) : (
              <span className="text-[color:var(--foreground-muted)] text-sm">unspecified</span>
            )}
          </Panel>
          <Panel title="Website">
            {org.website ? (
              <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:underline font-mono text-xs break-all">
                {org.website}
              </a>
            ) : (
              <span className="text-[color:var(--foreground-muted)] text-sm">unspecified</span>
            )}
          </Panel>
        </div>
      </Container>

      <Section title="Sources" description="Papers, preprints, and data records attributed to this lab.">
        {org.sources.length === 0 ? (
          <Empty>No sources attributed to this lab yet.</Empty>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {org.sources.map((s) => (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                <Link href={`/sources/${s.id}`} className="font-medium hover:underline truncate">{s.title}</Link>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs text-[color:var(--foreground-muted)]">{s.kind}</span>
                  {s.year && <span className="font-mono text-xs text-[color:var(--foreground-muted)]">{s.year}</span>}
                  <StatusBadge status={s.reviewStatus ?? "draft"} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Datasets">
        {org.datasets.length === 0 ? (
          <Empty>No datasets ingested under this lab.</Empty>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {org.datasets.map((d) => (
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

      <Section title="Systems">
        {org.systems.length === 0 ? (
          <Empty>No systems registered from this lab.</Empty>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {org.systems.map((s) => (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <Link href={`/systems/${s.slug}`} className="font-medium hover:underline">{s.name}</Link>
                <StatusBadge status={s.verificationStatus} />
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

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
      {children}
    </div>
  );
}
