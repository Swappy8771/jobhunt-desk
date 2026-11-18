import { getDb } from "./db";
import { addDays, today } from "./dates";

// Fetches remote jobs open to India from public job APIs and stores new ones in MongoDB.
// Used by the daily Vercel cron and the "Refresh now" button.

type RawJob = { title: string; company: string; location: string; url: string; posted: string; source: string };

const TITLE_OK = /(react|next\.?js|node|full[\s-]?stack|mern|front[\s-]?end|javascript|typescript|web developer|software (engineer|developer))/i;
const TITLE_BAD = /(senior|\bsr\b|lead|react native|staff|principal|architect|manager|director|head of|vp |intern|java\b|\.net|php|python|golang|ruby|ios|android|salesforce|wordpress|devops|data (engineer|scientist)|qa |test)/i;
const LOC_OK = /(worldwide|anywhere|global|india|asia|apac|remote$|^$)/i;

async function getJSON(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "jobhunt-web/1.0 (personal job search)" }, signal: AbortSignal.timeout(20000), cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).hostname}`);
  return res.json();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const SOURCES: Record<string, () => Promise<RawJob[]>> = {
  async himalayas() {
    const out: RawJob[] = [];
    for (const q of ["react", "full stack", "node.js", "next.js"]) {
      const j = await getJSON(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}&country=India&limit=20`);
      for (const x of j.jobs ?? [])
        out.push({ title: x.title, company: x.companyName, location: (x.locationRestrictions ?? []).join(", ") || "Remote", url: x.applicationLink, posted: new Date(x.pubDate * 1000).toISOString().slice(0, 10), source: "Himalayas" });
    }
    return out;
  },
  // Remotive terms: link back to Remotive, name it as the source, max 4 calls a day (we call once)
  async remotive() {
    const out: RawJob[] = [];
    for (const q of ["react", "full stack", "node"]) {
      const j = await getJSON(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}&limit=50`);
      for (const x of j.jobs ?? [])
        if (LOC_OK.test(String(x.candidate_required_location).trim()))
          out.push({ title: x.title, company: x.company_name, location: x.candidate_required_location, url: x.url, posted: String(x.publication_date).slice(0, 10), source: "Remotive" });
    }
    return out;
  },
  async remoteok() {
    const j = await getJSON("https://remoteok.com/api");
    return (j as any[]).slice(1).filter((x) => LOC_OK.test(String(x.location ?? "").trim()))
      .map((x) => ({ title: x.position, company: x.company, location: x.location || "Remote", url: x.url, posted: String(x.date).slice(0, 10), source: "RemoteOK" }));
  },
  // Optional: Pune office jobs. Free key from https://developer.adzuna.com
  async adzuna() {
    const { ADZUNA_APP_ID: id, ADZUNA_APP_KEY: key } = process.env;
    if (!id || !key) return [];
    const out: RawJob[] = [];
    for (const what of ["react developer", "full stack developer", "node js developer"]) {
      const j = await getJSON(`https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${id}&app_key=${key}&what=${encodeURIComponent(what)}&where=pune&max_days_old=3&results_per_page=50&content-type=application/json`);
      for (const x of j.results ?? [])
        out.push({ title: String(x.title).replace(/<[^>]+>/g, ""), company: x.company?.display_name ?? "?", location: x.location?.display_name ?? "Pune", url: x.redirect_url, posted: String(x.created).slice(0, 10), source: "Adzuna" });
    }
    return out;
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export type FetchResult = { added: number; matched: number; errors: string[]; ranAt: string };

export async function fetchAndStoreJobs(): Promise<FetchResult> {
  const results = await Promise.allSettled(Object.entries(SOURCES).map(async ([name, fn]) => {
    try { return await fn(); } catch (e) { throw new Error(`${name}: ${(e as Error).message}`); }
  }));
  const raw: RawJob[] = [];
  const errors: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") raw.push(...r.value);
    else errors.push(r.reason.message);
  }

  const cutoff = addDays(today(), -14);
  const seen = new Set<string>();
  const matched = raw.filter((j) => {
    if (!j.title || !j.url) return false;
    const key = `${j.company}|${j.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return TITLE_OK.test(j.title) && !TITLE_BAD.test(j.title) && j.posted >= cutoff;
  });

  const db = await getDb();
  const jobs = db.collection("jobs");
  await jobs.createIndex({ key: 1 }, { unique: true });
  let added = 0;
  if (matched.length) {
    // Insert only jobs we've never seen; never overwrite your "applied"/"hidden" choices
    const res = await jobs.bulkWrite(matched.map((j) => {
      const key = `${j.company}|${j.title}`.toLowerCase();
      return { updateOne: { filter: { key }, update: { $setOnInsert: { ...j, key, firstSeen: today(), status: "new" } }, upsert: true } };
    }), { ordered: false });
    added = res.upsertedCount;
  }
  // Keep the collection small: forget jobs older than 45 days
  await jobs.deleteMany({ firstSeen: { $lt: addDays(today(), -45) } });

  const result = { added, matched: matched.length, errors, ranAt: new Date().toISOString() };
  await db.collection("meta").updateOne({ _id: "lastFetch" as never }, { $set: result }, { upsert: true });
  return result;
}
