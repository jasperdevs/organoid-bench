import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatRow } from "@/components/ui/metric";
import { BenchmarkChart } from "@/components/benchmark-chart";
import { Leaderboard } from "@/components/leaderboard";
import {
  STATUS_COUNTS,
  TRACKS,
  SYSTEMS,
  RECENT_UPDATES,
  DATASETS,
  trackById,
} from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

export default function Home() {
  const topPerTrack = TRACKS.map((t) => {
    const list = SYSTEMS.filter((s) => s.track === t.id).sort(
      (a, b) => b.metrics.composite - a.metrics.composite,
    );
    return { track: t, top: list[0], count: list.length };
  });

  const recentDatasets = [...DATASETS].sort((a, b) => b.year - a.year).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="public benchmark · live dashboard"
        title="standardized evaluation for brain organoid systems"
        description="OrganoidBench compares full experimental systems — organoid + culture + recording + stimulation + decoder + task + controls + dataset + lab — across signal quality, responsiveness, plasticity, closed-loop learning, retention, and reproducibility."
        right={
          <div className="flex gap-2">
            <Button href="/leaderboard" variant="primary">view leaderboard</Button>
            <Button href="/submit" variant="outline">submit results</Button>
          </div>
        }
      >
        <div className="mt-8">
          <StatRow
            items={[
              { label: "systems evaluated", value: formatNumber(STATUS_COUNTS.systems) },
              {
                label: "organoids represented",
                value: formatNumber(STATUS_COUNTS.organoids),
              },
              { label: "datasets indexed", value: formatNumber(STATUS_COUNTS.datasets) },
              { label: "labs & sources", value: formatNumber(STATUS_COUNTS.labs) },
              {
                label: "last updated",
                value: (
                  <span className="text-sm">{formatDate(STATUS_COUNTS.lastUpdated)}</span>
                ),
              },
            ]}
          />
        </div>
      </PageHeader>

      <Section
        title="benchmark landscape"
        description="Each bubble is one system. Defaults show learning gain vs reproducibility confidence, sized by number of organoids."
        right={
          <Link
            href="/leaderboard"
            className="text-sm text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] underline underline-offset-4"
          >
            open full chart →
          </Link>
        }
      >
        <BenchmarkChart />
      </Section>

      <Section
        title="ranked leaderboard"
        description="The canonical ranked list. Click a row to expand learning curves, controls, and limitations."
        right={
          <div className="flex gap-2">
            <Button href="/leaderboard" size="sm" variant="outline">
              advanced filters
            </Button>
            <Button href="/docs#api" size="sm" variant="ghost">
              api
            </Button>
          </div>
        }
      >
        <Leaderboard compact />
      </Section>

      <Section
        title="benchmark tracks"
        description="Six tracks cover the full stack, from recording quality to reproducibility. Each track is scored independently."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPerTrack.map(({ track, top, count }) => (
            <Card key={track.id} className="flex flex-col">
              <div className="flex items-center justify-between">
                <Badge tone="outline">{track.name.toLowerCase()}</Badge>
                <span className="text-xs font-mono text-[color:var(--foreground-muted)]">
                  {count} system{count === 1 ? "" : "s"}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{track.name}</h3>
              <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
                {track.short}.
              </p>
              {top && (
                <div className="mt-4 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
                    current top
                  </div>
                  <Link
                    href={`/systems/${top.id}`}
                    className="mt-1 block font-medium hover:underline"
                  >
                    {top.name}
                  </Link>
                  <div className="mt-1 text-xs font-mono text-[color:var(--foreground-muted)]">
                    composite {top.metrics.composite.toFixed(2)} · grade {top.grade}
                  </div>
                </div>
              )}
              <Link
                href={`/benchmarks/${track.id}`}
                className="mt-auto pt-4 text-sm underline underline-offset-4"
              >
                open track →
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-3">
              recent updates
            </div>
            <ul className="divide-y divide-[color:var(--border)]">
              {RECENT_UPDATES.map((u, i) => (
                <li key={i} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={u.href}
                    className="block hover:bg-[color:var(--surface-alt)] -mx-2 px-2 rounded-[8px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{u.title}</div>
                      <span className="text-[10px] font-mono uppercase text-[color:var(--foreground-muted)]">
                        {u.kind}
                      </span>
                    </div>
                    <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">
                      {u.detail}
                    </div>
                    <div className="text-[11px] font-mono text-[color:var(--foreground-muted)] mt-1">
                      {formatDate(u.date)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-3">
              newly added datasets
            </div>
            <ul className="divide-y divide-[color:var(--border)]">
              {recentDatasets.map((d) => (
                <li key={d.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/datasets/${d.id}`}
                    className="block hover:bg-[color:var(--surface-alt)] -mx-2 px-2 rounded-[8px]"
                  >
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-[color:var(--foreground-muted)]">
                      {d.modality} · {d.nOrganoids} organoids · {d.license}
                    </div>
                    <div className="mt-1 flex gap-1.5 flex-wrap">
                      {d.tracks.map((t) => (
                        <Badge key={t} tone="outline">
                          {trackById(t).name.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-3">
              status
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-[color:var(--foreground-muted)]">methodology</span>
                <Link href="/methodology" className="font-mono underline underline-offset-2">
                  {STATUS_COUNTS.methodologyVersion}
                </Link>
              </li>
              <li className="flex justify-between">
                <span className="text-[color:var(--foreground-muted)]">submissions queue</span>
                <Link href="/governance#review-process" className="underline underline-offset-2">
                  open
                </Link>
              </li>
              <li className="flex justify-between">
                <span className="text-[color:var(--foreground-muted)]">api</span>
                <Link href="/docs#api" className="underline underline-offset-2">
                  public read-only
                </Link>
              </li>
              <li className="flex justify-between">
                <span className="text-[color:var(--foreground-muted)]">governance</span>
                <Link href="/governance" className="underline underline-offset-2">
                  open policies
                </Link>
              </li>
            </ul>

            <div className="mt-6 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-3 text-xs text-[color:var(--foreground-muted)]">
              OrganoidBench measures experimental system performance and adaptive
              neural dynamics. It does not claim to measure consciousness,
              sentience, or human-like intelligence.
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
