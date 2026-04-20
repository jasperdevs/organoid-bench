"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { DATASETS, trackById } from "@/lib/data";

const MODALITIES = Array.from(new Set(DATASETS.map((d) => d.modality))).sort();
const SOURCES = Array.from(new Set(DATASETS.map((d) => d.source))).sort();
const LICENSES = Array.from(new Set(DATASETS.map((d) => d.license))).sort();

export function DatasetsBrowser() {
  const [q, setQ] = useState("");
  const [access, setAccess] = useState("all");
  const [modality, setModality] = useState("all");
  const [source, setSource] = useState("all");
  const [license, setLicense] = useState("all");

  const list = useMemo(() => {
    return DATASETS.filter((d) => {
      if (access !== "all" && d.access !== access) return false;
      if (modality !== "all" && d.modality !== modality) return false;
      if (source !== "all" && d.source !== source) return false;
      if (license !== "all" && d.license !== license) return false;
      if (q) {
        const n = q.toLowerCase();
        return (
          d.name.toLowerCase().includes(n) ||
          d.modality.toLowerCase().includes(n) ||
          d.source.toLowerCase().includes(n)
        );
      }
      return true;
    });
  }, [q, access, modality, source, license]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Search datasets"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={access} onChange={(e) => setAccess(e.target.value)}>
            <option value="all">Any access</option>
            <option value="Open">Open</option>
            <option value="Restricted">Restricted</option>
            <option value="On request">On request</option>
          </Select>
          <Select value={modality} onChange={(e) => setModality(e.target.value)}>
            <option value="all">Any modality</option>
            {MODALITIES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <Select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={license} onChange={(e) => setLicense(e.target.value)}>
            <option value="all">Any license</option>
            {LICENSES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </div>
        <div className="mt-3 pt-3 border-t border-[color:var(--border)] text-sm">
          <span className="text-[color:var(--foreground-muted)] font-mono text-xs">
            {list.length} / {DATASETS.length} datasets
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
        <table className="w-full text-sm">
          <thead className="text-left bg-[color:var(--surface-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">Dataset</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Modality</th>
              <th className="px-4 py-3 font-medium">Organoid</th>
              <th className="px-4 py-3 font-medium text-right">Organoids</th>
              <th className="px-4 py-3 font-medium text-right">Size</th>
              <th className="px-4 py-3 font-medium">License</th>
              <th className="px-4 py-3 font-medium">Tracks</th>
              <th className="px-4 py-3 font-medium">Access</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.id} className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-alt)]">
                <td className="px-4 py-3">
                  <Link href={`/datasets/${d.id}`} className="font-medium hover:underline">
                    {d.name}
                  </Link>
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)]">{d.id}</div>
                </td>
                <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{d.source}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.modality}</td>
                <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{d.organoidType}</td>
                <td className="px-4 py-3 font-mono text-xs text-right">{d.nOrganoids}</td>
                <td className="px-4 py-3 font-mono text-xs text-right">{d.size}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.license}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.tracks.map((t) => (
                      <span key={t} className="inline-flex items-center rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[11px]">
                        {trackById(t).name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{d.access}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-[color:var(--foreground-muted)]">
                  No datasets match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
