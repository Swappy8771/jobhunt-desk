import { handle, json } from "@/lib/api";
import { fetchAndStoreJobs } from "@/lib/jobs";

export const maxDuration = 60;

// "Refresh now" button (logged-in only, via middleware)
export const POST = handle(async () => json(await fetchAndStoreJobs()));
