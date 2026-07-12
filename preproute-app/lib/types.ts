export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: string;
  userId?: string;
  name?: string;
  [key: string]: unknown;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export type TestStatus = "live" | "unpublished" | "scheduled" | "expired" | "draft";

export type Difficulty = "easy" | "medium" | "hard";

export interface Test {
  id: string;
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: TestStatus;
  questions?: string[];
  created_at?: string;
  // Some list endpoints return resolved names instead of ids for convenience
  subjectName?: string;
  topicNames?: string[];
}

export type CorrectOption = "option1" | "option2" | "option3" | "option4";

export interface Question {
  id: string;
  type: "mcq";
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: Difficulty;
  subject?: string;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
  test_id?: string;
}

// A question that only exists in the browser until it's bulk-saved to the API
export type DraftQuestion = Omit<Question, "id" | "test_id"> & {
  draftId: string;
};
