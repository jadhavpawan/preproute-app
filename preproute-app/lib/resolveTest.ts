import { subjectsApi, topicsApi, subTopicsApi } from "./api";
import type { Test, Subject, Topic, SubTopic } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_RE.test(value.trim());
}

function matchByIdOrName<T extends { id: string; name: string }>(
  value: string,
  list: T[]
): string | undefined {
  const trimmed = value.trim();
  if (isUuid(trimmed)) {
    const byId = list.find((item) => item.id === trimmed);
    if (byId) return byId.id;
  }
  const byName = list.find((item) => item.name.trim().toLowerCase() === trimmed.toLowerCase());
  return byName?.id;
}

export interface ResolvedTest extends Test {
  // subject/topics/sub_topics are guaranteed UUIDs on this object
  subjectDisplayName: string;
  topicNameById: Record<string, string>;
  subTopicNameById: Record<string, string>;
}

/**
 * GET /tests and GET /tests/:id sometimes return human-readable names for
 * subject/topics/sub_topics instead of the UUIDs that every other endpoint
 * (topics/subject/:id, sub-topics/multi-topics, tests create/update, etc.)
 * expects. This resolves whichever shape comes back into ids, so the rest
 * of the app can always assume test.subject/topics/sub_topics are UUIDs.
 */
export async function resolveTest(test: Test): Promise<ResolvedTest> {
  const subjects = await subjectsApi.getAll();
  const subjectId = matchByIdOrName(test.subject, subjects) ?? test.subject;
  const subjectDisplayName =
    subjects.find((s) => s.id === subjectId)?.name ?? test.subject;

  const topics: Topic[] = subjectId ? await topicsApi.getBySubject(subjectId) : [];
  const topicIds = (test.topics ?? [])
    .map((t) => matchByIdOrName(t, topics))
    .filter((id): id is string => !!id);

  const subTopics: SubTopic[] = topicIds.length
    ? await subTopicsApi.getByTopics(topicIds)
    : [];
  const subTopicIds = (test.sub_topics ?? [])
    .map((st) => matchByIdOrName(st, subTopics))
    .filter((id): id is string => !!id);

  return {
    ...test,
    subject: subjectId,
    topics: topicIds,
    sub_topics: subTopicIds,
    subjectDisplayName,
    topicNameById: Object.fromEntries(topics.map((t) => [t.id, t.name])),
    subTopicNameById: Object.fromEntries(subTopics.map((st) => [st.id, st.name])),
  };
}
