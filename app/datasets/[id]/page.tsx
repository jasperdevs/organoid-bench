import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/section";
import { DATASETS, datasetById, SYSTEMS, trackById } from "@/lib/data";

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

  const linkedSystems = SYSTEMS.filter((s) => s.datasetId === d.id);

  return (
    <>
      <PageHeader
        eyebrow={`Dataset · ${d.id}`}
        title={d.name}
        description={`${d.modality} · ${d.source} · ${d.nOrganoids} organoids · ${d.license}`}
        right={
          <div className="flex gap-2">
            <Link
              href="#"
              className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              {d.access === "Open" ? "Download" : d.access === "On request" ? "Request access" : "Contact"}
            </Link>
            <Link
              href="/about#citation"
              className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
            >
              Citation
            </Link>
          </div>
        }
      />

      <Container>
        <div className="flex flex-col gap-10">
          <section>
            <div className="flex flex-wrap gap-2">
              {[
                ["Raw data", d.raw],
                ["Processed data", d.processed],
                ["Analysis code", d.code],
              ].map(([label, present]) => (
                <span
                  key={label as string}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                    present
                      ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                      : "border border-[color:var(--border)] text-[color:var(--foreground-muted)]"
                  }`}
                >
                  {present ? "✓" : "—"} {label}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full border border-[color:var(--border)] px-3 py-1 text-xs">
                Access: {d.access}
              </span>
              {d.tracks.map((t) => (
                <span key={t} className="inline-flex items-center rounded-full border border-[color:var(--border)] px-3 py-1 text-xs">
                  {trackById(t).name}
                </span>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Panel title="Dataset detail">
              <KV k="Modality" v={d.modality} mono />
              <KV k="Platform" v={d.platform} />
              <KV k="Organoid type" v={d.organoidType} />
              <KV k="Species" v={d.species} />
              <KV k="Organoids (N)" v={d.nOrganoids} mono />
              <KV k="Sessions (N)" v={d.nSessions} mono />
              <KV k="Duration" v={d.duration} mono />
              <KV k="Size" v={d.size} mono />
              <KV k="License" v={d.license} mono />
              <KV k="Last updated" v={d.lastUpdated} mono />
            </Panel>

            <Panel title="Description">
              <p className="text-sm text-[color:var(--foreground-muted)]">{d.description}</p>
              {d.files && d.files.length > 0 && (
                <>
                  <div className="text-sm font-semibold mt-5 mb-2">Included files</div>
                  <ul className="flex flex-col divide-y divide-[color:var(--border)]">
                    {d.files.map((f) => (
                      <li key={f.name} className="flex items-start justify-between gap-3 py-2 text-sm">
                        <div>
                          <div className="font-mono text-xs">{f.name}</div>
                          {f.note && <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">{f.note}</div>}
                        </div>
                        <span className="font-mono text-xs text-[color:var(--foreground-muted)] shrink-0">{f.format}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Supported tracks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {d.tracks.map((t) => {
                const track = trackById(t);
                return (
                  <Link
                    key={t}
                    href={`/benchmarks/${t}`}
                    className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 hover:border-[color:var(--foreground)] transition"
                  >
                    <div className="font-medium">{track.name}</div>
                    <div className="text-xs text-[color:var(--foreground-muted)] mt-1">{track.short}</div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Linked systems</h2>
            <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
              <table className="w-full text-sm">
                <thead className="text-left bg-[color:var(--surface-alt)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">System</th>
                    <th className="px-4 py-3 font-medium">Track</th>
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedSystems.map((s) => (
                    <tr key={s.id} className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-alt)]">
                      <td className="px-4 py-3">
                        <Link href={`/systems/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{trackById(s.track).name}</td>
                      <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{s.task}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.grade}</td>
                      <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{s.source}</td>
                    </tr>
                  ))}
                  {linkedSystems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-[color:var(--foreground-muted)]">
                        No benchmark entries reference this dataset yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Citation</h2>
            <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`OrganoidBench dataset ${d.id}.
"${d.name}". ${d.source}.
License: ${d.license}. https://organoidbench.org/datasets/${d.id}`}
            </pre>
          </section>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[color:var(--border)] last:border-0">
      <div className="text-sm text-[color:var(--foreground-muted)]">{k}</div>
      <div className={`text-sm text-right ${mono ? "font-mono text-xs" : ""}`}>{v}</div>
    </div>
  );
}
