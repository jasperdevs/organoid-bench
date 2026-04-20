import { NextResponse } from "next/server";

export type CacheProfile = "short" | "medium" | "long" | "no-store";

export type CacheOptions = {
  profile?: CacheProfile;
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  status?: number;
  headers?: HeadersInit;
};

const profiles: Record<Exclude<CacheProfile, "no-store">, Required<Pick<CacheOptions, "maxAge" | "sMaxAge" | "staleWhileRevalidate">>> = {
  short: { maxAge: 30, sMaxAge: 120, staleWhileRevalidate: 600 },
  medium: { maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 1800 },
  long: { maxAge: 300, sMaxAge: 3600, staleWhileRevalidate: 86400 },
};

export function cacheHeaders(options: CacheOptions = {}) {
  const profile = options.profile ?? "medium";
  const headers = new Headers(options.headers);
  headers.set("X-OrganoidBench-Data-Source", "d1");
  headers.set("X-Robots-Tag", "noindex");

  if (profile === "no-store" || (options.status != null && options.status >= 400)) {
    headers.set("Cache-Control", "no-store");
    headers.set("X-OrganoidBench-Cache-Profile", "no-store");
    return headers;
  }

  const defaults = profiles[profile];
  const maxAge = options.maxAge ?? defaults.maxAge;
  const sMaxAge = options.sMaxAge ?? defaults.sMaxAge;
  const stale = options.staleWhileRevalidate ?? defaults.staleWhileRevalidate;
  headers.set(
    "Cache-Control",
    `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${stale}`,
  );
  headers.set("X-OrganoidBench-Cache-Profile", profile);
  return headers;
}

export function cachedJson<T>(data: T, options: CacheOptions = {}) {
  const status = options.status ?? 200;
  return NextResponse.json(data, {
    status,
    headers: cacheHeaders({ ...options, status }),
  });
}

export function noStoreJson<T>(data: T, options: Omit<CacheOptions, "profile"> = {}) {
  const status = options.status ?? 200;
  return NextResponse.json(data, {
    status,
    headers: cacheHeaders({ ...options, profile: "no-store", status }),
  });
}
