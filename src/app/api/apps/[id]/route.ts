import { getDb } from "@/lib/db";
import { fail, handle, json, parseId, str } from "@/lib/api";
import { today } from "@/lib/dates";

const STATUSES = ["applied", "referred", "call", "round1", "round2", "hr", "offer", "rejected", "ghosted"];
type Ctx = { params: Promise<{ id: string }> };

// Body: { status } and/or { followedUp: true } and/or { notes }
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const _id = parseId((await params).id);
  if (!_id) return fail("Bad id", 404);
  const b = await req.json().catch(() => ({}));
  const t = today();

  const set: Record<string, unknown> = {};
  const update: Record<string, unknown> = { $set: set };
  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status)) return fail("Unknown status");
    set.status = b.status;
    update.$push = { history: { date: t, status: b.status } };
  }
  if (b.followedUp === true) set.followedUpOn = t;
  if (typeof b.notes === "string") set.notes = str(b.notes, 2000);
  if (!Object.keys(set).length) return fail("Nothing to update");

  const db = await getDb();
  const res = await db.collection("apps").updateOne({ _id }, update);
  if (!res.matchedCount) return fail("Not found", 404);
  return json({ ok: true });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const _id = parseId((await params).id);
  if (!_id) return fail("Bad id", 404);
  const db = await getDb();
  await db.collection("apps").deleteOne({ _id });
  return json({ ok: true });
});
