// All "days" are India dates (YYYY-MM-DD), whatever timezone the server runs in.
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const addDays = (ymd: string, n: number) => {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime()) / 86400000);

// Monday of the week containing ymd
export const weekStart = (ymd: string) => addDays(ymd, -((new Date(ymd + "T00:00:00Z").getUTCDay() + 6) % 7));

export const prettyDate = (ymd: string) =>
  new Date(ymd + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
