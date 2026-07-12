"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Award, ChevronRight } from "lucide-react";
import { CheckCircle2, Circle } from "lucide-react";

const STRIP_ICONS: { src?: string; icon?: typeof BookOpen; href: string; active?: boolean }[] = [
  { src: "/icons/dashboard.png", href: "/dashboard" },
  { src: "/icons/test-creation.png", href: "/tests/new", active: true },
  { icon: BookOpen, href: "/dashboard" },
  { icon: Award, href: "/dashboard" },
];

export type QuestionStatus = "completed" | "pending";

interface QuestionNavSidebarProps {
  totalQuestions: number;
  statuses: QuestionStatus[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function QuestionNavSidebar({
  totalQuestions,
  statuses,
  currentIndex,
  onSelect,
}: QuestionNavSidebarProps) {
  const router = useRouter();
  const completedCount = statuses.filter((s) => s === "completed").length;

  return (
    <div className="flex shrink-0 flex-col">
      <div className="flex h-[160px] w-[240px] items-center border-b border-r border-border-light px-xl">
        <Image src="/logo.png" alt="PrepRoute" width={130} height={36} priority />
      </div>

      <div className="flex flex-1">
        {/* Collapsed icon strip */}
        <div className="flex w-[46px] flex-col items-center gap-4 border-r border-border-light py-xl">
          {STRIP_ICONS.map(({ icon: Icon, src, href, active }, i) => (
            <button
              key={i}
              onClick={() => router.push(href)}
              className={`flex h-10 w-10 items-center justify-center rounded ${
                active ? "bg-surface-blue text-brand-indigo" : "text-icon-gray"
              }`}
            >
              {src ? (
                <Image src={src} alt="" width={20} height={20} />
              ) : (
                Icon && <Icon className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          ))}
        </div>

        {/* Question list panel */}
        <div className="flex w-[194px] flex-col gap-lg border-r border-border-light px-md py-xl">
        <div className="flex items-center justify-between">
          <span className="text-small-label text-icon-gray">Question creation</span>
          <ChevronRight className="h-4 w-4 rotate-90 text-brand-indigo" />
        </div>
        <p className="text-small-body text-icon-gray">
          Total Questions <span className="text-body-emphasis text-icon-gray">: {completedCount}</span>
        </p>

        <div className="thin-scrollbar flex max-h-[560px] flex-col gap-2.5 overflow-y-auto pr-1">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const status = statuses[i] ?? "pending";
            const isCompleted = status === "completed";
            const isCurrent = i === currentIndex;
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`flex h-8 w-full items-center justify-between rounded border-hairline px-base10 text-caption ${
                  isCompleted
                    ? `text-success border-success ${isCurrent ? "bg-success-bg" : ""}`
                    : "text-text-disabled"
                }`}
                style={!isCompleted ? { borderColor: "#D1D5DB" } : undefined}
              >
                <span className="flex items-center gap-1.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  Question {i + 1}
                </span>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
