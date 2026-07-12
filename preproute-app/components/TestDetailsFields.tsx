"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input, Select } from "@/components/ui/Input";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { toast } from "@/components/ui/Toast";
import { subjectsApi, topicsApi, subTopicsApi, getApiErrorMessage } from "@/lib/api";
import type { Subject, Topic, SubTopic } from "@/lib/types";

export const TEST_TABS = [
  { value: "chapterwise", label: "Chapterwise" },
  { value: "pyq", label: "PYQ" },
  { value: "mock_test", label: "Mock Test" },
] as const;

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const testDetailsSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  subject: z.string().min(1, "Subject is required"),
  correct_marks: z.coerce.number(),
  wrong_marks: z.coerce.number(),
  unattempt_marks: z.coerce.number(),
  total_time: z.coerce.number().positive("Enter minutes greater than 0"),
  total_marks: z.coerce.number().positive("Enter total marks"),
  total_questions: z.coerce.number().int().positive("Enter a question count"),
});

export type TestDetailsForm = z.infer<typeof testDetailsSchema>;

export interface TestDetailsFieldsHandle {
  topics: string[];
  subTopics: string[];
  type: (typeof TEST_TABS)[number]["value"];
  difficulty: (typeof DIFFICULTIES)[number];
}

interface TestDetailsFieldsProps {
  defaultValues?: Partial<TestDetailsForm>;
  defaultTopics?: string[];
  defaultSubTopics?: string[];
  defaultType?: (typeof TEST_TABS)[number]["value"];
  defaultDifficulty?: (typeof DIFFICULTIES)[number];
  submitLabel: string;
  secondaryLabel: string;
  onSecondary: () => void;
  onSubmit: (values: TestDetailsForm & TestDetailsFieldsHandle) => void | Promise<void>;
  submitting?: boolean;
}

export function TestDetailsFields({
  defaultValues,
  defaultTopics = [],
  defaultSubTopics = [],
  defaultType = "chapterwise",
  defaultDifficulty = "easy",
  submitLabel,
  secondaryLabel,
  onSecondary,
  onSubmit,
  submitting,
}: TestDetailsFieldsProps) {
  const [tab, setTab] = useState<(typeof TEST_TABS)[number]["value"]>(defaultType);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>(defaultDifficulty);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(defaultTopics);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>(defaultSubTopics);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TestDetailsForm>({
    resolver: zodResolver(testDetailsSchema),
    defaultValues: {
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      ...defaultValues,
    },
  });

  const selectedSubject = watch("subject");

  useEffect(() => {
    subjectsApi
      .getAll()
      .then(setSubjects)
      .catch((err) => toast.error(getApiErrorMessage(err, "Couldn't load subjects")));
  }, []);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      return;
    }
    topicsApi
      .getBySubject(selectedSubject)
      .then(setTopics)
      .catch((err) => toast.error(getApiErrorMessage(err, "Couldn't load topics")));
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopics.length === 0) {
      setSubTopics([]);
      return;
    }
    subTopicsApi
      .getByTopics(selectedTopics)
      .then(setSubTopics)
      .catch((err) => toast.error(getApiErrorMessage(err, "Couldn't load sub-topics")));
  }, [selectedTopics]);

  const topicOptions = useMemo(() => topics.map((t) => ({ id: t.id, name: t.name })), [topics]);
  const subTopicOptions = useMemo(
    () => subTopics.map((st) => ({ id: st.id, name: st.name })),
    [subTopics]
  );

  // Keep selections in sync with whatever the backend actually has. Guarded
  // on `.length > 0` so this never fires while a list is still loading (which
  // would otherwise wipe out a valid default selection before the fetch for
  // it has even resolved).
  useEffect(() => {
    if (topics.length === 0) return;
    setSelectedTopics((prev) => prev.filter((id) => topics.some((t) => t.id === id)));
  }, [topics]);

  useEffect(() => {
    if (subTopics.length === 0) return;
    setSelectedSubTopics((prev) => prev.filter((id) => subTopics.some((st) => st.id === id)));
  }, [subTopics]);

  function submit(values: TestDetailsForm) {
    if (selectedTopics.length === 0) {
      toast.error("Select at least one topic");
      return;
    }
    // The backend's update endpoint rejects an empty sub_topics array (even
    // though create tolerates it) — see README for the full asymmetry. We
    // enforce the same rule here so a test can never end up in a state where
    // it saves once but then fails validation on every subsequent edit.
    // Skipped only when the selected topic(s) genuinely have zero sub-topics
    // in the backend's data — see the note rendered below the field.
    if (selectedSubTopics.length === 0 && subTopicOptions.length > 0) {
      toast.error("Select at least one sub-topic");
      return;
    }
    onSubmit({ ...values, topics: selectedTopics, subTopics: selectedSubTopics, type: tab, difficulty });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-xl">
      <SegmentedTabs
        options={TEST_TABS as unknown as { value: string; label: string }[]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      <div className="grid grid-cols-2 gap-xl">
        <Field label="Subject" error={errors.subject?.message}>
          <Select placeholder="Choose from Drop-down" error={!!errors.subject} {...register("subject")}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Name of Test" error={errors.name?.message}>
          <Input placeholder="Enter name of Test" error={!!errors.name} {...register("name")} />
        </Field>

        <Field label="Topic">
          <MultiSelect
            options={topicOptions}
            value={selectedTopics}
            onChange={setSelectedTopics}
            disabled={!selectedSubject}
            placeholder="Choose from Drop-down"
          />
        </Field>

        <Field
          label="Sub Topic"
          hint={
            selectedTopics.length > 0 && subTopicOptions.length === 0
              ? "No sub-topics exist for the selected topic(s) in the backend — this test won't be editable later until one is added there."
              : "Required — the backend rejects an empty selection when saving."
          }
        >
          <MultiSelect
            options={subTopicOptions}
            value={selectedSubTopics}
            onChange={setSelectedSubTopics}
            disabled={selectedTopics.length === 0}
            placeholder="Choose from Drop-down"
          />
        </Field>

        <Field label="Duration (Minutes)" error={errors.total_time?.message}>
          <Input placeholder="Enter the time" error={!!errors.total_time} {...register("total_time")} />
        </Field>

        <Field label="Test Difficulty Level">
          <div className="flex h-12 items-center gap-xl">
            {DIFFICULTIES.map((d) => (
              <label key={d} className="flex items-center gap-2 text-small-body text-text-secondary">
                <input
                  type="radio"
                  name="difficulty"
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                  className="h-4 w-4 accent-brand-periwinkle"
                />
                {d[0].toUpperCase() + d.slice(1)}
              </label>
            ))}
          </div>
        </Field>
      </div>

      <div>
        <p className="mb-lg text-small-body text-text-secondary">Marking Scheme:</p>
        <div className="grid grid-cols-5 gap-lg">
          <Field label="Wrong Answer" error={errors.wrong_marks?.message}>
            <Input type="number" error={!!errors.wrong_marks} {...register("wrong_marks")} />
          </Field>
          <Field label="Unattempted" error={errors.unattempt_marks?.message}>
            <Input type="number" error={!!errors.unattempt_marks} {...register("unattempt_marks")} />
          </Field>
          <Field label="Correct Answer" error={errors.correct_marks?.message}>
            <Input type="number" error={!!errors.correct_marks} {...register("correct_marks")} />
          </Field>
          <Field label="No of Questions" error={errors.total_questions?.message}>
            <Input placeholder="Ex:50 Qs" error={!!errors.total_questions} {...register("total_questions")} />
          </Field>
          <Field label="Total Marks" error={errors.total_marks?.message}>
            <Input placeholder="Ex:350 Marks" error={!!errors.total_marks} {...register("total_marks")} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-lg">
        <Button type="button" variant="secondary" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
