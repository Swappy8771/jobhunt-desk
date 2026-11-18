import { getDb } from "@/lib/db";
import { fail, handle, json, parseId } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

// Body: { status: "applied" | "hidden" | "new" }
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const _id = parseId((await params).id);
  if (!_id) return fail("Bad id", 404);
  const { status } = await req.json().catch(() => ({}));
  if (!["applied", "hidden", "new"].includes(status)) return fail("Unknown status");
  const db = await getDb();
  const res = await db.collection("jobs").updateOne({ _id }, { $set: { status } });
  if (!res.matchedCount) return fail("Not found", 404);
  return json({ ok: true });
});
