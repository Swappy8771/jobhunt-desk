"use client";

import { useState } from "react";
import type { Application } from "@/lib/types";
import { SOURCES, STAGE, STATUSES, TARGET, sourceLabel } from "@/lib/constants";
import { counts, gotCall, needsFollowUp } from "@/lib/progress";
import { prettyDate, today } from "@/lib/dates";
import type { Actions } from "./App";

type Props = { apps: Application[] | null; actions: Actions; initialKind: "applied" | "referred" };
type Filter = "all" | "active" | "waiting" | "followup" | "closed";

const FILTERS: [Filter, string][] = [["all", "All"], ["active", "Interviews"], ["waiting", "Waiting"], ["followup", "Follow up"], ["closed", "Closed"]];

export function TrackerTab({ apps, actions, initialKind }: Props) {
  const [kind, setKind] = useState(initialKind);
  const [form, setForm] = useState({ company: "", role: "", via: "naukri", person: "", link: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const list = apps ?? [];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim()) return;
    setBusy(true); setMsg("");
    try {
      await actions.addApp({ ...form, kind });
      const t = today();
      const c = counts([...list, { kind, date: t } as Application], t, t);
      setMsg(`Saved ${form.company}. Today: ${c.apps}/${TARGET.apps} applications, ${c.refs}/${TARGET.refs} referrals.`);
      setForm({ company: "", role: "", via: form.via, person: "", link: "" });
      document.getElementById("f-company")?.focus();
    } catch (err) { setMsg((err as Error).message); }
    finally { setBusy(false); }
  }

  const shown = list.filter((a) =>
    filter === "all" ||
    (filter === "active" && STAGE.includes(a.status)) ||
    (filter === "waiting" && ["applied", "referred"].includes(a.status)) ||
    (filter === "followup" && needsFollowUp(a)) ||
    (filter === "closed" && ["offer", "rejected", "ghosted"].includes(a.status)));

  const calls = list.filter(gotCall).length;
  const sources = [...new Set(list.map((a) => a.via))];
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <section className="grid gap-4">
      <form className="card" onSubmit={save} autoComplete="off">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="h2">Log it</h2>
          <div className="inline-flex overflow-hidden rounded-lg border border-line">
            {(["applied", "referred"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
                className={`cursor-pointer px-3.5 py-2 text-sm font-semibold ${kind === k ? "bg-accent-soft text-fg" : "bg-surface text-muted"}`}>
                {k === "applied" ? "I applied" : "I asked for a referral"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="label" htmlFor="f-company">Company<input id="f-company" className="field" required placeholder="e.g. Persistent Systems" value={form.company} onChange={set("company")} /></label>
          <label className="label" htmlFor="f-role">Role<input id="f-role" className="field" placeholder="Full Stack Developer" value={form.role} onChange={set("role")} /></label>
          {kind === "applied" ? (
            <label className="label" htmlFor="f-via">Where<select id="f-via" className="field" value={form.via} onChange={set("via")}>{SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          ) : (
            <label className="label" htmlFor="f-person">Person you asked<input id="f-person" className="field" placeholder="e.g. Rahul K (Senior Engineer)" value={form.person} onChange={set("person")} /></label>
          )}
          <label className="label" htmlFor="f-link">Job link (optional)<input id="f-link" className="field" type="url" placeholder="https://" value={form.link} onChange={set("link")} /></label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          {msg && <span className="text-[13px] text-muted" role="status">{msg}</span>}
        </div>
      </form>

      {list.length > 0 && (
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="h2">What&apos;s working</h2>
            <span className="pill pill-accent">{list.length} total · {calls} got a call ({Math.round((calls / list.length) * 100)}%)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((v) => {
              const all = list.filter((a) => a.via === v), c = all.filter(gotCall).length;
              return <span key={v} className={`pill ${c ? "pill-good" : ""}`}>{sourceLabel(v)}: {c} calls from {all.length}</span>;
            })}
          </div>
          <p className="text-[13px] text-muted">If a source gives 0 calls after 30 applications, spend that time on the source that works.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(([k, l]) => <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}
      </div>

      {apps === null ? <p className="text-muted">Loading your applications…</p> : shown.length === 0 ? (
        <div className="grid gap-1 rounded-xl border border-dashed border-line p-5 text-muted">
          <b>{list.length ? "Nothing in this filter." : "No applications logged yet."}</b>
          <span>{list.length ? "Try another filter." : "Apply to a job from Find jobs, then fill in the form above. Your first one will show here."}</span>
        </div>
      ) : (
        <div className="grid gap-2">
          {shown.map((a) => {
            const stage = STAGE.includes(a.status), closed = ["rejected", "ghosted"].includes(a.status), fu = needsFollowUp(a);
            return (
              <div key={a.id} className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl border border-line bg-surface px-3.5 py-3 ${stage ? "border-l-4 border-l-warn" : ""} ${a.status === "offer" ? "border-l-4 border-l-good" : ""} ${closed ? "opacity-60" : ""}`}>
                <div className="min-w-0">
                  <div className="font-semibold [overflow-wrap:anywhere]">{a.company}</div>
                  <div className="text-[13px] text-muted [overflow-wrap:anywhere]">{a.role} · {sourceLabel(a.via)}{a.person ? ` · ${a.person}` : ""} · {prettyDate(a.date)}</div>
                </div>
                <div>{fu ? <span className="pill pill-warn">Follow up</span> : a.followedUpOn ? <span className="pill">Followed up</span> : null}</div>
                <div className="col-span-2 flex flex-wrap items-center gap-2">
                  <select aria-label={`Status for ${a.company}`} className="field w-auto px-2 py-1 text-[13px]" value={a.status} onChange={(e) => actions.patchApp(a.id, { status: e.target.value })}>
                    {STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  {a.link && <a className="btn btn-sm" href={a.link} target="_blank" rel="noopener">Job ↗</a>}
                  {fu && <button className="btn btn-sm" onClick={() => actions.patchApp(a.id, { followedUp: true })}>Followed up</button>}
                  <button className="btn btn-sm text-bad" onClick={() => { if (confirmDelete === a.id) { setConfirmDelete(null); actions.deleteApp(a.id); } else setConfirmDelete(a.id); }}>
                    {confirmDelete === a.id ? "Tap again to delete" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
