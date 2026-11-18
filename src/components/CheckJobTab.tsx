"use client";

import { useState } from "react";
import { COMMON_ASKS, MY_SKILLS, recruiterNote, referralMessage } from "@/lib/constants";

type Result = { score: number; hit: string[]; gap: string[]; exp: string | null; company: string; role: string };

function analyse(raw: string, company: string, role: string): Result {
  const jd = raw.toLowerCase();
  const has = (k: string) => new RegExp(`(^|[^a-z])${k.replace(/[.+/]/g, "\\$&")}([^a-z]|$)`).test(jd);
  const hit = [...new Set(MY_SKILLS.filter(has).map((s) => s.replace("nodejs", "node.js").replace("nextjs", "next.js")))];
  const gap = COMMON_ASKS.filter(has);
  const exp = jd.match(/(\d+)\s*(?:\+|-|to)?\s*(\d+)?\s*(?:years|yrs)/);
  return { score: Math.round((hit.length / Math.max(1, hit.length + gap.length)) * 100), hit, gap, exp: exp ? exp[0] : null, company, role };
}

function CopyBox({ title, text }: { title: string; text: string }) {
  const [label, setLabel] = useState("Copy");
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="h3">{title}</h3>
        <button className="btn btn-sm" onClick={() => navigator.clipboard.writeText(text).then(() => setLabel("Copied"), () => setLabel("Select and copy"))}>{label}</button>
      </div>
      <div className="whitespace-pre-wrap rounded-lg bg-surface-2 p-3.5 text-[14.5px]">{text}</div>
    </div>
  );
}

export function CheckJobTab() {
  const [text, setText] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [warn, setWarn] = useState("");

  function check() {
    if (text.trim().length < 40) { setWarn("Paste the whole job description first (at least a few lines)."); setRes(null); return; }
    setWarn(""); setRes(analyse(text, company.trim(), role.trim()));
  }

  const verdict = res && (res.score >= 60 ? ["pill-good", "Good match: apply today."] : res.score >= 40 ? ["pill-warn", "Partial match: apply if the experience fits."] : ["pill-bad", "Weak match: skip unless you really want it."]);

  return (
    <section className="grid gap-4">
      <div className="card">
        <h2 className="h2">Does this job suit me?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="label" htmlFor="jd-company">Company (optional)<input id="jd-company" className="field" value={company} onChange={(e) => setCompany(e.target.value)} /></label>
          <label className="label" htmlFor="jd-role">Role (optional)<input id="jd-role" className="field" value={role} onChange={(e) => setRole(e.target.value)} /></label>
        </div>
        <label className="label" htmlFor="jd-text">Paste the job description
          <textarea id="jd-text" className="field min-h-40 resize-y" placeholder="Copy the full job description from Naukri or LinkedIn and paste it here" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div><button className="btn btn-primary" onClick={check}>Check match</button></div>
        {warn && <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">{warn}</p>}
      </div>

      {res && verdict && (
        <>
          <div className="card">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-4xl font-semibold">{res.score}%</span>
              <span className={`pill ${verdict[0]}`}>{verdict[1]}</span>
            </div>
            {res.exp && <p className="text-[13px] text-muted">Experience they ask for: {res.exp}</p>}
            <div className="grid gap-1.5"><h3 className="h3">You have</h3>
              <div className="flex flex-wrap gap-1.5">{(res.hit.length ? res.hit : ["none found"]).map((s) => <span key={s} className="pill pill-good">{s}</span>)}</div></div>
            <div className="grid gap-1.5"><h3 className="h3">They also want</h3>
              <div className="flex flex-wrap gap-1.5">{(res.gap.length ? res.gap : ["nothing extra"]).map((s) => <span key={s} className="pill pill-warn">{s}</span>)}</div></div>
            <p className="text-[13px] text-muted">For each gap: if you&apos;ve used it even a little, say so honestly; if not, learn the basics before the interview.</p>
          </div>
          <div className="card">
            <CopyBox title="Referral message (LinkedIn)" text={referralMessage(res.company, res.role, res.hit)} />
            <CopyBox title="Note to recruiter" text={recruiterNote(res.role, res.hit)} />
            <p className="text-[13px] text-muted">Replace [Name] and [job link] before sending. Want a more personal version? Paste the job description to Claude.</p>
          </div>
        </>
      )}
    </section>
  );
}
