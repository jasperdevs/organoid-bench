import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { LeaderboardView } from "@/components/leaderboard-view";
import { STATUS_COUNTS } from "@/lib/data";

export default function LeaderboardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Leaderboards"
        title="Organoid systems — ranked"
        description={`Performance across six benchmark tracks. Methodology ${STATUS_COUNTS.methodologyVersion}. Last updated ${STATUS_COUNTS.lastUpdated}.`}
        right={
          <div className="flex flex-col gap-2 items-end">
            <Link
              href="/submit"
              className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Submit an entry
            </Link>
            <Link
              href="/about#methodology"
              className="text-sm text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] underline underline-offset-4"
            >
              How scores are calculated
            </Link>
          </div>
        }
      />
      <Container>
        <LeaderboardView />
      </Container>
      <div className="h-16" />
    </>
  );
}
