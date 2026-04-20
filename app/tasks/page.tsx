import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TasksIndex() {
  const tasks = await prisma.task.findMany({
    include: {
      track: { select: { slug: true, name: true } },
      _count: { select: { systems: true, runs: true } },
    },
    orderBy: [{ track: { sortOrder: "asc" } }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        eyebrow="Tasks"
        title="Benchmark tasks"
        description="Tasks are concrete protocols within a track. Each task specifies required inputs and pairs with one or more systems."
      />
      <Container>
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks defined yet"
            body="Tasks are part of the canonical seed. If you see this, the database has not been seeded or the seed failed."
            primaryHref="/docs"
            primaryLabel="Read API docs"
          />
        ) : (
          <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--surface-alt)] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Track</th>
                  <th className="px-4 py-3 font-medium">Required inputs</th>
                  <th className="px-4 py-3 font-medium text-right">Systems</th>
                  <th className="px-4 py-3 font-medium text-right">Runs</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3">
                      <Link href={`/tasks/${t.slug}`} className="font-medium hover:underline">{t.name}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/benchmarks/${t.track.slug}`} className="hover:underline text-[color:var(--foreground-muted)]">
                        {t.track.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">{t.requiredInputs ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{t._count.systems}</td>
                    <td className="px-4 py-3 font-mono text-xs text-right">{t._count.runs}</td>
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
