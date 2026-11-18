"use client";

import type { Application, Job, QuizProgress } from "@/lib/types";
import { PREP_CHECKLIST, STAGE, TARGET, TOPIC_NAMES, statusLabel } from "@/lib/constants";
import { counts, dayTopic, needsFollowUp, quizDeck } from "@/lib/progress";
import { daysBetween, today, weekStart } from "@/lib/dates";
import type { Actions, Tab } from "./App";

type Props = { apps: Application[] | null; jobs: Job[] | null; quiz: QuizProgress; go: (t: Tab, kind?: "applied" | "referred") => void; actions: Actions };

function Meter({ label, n, max }: { label: string; n: number; max: number }) {
  return (
    <div className="card gap-1.5">
      <h3 className="h3">{label}</h3>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums">{n} <small className="text-[15px] text-muted">/ {max}</small></div>
      <div className="h-2 overflow-hidden rounded bg-surface-2">
        <span className={`block h-full transition-[width] ${n >= max ? "bg-good" : "bg-accent"}`} style={{ width: `${Math.min(100, (n / max) * 100)}%` }} />
      </div>
    </div>
  );
}

export function TodayTab({ apps, jobs, quiz, go, actions }: Props) {
  const t = today();
  const list = apps ?? [];
  const d = counts(list, t, t), w = counts(list, weekStart(t), t);
  const newJobs = (jobs ?? []).filter((j) => j.status === "new" && j.firstSeen === t).length;
  const due = quizDeck(quiz, dayTopic()).length;
  const active = list.filter((a) => STAGE.includes(a.status));
  const followUps = list.filter(needsFollowUp);

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Meter label="Applications today" n={d.apps} max={TARGET.apps} />
        <Meter label="Referral requests today" n={d.refs} max={TARGET.refs} />
      </div>
      <p className="text-[13px] text-muted">This week: {w.apps} of {TARGET.appsWeek} applications, {w.refs} of {TARGET.refsWeek} referral requests.</p>

      <div className="card">
        <h2 className="h2">Today&apos;s plan</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="btn btn-primary" onClick={() => go("jobs")}>1. Find jobs and apply to 10{newJobs ? ` (${newJobs} new)` : ""}</button>
          <button className="btn" onClick={() => go("tracker", "referred")}>2. Ask 5 people for referrals</button>
          <button className="btn" onClick={() => go("quiz")}>3. Quiz: {TOPIC_NAMES[dayTopic()]} ({due} cards)</button>
          <button className="btn" onClick={() => go("jd")}>Check a job description</button>
        </div>
      </div>

      {active.length > 0 && (
        <div className="card">
          <h2 className="h2">Interviews in progress</h2>
          {active.map((a) => (
            <details key={a.id} className="rounded-lg bg-surface-2 px-3 py-2">
              <summary className="cursor-pointer font-semibold">{a.company}: {statusLabel(a.status)} · open prep checklist</summary>
              <div className="grid gap-2 pt-3">
                {PREP_CHECKLIST.map((p, i) => (
                  <label key={i} className="flex items-start gap-2.5 text-sm" htmlFor={`prep-${a.id}-${i}`}>
                    <input id={`prep-${a.id}-${i}`} type="checkbox" className="mt-0.5 size-[18px] shrink-0" />{p}
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}

      {followUps.length > 0 && (
        <div className="card">
          <h2 className="h2">Follow up today</h2>
          <p className="text-[13px] text-muted">No reply for 7+ days. Send a short polite message, then tap Done.</p>
          {followUps.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2">
              <span><b>{a.company}</b> · {a.role}{a.person ? ` · ${a.person}` : ""} · {daysBetween(a.date, t)} days</span>
              <button className="btn btn-sm" onClick={() => actions.patchApp(a.id, { followedUp: true })}>Done</button>
            </div>
          ))}
        </div>
      )}
      {apps === null && <p className="text-muted">Loading…</p>}
    </section>
  );
}
