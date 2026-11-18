import type { Application, Question, QuizProgress } from "./types";
import { DAY_TOPICS, FOLLOW_UP_DAYS, NEW_CARDS_PER_DAY, STAGE } from "./constants";
import { daysBetween, today } from "./dates";
import questionsJson from "@/data/questions.json";

export const QUESTIONS = questionsJson as Question[];

export const dayTopic = () => DAY_TOPICS[new Date(today() + "T00:00:00Z").getUTCDay()];

export function counts(apps: Application[], from: string, to: string) {
  const r = apps.filter((a) => a.date >= from && a.date <= to);
  return { apps: r.filter((a) => a.kind !== "referred").length, refs: r.filter((a) => a.kind === "referred").length };
}

export const needsFollowUp = (a: Application) =>
  (a.status === "applied" || a.status === "referred") && !a.followedUpOn && daysBetween(a.date, today()) >= FOLLOW_UP_DAYS;

export const gotCall = (a: Application) =>
  [...STAGE, "offer"].includes(a.status) || a.history.some((h) => [...STAGE, "offer"].includes(h.status));

// Cards to practise now: due reviews first (today's topic first), then up to 8 new cards a day
export function quizDeck(quiz: QuizProgress, topic: string) {
  const t = today();
  const inTopic = (q: Question) => topic === "all" || topic === "revise" || q.topic === topic;
  const due = QUESTIONS.filter((q) => quiz.cards[q.id] && quiz.cards[q.id].due <= t)
    .sort((a, b) => Number(inTopic(b)) - Number(inTopic(a)) || quiz.cards[a.id].box - quiz.cards[b.id].box);
  const introducedToday = Object.values(quiz.cards).filter((c) => c.introduced === t).length;
  const fresh = QUESTIONS.filter((q) => !quiz.cards[q.id] && inTopic(q)).slice(0, Math.max(0, NEW_CARDS_PER_DAY - introducedToday));
  return [...due, ...fresh].slice(0, 15);
}
