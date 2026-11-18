"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import { SEARCH_LINKS } from "@/lib/constants";
import { prettyDate, today } from "@/lib/dates";
import type { Actions, LastFetch, Tab } from "./App";

type Props = { jobs: Job[] | null; lastFetch: LastFetch; actions: Actions; go: (t: Tab, kind?: "applied" | "referred") => void };

export function JobsTab({ jobs, lastFetch, actions, go }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showApplied, setShowApplied] = useState(false);
  const t = today();
  const list = (jobs ?? []).filter((j) => showApplied || j.status !== "applied");

  async function refresh() {
    setBusy(true); setMsg("");
    try {
      const r = await actions.refreshJobs();
      setMsg(`${r.added} new job${r.added === 1 ? "" : "s"} found.${r.errors.length ? ` Some sites didn't answer: ${r.errors.join("; ")}` : ""}`);
    } catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  }

  async function applied(j: Job) {
    try {
      await actions.addApp({ company: j.company, role: j.title, kind: "applied", via: j.source.toLowerCase().replace(/\s/g, ""), person: "", link: j.url });
      await actions.patchJob(j.id, "applied");
      setMsg(`Logged: ${j.company}. It counts toward today's 10.`);
    } catch (e) { setMsg((e as Error).message); }
  }

  return (
    <section className="grid gap-4">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="h2">Remote jobs open to India</h2>
          <button className="btn btn-sm" onClick={refresh} disabled={busy}>{busy ? "Searching…" : "Refresh now"}</button>
        </div>
        <p className="text-[13px] text-muted">
          Found automatically every morning at 9:00.{" "}
          {lastFetch && <>Last search: {new Date(lastFetch.ranAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.</>}{" "}
          Sources: <a className="underline" href="https://himalayas.app" target="_blank" rel="noopener">Himalayas</a>, <a className="underline" href="https://remotive.com" target="_blank" rel="noopener">Remotive</a>, <a className="underline" href="https://remoteok.com" target="_blank" rel="noopener">Remote OK</a>, Adzuna.
        </p>
        {msg && <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm" role="status">{msg}</p>}
        <label className="flex items-center gap-2 text-[13px] text-muted"><input type="checkbox" checked={showApplied} onChange={(e) => setShowApplied(e.target.checked)} /> Show jobs I already applied to</label>

        {jobs === null ? <p className="text-muted">Loading…</p> : list.length === 0 ? (
          <div className="grid gap-1 rounded-lg border border-dashed border-line p-4 text-muted">
            <b>No jobs yet.</b><span>Tap Refresh now, or use the searches below.</span>
          </div>
        ) : (
          <div className="grid gap-2">
            {list.map((j) => (
              <div key={j.id} className={`grid gap-2 rounded-lg border border-line p-3 ${j.status === "applied" ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold [overflow-wrap:anywhere]">{j.title}</div>
                    <div className="text-[13px] text-muted [overflow-wrap:anywhere]">{j.company} · {j.location} · {j.source} · posted {prettyDate(j.posted)}</div>
                  </div>
                  {j.firstSeen === t && j.status === "new" && <span className="pill pill-good">New today</span>}
                  {j.status === "applied" && <span className="pill">Applied</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a className="btn btn-sm btn-primary" href={j.url} target="_blank" rel="noopener">Open and apply ↗</a>
                  {j.status !== "applied" && <button className="btn btn-sm" onClick={() => applied(j)}>I applied</button>}
                  <button className="btn btn-sm text-muted" onClick={() => actions.patchJob(j.id, "hidden")}>Not for me</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-accent-soft px-3 py-2.5 text-sm">
        Pune and India jobs: each button opens a search filtered for the <b>last 24 hours</b>. After you apply, tap{" "}
        <button className="font-semibold underline" onClick={() => go("tracker", "applied")}>Log an application</button>.
      </div>
      {SEARCH_LINKS.map((g) => (
        <div key={g.group} className="grid gap-2">
          <h3 className="h3">{g.group}</h3>
          {g.note && <p className="text-[13px] text-muted">{g.note}</p>}
          <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
            {g.links.map(([label, url]) => (
              <a key={url} href={url} target="_blank" rel="noopener" className="grid gap-0.5 rounded-xl border border-line bg-surface px-3.5 py-3 hover:border-accent">
                <b className="font-semibold">{label}</b><span className="text-[13px] text-muted">{new URL(url).hostname.replace("www.", "")} ↗</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
