import Link from "next/link";
import { PageHeader, Section, Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BenchmarkChart } from "@/components/benchmark-chart";
import { Leaderboard } from "@/components/leaderboard";
import { TRACKS, STATUS_COUNTS } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function LeaderboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="leaderboard"
        title="OrganoidBench Leaderboard"
        description="Compare organoid-based experimental systems across standardized functional benchmarks. Scoring is track-first; composite scores are secondary."
        right={
          <div className="flex gap-2 flex-wrap">
            <Button href="/docs#csv" size="sm" variant="outline">
              download csv
            </Button>
            <Button href="/docs#api" size="sm" variant="ghost">
              api
            </Button>
            <Button href="/submit" size="sm" variant="primary">
              submit result
            </Button>
          </div>
        }
      >
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-[color:var(--foreground-muted)]">
            last updated
            <span className="ml-2 font-mono text-[color:var(--foreground)]">
              {formatDate(STATUS_COUNTS.lastUpdated)}
            </span>
          </span>
          <span className="text-[color:var(--foreground-muted)]">
            methodology
            <Link
              href="/methodology#versioning"
              className="ml-2 font-mono text-[color:var(--foreground)] underline underline-offset-2"
            >
              {STATUS_COUNTS.methodologyVersion}
            </Link>
          </span>
          <span className="text-[color:var(--foreground-muted)]">
            grades
            <span className="ml-2 font-mono text-[color:var(--foreground)]">A · B · C · D</span>
          </span>
        </div>
      </PageHeader>

      <Section title="advanced chart">
        <BenchmarkChart height={420} />
      </Section>

      <Section
        title="ranked results"
        description="Expand any row for learning curve, controls, and limitations. Sortable by every metric."
      >
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="min-w-0">
            <Leaderboard />
          </div>
          <aside className="space-y-4">
            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-3">
                metric explanations
              </div>
              <ul className="space-y-3 text-sm">
                {TRACKS.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/benchmarks/${t.id}`}
                      className="font-medium hover:underline"
                    >
                      {t.name}
                    </Link>
                    <p className="text-xs text-[color:var(--foreground-muted)] mt-0.5">
                      {t.short}.
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-3">
                row badges
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge tone="default">raw</Badge>
                  raw traces available
                </li>
                <li className="flex items-center gap-2">
                  <Badge tone="default">code</Badge>
                  analysis code public
                </li>
                <li className="flex items-center gap-2">
                  <Badge tone="default">peer</Badge>
                  peer reviewed
                </li>
                <li className="flex items-center gap-2">
                  <Badge tone="outline">closed-loop</Badge>
                  closed-loop system
                </li>
                <li className="flex items-center gap-2">
                  <Badge tone="outline">multi-lab</Badge>
                  independently replicated
                </li>
              </ul>
            </Card>
            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-3">
                note
              </div>
              <p className="text-sm text-[color:var(--foreground-muted)]">
                Entries with missing metadata or failing controls are not hidden —
                they are graded <span className="font-mono">C</span>,{" "}
                <span className="font-mono">D</span>, or{" "}
                <span className="font-mono">Unscored</span>. Ranking is always
                paired with a confidence grade.
              </p>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
