export type AppKind = "applied" | "referred";
export type AppStatus = "applied" | "referred" | "call" | "round1" | "round2" | "hr" | "offer" | "rejected" | "ghosted";

export type Application = {
  id: string;
  company: string;
  role: string;
  kind: AppKind;
  via: string;
  person: string;
  link: string;
  status: AppStatus;
  date: string; // YYYY-MM-DD (India)
  followedUpOn: string | null;
  notes: string;
  history: { date: string; status: AppStatus }[];
  createdAt: number;
};

export type JobStatus = "new" | "applied" | "hidden";

export type Job = {
  id: string;
  key: string;
  title: string;
  company: string;
  location: string;
  url: string;
  posted: string;
  source: string;
  firstSeen: string;
  status: JobStatus;
};

export type QuizCard = { box: number; due: string; introduced: string };
export type QuizProgress = { cards: Record<string, QuizCard>; log: Record<string, { done: number; right: number }> };

export type Question = { id: string; topic: string; q: string; a: string; followup: string | null };
