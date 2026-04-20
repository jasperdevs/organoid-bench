import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { KV } from "@/components/ui/metric";
import {
  LABS,
  labById,
  systemsForLab,
  datasetsForLab,
  papersForLab,
  trackById,
} from "@/lib/data";

export function generateStaticParams() {
  return LABS.map((l) => ({ id: l.id }));
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lab = labById(id);
  if (!lab) notFound();

  const systems = systemsForLab(lab.id);
  const datasets = datasetsForLab(lab.id);
  const papers = papersForLab(lab.id);

  return (
    <>
      <PageHeader
        eyebrow="lab / source"
        title={lab.name}
        description={lab.description}
        right={
          <div className="flex gap-2">
            <Button href={lab.website} size="sm" variant="outline">
              website
            </Button>
            <Button href="/submit" size="sm" variant="primary">
              submit result
            </Button>
          </div>
        }
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {lab.verified ? (
            <Badge tone="default">✓ verified</Badge>
          ) : (
            <Badge tone="outline">community</Badge>
          )}
          {lab.tracks.map((t) => (
            <Badge key={t} tone="outline">
              {trackById(t).name.toLowerCase()}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="details" />
            <KV k="institution" v={lab.institution} />
            <KV k="location" v={lab.location} />
            <KV k="systems contributed" v={lab.systems} mono />
            <KV k="datasets contributed" v={lab.datasets} mono />
            <KV k="total organoids" v={lab.totalOrganoids} mono />
            <KV
              k="website"
              v={
                <a
                  className="underline underline-offset-2 font-mono text-xs"
                  href={lab.website}
                >
                  {lab.website.replace("https://", "")}
                </a>
              }
            />
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="benchmark tracks represented" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {lab.tracks.map((t) => {
                const track = trackById(t);
                return (
                  <Link
                    key={t}
                    href={`/benchmarks/${t}`}
                    className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-3 hover:bg-[color:var(--surface-alt)]"
                  >
                    <div className="text-sm font-medium">{track.name}</div>
                    <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">
                      {track.short}.
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </Section>

      <Section title="systems">
        <Card padded={false}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
              <tr>
                <th className="px-4 py-3 font-medium">system</th>
                <th className="px-4 py-3 font-medium">track</th>
                <th className="px-4 py-3 font-medium">task</th>
                <th className="px-4 py-3 font-medium">composite</th>
                <th className="px-4 py-3 font-medium">grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {systems.map((s) => (
                <tr key={s.id} className="hover:bg-[color:var(--surface-alt)]">
                  <td className="px-4 py-3">
                    <Link href={`/systems/${s.id}`} className="font-medium hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="outline">{trackById(s.track).name.toLowerCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.taskId}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {s.metrics.composite.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <ConfidenceBadge grade={s.grade} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="datasets contributed" />
            <ul className="divide-y divide-[color:var(--border)]">
              {datasets.map((d) => (
                <li key={d.id} className="py-3 first:pt-0 last:pb-0">
                  <Link href={`/datasets/${d.id}`} className="font-medium hover:underline">
                    {d.name}
                  </Link>
                  <div className="text-xs text-[color:var(--foreground-muted)]">
                    {d.modality} · {d.nOrganoids} organoids · {d.license}
                  </div>
                </li>
              ))}
              {datasets.length === 0 && (
                <li className="py-3 text-sm text-[color:var(--foreground-muted)]">
                  no datasets yet
                </li>
              )}
            </ul>
          </Card>
          <Card>
            <CardHeader title="publications" />
            <ul className="divide-y divide-[color:var(--border)]">
              {papers.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <Link href={`/papers/${p.id}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                  <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">
                    {p.authors.join(", ")} · {p.year} · {p.venue}
                    {p.peerReviewed && " · peer reviewed"}
                  </div>
                </li>
              ))}
              {papers.length === 0 && (
                <li className="py-3 text-sm text-[color:var(--foreground-muted)]">
                  no papers yet
                </li>
              )}
            </ul>
          </Card>
        </div>
      </Section>
    </>
  );
}
