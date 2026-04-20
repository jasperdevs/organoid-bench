import Link from "next/link";
import { Container } from "@/components/ui/section";

const columns = [
  {
    title: "Benchmarks",
    links: [
      { href: "/leaderboards", label: "Leaderboards" },
      { href: "/benchmarks", label: "Benchmark tracks" },
      { href: "/systems", label: "Systems" },
    ],
  },
  {
    title: "Data",
    links: [
      { href: "/datasets", label: "Datasets" },
      { href: "/submit", label: "Submit an entry" },
      { href: "/about#api", label: "API" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Overview" },
      { href: "/about#methodology", label: "Methodology" },
      { href: "/about#contact", label: "Contact" },
      { href: "https://github.com/jasperdevs/organoid-bench", label: "GitHub" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)] mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[color:var(--foreground)] text-[color:var(--background)] rounded-full pl-3 pr-4 py-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="5" cy="8" r="2.5" fill="currentColor" />
                <circle cx="11" cy="5" r="1.5" fill="currentColor" />
                <circle cx="11" cy="11" r="1.5" fill="currentColor" />
              </svg>
              <span className="text-sm font-semibold">OrganoidBench</span>
            </Link>
            <p className="mt-4 text-sm text-[color:var(--foreground-muted)] max-w-xs">
              Independent benchmarks for brain organoid electrophysiology and closed-loop learning.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold mb-3">{col.title}</div>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[color:var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--foreground-muted)]">
          <div className="max-w-2xl">
            Measures experimental system performance and adaptive neural dynamics. Does not measure consciousness, sentience, or general intelligence.
          </div>
          <div className="font-mono">v1.3.0 · © 2026</div>
        </div>
      </Container>
    </footer>
  );
}
