export function cn(...parts: Array<string | number | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatNumber(n: number, digits = 0) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}
