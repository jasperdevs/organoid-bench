import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await prisma.benchmarkRun.findUnique({
    where: { id },
    include: {
      system: { include: { source: true, dataset: true } },
      track: true,
      task: true,
      methodologyVersion: true,
      metricValues: { include: { metric: true, source: true } },
      scoreCalculations: true,
      provenanceEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!run) notFound();

  const score = run.scoreCalculations[0];
  const metric = run.metricValues[0];
  const calculation = score?.calculationJson ? JSON.parse(score.calculationJson) : null;
  const inputFiles = Array.isArray(calculation?.inputFiles) ? calculation.inputFiles : [];

  return (
    <>
      <PageHeader
        eyebrow={`${run.track.name}${run.task ? ` / ${run.task.name}` : ""}`}
        title={run.system.name}
        description="Provisional score from source-backed local computation."
        right={<StatusBadge status={run.runStatus} />}
      />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px rounded-[12px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]">
          <Stat label="Score" value={score?.score != null ? score.score.toFixed(2) : "-"} />
          <Stat label="Confidence" value={score?.confidenceGrade ?? "-"} />
          <Stat label="Methodology" value={run.methodologyVersion?.version ?? "-"} />
          <Stat label="Derivation" value={metric?.derivationMethod ?? "-"} />
        </div>
      </Container>

      <Section title="Metric">
        {metric ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <Row k="Metric" v={metric.metric.name} />
                <Row k="Value" v={String(metric.value)} />
                <Row k="95% CI" v={metric.ciLow != null && metric.ciHigh != null ? `${metric.ciLow} to ${metric.ciHigh}` : "-"} />
                <Row k="CI method" v={metric.ciMethod ?? "-"} />
                <Row k="Source" v={metric.source?.title ?? "-"} />
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[color:var(--foreground-muted)]">No metric value recorded.</p>
        )}
      </Section>

      <Section title="Evidence">
        <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <Row k="Source" v={run.system.source?.title ?? "-"} />
              <Row k="Dataset" v={run.system.dataset?.name ?? "-"} />
              <Row k="Script" v={calculation?.scriptName ?? "-"} />
              <Row k="Methodology" v={calculation?.methodologyVersion ?? run.methodologyVersion?.version ?? "-"} />
              {inputFiles.map((file: Record<string, unknown>, i: number) => (
                <Row
                  key={String(file.datasetFileId ?? i)}
                  k={i === 0 ? "Input file" : "Input file"}
                  v={`${file.name ?? "-"} · ${file.checksumAlgorithm ?? "checksum"}:${file.checksumValue ?? "-"}`}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Calculation">
        <pre className="font-mono text-xs whitespace-pre-wrap rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-4 overflow-x-auto">
          {JSON.stringify(calculation, null, 2)}
        </pre>
      </Section>

      <Section title="Caveats">
        <div className="text-sm text-[color:var(--foreground-muted)] max-w-3xl">
          {score?.scoreType === "signal"
            ? "This score reflects active electrode coverage from well-average MEA data. It is not a broad biological quality score."
            : "This score reflects a provisional closed-loop task performance metric. It is not a general intelligence claim."}
        </div>
      </Section>

      <Container>
        <Link href="/leaderboards" className="text-sm font-medium underline underline-offset-4">
          Back to leaderboard
        </Link>
      </Container>
      <div className="h-16" />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[color:var(--surface)] p-4">
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-t first:border-t-0 border-[color:var(--border)]">
      <th className="w-44 px-4 py-3 text-left font-medium bg-[color:var(--surface-alt)]">{k}</th>
      <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{v}</td>
    </tr>
  );
}
