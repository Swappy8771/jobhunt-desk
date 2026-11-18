"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).catch(() => null);
    setBusy(false);
    if (res?.ok) router.replace("/");
    else setError(res ? (await res.json()).message ?? "Login failed" : "No internet connection");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-sm place-content-center px-4">
      <form onSubmit={submit} className="card w-[min(360px,calc(100vw-32px))]">
        <h1 className="font-head text-xl font-bold">Job Hunt Desk</h1>
        <label className="label" htmlFor="password">
          Password
          <input id="password" type="password" autoFocus required className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="text-sm text-bad" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
      </form>
    </main>
  );
}
