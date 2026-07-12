import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import type {
  ApiEnvelope,
  Subject,
  Topic,
  SubTopic,
  Test,
  Question,
  User,
} from "@/lib/types";

// Defaults to our own "/api" path, which next.config.js rewrites
// server-to-server to the real backend — this avoids the browser ever
// making a cross-origin request, so there's no CORS preflight to fail.
// Override with NEXT_PUBLIC_API_BASE_URL only if you want to bypass the
// proxy and hit the backend directly (e.g. once its CORS config is fixed).
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const api = axios.create({ baseURL });

// Attach the JWT to every request except login.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected, clear auth so RequireAuth bounces the user to /login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export const authApi = {
  login: (userId: string, password: string) =>
    unwrap<{ token: string; user: User }>(
      api.post("/auth/login", { userId, password })
    ),
};

export const subjectsApi = {
  getAll: () => unwrap<Subject[]>(api.get("/subjects")),
};

export const topicsApi = {
  getBySubject: (subjectId: string) =>
    unwrap<Topic[]>(api.get(`/topics/subject/${subjectId}`)),
};

export const subTopicsApi = {
  getByTopic: (topicId: string) =>
    unwrap<SubTopic[]>(api.get(`/sub-topics/topic/${topicId}`)),
  getByTopics: (topicIds: string[]) =>
    unwrap<SubTopic[]>(api.post("/sub-topics/multi-topics", { topicIds })),
};

export const testsApi = {
  getAll: () => unwrap<Test[]>(api.get("/tests")),
  getById: (id: string) => unwrap<Test>(api.get(`/tests/${id}`)),
  create: (payload: Partial<Test>) =>
    unwrap<Test>(api.post("/tests", payload)),
  update: (id: string, payload: Partial<Test>) =>
    unwrap<Test>(api.put(`/tests/${id}`, payload)),
  publish: (id: string) =>
    unwrap<Test>(api.put(`/tests/${id}`, { status: "live" })),
  // Not documented in the provided API spec — included as a best-effort
  // implementation of the dashboard's "Delete" action (standard REST convention).
  remove: (id: string) => api.delete(`/tests/${id}`),
};

export const questionsApi = {
  bulkCreate: (questions: Omit<Question, "id">[]) =>
    unwrap<Question[]>(api.post("/questions/bulk", { questions })),
  fetchBulk: (questionIds: string[]) =>
    unwrap<Question[]>(
      api.post("/questions/fetchBulk", { question_ids: questionIds })
    ),
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return fallback;
}
