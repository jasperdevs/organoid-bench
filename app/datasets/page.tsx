import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { DatasetsBrowser } from "@/components/datasets-browser";

export default function DatasetsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Datasets"
        title="Benchmark-linked datasets"
        description="Every dataset is indexed with its modality, license, and the benchmark tracks it can support. Prefer datasets with public raw data and open code."
        right={
          <Link
            href="/submit"
            className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Submit a dataset
          </Link>
        }
      />
      <Container>
        <DatasetsBrowser />
      </Container>
      <div className="h-16" />
    </>
  );
}
