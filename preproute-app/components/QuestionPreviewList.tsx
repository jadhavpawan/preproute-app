import { CheckCircle2 } from "lucide-react";
import type { Question, CorrectOption } from "@/lib/types";

const OPTION_KEYS: CorrectOption[] = ["option1", "option2", "option3", "option4"];

interface QuestionPreviewListProps {
  questions: Question[];
  topicNameById?: Record<string, string>;
  subTopicNameById?: Record<string, string>;
}

export function QuestionPreviewList({
  questions,
  topicNameById = {},
  subTopicNameById = {},
}: QuestionPreviewListProps) {
  if (questions.length === 0) {
    return <p className="text-small-body text-text-tertiary">No questions saved yet.</p>;
  }

  return (
    <div className="flex flex-col gap-lg">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded border border-border-light p-xl">
          <div className="mb-lg flex items-start gap-2">
            <span className="shrink-0 text-body-emphasis text-text-secondary">{i + 1}.</span>
            <div
              className="prose-sm max-w-none text-body-emphasis text-text-secondary [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded"
              dangerouslySetInnerHTML={{ __html: q.question }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {OPTION_KEYS.map((key) => {
              const isCorrect = q.correct_option === key;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 rounded border-hairline px-base10 py-2 text-small-body ${
                    isCorrect
                      ? "border-success bg-success-bg text-success"
                      : "border-border-light text-text-secondary"
                  }`}
                >
                  {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {q[key]}
                </div>
              );
            })}
          </div>

          {(q.difficulty || q.topic || q.sub_topic) && (
            <div className="mt-lg flex flex-wrap gap-lg text-caption text-icon-gray">
              {q.difficulty && <span className="capitalize">Difficulty: {q.difficulty}</span>}
              {q.topic && <span>Topic: {topicNameById[q.topic] ?? q.topic}</span>}
              {q.sub_topic && <span>Sub-topic: {subTopicNameById[q.sub_topic] ?? q.sub_topic}</span>}
            </div>
          )}

          {q.explanation && (
            <p className="mt-lg text-caption text-icon-gray">Explanation: {q.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
}
