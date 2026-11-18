import type { AppStatus } from "./types";

export const TARGET = { apps: 10, refs: 5, appsWeek: 50, refsWeek: 25 };
export const FOLLOW_UP_DAYS = 7;
export const QUIZ_INTERVALS = [0, 1, 2, 4, 7, 15, 30];
export const NEW_CARDS_PER_DAY = 8;

export const DAY_TOPICS = ["revise", "js", "react", "next-ts", "node", "db", "coding"]; // Sun..Sat
export const TOPIC_NAMES: Record<string, string> = {
  js: "JavaScript", react: "React", "next-ts": "Next.js + TypeScript", node: "Node.js + Express",
  db: "Databases", coding: "Machine coding + DSA", resume: "Resume / HR round", revise: "Revision", all: "All topics",
};

export const STATUSES: [AppStatus, string][] = [
  ["applied", "Applied"], ["referred", "Referral asked"], ["call", "HR call"], ["round1", "Round 1"], ["round2", "Round 2"],
  ["hr", "HR round"], ["offer", "Offer 🎉"], ["rejected", "Rejected"], ["ghosted", "No reply"],
];
export const STAGE: AppStatus[] = ["call", "round1", "round2", "hr"];
export const statusLabel = (s: string) => STATUSES.find(([k]) => k === s)?.[1] ?? s;

export const SOURCES: [string, string][] = [
  ["naukri", "Naukri"], ["linkedin", "LinkedIn"], ["instahyre", "Instahyre"], ["wellfound", "Wellfound"],
  ["cutshort", "Cutshort"], ["company", "Company website"], ["himalayas", "Himalayas"], ["remotive", "Remotive"],
  ["remoteok", "Remote OK"], ["adzuna", "Adzuna"], ["other", "Other"],
];
export const sourceLabel = (v: string) => (v === "referral" ? "Referral" : SOURCES.find(([k]) => k === v)?.[1] ?? v);

export const SEARCH_LINKS: { group: string; note?: string; links: [string, string][] }[] = [
  { group: "Naukri · Pune · 2 to 5 years · last 24h", links: [
    ["Full Stack Developer", "https://www.naukri.com/full-stack-developer-jobs-in-pune?experience=3&jobAge=1"],
    ["React.js Developer", "https://www.naukri.com/react-js-developer-jobs-in-pune?experience=3&jobAge=1"],
    ["Node.js Developer", "https://www.naukri.com/node-js-developer-jobs-in-pune?experience=3&jobAge=1"],
    ["MERN Stack Developer", "https://www.naukri.com/mern-stack-developer-jobs-in-pune?experience=3&jobAge=1"],
    ["Next.js Developer", "https://www.naukri.com/next-js-developer-jobs-in-pune?experience=3&jobAge=1"],
    ["Remote React (India)", "https://www.naukri.com/react-js-developer-jobs?experience=3&jobAge=1&wfhType=2"],
  ] },
  { group: "LinkedIn jobs · last 24h", links: [
    ["Full Stack Developer · Pune", "https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Developer&location=Pune&f_TPR=r86400"],
    ["React Developer · Pune", "https://www.linkedin.com/jobs/search/?keywords=React%20Developer&location=Pune&f_TPR=r86400"],
    ["Node.js Developer · Pune", "https://www.linkedin.com/jobs/search/?keywords=Node.js%20Developer&location=Pune&f_TPR=r86400"],
    ["React Developer · Remote India", "https://www.linkedin.com/jobs/search/?keywords=React%20Developer&location=India&f_WT=2&f_TPR=r86400"],
  ] },
  { group: "LinkedIn posts: people saying \"we're hiring\"", note: "Message the person who posted. This often works better than Easy Apply.", links: [
    ["hiring react developer pune", "https://www.linkedin.com/search/results/content/?keywords=hiring%20react%20developer%20pune&datePosted=%22past-24h%22"],
    ["hiring full stack immediate joiner", "https://www.linkedin.com/search/results/content/?keywords=hiring%20full%20stack%20developer%20immediate%20joiner&datePosted=%22past-24h%22"],
    ["hiring node.js developer", "https://www.linkedin.com/search/results/content/?keywords=hiring%20node.js%20developer&datePosted=%22past-24h%22"],
    ["hiring MERN developer", "https://www.linkedin.com/search/results/content/?keywords=hiring%20mern%20stack%20developer&datePosted=%22past-24h%22"],
  ] },
  { group: "Other job sites", links: [
    ["Instahyre", "https://www.instahyre.com/full-stack-developer-jobs-in-pune/"],
    ["Wellfound (startups)", "https://wellfound.com/role/l/full-stack-engineer/india"],
    ["Cutshort", "https://cutshort.io/jobs/reactjs-jobs-in-pune"],
    ["Hirist", "https://www.hirist.tech/k/react-js-jobs"],
  ] },
];

export const MY_SKILLS = ["react", "next.js", "nextjs", "redux", "angular", "typescript", "javascript", "html", "css", "tailwind", "node", "node.js", "nodejs", "express", "mongodb", "mysql", "postgresql", "postgres", "sql", "rest", "api", "jwt", "oauth", "git", "docker", "laravel", "chart.js", "multi-tenant", "saas", "responsive", "mern"];
export const COMMON_ASKS = ["aws", "graphql", "jest", "testing", "react testing library", "cypress", "ci/cd", "microservices", "redis", "kubernetes", "socket.io", "websocket", "nestjs", "prisma", "firebase", "azure", "gcp", "react native", "vue", "python", "java", "agile", "scrum", "system design", "webpack", "vite", "storybook", "sass", "material ui", "kafka", "rabbitmq", "serverless", "elasticsearch"];

export const PREP_CHECKLIST = [
  "Read the job description again; check the gaps in the Check job tab",
  "Look up the company: what they sell, their users, their tech stack",
  "Say 'Tell me about yourself' out loud in under 2 minutes, twice",
  "One project story (GoChart or HRMS): problem → what YOU did → numbers",
  "Do 20 mixed quiz cards",
  "One machine-coding problem in 45 minutes",
  "Ask Claude for a 30-minute mock interview for this role",
  "Prepare 2 questions to ask them",
  "Laptop charged, mic and camera tested, quiet room",
  "Afterwards: write the questions you were asked in the notes",
];

export const referralMessage = (company: string, role: string, skills: string[]) =>
  `Hi [Name], I came across your profile while looking at ${company || "[Company]"}. I'm a Full Stack Developer with 3+ years in ${skills.length ? skills.slice(0, 4).join(", ") : "React, Next.js and Node.js"}, and I'm an immediate joiner.

I saw the ${role || "Full Stack Developer"} opening: [job link]. Would you be open to referring me? I've attached my resume, and I'm happy to share more about my work, including a live platform I built (gochart.in, 100+ users).

Thank you for your time!`;

export const recruiterNote = (role: string, skills: string[]) =>
  `Hi, I'm applying for the ${role || "Full Stack Developer"} role. I have 3+ years building production apps with ${skills.length ? skills.slice(0, 5).join(", ") : "React, Next.js, Node.js and TypeScript"}, including a live SaaS platform with 100+ users and multi-tenant HRMS modules. I can join immediately.`;
