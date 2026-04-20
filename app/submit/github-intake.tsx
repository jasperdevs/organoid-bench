import { ISSUE_TEMPLATES, buildIssueUrl, type IssueTemplate } from "@/lib/github-issues";

export function GitHubIntake({ repo }: { repo: string | null }) {
  return (
    <div className="max-w-5xl">
      {!repo && (
        <div className="mb-5 rounded-[12px] border border-[color:var(--border-strong)] bg-[color:var(--surface)] p-4 text-sm">
          <div className="font-medium">GitHub repository is not configured.</div>
          <p className="mt-1 text-[color:var(--foreground-muted)]">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_GITHUB_REPO</code> to enable submission links.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {ISSUE_TEMPLATES.map((template) => (
          <IssueCard
            key={template.key}
            template={template}
            href={buildIssueUrl({ repo, template })}
          />
        ))}
      </div>
    </div>
  );
}

function IssueCard({ template, href }: { template: IssueTemplate; href: string | null }) {
  const content = (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 h-full hover:border-[color:var(--border-strong)]">
      <div className="font-medium">{template.title}</div>
      <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">{template.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {template.labels.map((label) => (
          <span key={label} className="rounded-full bg-[color:var(--surface-alt)] px-2 py-0.5 text-xs font-mono">
            {label}
          </span>
        ))}
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    <div className="opacity-70">{content}</div>
  );
}
