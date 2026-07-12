import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  current: number; // 0-indexed
  onChange: (index: number) => void;
}

export function Pagination({ total, current, onChange }: PaginationProps) {
  // Show a window of up to 5 page numbers around the current page, with ellipsis.
  const pages: (number | "ellipsis")[] = [];
  const windowSize = 5;
  let start = Math.max(0, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize);
  start = Math.max(0, end - windowSize);

  for (let i = start; i < end; i++) pages.push(i);
  if (end < total) pages.push("ellipsis");

  return (
    <div className="flex items-center justify-center gap-2 py-md">
      <button
        disabled={current === 0}
        onClick={() => onChange(current - 1)}
        className="flex h-7 w-7 items-center justify-center rounded text-icon-gray disabled:opacity-30"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="w-[18px] text-center text-caption text-icon-gray">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-7 w-7 rounded text-caption ${
              p === current ? "bg-surface-blue text-brand-periwinkle" : "text-icon-gray hover:bg-surface-gray"
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        disabled={current === total - 1}
        onClick={() => onChange(current + 1)}
        className="flex h-7 w-7 items-center justify-center rounded text-icon-gray disabled:opacity-30"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
