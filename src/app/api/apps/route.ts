import { getDb } from "@/lib/db";
import { fail, handle, json, str, toPlain } from "@/lib/api";
import { today } from "@/lib/dates";
import type { Application } from "@/lib/types";

const VIA = ["naukri", "linkedin", "instahyre", "wellfound", "cutshort", "company", "other", "himalayas", "remotive", "remoteok", "adzuna"];

export const GET = handle(async () => {
  const db = await getDb();
  const docs = await db.collection("apps").find().sort({ createdAt: -1 }).limit(1000).toArray();
  return json(docs.map((d) => toPlain<Application>(d)));
});

export const POST = handle(async (req: Request) => {
  const b = await req.json().catch(() => ({}));
  const company = str(b.company, 120);
  if (!company) return fail("Company name is required");
  const kind = b.kind === "referred" ? "referred" : "applied";
  const via = kind === "referred" ? "referral" : VIA.includes(b.via) ? b.via : "other";
  const t = today();

  const app = {
    company,
    role: str(b.role, 120) || "Full Stack Developer",
    kind,
    via,
    person: kind === "referred" ? str(b.person, 120) : "",
    link: /^https?:\/\//.test(str(b.link, 1000)) ? str(b.link, 1000) : "",
    status: kind,
    date: t,
    followedUpOn: null,
    notes: "",
    history: [{ date: t, status: kind }],
    createdAt: Date.now(),
  };
  const db = await getDb();
  const res = await db.collection("apps").insertOne(app);
  return json({ id: String(res.insertedId), ...app }, 201);
});
