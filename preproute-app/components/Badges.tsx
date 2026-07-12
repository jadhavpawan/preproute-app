import { Brain } from "lucide-react";

export function ChapterWiseBadge() {
  return (
    <span
      className="inline-flex items-center rounded-pill px-base10 py-1 text-badge-text text-white border-hairline"
      style={{
        background: "linear-gradient(135deg, #07013C 0%, #000A3A 100%)",
        borderColor: "#F8FAFF",
      }}
    >
      Chapter Wise
    </span>
  );
}

export function DifficultyBadge({ label = "Easy" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-teal-accent px-base10 py-1 text-badge-text text-white">
      <Brain className="h-3.5 w-3.5" strokeWidth={2} />
      {label}
    </span>
  );
}

export function TopicTag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded px-base10 py-1 text-badge-text border-hairline"
      style={{ color: "#FFC82C", borderColor: "#E9B406" }}
    >
      {label}
    </span>
  );
}
