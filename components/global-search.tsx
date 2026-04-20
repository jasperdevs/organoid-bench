"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { searchIndex } from "@/lib/data";

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return searchIndex
      .filter(
        (i) =>
          i.title.toLowerCase().includes(needle) ||
          i.type.toLowerCase().includes(needle) ||
          i.subtitle?.toLowerCase().includes(needle),
      )
      .slice(0, 10);
  }, [q]);

  return (
    <div ref={ref} className="relative">
      <input
        type="search"
        placeholder="search systems, datasets, labs…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="h-9 w-full rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-3 text-sm placeholder:text-[color:var(--foreground-muted)] focus:outline-none focus:border-[color:var(--foreground)]"
      />
      {open && q && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-md overflow-hidden z-50 max-h-[420px] overflow-y-auto">
          {results.length === 0 && (
            <div className="p-3 text-sm text-[color:var(--foreground-muted)]">
              no results
            </div>
          )}
          {results.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-[color:var(--surface-alt)]",
              )}
              onClick={() => {
                setOpen(false);
                setQ("");
              }}
            >
              <div className="min-w-0">
                <div className="truncate">{r.title}</div>
                {r.subtitle && (
                  <div className="text-xs text-[color:var(--foreground-muted)] truncate">
                    {r.subtitle}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wide text-[color:var(--foreground-muted)]">
                {r.type}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
