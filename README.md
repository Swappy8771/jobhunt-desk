# Job Hunt Desk

A personal job-search web app: finds new remote jobs every morning, tracks applications and referral requests, drills interview questions with spaced repetition, and checks job descriptions against my skills.

**Stack:** Next.js 15 (App Router, Route Handlers, Middleware) · React 19 · TypeScript · Tailwind CSS 4 · MongoDB (Atlas) · Vercel Cron

## Features
- **Daily job feed:** a Vercel Cron job calls `/api/cron/fetch-jobs` at 9:00 IST, pulls remote jobs open to India from Himalayas, Remotive, Remote OK (and Adzuna for Pune if a key is set), filters by title and experience, de-duplicates with a unique index, and stores only new ones
- **Tracker:** applications and referral requests, status history, 7-day follow-up reminders, "which source gets calls" stats
- **Quiz:** 57 JS/React/Node/DB/HR questions with Leitner-box spaced repetition
- **Check job:** skill match % for a pasted job description + ready-to-copy referral message
- **Single-user auth:** password login → HMAC-signed httpOnly cookie, verified in Next.js middleware (Web Crypto, edge-compatible)

## Run locally
```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev                  # http://localhost:3000
```

## Deploy (free)

### 1. MongoDB Atlas
1. https://www.mongodb.com/cloud/atlas/register → create a **free M0** cluster (region: Mumbai)
2. **Database Access** → add a user with a password
3. **Network Access** → add `0.0.0.0/0` (Vercel's servers have changing IPs)
4. **Connect → Drivers** → copy the connection string, put your password in it

### 2. GitHub
1. On github.com → **New repository** → name `jobhunt-desk` → **Private** → don't add a README → Create
2. Then in the terminal:
```bash
cd ~/Desktop/swapnil/Job_Search/jobhunt-web
git add . && git commit -m "Job Hunt Desk: jobs feed, tracker, quiz, JD check"
git remote add origin https://github.com/Swappy8771/jobhunt-desk.git
git push -u origin main
```
`.env.local` is git-ignored, so your secrets are never pushed.

### 3. Vercel
1. https://vercel.com → **Sign up with GitHub** → **Add New → Project** → import `jobhunt-desk`
2. Before clicking Deploy, open **Environment Variables** and add every line from `.env.example`:
   `MONGODB_URI`, `MONGODB_DB`, `APP_PASSWORD`, `AUTH_SECRET`, `CRON_SECRET` (and Adzuna keys if you have them)
3. **Deploy**. You get a link like `https://jobhunt-desk.vercel.app`
4. Open it, log in, go to **Find jobs → Refresh now** once. After that the cron runs every morning by itself (Vercel → Project → Settings → Cron Jobs shows it)

Every `git push` redeploys automatically.

## API
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/login`, `/api/logout` | Session cookie |
| GET/POST | `/api/apps` | List / add applications |
| PATCH/DELETE | `/api/apps/:id` | Change status, mark followed up, delete |
| GET | `/api/jobs` | Jobs found in the last 14 days |
| PATCH | `/api/jobs/:id` | Mark applied / hide |
| POST | `/api/jobs/refresh` | Fetch jobs now |
| GET | `/api/cron/fetch-jobs` | Daily cron (needs `Authorization: Bearer CRON_SECRET`) |
| GET/PUT | `/api/quiz` | Quiz progress |
