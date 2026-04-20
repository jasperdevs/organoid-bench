import { cn } from "@/lib/utils";

export type Controls = {
  random_feedback?: "pass" | "fail" | "partial" | "missing";
  sham_stimulation?: "pass" | "fail" | "partial" | "missing";
  null_stimulation?: "pass" | "fail" | "partial" | "missing";
  frozen_decoder?: "pass" | "fail" | "partial" | "missing";
  decoder_only?: "pass" | "fail" | "partial" | "missing";
  surrogate?: "pass" | "fail" | "partial" | "missing";
  repeated_runs?: "pass" | "fail" | "partial" | "missing";
  batch_replication?: "pass" | "fail" | "partial" | "missing";
  independent_replication?: "pass" | "fail" | "partial" | "missing";
};

const labels: Record<keyof Controls, string> = {
  random_feedback: "random feedback",
  sham_stimulation: "sham stimulation",
  null_stimulation: "null stimulation",
  frozen_decoder: "frozen decoder",
  decoder_only: "decoder-only baseline",
  surrogate: "non-living surrogate",
  repeated_runs: "repeated-run validation",
  batch_replication: "batch replication",
  independent_replication: "independent lab replication",
};

const glyph: Record<NonNullable<Controls[keyof Controls]>, string> = {
  pass: "✓",
  fail: "✗",
  partial: "≈",
  missing: "—",
};

const color: Record<NonNullable<Controls[keyof Controls]>, string> = {
  pass: "text-[color:var(--success)]",
  fail: "text-[color:var(--destructive)]",
  partial: "text-[color:var(--warning)]",
  missing: "text-[color:var(--foreground-muted)]",
};

export function ControlsChecklist({
  controls,
  notes,
}: {
  controls: Controls;
  notes?: Partial<Record<keyof Controls, string>>;
}) {
  const keys = Object.keys(labels) as (keyof Controls)[];
  return (
    <ul className="divide-y divide-[color:var(--border)] rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)]">
      {keys.map((k) => {
        const v = controls[k] ?? "missing";
        return (
          <li key={k} className="flex items-start gap-3 px-4 py-3">
            <span
              className={cn(
                "h-6 w-6 shrink-0 rounded-[8px] bg-[color:var(--surface-alt)] grid place-items-center font-mono text-sm",
                color[v],
              )}
              aria-label={v}
            >
              {glyph[v]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium flex items-center gap-2">
                {labels[k]}
                <span className="text-xs font-mono uppercase text-[color:var(--foreground-muted)]">
                  {v}
                </span>
              </div>
              {notes?.[k] && (
                <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">
                  {notes[k]}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
