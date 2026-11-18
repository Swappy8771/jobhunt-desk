"use client";

import { useCallback, useEffect, useState } from "react";
import type { Application, Job, QuizCard, QuizProgress } from "@/lib/types";
import { today } from "@/lib/dates";
import { TodayTab } from "./TodayTab";
import { JobsTab } from "./JobsTab";
import { TrackerTab } from "./TrackerTab";
import { QuizTab } from "./QuizTab";
import { CheckJobTab } from "./CheckJobTab";

export type Tab = "today" | "jobs" | "tracker" | "quiz" | "jd";
export type LastFetch = { added: number; matched: number; errors: string[]; ranAt: string } | null;
export type NewApp = { company: string; role: string; kind: "applied" | "referred"; via: string; person: string; link: string };
export type Actions = {
  addApp(a: NewApp): Promise<Application>;
  patchApp(id: string, patch: { status?: string; followedUp?: boolean; notes?: string }): Promise<void>;
  deleteApp(id: string): Promise<void>;
  patchJob(id: string, status: Job["status"]): Promise<void>;
  refreshJobs(): Promise<NonNullable<LastFetch>>;
  rateQuiz(id: string, card: QuizCard, right: boolean): void;
  logout(): Promise<void>;
};

const TABS: [Tab, string][] = [["today", "Today"], ["jobs", "Find jobs"], ["tracker", "Tracker"], ["quiz", "Quiz"], ["jd", "Check job"]];

async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) { window.location.href = "/login"; throw new Error("Please log in"); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data as T;
}

export function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [apps, setApps] = useState<Application[] | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [lastFetch, setLastFetch] = useState<LastFetch>(null);
  const [quiz, setQuiz] = useState<QuizProgress>({ cards: {}, log: {} });
  const [error, setError] = useState("");
  const [trackerKind, setTrackerKind] = useState<"applied" | "referred">("applied");

  const fail = (e: unknown) => setError((e as Error).message);

  const loadApps = useCallback(() => call<Application[]>("GET", "/api/apps").then(setApps).catch(fail), []);
  const loadJobs = useCallback(() => call<{ jobs: Job[]; lastFetch: LastFetch }>("GET", "/api/jobs").then((d) => { setJobs(d.jobs); setLastFetch(d.lastFetch); }).catch(fail), []);

  useEffect(() => {
    loadApps();
    loadJobs();
    call<QuizProgress>("GET", "/api/quiz").then(setQuiz).catch(fail);
  }, [loadApps, loadJobs]);

  const go = (t: Tab, kind?: "applied" | "referred") => { if (kind) setTrackerKind(kind); setTab(t); window.scrollTo({ top: 0 }); };

  const actions: Actions = {
    async addApp(a: NewApp) {
      const created = await call<Application>("POST", "/api/apps", a);
      setApps((prev) => [created, ...(prev ?? [])]);
      return created;
    },
    async patchApp(id: string, patch: { status?: string; followedUp?: boolean; notes?: string }) {
      setError("");
      try { await call("PATCH", `/api/apps/${id}`, patch); await loadApps(); } catch (e) { fail(e); }
    },
    async deleteApp(id: string) {
      try { await call("DELETE", `/api/apps/${id}`); setApps((prev) => (prev ?? []).filter((a) => a.id !== id)); } catch (e) { fail(e); }
    },
    async patchJob(id: string, status: Job["status"]) {
      setJobs((prev) => (prev ?? []).map((j) => (j.id === id ? { ...j, status } : j)).filter((j) => j.status !== "hidden"));
      try { await call("PATCH", `/api/jobs/${id}`, { status }); } catch (e) { fail(e); loadJobs(); }
    },
    async refreshJobs() {
      const r = await call<NonNullable<LastFetch>>("POST", "/api/jobs/refresh");
      await loadJobs();
      return r;
    },
    rateQuiz(id: string, card: QuizCard, right: boolean) {
      const t = today();
      setQuiz((q) => {
        const log = q.log[t] ?? { done: 0, right: 0 };
        return { cards: { ...q.cards, [id]: card }, log: { ...q.log, [t]: { done: log.done + 1, right: log.right + (right ? 1 : 0) } } };
      });
      call("PUT", "/api/quiz", { id, card, date: t, right }).catch(fail);
    },
    async logout() {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    },
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3 pt-3 pb-1">
            <h1 className="font-head text-xl font-bold tracking-tight">Job Hunt Desk</h1>
            <div className="flex items-baseline gap-3 text-[13px] text-muted">
              <span suppressHydrationWarning>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}</span>
              <button className="underline" onClick={actions.logout}>Log out</button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pt-1.5" role="tablist">
            {TABS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => go(k)}
                className={`shrink-0 cursor-pointer border-b-[3px] px-3 py-2.5 text-sm font-semibold ${tab === k ? "border-accent text-fg" : "border-transparent text-muted"}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-[880px] gap-5 px-4 pt-5 pb-16">
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-lg bg-warn-soft px-3 py-2.5 text-sm text-warn" role="alert">
            <span>{error}</span><button className="font-semibold" onClick={() => setError("")}>Dismiss</button>
          </div>
        )}
        {tab === "today" && <TodayTab apps={apps} jobs={jobs} quiz={quiz} go={go} actions={actions} />}
        {tab === "jobs" && <JobsTab jobs={jobs} lastFetch={lastFetch} actions={actions} go={go} />}
        {tab === "tracker" && <TrackerTab apps={apps} actions={actions} initialKind={trackerKind} />}
        {tab === "quiz" && <QuizTab quiz={quiz} actions={actions} />}
        {tab === "jd" && <CheckJobTab />}
      </main>
    </>
  );
}
