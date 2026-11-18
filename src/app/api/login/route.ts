import { cookies } from "next/headers";
import { createSessionToken, safeEqual, SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth";
import { fail, handle, json, str } from "@/lib/api";

export const POST = handle(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const password = str(body.password, 200);
  const expected = process.env.APP_PASSWORD;
  if (!expected) return fail("APP_PASSWORD is not set on the server", 500);

  if (!password || !safeEqual(password, expected)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return fail("Wrong password", 401);
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return json({ ok: true });
});
