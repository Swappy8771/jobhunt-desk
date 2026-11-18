import { getDb } from "@/lib/db";
import { handle, json, toPlain } from "@/lib/api";
import { addDays, today } from "@/lib/dates";
import type { Job } from "@/lib/types";

// Jobs found in the last 14 days that you haven't hidden, newest first, plus when the last fetch ran
export const GET = handle(async () => {
  const db = await getDb();
  const [docs, last] = await Promise.all([
    db.collection("jobs").find({ status: { $ne: "hidden" }, firstSeen: { $gte: addDays(today(), -14) } }).sort({ firstSeen: -1, posted: -1 }).limit(300).toArray(),
    db.collection("meta").findOne({ _id: "lastFetch" as never }),
  ]);
  return json({ jobs: docs.map((d) => toPlain<Job>(d)), lastFetch: last ? { added: last.added, matched: last.matched, errors: last.errors, ranAt: last.ranAt } : null });
});
