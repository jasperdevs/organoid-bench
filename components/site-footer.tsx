import Link from "next/link";
import { Container } from "@/components/ui/section";

const columns = [
  {
    title: "Benchmarks",
    links: [
      { href: "/leaderboards", label: "Leaderboards" },
      { href: "/benchmarks", label: "Tracks" },
      { href: "/systems", label: "Systems" },
    ],
  },
  {
    title: "Data",
    links: [
      { href: "/datasets", label: "Datasets" },
      { href: "/submit", label: "Submit" },
      { href: "/docs", label: "Docs" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Overview" },
      { href: "/methodology", label: "Methodology" },
      { href: "/organizations", label: "Labs" },
      { href: "https://github.com/jasperdevs/organoid-bench", label: "GitHub" },
      { href: "https://x.com/jasperdevs", label: "X: @jasperdevs" },
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
          <div className="max-w-2xl">Brain organoid benchmark registry.</div>
          <div className="font-mono">v1.3.0 · © 2026</div>
        </div>
      </Container>
    </footer>
  );
}
