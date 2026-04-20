export type IssueTemplateKey =
  | "dataset"
  | "system"
  | "benchmarkResult"
  | "correction"
  | "taskRequest"
  | "bugReport";

export type IssueTemplate = {
  key: IssueTemplateKey;
  title: string;
  description: string;
  template: string;
  labels: string[];
  defaultTitle: string;
};

export const ISSUE_TEMPLATES: IssueTemplate[] = [
  {
    key: "dataset",
    title: "Submit Dataset",
    description: "Submit a source-backed dataset or data record for curator review.",
    template: "dataset-submission.yml",
    labels: ["submission", "dataset", "needs-review"],
    defaultTitle: "Dataset submission: ",
  },
  {
    key: "system",
    title: "Submit System",
    description: "Submit an organoid experimental system backed by a source.",
    template: "system-submission.yml",
    labels: ["submission", "system", "needs-review"],
    defaultTitle: "System submission: ",
  },
  {
    key: "benchmarkResult",
    title: "Submit Benchmark Result",
    description: "Submit benchmark result evidence. No score is created automatically.",
    template: "benchmark-result.yml",
    labels: ["submission", "benchmark-result", "needs-review"],
    defaultTitle: "Benchmark result: ",
  },
  {
    key: "correction",
    title: "Submit Correction",
    description: "Correct or dispute an existing registry entry.",
    template: "correction.yml",
    labels: ["correction", "needs-review"],
    defaultTitle: "Correction: ",
  },
  {
    key: "taskRequest",
    title: "Request New Task",
    description: "Propose a new benchmark task with required data and controls.",
    template: "task-request.yml",
    labels: ["task-request", "needs-review"],
    defaultTitle: "Task request: ",
  },
  {
    key: "bugReport",
    title: "Report Site/API Bug",
    description: "Report a website or API problem.",
    template: "bug-report.yml",
    labels: ["bug", "site"],
    defaultTitle: "Bug: ",
  },
];

export type IssueUrlInput = {
  repo: string | null;
  template: IssueTemplate;
  title?: string;
  body?: string;
};

export function buildIssueUrl({ repo, template, title, body }: IssueUrlInput) {
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  const params = new URLSearchParams({
    template: template.template,
    title: title?.trim() || template.defaultTitle,
    labels: template.labels.join(","),
  });
  const trimmedBody = body?.trim();
  if (trimmedBody && trimmedBody.length <= 1800) {
    params.set("body", trimmedBody);
  }
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
