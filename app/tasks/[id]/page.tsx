import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { Leaderboard } from "@/components/leaderboard";
import {
  TASKS,
  taskById,
  trackById,
  systemsForTask,
  labById,
} from "@/lib/data";

export function generateStaticParams() {
  return TASKS.map((t) => ({ id: t.id }));
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = taskById(id);
  if (!t) notFound();

  const track = trackById(t.track);
  const list = systemsForTask(t.id);

  return (
    <>
      <PageHeader
        eyebrow={`task · ${t.id}`}
        title={t.name}
        description={t.objective}
        right={
          <div className="flex gap-2">
            <Button
              href={`/benchmarks/${track.id}`}
              size="sm"
              variant="outline"
            >
              open track
            </Button>
            <Button href="/submit" size="sm" variant="primary">
              submit result
            </Button>
          </div>
        }
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="outline">{track.name.toLowerCase()}</Badge>
          {t.variants.map((v) => (
            <Badge key={v} tone="outline">
              variant · {v}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="input protocol" />
            <p className="text-sm">{t.inputProtocol}</p>
          </Card>
          <Card>
            <CardHeader title="output measured" />
            <p className="text-sm">{t.output}</p>
          </Card>
          <Card>
            <CardHeader title="scoring metrics" />
            <ul className="flex flex-wrap gap-2">
              {t.metrics.map((m) => (
                <Badge key={m} tone="muted" mono>
                  {m}
                </Badge>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="required controls" />
            <ul className="space-y-1 text-sm list-disc pl-5">
              {t.requiredControls.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="known confounds" />
            <ul className="space-y-1 text-sm list-disc pl-5 text-[color:var(--foreground-muted)]">
              {t.confounds.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="allowed variants" />
            <ul className="flex flex-wrap gap-2">
              {t.variants.map((v) => (
                <Badge key={v} tone="outline">
                  {v}
                </Badge>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="leaderboard for this task">
        <Leaderboard systems={list} compact showAdvancedFilters={false} />
      </Section>

      <Section title="example systems">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.slice(0, 4).map((s) => (
            <Link key={s.id} href={`/systems/${s.id}`}>
              <Card className="hover:border-[color:var(--foreground)]">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.name}</div>
                  <ConfidenceBadge grade={s.grade} compact />
                </div>
                <div className="text-xs text-[color:var(--foreground-muted)]">
                  {labById(s.labId)?.name}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <div className="text-[10px] uppercase text-[color:var(--foreground-muted)]">
                      learning
                    </div>
                    <div>{s.metrics.learning.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[color:var(--foreground-muted)]">
                      retention
                    </div>
                    <div>{s.metrics.retention.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[color:var(--foreground-muted)]">
                      repro
                    </div>
                    <div>{s.metrics.reproducibility.toFixed(2)}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <Card className="bg-[color:var(--surface-alt)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
                submission requirements
              </div>
              <p className="text-sm mt-1 max-w-[540px]">
                Results on the {t.name} task must specify input protocol, feedback
                mapping (if applicable), decoder/controller state, and all
                required controls.
              </p>
            </div>
            <Button href="/submit" variant="primary" size="sm">
              submit result
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
