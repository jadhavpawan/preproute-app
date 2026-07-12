"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  TestDetailsFields,
  type TestDetailsForm,
  type TestDetailsFieldsHandle,
} from "@/components/TestDetailsFields";
import { toast } from "@/components/ui/Toast";
import { testsApi, getApiErrorMessage } from "@/lib/api";
import { resolveTest } from "@/lib/resolveTest";
import type { Test } from "@/lib/types";

function CreateEditTestContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [existingTest, setExistingTest] = useState<Test | null>(null);
  const [loadingTest, setLoadingTest] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    testsApi
      .getById(params.id)
      .then(resolveTest)
      .then(setExistingTest)
      .catch((err) => toast.error(getApiErrorMessage(err, "Couldn't load test")))
      .finally(() => setLoadingTest(false));
  }, [isNew, params.id]);

  async function handleSubmit(values: TestDetailsForm & TestDetailsFieldsHandle) {
    setSaving(true);
    try {
      const payload: Partial<Test> = {
        name: values.name,
        subject: values.subject,
        type: values.type,
        topics: values.topics,
        sub_topics: values.subTopics,
        difficulty: values.difficulty,
        correct_marks: values.correct_marks,
        wrong_marks: values.wrong_marks,
        unattempt_marks: values.unattempt_marks,
        total_time: values.total_time,
        total_marks: values.total_marks,
        total_questions: values.total_questions,
        status: "draft",
      };

      const test = existingTest
        ? await testsApi.update(existingTest.id, payload)
        : await testsApi.create(payload);

      toast.success(existingTest ? "Test updated" : "Test created");
      router.push(`/tests/${test.id}/questions`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't save test"));
    } finally {
      setSaving(false);
    }
  }

  if (loadingTest) {
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
          <Breadcrumb
            items={[
              { label: "Test Creation", href: "/dashboard" },
              { label: "Create Test" },
              { label: "Chapter Wise" },
            ]}
          />

          <TestDetailsFields
            defaultValues={
              existingTest
                ? {
                    name: existingTest.name,
                    subject: existingTest.subject,
                    correct_marks: existingTest.correct_marks,
                    wrong_marks: existingTest.wrong_marks,
                    unattempt_marks: existingTest.unattempt_marks,
                    total_time: existingTest.total_time,
                    total_marks: existingTest.total_marks,
                    total_questions: existingTest.total_questions,
                  }
                : undefined
            }
            defaultTopics={existingTest?.topics}
            defaultSubTopics={existingTest?.sub_topics}
            defaultType={(existingTest?.type as "chapterwise" | "pyq" | "mock_test") ?? "chapterwise"}
            defaultDifficulty={existingTest?.difficulty ?? "easy"}
            submitLabel="Next"
            secondaryLabel="Cancel"
            onSecondary={() => router.push("/dashboard")}
            submitting={saving}
            onSubmit={handleSubmit}
          />
        </main>
      </div>
    </div>
  );
}

export default function CreateEditTestPage() {
  return (
    <RequireAuth>
      <CreateEditTestContent />
    </RequireAuth>
  );
}
