import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const toc = [
  { id: "review-process", label: "1. review process" },
  { id: "scoring-updates", label: "2. scoring updates" },
  { id: "coi", label: "3. conflict of interest policy" },
  { id: "corrections", label: "4. correction requests" },
  { id: "disputed", label: "5. disputed scores" },
  { id: "versioning", label: "6. benchmark versioning" },
  { id: "advisory", label: "7. advisory board" },
  { id: "standards", label: "8. reproducibility standards" },
];

export default function GovernancePage() {
  return (
    <>
      <PageHeader
        eyebrow="governance & review"
        title="how OrganoidBench is governed"
        description="Credibility requires process. These pages describe how entries are reviewed, how disputes are handled, and how the methodology changes."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
              contents
            </div>
            <ul className="space-y-1 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="space-y-10">
            <section id="review-process">
              <h2 className="text-xl font-semibold mb-3">1. review process</h2>
              <Card>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Automated validation against the JSON schema.</li>
                  <li>Independent review by two reviewers not affiliated with the submitting lab.</li>
                  <li>Author response period (14 days).</li>
                  <li>Provisional listing with a "provisional" flag.</li>
                  <li>Final scored listing after controls are confirmed.</li>
                </ol>
              </Card>
            </section>

            <section id="scoring-updates">
              <h2 className="text-xl font-semibold mb-3">2. scoring updates</h2>
              <Card>
                <p className="text-sm">
                  Scores are recomputed automatically when:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                  <li>methodology version changes</li>
                  <li>a linked dataset is updated</li>
                  <li>a replication is added</li>
                  <li>a correction is accepted</li>
                </ul>
                <p className="text-sm mt-3 text-[color:var(--foreground-muted)]">
                  Previous scores are preserved and accessible via the API with{" "}
                  <code className="font-mono">?version=</code>.
                </p>
              </Card>
            </section>

            <section id="coi">
              <h2 className="text-xl font-semibold mb-3">3. conflict of interest policy</h2>
              <Card>
                <ul className="list-disc pl-5 text-sm space-y-2">
                  <li>Reviewers recuse themselves from entries submitted by their lab or close collaborators.</li>
                  <li>Commercial submitters must disclose financial relationships.</li>
                  <li>Advisory board members do not review their own entries.</li>
                  <li>Every scored entry lists at least two non-conflicted reviewers.</li>
                </ul>
              </Card>
            </section>

            <section id="corrections">
              <h2 className="text-xl font-semibold mb-3">4. correction requests</h2>
              <Card>
                <p className="text-sm">
                  Anyone can submit a correction using the{" "}
                  <Link href="/submit#correction" className="underline underline-offset-2">
                    correction form
                  </Link>
                  . Corrections are triaged within 7 days.
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1 mt-3">
                  <li>metadata corrections: applied immediately after verification</li>
                  <li>scoring corrections: recomputed under current methodology</li>
                  <li>dispute corrections: see section 5</li>
                </ul>
              </Card>
            </section>

            <section id="disputed">
              <h2 className="text-xl font-semibold mb-3">5. disputed scores</h2>
              <Card padded={false}>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">entry</th>
                      <th className="px-4 py-3 font-medium">status</th>
                      <th className="px-4 py-3 font-medium">reason</th>
                      <th className="px-4 py-3 font-medium">last reviewed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    <Disputed
                      id="ob-sys-0008"
                      status="under review"
                      reason="sham condition re-analysis requested"
                      date="2026-04-18"
                    />
                    <Disputed
                      id="ob-sys-0002"
                      status="provisional"
                      reason="raw data unavailable; scored on processed artifacts only"
                      date="2026-02-22"
                    />
                  </tbody>
                </table>
              </Card>
              <p className="mt-3 text-xs text-[color:var(--foreground-muted)]">
                Disputed entries remain visible with a clear status badge.
                Scores are frozen during dispute.
              </p>
            </section>

            <section id="versioning">
              <h2 className="text-xl font-semibold mb-3">6. benchmark versioning</h2>
              <Card>
                <p className="text-sm">
                  Methodology versions follow semver. Breaking changes bump the
                  major version; entries are automatically re-scored.
                </p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Badge tone="outline">v1.0.0 · 2025-01-10</Badge>
                  <Badge tone="outline">v1.1.0 · 2025-06-18</Badge>
                  <Badge tone="outline">v1.2.0 · 2025-11-02</Badge>
                  <Badge tone="default">v1.3.0 · current</Badge>
                </div>
                <Button href="/methodology#versioning" size="sm" variant="outline" className="mt-4">
                  full changelog
                </Button>
              </Card>
            </section>

            <section id="advisory">
              <h2 className="text-xl font-semibold mb-3">7. advisory board</h2>
              <Card>
                <p className="text-sm text-[color:var(--foreground-muted)]">
                  Placeholder. The advisory board is constituted from the
                  organoid, electrophysiology, and closed-loop-learning
                  communities. Membership is public and time-limited.
                </p>
                <ul className="mt-3 text-sm space-y-1 list-disc pl-5">
                  <li>ephys / MEA representative</li>
                  <li>organoid protocol representative</li>
                  <li>closed-loop / BMI representative</li>
                  <li>ethics representative</li>
                  <li>independent replication representative</li>
                </ul>
              </Card>
            </section>

            <section id="standards">
              <h2 className="text-xl font-semibold mb-3">8. reproducibility standards</h2>
              <Card>
                <ul className="text-sm space-y-2 list-disc pl-5">
                  <li>grade A requires either open raw data + controls, or an independent replication</li>
                  <li>every grade must have at least one non-lab reviewer</li>
                  <li>preprints without open data are capped at grade B</li>
                  <li>entries without a limitations statement are not scored</li>
                </ul>
              </Card>
            </section>
          </div>
        </div>
      </Section>
    </>
  );
}

function Disputed({
  id,
  status,
  reason,
  date,
}: {
  id: string;
  status: string;
  reason: string;
  date: string;
}) {
  return (
    <tr>
      <td className="px-4 py-3">
        <Link href={`/systems/${id}`} className="font-mono text-xs underline underline-offset-2">
          {id}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Badge tone="warning">{status}</Badge>
      </td>
      <td className="px-4 py-3 text-sm">{reason}</td>
      <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">{date}</td>
    </tr>
  );
}
