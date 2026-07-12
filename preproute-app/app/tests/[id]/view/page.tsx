"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, LayoutGrid } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StatusBadge } from "@/components/StatusBadge";
import { TestDetailCard } from "@/components/TestDetailCard";
import { QuestionPreviewList } from "@/components/QuestionPreviewList";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { testsApi, questionsApi, getApiErrorMessage } from "@/lib/api";
import { resolveTest } from "@/lib/resolveTest";
import type { Test, Question } from "@/lib/types";

function ViewTestContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const testId = params.id;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [topicNameById, setTopicNameById] = useState<Record<string, string>>({});
  const [subTopicNameById, setSubTopicNameById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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

  if (loading || !test) {
    return (
      <div className="flex min-h-screen bg-white">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <p className="py-2xl text-center text-small-body text-text-tertiary">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-col gap-xl p-xl">
          <div className="flex items-center justify-between">
            <Breadcrumb
              items={[{ label: "Dashboard", href: "/dashboard" }, { label: test.name }]}
            />
            <div className="flex items-center gap-lg">
              <StatusBadge status={test.status} />
              <Button variant="secondary" onClick={() => router.push(`/tests/${testId}`)}>
                <Pencil className="h-4 w-4" />
                Edit Test
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                <LayoutGrid className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {test.status === "live" && (
            <div className="rounded border border-success bg-success-bg px-xl py-lg text-small-body text-success">
              This test is live and scheduled for students to take.
            </div>
          )}

          <TestDetailCard
            chapterLabel={test.name}
            difficulty={test.difficulty}
            subjectName={subjectName}
            topicNames={test.topics.map((id) => topicNameById[id] ?? id)}
            subTopicNames={test.sub_topics.map((id) => subTopicNameById[id] ?? id)}
            totalTime={test.total_time}
            totalQuestions={test.total_questions}
            totalMarks={test.total_marks}
          />

          <h2 className="text-body-emphasis text-text-secondary">
            Questions ({questions.length})
          </h2>

          <QuestionPreviewList
            questions={questions}
            topicNameById={topicNameById}
            subTopicNameById={subTopicNameById}
          />
        </main>
      </div>
    </div>
  );
}

export default function ViewTestPage() {
  return (
    <RequireAuth>
      <ViewTestContent />
    </RequireAuth>
  );
}
