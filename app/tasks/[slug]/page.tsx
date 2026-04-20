import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const task = await prisma.task.findUnique({
    where: { slug },
    include: {
      track: true,
      systems: {
        select: { id: true, slug: true, name: true, verificationStatus: true, organization: { select: { name: true } } },
      },
      runs: {
        include: {
          system: { select: { slug: true, name: true } },
          methodologyVersion: { select: { version: true } },
          scoreCalculations: true,
        },
        orderBy: { runDate: "desc" },
      },
    },
  });
  if (!task) notFound();

  return (
    <>
      <PageHeader
        eyebrow={`Track · ${task.track.name}`}
        title={task.name}
        description={task.description ?? undefined}
      />

      <Container>
        <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
          <div className="text-sm font-semibold mb-2">Required inputs</div>
          {task.requiredInputs ? (
            <pre className="font-mono text-xs whitespace-pre-wrap text-[color:var(--foreground-muted)]">{task.requiredInputs}</pre>
          ) : (
            <span className="text-sm text-[color:var(--foreground-muted)]">not specified</span>
          )}
        </div>
      </Container>

      <Section title="Systems registered for this task">
        {task.systems.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No systems registered for this task yet.
          </div>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {task.systems.map((s) => (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/systems/${s.slug}`} className="font-medium hover:underline">{s.name}</Link>
                  {s.organization?.name && (
                    <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">{s.organization.name}</div>
                  )}
                </div>
                <StatusBadge status={s.verificationStatus} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Runs">
        {task.runs.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No benchmark runs for this task yet.
          </div>
        ) : (
          <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--surface-alt)] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">System</th>
                  <th className="px-4 py-3 font-medium">Methodology</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Composite</th>
                </tr>
              </thead>
              <tbody>
                {task.runs.map((r) => {
                  const composite = r.scoreCalculations.find((sc) => sc.scoreType === "composite");
                  return (
                    <tr key={r.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3">
                        <Link href={`/systems/${r.system.slug}`} className="font-medium hover:underline">{r.system.name}</Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.methodologyVersion?.version ?? "unassigned"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.runDate ? r.runDate.toISOString().slice(0, 10) : "-"}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.runStatus} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-right">
                        {composite?.score != null ? composite.score.toFixed(2) : "unscored"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <div className="h-16" />
    </>
  );
}
