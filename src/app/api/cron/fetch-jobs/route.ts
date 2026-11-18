import { fail, handle, json } from "@/lib/api";
import { safeEqual } from "@/lib/auth";
import { fetchAndStoreJobs } from "@/lib/jobs";

export const maxDuration = 60;

// Called by Vercel Cron every day (see vercel.json). Vercel sends "Authorization: Bearer <CRON_SECRET>".
export const GET = handle(async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return fail("Unauthorized", 401);
  return json(await fetchAndStoreJobs());
});
