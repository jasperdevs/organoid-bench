import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KV } from "@/components/ui/metric";
import { DATASETS, datasetById, labById, SYSTEMS, trackById } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export function generateStaticParams() {
  return DATASETS.map((d) => ({ id: d.id }));
}

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = datasetById(id);
  if (!d) notFound();

  const lab = labById(d.labId);
  const linkedSystems = SYSTEMS.filter((s) => s.datasetId === d.id);

  const completenessItems = [
    { k: "metadata schema", v: true },
    { k: "protocol", v: true },
    { k: "batch IDs", v: d.rawAvailable },
    { k: "sample counts", v: true },
    { k: "raw traces", v: d.rawAvailable },
    { k: "processed data", v: d.processedAvailable },
    { k: "code", v: d.codeAvailable },
    { k: "license", v: true },
  ];

  return (
    <>
      <PageHeader
        eyebrow={`dataset · ${d.id}`}
        title={d.name}
        description={
          <span>
            {d.modality} · {lab?.name} · {formatNumber(d.nOrganoids)} organoids ·{" "}
            <span className="font-mono text-xs bg-[color:var(--surface-alt)] rounded-[8px] px-1.5 py-0.5">
              {d.license}
            </span>
          </span>
        }
        right={
          <div className="flex gap-2">
            <Button size="sm" variant="primary" href="#">
              {d.access === "public" ? "download" : d.access === "request-access" ? "request access" : "contact"}
            </Button>
            <Button size="sm" variant="outline" href="#">
              citation
            </Button>
          </div>
        }
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone={d.rawAvailable ? "default" : "outline"}>
            {d.rawAvailable ? "✓ raw" : "— raw"}
          </Badge>
          <Badge tone={d.processedAvailable ? "default" : "outline"}>
            {d.processedAvailable ? "✓ processed" : "— processed"}
          </Badge>
          <Badge tone={d.codeAvailable ? "default" : "outline"}>
            {d.codeAvailable ? "✓ code" : "— code"}
          </Badge>
          <Badge tone="outline">{d.access}</Badge>
          {d.tracks.map((t) => (
            <Badge key={t} tone="outline">
              {trackById(t).name.toLowerCase()}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <Section title="dataset summary">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="what this dataset can score" />
            <ul className="space-y-2 text-sm">
              {d.supports.map((t) => {
                const track = trackById(t);
                return (
                  <li key={t} className="flex justify-between items-center gap-3 border-b border-[color:var(--border)] pb-2 last:border-0">
                    <div>
                      <div className="font-medium">{track.name}</div>
                      <div className="text-xs text-[color:var(--foreground-muted)]">
                        {track.short}
                      </div>
                    </div>
                    <Link
                      href={`/benchmarks/${t}`}
                      className="text-xs underline underline-offset-2"
                    >
                      open track
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <CardHeader title="dataset detail" />
            <KV k="modality" v={d.modality} mono />
            <KV k="platform" v={d.platform} />
            <KV k="organoid type" v={d.organoidType} />
            <KV k="species" v={d.species} />
            <KV k="organoids (N)" v={d.nOrganoids} mono />
            <KV k="sessions (N)" v={d.nSessions} mono />
            <KV k="size" v={`${formatNumber(d.sizeGb)} gb`} mono />
            <KV k="license" v={d.license} mono />
            <KV k="year" v={d.year} mono />
            <KV
              k="tasks"
              v={
                <span className="font-mono text-xs text-[color:var(--foreground-muted)]">
                  {d.tasks.join(", ")}
                </span>
              }
            />
          </Card>
        </div>
      </Section>

      <Section title="files & metadata">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="included files" />
            <ul className="divide-y divide-[color:var(--border)] text-sm">
              <FileRow
                label="raw traces"
                ext=".nwb"
                present={d.rawAvailable}
                size={`${formatNumber(d.sizeGb * 0.7)} gb`}
              />
              <FileRow
                label="spike events"
                ext=".parquet"
                present={d.processedAvailable}
                size={`${formatNumber(Math.max(1, d.sizeGb * 0.05))} gb`}
              />
              <FileRow
                label="session metadata"
                ext=".json"
                present
                size="< 1 gb"
              />
              <FileRow
                label="task trajectories"
                ext=".parquet"
                present={d.modality === "closed-loop"}
                size="< 1 gb"
              />
              <FileRow
                label="analysis code"
                ext=".tar.gz"
                present={d.codeAvailable}
                size="< 1 gb"
              />
            </ul>
          </Card>
          <Card>
            <CardHeader title="metadata completeness" />
            <ul className="divide-y divide-[color:var(--border)]">
              {completenessItems.map((c) => (
                <li key={c.k} className="flex items-center justify-between py-2">
                  <span className="text-sm">{c.k}</span>
                  <span
                    className={`font-mono text-xs ${c.v ? "text-[color:var(--success)]" : "text-[color:var(--foreground-muted)]"}`}
                  >
                    {c.v ? "present" : "missing"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        title="known limitations"
        description="Every dataset has trade-offs. OrganoidBench lists them explicitly so that downstream benchmark entries cannot over-claim."
      >
        <Card className="bg-[color:var(--surface-alt)]">
          <ul className="space-y-2 text-sm list-disc pl-5">
            {!d.rawAvailable && <li>raw traces are not publicly available; scoring must rely on processed artifacts.</li>}
            {!d.codeAvailable && <li>analysis code not released; independent reproduction requires re-implementation.</li>}
            {d.access !== "public" && <li>access is gated; external labs must request access before reuse.</li>}
            <li>
              {d.nOrganoids < 30 ? "moderate N; reproducibility confidence capped at grade B unless replicated." : "large N but single-lab unless paired with an independent replication."}
            </li>
          </ul>
        </Card>
      </Section>

      <Section title="example analyses">
        <Card>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Apply the open preprocessing pipeline to compute per-channel spike trains.</li>
            <li>Compute track-specific metrics using the OrganoidBench scoring package.</li>
            <li>Compare per-organoid metrics to the track median and bootstrap 95% CIs.</li>
            <li>Submit a benchmark entry referencing this dataset.</li>
          </ol>
        </Card>
      </Section>

      <Section title="linked systems & entries">
        <Card padded={false}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
              <tr>
                <th className="px-4 py-3 font-medium">system</th>
                <th className="px-4 py-3 font-medium">track</th>
                <th className="px-4 py-3 font-medium">task</th>
                <th className="px-4 py-3 font-medium">grade</th>
                <th className="px-4 py-3 font-medium">lab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {linkedSystems.map((s) => (
                <tr key={s.id} className="hover:bg-[color:var(--surface-alt)]">
                  <td className="px-4 py-3">
                    <Link href={`/systems/${s.id}`} className="font-medium hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.track}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.taskId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.grade}</td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)]">
                    {labById(s.labId)?.name}
                  </td>
                </tr>
              ))}
              {linkedSystems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-[color:var(--foreground-muted)]">
                    no benchmark entries reference this dataset yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="download & citation">
        <Card>
          <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
            citation
          </div>
          <pre className="font-mono text-xs whitespace-pre-wrap bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)]">
{`OrganoidBench dataset ${d.id}.
"${d.name}". ${lab?.name}. ${d.year}.
License: ${d.license}. https://organoidbench.org/datasets/${d.id}`}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" size="sm" href="#">
              {d.access === "public" ? "download" : "request access"}
            </Button>
            <Button variant="outline" size="sm" href={`/labs/${d.labId}`}>
              view lab
            </Button>
            <Button variant="ghost" size="sm" href="/submit#correction">
              submit correction
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}

function FileRow({
  label,
  ext,
  present,
  size,
}: {
  label: string;
  ext: string;
  present: boolean;
  size: string;
}) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[6px] bg-[color:var(--surface-alt)]">
          {ext}
        </span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3 text-xs font-mono text-[color:var(--foreground-muted)]">
        <span>{size}</span>
        <span className={present ? "text-[color:var(--success)]" : ""}>
          {present ? "present" : "—"}
        </span>
      </div>
    </li>
  );
}
