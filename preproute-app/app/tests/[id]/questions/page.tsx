"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Papa from "papaparse";
import { Radio as RadioIcon, Plus, Upload } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { QuestionNavSidebar, type QuestionStatus } from "@/components/QuestionNavSidebar";
import { TestDetailCard } from "@/components/TestDetailCard";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Pagination } from "@/components/Pagination";
import { EditTestModal } from "@/components/EditTestModal";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GhostChip, ToolbarActionButton } from "@/components/Buttons";
import { toast } from "@/components/ui/Toast";
import {
  testsApi,
  questionsApi,
  getApiErrorMessage,
} from "@/lib/api";
import { resolveTest } from "@/lib/resolveTest";
import type { Test, Question, CorrectOption } from "@/lib/types";

const questionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  option1: z.string().min(1, "Required"),
  option2: z.string().min(1, "Required"),
  option3: z.string().min(1, "Required"),
  option4: z.string().min(1, "Required"),
  correct_option: z.enum(["option1", "option2", "option3", "option4"]),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().or(z.literal("")),
  topic: z.string().optional().or(z.literal("")),
  sub_topic: z.string().optional().or(z.literal("")),
});

type QuestionForm = z.infer<typeof questionSchema>;

const EMPTY_ENTRY: QuestionForm = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_option: "option1",
  explanation: "",
  difficulty: "",
  topic: "",
  sub_topic: "",
};

function AddQuestionsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const testId = params.id;

  const [test, setTest] = useState<Test | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [topicNameById, setTopicNameById] = useState<Record<string, string>>({});
  const [subTopicNameById, setSubTopicNameById] = useState<Record<string, string>>({});
  const [existingIds, setExistingIds] = useState<(string | undefined)[]>([]);
  const [entries, setEntries] = useState<Record<number, QuestionForm>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: EMPTY_ENTRY,
  });

  const csvInputRef = useRef<HTMLInputElement>(null);

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
          const existing = await questionsApi.fetchBulk(resolved.questions);
          const loadedEntries: Record<number, QuestionForm> = {};
          const ids: (string | undefined)[] = [];
          existing.forEach((q, i) => {
            loadedEntries[i] = {
              question: q.question,
              option1: q.option1,
              option2: q.option2,
              option3: q.option3,
              option4: q.option4,
              correct_option: q.correct_option,
              explanation: q.explanation ?? "",
              difficulty: (q.difficulty as QuestionForm["difficulty"]) ?? "",
              topic: q.topic ?? "",
              sub_topic: q.sub_topic ?? "",
            };
            ids[i] = q.id;
          });
          setEntries(loadedEntries);
          setExistingIds(ids);
          reset(loadedEntries[0] ?? EMPTY_ENTRY);
        }
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Couldn't load test"));
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const totalQuestions = test?.total_questions ?? 0;

  const statuses: QuestionStatus[] = useMemo(
    () =>
      Array.from({ length: totalQuestions }).map((_, i) =>
        entries[i]?.question ? "completed" : "pending"
      ),
    [entries, totalQuestions]
  );

  const topicOptions = useMemo(
    () => Object.entries(topicNameById).map(([id, name]) => ({ id, name })),
    [topicNameById]
  );
  const subTopicOptions = useMemo(
    () => Object.entries(subTopicNameById).map(([id, name]) => ({ id, name })),
    [subTopicNameById]
  );

  function goToIndex(index: number, currentValues: QuestionForm) {
    setEntries((prev) => ({ ...prev, [currentIndex]: currentValues }));
    setCurrentIndex(index);
    reset(entries[index] ?? EMPTY_ENTRY);
  }

  function handleDeleteEdits() {
    reset(EMPTY_ENTRY);
    setEntries((prev) => ({ ...prev, [currentIndex]: EMPTY_ENTRY }));
    toast.success("Cleared this question's edits");
  }

  function handleAddQuestionSlot() {
    const newIndex = totalQuestions;
    setTest((prev) => (prev ? { ...prev, total_questions: prev.total_questions + 1 } : prev));
    goToIndex(newIndex, entries[currentIndex] ?? EMPTY_ENTRY);
  }

  function handleCsvButtonClick() {
    csvInputRef.current?.click();
  }

  function handleCsvFileSelected(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const imported: QuestionForm[] = [];
        let skipped = 0;

        rows.forEach((row) => {
          const question = row.question?.trim();
          const option1 = row.option1?.trim();
          const option2 = row.option2?.trim();
          const option3 = row.option3?.trim();
          const option4 = row.option4?.trim();
          const correctRaw = row.correct_option?.trim();
          const isValidCorrect =
            correctRaw === "option1" ||
            correctRaw === "option2" ||
            correctRaw === "option3" ||
            correctRaw === "option4";

          if (!question || !option1 || !option2 || !option3 || !option4 || !isValidCorrect) {
            skipped++;
            return;
          }

          const topicName = row.topic?.trim();
          const subTopicName = row.sub_topic?.trim();
          const topicId = topicName
            ? topicOptions.find((t) => t.name.toLowerCase() === topicName.toLowerCase())?.id
            : undefined;
          const subTopicId = subTopicName
            ? subTopicOptions.find((st) => st.name.toLowerCase() === subTopicName.toLowerCase())?.id
            : undefined;

          imported.push({
            question,
            option1,
            option2,
            option3,
            option4,
            correct_option: correctRaw as CorrectOption,
            explanation: row.explanation?.trim() ?? "",
            difficulty: (row.difficulty?.trim() as QuestionForm["difficulty"]) ?? "",
            topic: topicId ?? "",
            sub_topic: subTopicId ?? "",
          });
        });

        if (imported.length === 0) {
          toast.error("No valid rows found — check the column headers match the CSV template");
          return;
        }

        setEntries((prev) => {
          const updated = { ...prev };
          let insertAt = 0;
          while (updated[insertAt]?.question) insertAt++;
          imported.forEach((entry) => {
            updated[insertAt] = entry;
            insertAt++;
          });

          // Grow the test's question count if the CSV brought in more than planned.
          setTest((prevTest) =>
            prevTest && insertAt > prevTest.total_questions
              ? { ...prevTest, total_questions: insertAt }
              : prevTest
          );

          return updated;
        });

        toast.success(
          `Imported ${imported.length} question(s) from CSV` +
            (skipped ? `, skipped ${skipped} invalid row(s)` : "")
        );
      },
      error: () => toast.error("Couldn't parse that CSV file"),
    });
  }

  async function persistAllQuestions(finalEntries: Record<number, QuestionForm>) {
    const filled = Object.entries(finalEntries).filter(([, v]) => v.question.trim().length > 0);

    if (filled.length === 0) {
      throw new Error("Add at least one question before continuing");
    }

    // Anything that already has an id just gets left alone — there's no
    // per-question update endpoint in the API doc, so only new questions
    // (no existing id at that index) are bulk-created here.
    const toCreate: { index: number; payload: Omit<Question, "id"> }[] = [];
    filled.forEach(([idxStr, v]) => {
      const idx = Number(idxStr);
      if (!existingIds[idx]) {
        toCreate.push({
          index: idx,
          payload: {
            type: "mcq",
            question: v.question,
            option1: v.option1,
            option2: v.option2,
            option3: v.option3,
            option4: v.option4,
            correct_option: v.correct_option as CorrectOption,
            explanation: v.explanation || undefined,
            difficulty: (v.difficulty || undefined) as Question["difficulty"],
            subject: test?.subject,
            topic: v.topic || undefined,
            sub_topic: v.sub_topic || undefined,
            test_id: testId,
          },
        });
      }
    });

    let newIds: string[] = [];
    if (toCreate.length > 0) {
      const created = await questionsApi.bulkCreate(toCreate.map((t) => t.payload));
      newIds = created.map((c) => c.id);
    }

    const allIds = [...existingIds.filter((id): id is string => !!id), ...newIds];

    await testsApi.update(testId, {
      questions: allIds,
      total_questions: allIds.length,
    });

    return allIds;
  }

  async function onNext(values: QuestionForm) {
    const updatedEntries = { ...entries, [currentIndex]: values };
    setEntries(updatedEntries);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      reset(updatedEntries[currentIndex + 1] ?? EMPTY_ENTRY);
      return;
    }

    // Last question — save everything and move to the publish confirmation screen.
    setSaving(true);
    try {
      await persistAllQuestions(updatedEntries);
      toast.success("All questions saved");
      router.push(`/tests/${testId}/preview`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't save questions"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishNow(values: QuestionForm) {
    const updatedEntries = { ...entries, [currentIndex]: values };
    setSaving(true);
    try {
      await persistAllQuestions(updatedEntries);
      router.push(`/tests/${testId}/preview`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't save questions"));
    } finally {
      setSaving(false);
    }
  }

  function handleExit() {
    if (!confirm("Exit test creation? Unsaved changes to this question will be lost.")) return;
    router.push("/dashboard");
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
        totalQuestions={totalQuestions}
        statuses={statuses}
        currentIndex={currentIndex}
        onSelect={(i) => goToIndex(i, entries[currentIndex] ?? EMPTY_ENTRY)}
      />

      <div className="flex flex-1 flex-col">
        <Header
          extra={
            <Button onClick={handleSubmit(handlePublishNow)} loading={saving} className="w-[200px]">
              Publish
            </Button>
          }
        />
        <div className="flex items-center border-b border-border-light px-xl py-lg">
          <Breadcrumb
            items={[
              { label: "Test Creation", href: "/dashboard" },
              { label: "Create Test", href: `/tests/${testId}` },
              { label: "Chapter Wise" },
            ]}
          />
        </div>

        <main className="flex flex-col gap-xl p-xl">
          <TestDetailCard
            chapterLabel={test.name}
            difficulty={test.difficulty}
            subjectName={subjectName}
            topicNames={test.topics.map((id) => topicNameById[id] ?? id)}
            subTopicNames={test.sub_topics.map((id) => subTopicNameById[id] ?? id)}
            totalTime={test.total_time}
            totalQuestions={test.total_questions}
            totalMarks={test.total_marks}
            onEdit={() => setEditModalOpen(true)}
          />

          <div className="flex items-center justify-between">
            <span className="text-body-emphasis" style={{ color: "#07013C" }}>
              Question {currentIndex + 1}/{totalQuestions}
            </span>
            <div className="flex items-center gap-2">
              <ToolbarActionButton type="button" onClick={handleAddQuestionSlot}>
                <Plus className="h-4 w-4" />
                MCQ
              </ToolbarActionButton>
              <ToolbarActionButton type="button" onClick={handleCsvButtonClick}>
                <Upload className="h-4 w-4" />
                CSV
              </ToolbarActionButton>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvFileSelected(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
          <p className="-mt-lg text-caption text-text-tertiary">
            CSV columns: question, option1, option2, option3, option4, correct_option (option1–4),
            explanation, difficulty, topic, sub_topic
          </p>

          <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-2xl">
            <div className="flex justify-end">
              <GhostChip type="button" onClick={handleDeleteEdits}>
                Delete All Edits
              </GhostChip>
            </div>

            <Controller
              control={control}
              name="question"
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Type here" />
              )}
            />
            {errors.question && <p className="-mt-lg text-caption text-danger">{errors.question.message}</p>}

            <div className="flex flex-col gap-lg">
              <p className="text-body-emphasis text-black">Type the options below</p>
              {(["option1", "option2", "option3", "option4"] as const).map((key) => (
                <div key={key} className="flex items-center gap-lg">
                  <RadioIcon className="h-5 w-5 shrink-0 text-brand-periwinkle" strokeWidth={1.5} />
                  <div className="flex flex-1 items-center gap-2 rounded border border-border-light px-base10">
                    <Input
                      placeholder="Type Option here"
                      error={!!errors[key]}
                      className="flex-1 border-none px-0"
                      {...register(key)}
                    />
                    <label className="flex shrink-0 items-center gap-1 text-caption text-text-tertiary">
                      <input
                        type="radio"
                        value={key}
                        className="accent-brand-periwinkle"
                        {...register("correct_option")}
                      />
                      Correct
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-lg">
              <p className="text-body-emphasis text-black">Add Solution</p>
              <Textarea rows={4} placeholder="Type here" {...register("explanation")} />
            </div>

            <Pagination
              total={totalQuestions}
              current={currentIndex}
              onChange={(i) => goToIndex(i, entries[currentIndex] ?? EMPTY_ENTRY)}
            />

            <div className="flex flex-col gap-lg">
              <p className="text-body-emphasis text-text-secondary">Question settings</p>

              <Field label="Level of Difficulty">
                <Select placeholder="Select from Drop-down" {...register("difficulty")}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </Field>

              <Field label="Topic">
                <Select placeholder="Select from Drop-down" {...register("topic")}>
                  {topicOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Sub-topic">
                <Select placeholder="Select from Drop-down" {...register("sub_topic")}>
                  {subTopicOptions.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex items-center justify-between">
              <Button type="button" variant="destructive" onClick={handleExit} className="w-[160px]">
                Exit Test Creation
              </Button>
              <Button type="submit" loading={saving} className="w-[200px]">
                {currentIndex < totalQuestions - 1 ? "Next" : "Finish"}
              </Button>
            </div>
          </form>
        </main>
      </div>

      {test && (
        <EditTestModal
          test={test}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSaved={(updated) => {
            setTest(updated);
            setSubjectName(updated.subjectDisplayName);
            setTopicNameById(updated.topicNameById);
            setSubTopicNameById(updated.subTopicNameById);
          }}
        />
      )}
    </div>
  );
}

export default function AddQuestionsPage() {
  return (
    <RequireAuth>
      <AddQuestionsContent />
    </RequireAuth>
  );
}
