import { prisma } from "../lib/db";
import fs from "node:fs";
import path from "node:path";

if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}

export { prisma };

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `rec-${Date.now()}`;
}

export async function uniqueSlug(base: string, check: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = base;
  let i = 2;
  while (await check(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function fetchJson<T = unknown>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OrganoidBench-Ingester/1.0 (+https://organoidbench.org)",
      ...headers,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}: ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as T;
}

export function requireArg(argv: string[], flag: string): string {
  const i = argv.indexOf(flag);
  if (i < 0 || !argv[i + 1]) {
    console.error(`Missing required argument: ${flag}`);
    process.exit(2);
  }
  return argv[i + 1];
}

export function optArg(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  if (i < 0) return undefined;
  return argv[i + 1];
}

export function parseBytes(v: unknown): bigint | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return BigInt(Math.floor(n));
}
