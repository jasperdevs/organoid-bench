import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KV } from "@/components/ui/metric";
import { PAPERS, paperById, labById, systemById, datasetById, trackById } from "@/lib/data";

export function generateStaticParams() {
  return PAPERS.map((p) => ({ id: p.id }));
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = paperById(id);
  if (!p) notFound();

  const lab = labById(p.labId);

  return (
    <>
      <PageHeader
        eyebrow={`paper · ${p.id}`}
        title={p.title}
        description={
          <span>
            {p.authors.join(", ")} · {p.year} · {p.venue}
          </span>
        }
        right={
          <div className="flex gap-2 flex-wrap">
            {p.peerReviewed ? (
              <Badge tone="default">peer reviewed</Badge>
            ) : (
              <Badge tone="outline">preprint</Badge>
            )}
            {p.hasDataset && <Badge tone="muted">dataset</Badge>}
            {p.hasCode && <Badge tone="muted">code</Badge>}
          </div>
        }
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {p.tracks.map((t) => (
            <Badge key={t} tone="outline">
              {trackById(t).name.toLowerCase()}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <Section title="summary">
        <Card>
          <p className="text-sm max-w-prose">{p.summary}</p>
        </Card>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="source" />
            <KV k="authors" v={p.authors.join(", ")} />
            <KV k="year" v={p.year} mono />
            <KV k="venue" v={p.venue} />
            <KV k="peer reviewed" v={p.peerReviewed ? "yes" : "no"} mono />
            <KV k="lab / source" v={lab?.name ?? "—"} />
            {p.doi && <KV k="doi" v={<span className="font-mono text-xs">{p.doi}</span>} />}
          </Card>

          <Card>
            <CardHeader title="linked benchmark entries" />
            <ul className="divide-y divide-[color:var(--border)]">
              {p.linkedSystems.map((sid) => {
                const s = systemById(sid);
                if (!s) return null;
                return (
                  <li key={sid} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/systems/${s.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {s.name}
                    </Link>
                    <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                      {s.track} · {s.taskId}
                    </div>
                  </li>
                );
              })}
              {p.linkedSystems.length === 0 && (
                <li className="py-2 text-sm text-[color:var(--foreground-muted)]">
                  no benchmark entries reference this paper yet
                </li>
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader title="linked datasets" />
            <ul className="divide-y divide-[color:var(--border)]">
              {p.linkedDatasets.map((did) => {
                const d = datasetById(did);
                if (!d) return null;
                return (
                  <li key={did} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/datasets/${d.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {d.name}
                    </Link>
                    <div className="text-xs text-[color:var(--foreground-muted)]">
                      {d.modality} · {d.nOrganoids} organoids · {d.license}
                    </div>
                  </li>
                );
              })}
              {p.linkedDatasets.length === 0 && (
                <li className="py-2 text-sm text-[color:var(--foreground-muted)]">
                  no datasets linked
                </li>
              )}
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="limitations noted by OrganoidBench">
        <Card className="bg-[color:var(--surface-alt)]">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            {p.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[color:var(--foreground-muted)]">
            These notes are appended by OrganoidBench reviewers and may be
            updated as new replications or corrections arrive.
          </p>
        </Card>
      </Section>

      <Section>
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
                cite this source
              </div>
              <p className="text-sm mt-1">
                Cite the source publication. When citing a benchmark entry,
                reference both the paper and the entry id.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" href="#">copy citation</Button>
              <Button size="sm" variant="ghost" href="/submit#correction">submit correction</Button>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}
