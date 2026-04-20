import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASKS, trackById, systemsForTask } from "@/lib/data";

export default function TasksIndex() {
  return (
    <>
      <PageHeader
        eyebrow="benchmark tasks"
        title="task definitions"
        description="Tasks are the standardized experimental assays benchmarked by OrganoidBench. Each task specifies inputs, outputs, metrics, and required controls."
      />
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TASKS.map((t) => {
            const track = trackById(t.track);
            const count = systemsForTask(t.id).length;
            return (
              <Link key={t.id} href={`/tasks/${t.id}`}>
                <Card className="h-full hover:border-[color:var(--foreground)]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge tone="outline">{track.name.toLowerCase()}</Badge>
                    <span className="text-xs font-mono text-[color:var(--foreground-muted)]">
                      {count} systems
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                    {t.id}
                  </div>
                  <h3 className="mt-1 text-base font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
                    {t.objective}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </Section>
    </>
  );
}
