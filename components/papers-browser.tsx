"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input, Select, Checkbox } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PAPERS, LABS, trackById } from "@/lib/data";

export function PapersBrowser() {
  const [q, setQ] = useState("");
  const [year, setYear] = useState("all");
  const [lab, setLab] = useState("all");
  const [track, setTrack] = useState("all");
  const [peerOnly, setPeerOnly] = useState(false);
  const [dataOnly, setDataOnly] = useState(false);
  const [codeOnly, setCodeOnly] = useState(false);

  const years = Array.from(new Set(PAPERS.map((p) => p.year))).sort().reverse();

  const list = useMemo(() => {
    return PAPERS.filter((p) => {
      if (year !== "all" && p.year !== Number(year)) return false;
      if (lab !== "all" && p.labId !== lab) return false;
      if (track !== "all" && !p.tracks.includes(track as never)) return false;
      if (peerOnly && !p.peerReviewed) return false;
      if (dataOnly && !p.hasDataset) return false;
      if (codeOnly && !p.hasCode) return false;
      if (q) {
        const needle = q.toLowerCase();
        return (
          p.title.toLowerCase().includes(needle) ||
          p.authors.join(" ").toLowerCase().includes(needle) ||
          p.venue.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [q, year, lab, track, peerOnly, dataOnly, codeOnly]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="search by title, author, venue…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">any year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Select value={lab} onChange={(e) => setLab(e.target.value)}>
            <option value="all">any lab</option>
            {LABS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Select value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="all">any track</option>
            {["signal-quality", "responsiveness", "plasticity", "closed-loop-learning", "retention", "reproducibility"].map((t) => (
              <option key={t} value={t}>
                {trackById(t as never).name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 pt-3 border-t border-[color:var(--border)] flex flex-wrap gap-x-5 gap-y-2 items-center">
          <Checkbox
            label="peer reviewed"
            checked={peerOnly}
            onChange={(e) => setPeerOnly(e.target.checked)}
          />
          <Checkbox
            label="has dataset"
            checked={dataOnly}
            onChange={(e) => setDataOnly(e.target.checked)}
          />
          <Checkbox
            label="has code"
            checked={codeOnly}
            onChange={(e) => setCodeOnly(e.target.checked)}
          />
          <span className="ml-auto text-xs font-mono text-[color:var(--foreground-muted)]">
            {list.length} / {PAPERS.length}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {list.map((p) => (
          <Link key={p.id} href={`/papers/${p.id}`}>
            <Card className="hover:border-[color:var(--foreground)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                    {p.id}
                  </div>
                  <div className="mt-0.5 text-base font-semibold">{p.title}</div>
                  <div className="text-sm text-[color:var(--foreground-muted)] mt-0.5">
                    {p.authors.join(", ")} · {p.year} · {p.venue}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 shrink-0">
                  {p.peerReviewed ? (
                    <Badge tone="default">peer reviewed</Badge>
                  ) : (
                    <Badge tone="outline">preprint</Badge>
                  )}
                  {p.hasDataset && <Badge tone="muted">dataset</Badge>}
                  {p.hasCode && <Badge tone="muted">code</Badge>}
                </div>
              </div>
              <p className="mt-3 text-sm text-[color:var(--foreground-muted)] max-w-prose">
                {p.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tracks.map((t) => (
                  <Badge key={t} tone="outline">
                    {trackById(t).name.toLowerCase()}
                  </Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
