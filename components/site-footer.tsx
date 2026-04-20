import Link from "next/link";
import { Container } from "@/components/ui/section";

const columns = [
  {
    title: "benchmark",
    links: [
      { href: "/leaderboard", label: "leaderboard" },
      { href: "/benchmarks", label: "benchmark tracks" },
      { href: "/systems", label: "systems" },
      { href: "/tasks", label: "tasks" },
    ],
  },
  {
    title: "data",
    links: [
      { href: "/datasets", label: "datasets" },
      { href: "/labs", label: "labs & sources" },
      { href: "/papers", label: "papers" },
      { href: "/docs", label: "api & docs" },
    ],
  },
  {
    title: "standards",
    links: [
      { href: "/methodology", label: "methodology" },
      { href: "/governance", label: "governance & review" },
      { href: "/submit", label: "submit a result" },
      { href: "/about", label: "about" },
    ],
  },
  {
    title: "external",
    links: [
      { href: "https://github.com/organoidbench", label: "github" },
      { href: "/about#contact", label: "contact" },
      { href: "/about#citation", label: "citation" },
      { href: "/methodology#ethics", label: "ethics note" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)] mt-auto">
      <Container className="py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-[8px] bg-[color:var(--foreground)] text-[color:var(--background)] grid place-items-center text-[10px] font-semibold">
                OB
              </span>
              <span className="font-logo text-xl leading-none">organoidbench</span>
            </Link>
            <p className="mt-3 text-sm text-[color:var(--foreground-muted)] max-w-sm">
              standardized evaluation for brain organoid electrophysiology,
              plasticity, and closed-loop learning.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-3">
                {col.title}
              </div>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[color:var(--foreground)] hover:text-[color:var(--foreground-muted)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[color:var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--foreground-muted)]">
          <div>
            OrganoidBench measures experimental system performance and adaptive
            neural dynamics. It does not measure consciousness, sentience, or
            human-like intelligence.
          </div>
          <div className="font-mono">methodology v1.3.0 · © 2026</div>
        </div>
      </Container>
    </footer>
  );
}
