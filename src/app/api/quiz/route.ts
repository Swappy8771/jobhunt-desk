import { getDb } from "@/lib/db";
import { fail, handle, json } from "@/lib/api";

const ID = "quizProgress" as never;

export const GET = handle(async () => {
  const db = await getDb();
  const doc = await db.collection("meta").findOne({ _id: ID });
  return json({ cards: doc?.cards ?? {}, log: doc?.log ?? {} });
});

// Body: { id, card: {box, due, introduced}, date, right: boolean } — one rating at a time
export const PUT = handle(async (req: Request) => {
  const b = await req.json().catch(() => ({}));
  const id = typeof b.id === "string" && /^[a-z0-9-]{1,60}$/.test(b.id) ? b.id : null;
  const card = b.card;
  const date = typeof b.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : null;
  if (!id || !date || !card || typeof card.box !== "number" || typeof card.due !== "string") return fail("Bad quiz update");

  const db = await getDb();
  await db.collection("meta").updateOne(
    { _id: ID },
    {
      $set: { [`cards.${id}`]: { box: card.box, due: card.due, introduced: String(card.introduced ?? date) } },
      $inc: { [`log.${date}.done`]: 1, [`log.${date}.right`]: b.right ? 1 : 0 },
    },
    { upsert: true },
  );
  return json({ ok: true });
});
