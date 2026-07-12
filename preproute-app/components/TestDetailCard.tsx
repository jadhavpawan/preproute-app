import { Pencil } from "lucide-react";
import { ChapterWiseBadge, DifficultyBadge, TopicTag } from "@/components/Badges";
import { StatRow } from "@/components/StatRow";
import type { Difficulty } from "@/lib/types";

interface TestDetailCardProps {
  chapterLabel: string;
  difficulty: Difficulty;
  subjectName: string;
  topicNames: string[];
  subTopicNames: string[];
  totalTime: number;
  totalQuestions: number;
  totalMarks: number;
  onEdit?: () => void;
}

export function TestDetailCard({
  chapterLabel,
  difficulty,
  subjectName,
  topicNames,
  subTopicNames,
  totalTime,
  totalQuestions,
  totalMarks,
  onEdit,
}: TestDetailCardProps) {
  return (
    <div className="flex items-start justify-between gap-xl rounded border border-border-light p-xl">
      <div className="flex flex-col gap-lg">
        <div className="flex items-end gap-1.5">
          <ChapterWiseBadge />
        </div>

        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-2">
            <span className="text-body-emphasis font-bold text-black">{chapterLabel}</span>
          </div>
          <DifficultyBadge label={difficulty[0].toUpperCase() + difficulty.slice(1)} />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-caption text-icon-gray">
            <span>Subject</span>
            <span>:</span>
            <span className="text-body-emphasis text-icon-gray" style={{ color: "#6B7280" }}>
              {subjectName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-caption text-icon-gray">
            <span>Topic</span>
            <span>:</span>
            <div className="flex flex-wrap gap-1.5">
              {topicNames.map((t) => (
                <TopicTag key={t} label={t} />
              ))}
            </div>
          </div>
          {subTopicNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-caption text-icon-gray">
              <span>Sub Topic</span>
              <span>:</span>
              <div className="flex flex-wrap gap-1.5">
                {subTopicNames.map((t) => (
                  <TopicTag key={t} label={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between gap-xl self-stretch">
        {onEdit && (
          <button onClick={onEdit} className="text-brand-periwinkle hover:opacity-70">
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <StatRow
          stats={[
            { icon: "time", value: `${totalTime} Min` },
            { icon: "questions", value: `${totalQuestions} Q's` },
            { icon: "marks", value: `${totalMarks} Marks` },
          ]}
        />
      </div>
    </div>
  );
}
