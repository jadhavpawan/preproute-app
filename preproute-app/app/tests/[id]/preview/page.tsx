"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Header } from "@/components/Header";
import { QuestionNavSidebar, type QuestionStatus } from "@/components/QuestionNavSidebar";
import { TestDetailCard } from "@/components/TestDetailCard";
import { QuestionPreviewList } from "@/components/QuestionPreviewList";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { testsApi, questionsApi, getApiErrorMessage } from "@/lib/api";
import { resolveTest } from "@/lib/resolveTest";
import type { Test, Question } from "@/lib/types";

const PUBLISH_TABS = [
  { value: "now", label: "Publish Now" },
  { value: "schedule", label: "Schedule Publish" },
] as const;

const LIVE_UNTIL_OPTIONS = [
  "Always Available",
  "1 Week",
  "2 Weeks",
  "3 Weeks",
  "1 Month",
  "Custom Duration",
] as const;

function PreviewContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const testId = params.id;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [topicNameById, setTopicNameById] = useState<Record<string, string>>({});
  const [subTopicNameById, setSubTopicNameById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [publishTab, setPublishTab] = useState<(typeof PUBLISH_TABS)[number]["value"]>("now");
  const [liveUntil, setLiveUntil] = useState<(typeof LIVE_UNTIL_OPTIONS)[number]>("Custom Duration");
  const [confirming, setConfirming] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const rawTest = await testsApi.getById(testId);
        const resolved = await resolveTest(rawTest);
        setTest(resolved);
        setSubjectName(resolved.subjectDisplayName);
        setTopicNameById(resolved.topicNameById);
        setSubTopicNameById(resolved.subTopicNameById);
        if (resolved.questions?.length) {
          setQuestions(await questionsApi.fetchBulk(resolved.questions));
        }
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Couldn't load test"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [testId]);

  const questionsDone = test?.questions?.length ?? 0;
  const statuses: QuestionStatus[] = useMemo(
    () =>
      Array.from({ length: test?.total_questions ?? 0 }).map((_, i) =>
        i < questionsDone ? "completed" : "pending"
      ),
    [questionsDone, test?.total_questions]
  );

  async function handleConfirm() {
    if (!test) return;
    setConfirming(true);
    try {
      await testsApi.publish(test.id);
      toast.success(
        publishTab === "now"
          ? "Test published successfully"
          : "Scheduled publishing isn't supported by the API yet — published immediately instead"
      );
      router.push(`/tests/${test.id}/view`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't publish test"));
    } finally {
      setConfirming(false);
    }
  }

  if (loading || !test) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <p className="py-2xl text-center text-small-body text-text-tertiary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <QuestionNavSidebar
        totalQuestions={test.total_questions}
        statuses={statuses}
        currentIndex={-1}
        onSelect={(i) => router.push(`/tests/${testId}/questions`)}
      />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex flex-col gap-xl p-xl">
          <h1 className="text-section-title text-text-secondary">Test creation</h1>

          <div className="flex items-center gap-lg">
            <span className="text-body-emphasis text-text-secondary">Test created</span>
            <span className="inline-flex items-center gap-1.5 rounded bg-success-bg px-base10 py-1 text-caption-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All {test.total_questions} Questions done
            </span>
          </div>

          <TestDetailCard
            chapterLabel={test.name}
            difficulty={test.difficulty}
            subjectName={subjectName}
            topicNames={test.topics.map((id) => topicNameById[id] ?? id)}
            subTopicNames={test.sub_topics.map((id) => subTopicNameById[id] ?? id)}
            totalTime={test.total_time}
            totalQuestions={test.total_questions}
            totalMarks={test.total_marks}
            onEdit={() => router.push(`/tests/${testId}`)}
          />

          <div className="rounded border border-border-light">
            <button
              onClick={() => setShowPreview((s) => !s)}
              className="flex w-full items-center justify-between px-xl py-lg text-body-emphasis text-text-secondary"
            >
              Preview Questions ({questions.length})
              {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showPreview && (
              <div className="border-t border-border-light p-xl">
                <QuestionPreviewList
                  questions={questions}
                  topicNameById={topicNameById}
                  subTopicNameById={subTopicNameById}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-xl rounded border border-border-light p-xl">
            <SegmentedTabs
              options={PUBLISH_TABS as unknown as { value: string; label: string }[]}
              value={publishTab}
              onChange={(v) => setPublishTab(v as typeof publishTab)}
            />

            {publishTab === "schedule" && (
              <div className="flex flex-col gap-lg">
                <p className="text-body-emphasis text-text-secondary">Select Date and Time</p>
                <div className="grid grid-cols-2 gap-lg">
                  <Input type="date" placeholder="Select Date" />
                  <Input type="time" placeholder="Select Time" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-lg">
              <div>
                <p className="text-body-emphasis text-text-secondary">Live Until</p>
                <p className="text-caption text-text-tertiary">
                  Choose how long this test should remain available on the platform.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                {LIVE_UNTIL_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-small-body text-text-secondary">
                    <input
                      type="radio"
                      name="live-until"
                      checked={liveUntil === opt}
                      onChange={() => setLiveUntil(opt)}
                      className="h-4 w-4 accent-brand-periwinkle"
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {liveUntil === "Custom Duration" && (
                <div className="grid grid-cols-2 gap-lg">
                  <Input type="date" placeholder="Select End Date" />
                  <Input type="time" placeholder="Select End Time" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-lg">
            <Button variant="secondary" onClick={() => router.push(`/tests/${testId}/questions`)}>
              Cancel
            </Button>
            <Button loading={confirming} onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <RequireAuth>
      <PreviewContent />
    </RequireAuth>
  );
}
