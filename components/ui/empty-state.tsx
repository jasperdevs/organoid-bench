import Link from "next/link";
import * as React from "react";

export function EmptyState({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  tertiaryHref,
  tertiaryLabel,
}: {
  title: string;
  body: React.ReactNode;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tertiaryHref?: string;
  tertiaryLabel?: string;
}) {
  return (
    <div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] p-8 text-center">
      <div className="mx-auto max-w-[520px]">
        <div className="text-sm font-semibold uppercase tracking-wide text-[color:var(--foreground-muted)]">
          No verified entries yet
        </div>
        <div className="mt-2 font-serif text-2xl text-[color:var(--foreground)]">{title}</div>
        <div className="mt-3 text-sm text-[color:var(--foreground-muted)]">{body}</div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryHref && primaryLabel && (
            <Link
              href={primaryHref}
              className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium"
            >
              {primaryLabel}
            </Link>
          )}
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
            >
              {secondaryLabel}
            </Link>
          )}
          {tertiaryHref && tertiaryLabel && (
            <Link
              href={tertiaryHref}
              className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
            >
              {tertiaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    draft: "bg-[color:var(--surface-alt)] text-[color:var(--foreground-muted)]",
    source_verified: "bg-[color:var(--surface-alt)] text-[color:var(--foreground)]",
    data_ingested: "bg-[color:var(--surface-alt)] text-[color:var(--foreground)]",
    unscored: "bg-[color:var(--surface-alt)] text-[color:var(--foreground-muted)]",
    provisional: "border border-[color:var(--border-strong)] text-[color:var(--foreground)]",
    scored: "bg-[color:var(--foreground)] text-[color:var(--background)]",
    curator_reviewed: "bg-[color:var(--foreground)] text-[color:var(--background)]",
    published: "bg-[color:var(--foreground)] text-[color:var(--background)]",
    disputed: "border border-[color:var(--border-strong)] text-[color:var(--foreground-muted)] line-through",
    deprecated: "text-[color:var(--foreground-muted)] line-through",
  };
  const cls = palette[status] ?? "bg-[color:var(--surface-alt)]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-mono ${cls}`}>
      {status}
    </span>
  );
}
