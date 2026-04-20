"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input, Select, Checkbox } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DATASETS, LABS, labById, trackById } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export function DatasetsBrowser() {
  const [q, setQ] = useState("");
  const [access, setAccess] = useState("all");
  const [modality, setModality] = useState("all");
  const [lab, setLab] = useState("all");
  const [species, setSpecies] = useState("all");
  const [license, setLicense] = useState("all");
  const [onlyRaw, setOnlyRaw] = useState(false);
  const [onlyProcessed, setOnlyProcessed] = useState(false);
  const [onlyCode, setOnlyCode] = useState(false);

  const modalities = Array.from(new Set(DATASETS.map((d) => d.modality)));
  const licenses = Array.from(new Set(DATASETS.map((d) => d.license)));
  const speciesList = Array.from(new Set(DATASETS.map((d) => d.species)));

  const list = useMemo(() => {
    return DATASETS.filter((d) => {
      if (access !== "all" && d.access !== access) return false;
      if (modality !== "all" && d.modality !== modality) return false;
      if (lab !== "all" && d.labId !== lab) return false;
      if (species !== "all" && d.species !== species) return false;
      if (license !== "all" && d.license !== license) return false;
      if (onlyRaw && !d.rawAvailable) return false;
      if (onlyProcessed && !d.processedAvailable) return false;
      if (onlyCode && !d.codeAvailable) return false;
      if (q) {
        const needle = q.toLowerCase();
        return (
          d.name.toLowerCase().includes(needle) ||
          d.modality.includes(needle) ||
          labById(d.labId)?.name.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [q, access, modality, lab, species, license, onlyRaw, onlyProcessed, onlyCode]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <Input
            placeholder="search datasets…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={access} onChange={(e) => setAccess(e.target.value)}>
            <option value="all">any access</option>
            <option value="public">public</option>
            <option value="request-access">request access</option>
            <option value="private">private</option>
          </Select>
          <Select value={modality} onChange={(e) => setModality(e.target.value)}>
            <option value="all">any modality</option>
            {modalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select value={lab} onChange={(e) => setLab(e.target.value)}>
            <option value="all">all labs</option>
            {LABS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Select value={species} onChange={(e) => setSpecies(e.target.value)}>
            <option value="all">any species</option>
            {speciesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select value={license} onChange={(e) => setLicense(e.target.value)}>
            <option value="all">any license</option>
            {licenses.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 pt-3 border-t border-[color:var(--border)] flex flex-wrap gap-x-5 gap-y-2 items-center">
          <Checkbox
            label="raw data"
            checked={onlyRaw}
            onChange={(e) => setOnlyRaw(e.target.checked)}
          />
          <Checkbox
            label="processed data"
            checked={onlyProcessed}
            onChange={(e) => setOnlyProcessed(e.target.checked)}
          />
          <Checkbox
            label="code"
            checked={onlyCode}
            onChange={(e) => setOnlyCode(e.target.checked)}
          />
          <span className="ml-auto text-xs font-mono text-[color:var(--foreground-muted)]">
            {list.length} / {DATASETS.length}
          </span>
        </div>
      </Card>

      <div className="w-full overflow-x-auto rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)]">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">dataset</th>
              <th className="px-4 py-3 font-medium">lab</th>
              <th className="px-4 py-3 font-medium">modality</th>
              <th className="px-4 py-3 font-medium">organoid</th>
              <th className="px-4 py-3 font-medium">N</th>
              <th className="px-4 py-3 font-medium">size</th>
              <th className="px-4 py-3 font-medium">license</th>
              <th className="px-4 py-3 font-medium">tracks</th>
              <th className="px-4 py-3 font-medium">artifacts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {list.map((d) => (
              <tr key={d.id} className="hover:bg-[color:var(--surface-alt)]">
                <td className="px-4 py-3">
                  <Link href={`/datasets/${d.id}`} className="font-medium hover:underline">
                    {d.name}
                  </Link>
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)]">
                    {d.id}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/labs/${d.labId}`}
                    className="hover:underline text-[color:var(--foreground-muted)]"
                  >
                    {labById(d.labId)?.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{d.modality}</td>
                <td className="px-4 py-3 text-[color:var(--foreground-muted)]">
                  {d.organoidType}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{formatNumber(d.nOrganoids)}</td>
                <td className="px-4 py-3 font-mono text-xs">{formatNumber(d.sizeGb)} gb</td>
                <td className="px-4 py-3 font-mono text-xs">{d.license}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.tracks.map((t) => (
                      <Badge key={t} tone="outline">
                        {trackById(t).name.toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 text-[10px] font-mono">
                    {d.rawAvailable && <span className="px-1.5 py-0.5 rounded-[6px] bg-[color:var(--foreground)] text-[color:var(--background)]">raw</span>}
                    {d.processedAvailable && <span className="px-1.5 py-0.5 rounded-[6px] bg-[color:var(--surface-alt)]">proc</span>}
                    {d.codeAvailable && <span className="px-1.5 py-0.5 rounded-[6px] bg-[color:var(--surface-alt)]">code</span>}
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-[color:var(--foreground-muted)]">
                  no datasets match these filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
