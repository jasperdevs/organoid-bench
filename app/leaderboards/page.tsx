import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { LeaderboardView } from "@/components/leaderboard-view";
import { STATUS_COUNTS } from "@/lib/data";

export default function LeaderboardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Leaderboards"
        title="Organoid systems, ranked"
        description={`Performance across six benchmark tracks. Methodology ${STATUS_COUNTS.methodologyVersion}. Last updated ${STATUS_COUNTS.lastUpdated}.`}
        right={
          <Link
            href="/about#methodology"
            className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
          >
            Methodology
          </Link>
        }
      />
      <Container>
        <LeaderboardView />
      </Container>
      <div className="h-16" />
    </>
  );
}
