import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { EmptyState, StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SystemsIndex() {
  const systems = await prisma.system.findMany({
    include: {
      organization: { select: { id: true, name: true } },
      dataset: { select: { slug: true, name: true } },
      source: { select: { url: true, doi: true, title: true } },
      task: { include: { track: { select: { slug: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        eyebrow="Systems"
        title="Registered systems"
        description="A system is the full experimental setup: organoid preparation, recording setup, stimulation protocol, task, controls, dataset, and source citation. Systems without a source never reach this page."
      />
      <Container>
        {systems.length === 0 ? (
          <EmptyState
            title="No systems registered yet"
            body="The registry is empty. Systems enter only through the submission workflow or ingestion of a verified source."
            primaryHref="/submit"
            primaryLabel="Submit an entry"
            secondaryHref="/docs"
            secondaryLabel="Read API docs"
          />
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="text-left bg-[color:var(--surface-alt)]">
                <tr>
                  <th className="px-4 py-3 font-medium">System</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium">Track / Task</th>
                  <th className="px-4 py-3 font-medium">Dataset</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3">
                      <Link href={`/systems/${s.slug}`} className="font-medium hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{s.organization?.name ?? "-"}</td>
                    <td className="px-4 py-3">
                      {s.task ? (
                        <>
                          <Link href={`/benchmarks/${s.task.track.slug}`} className="hover:underline">
                            {s.task.track.name}
                          </Link>
                          <span className="text-[color:var(--foreground-muted)]"> / {s.task.name}</span>
                        </>
                      ) : (
                        <span className="text-[color:var(--foreground-muted)]">unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.dataset ? (
                        <Link href={`/datasets/${s.dataset.slug}`} className="hover:underline">
                          {s.dataset.name}
                        </Link>
                      ) : (
                        <span className="text-[color:var(--foreground-muted)]">no dataset</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.source?.url ? (
                        <a className="hover:underline" href={s.source.url} target="_blank" rel="noopener noreferrer">
                          {(s.source.title ?? "source").slice(0, 36)}
                        </a>
                      ) : (
                        <span className="text-[color:var(--foreground-muted)]">no source</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.verificationStatus} />
                    </td>
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
