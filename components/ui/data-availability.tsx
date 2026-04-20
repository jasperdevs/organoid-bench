import { Badge } from "@/components/ui/badge";

export type DataAvailability = {
  raw?: boolean;
  processed?: boolean;
  code?: boolean;
  peerReviewed?: boolean;
  openDataset?: boolean;
};

export function DataAvailabilityBadges({
  avail,
  subset,
}: {
  avail: DataAvailability;
  subset?: Array<keyof DataAvailability>;
}) {
  const items: { key: keyof DataAvailability; label: string }[] = [
    { key: "raw", label: "raw data" },
    { key: "processed", label: "processed" },
    { key: "code", label: "code" },
    { key: "peerReviewed", label: "peer reviewed" },
    { key: "openDataset", label: "open dataset" },
  ];
  const shown = subset ? items.filter((i) => subset.includes(i.key)) : items;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((i) => (
        <Badge key={i.key} tone={avail[i.key] ? "default" : "outline"}>
          {avail[i.key] ? "✓ " : "- "}
          {i.label}
        </Badge>
      ))}
    </div>
  );
}
