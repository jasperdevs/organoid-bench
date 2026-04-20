import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LABS, trackById } from "@/lib/data";

export default function LabsPage() {
  return (
    <>
      <PageHeader
        eyebrow="labs & sources"
        title="labs, platforms, and sources"
        description="Every benchmark entry is attributed to a verified lab, platform, or consortium. Independent, community-run replications are listed as their own source."
        right={
          <Button size="sm" variant="primary" href="/submit#partner">
            become a benchmark partner
          </Button>
        }
      />
      <Section>
        <Card padded={false}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
              <tr>
                <th className="px-4 py-3 font-medium">lab / source</th>
                <th className="px-4 py-3 font-medium">institution</th>
                <th className="px-4 py-3 font-medium">systems</th>
                <th className="px-4 py-3 font-medium">datasets</th>
                <th className="px-4 py-3 font-medium">organoids</th>
                <th className="px-4 py-3 font-medium">tracks</th>
                <th className="px-4 py-3 font-medium">verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {LABS.map((l) => (
                <tr key={l.id} className="hover:bg-[color:var(--surface-alt)]">
                  <td className="px-4 py-3">
                    <Link href={`/labs/${l.id}`} className="font-medium hover:underline">
                      {l.name}
                    </Link>
                    <div className="text-xs text-[color:var(--foreground-muted)]">
                      {l.location}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{l.institution}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.systems}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.datasets}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.totalOrganoids}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {l.tracks.map((t) => (
                        <Badge key={t} tone="outline">
                          {trackById(t).name.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {l.verified ? (
                      <Badge tone="default">✓ verified</Badge>
                    ) : (
                      <Badge tone="outline">community</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
    </>
  );
}
