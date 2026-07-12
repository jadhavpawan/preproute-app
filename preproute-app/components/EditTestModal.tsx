"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import {
  TestDetailsFields,
  type TestDetailsForm,
  type TestDetailsFieldsHandle,
} from "@/components/TestDetailsFields";
import { toast } from "@/components/ui/Toast";
import { testsApi, getApiErrorMessage } from "@/lib/api";
import { resolveTest, type ResolvedTest } from "@/lib/resolveTest";
import type { Test } from "@/lib/types";

interface EditTestModalProps {
  test: Test;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: ResolvedTest) => void;
}

export function EditTestModal({ test, open, onClose, onSaved }: EditTestModalProps) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: TestDetailsForm & TestDetailsFieldsHandle) {
    setSaving(true);
    try {
      const updated = await testsApi.update(test.id, {
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
      });
      const resolved = await resolveTest(updated);
      toast.success("Test updated");
      onSaved(resolved);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't save test"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Test creation" widthClassName="max-w-[720px]">
      <TestDetailsFields
        defaultValues={{
          name: test.name,
          subject: test.subject,
          correct_marks: test.correct_marks,
          wrong_marks: test.wrong_marks,
          unattempt_marks: test.unattempt_marks,
          total_time: test.total_time,
          total_marks: test.total_marks,
          total_questions: test.total_questions,
        }}
        defaultTopics={test.topics}
        defaultSubTopics={test.sub_topics}
        defaultType={(test.type as "chapterwise" | "pyq" | "mock_test") ?? "chapterwise"}
        defaultDifficulty={test.difficulty ?? "easy"}
        submitLabel="Save"
        secondaryLabel="Cancel"
        onSecondary={onClose}
        submitting={saving}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
}
