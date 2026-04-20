import { cn } from "@/lib/utils";

export type Grade = "A" | "B" | "C" | "D" | "Unscored";

const map: Record<Grade, { label: string; sub: string; color: string }> = {
  A: {
    label: "A",
    sub: "strong",
    color:
      "bg-[color:var(--surface)] border-[color:var(--foreground)] text-[color:var(--foreground)]",
  },
  B: {
    label: "B",
    sub: "public + controlled",
    color:
      "bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--foreground)]",
  },
  C: {
    label: "C",
    sub: "partial controls",
    color:
      "bg-[color:var(--surface-alt)] border-[color:var(--border)] text-[color:var(--foreground-muted)]",
  },
  D: {
    label: "D",
    sub: "weak evidence",
    color:
      "bg-[color:var(--surface-alt)] border-[color:var(--border)] text-[color:var(--foreground-muted)]",
  },
  Unscored: {
    label: "-",
    sub: "unscored",
    color:
      "bg-[color:var(--surface-alt)] border-[color:var(--border)] text-[color:var(--foreground-muted)]",
  },
};

export function ConfidenceBadge({
  grade,
  compact = false,
}: {
  grade: Grade;
  compact?: boolean;
}) {
  const v = map[grade];
  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-[8px] border text-xs font-mono font-semibold",
          v.color,
        )}
      >
        {v.label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[12px] border px-2.5 py-1",
        v.color,
      )}
    >
      <span className="font-mono font-semibold text-sm leading-none">{v.label}</span>
      <span className="text-xs text-[color:var(--foreground-muted)] leading-none">{v.sub}</span>
    </span>
  );
}
