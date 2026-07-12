import type { TestStatus } from "@/lib/types";

const STYLES: Record<TestStatus, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-success-bg text-success" },
  scheduled: { label: "Scheduled", className: "bg-surface-blue text-brand-periwinkle" },
  draft: { label: "Draft", className: "bg-surface-gray text-icon-gray" },
  unpublished: { label: "Unpublished", className: "bg-surface-gray text-icon-gray" },
  expired: { label: "Expired", className: "bg-danger-bg text-danger" },
};

export function StatusBadge({ status }: { status: TestStatus }) {
  const style = STYLES[status] ?? STYLES.draft;

  return (
    <span className={`inline-flex items-center rounded px-base10 py-1 text-badge-text ${style.className}`}>
      {style.label}
    </span>
  );
}
