"use client";

import { useState } from "react";
import type { Question, QuizProgress } from "@/lib/types";
import { QUIZ_INTERVALS, TOPIC_NAMES } from "@/lib/constants";
import { QUESTIONS, dayTopic, quizDeck } from "@/lib/progress";
import { addDays, today } from "@/lib/dates";
import type { Actions } from "./App";

type Props = { quiz: QuizProgress; actions: Actions };
const TOPICS = ["js", "react", "next-ts", "node", "db", "coding", "resume", "all"];

export function QuizTab({ quiz, actions }: Props) {
  const startTopic = dayTopic() === "revise" ? "all" : dayTopic();
  const [topic, setTopic] = useState(startTopic);
  // The deck is fixed when a session starts, so rating a card doesn't reshuffle the list under you
  const [deck, setDeck] = useState<Question[]>(() => quizDeck(quiz, startTopic));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ done: 0, right: 0 });

  function start(tp: string) {
    setTopic(tp); setDeck(quizDeck(quiz, tp)); setI(0); setRevealed(false); setScore({ done: 0, right: 0 });
  }

  function rate(q: Question, r: "y" | "p" | "n") {
    const t = today();
    const prev = quiz.cards[q.id] ?? { box: 0, introduced: t, due: t };
    const box = r === "y" ? Math.min(prev.box + 1, QUIZ_INTERVALS.length - 1) : r === "p" ? Math.max(prev.box, 1) : 0;
    actions.rateQuiz(q.id, { box, introduced: prev.introduced, due: addDays(t, r === "n" ? 1 : QUIZ_INTERVALS[box]) }, r === "y");
    setScore((s) => ({ done: s.done + 1, right: s.right + (r === "y" ? 1 : 0) }));
    setI(i + 1); setRevealed(false);
  }

  const seen = Object.keys(quiz.cards).length;
  const strong = Object.values(quiz.cards).filter((c) => c.box >= 3).length;
  const q = deck[i];

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="label min-w-[220px]" htmlFor="q-topic">Topic
          <select id="q-topic" className="field" value={topic} onChange={(e) => start(e.target.value)}>
            {TOPICS.map((k) => <option key={k} value={k}>{TOPIC_NAMES[k]}{k === dayTopic() ? " (today)" : ""}</option>)}
          </select>
        </label>
        <p className="text-[13px] text-muted">{seen} of {QUESTIONS.length} questions practised · {strong} strong</p>
      </div>

      {q ? (
        <div className="grid gap-4 rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">{TOPIC_NAMES[q.topic]}</span>
            <span className="text-[13px] text-muted">{i + 1} of {deck.length}{quiz.cards[q.id] ? "" : " · new"}</span>
          </div>
          <p className="font-head text-[19px] font-semibold leading-snug [text-wrap:balance]">{q.q}</p>
          {revealed ? (
            <>
              <div className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3.5 text-[14.5px] leading-relaxed">{q.a}</div>
              {q.followup && <p className="text-sm text-warn">They may then ask: {q.followup}</p>}
              <div className="grid grid-cols-3 gap-2">
                <button className="btn min-h-12 text-bad" onClick={() => rate(q, "n")}>Didn&apos;t know</button>
                <button className="btn min-h-12 text-warn" onClick={() => rate(q, "p")}>Partly</button>
                <button className="btn min-h-12 text-good" onClick={() => rate(q, "y")}>Knew it</button>
              </div>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setRevealed(true)}>Show answer</button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 rounded-xl border border-line bg-surface p-5">
          {score.done > 0 && <div className="font-mono text-4xl font-semibold">{score.right}/{score.done}</div>}
          <p className="font-head text-lg font-semibold">{score.done ? "Done for now." : "Nothing due in this topic today."}</p>
          <p className="text-muted">{score.done ? "Cards you missed come back tomorrow." : "Pick another topic, or All topics."}</p>
          <div><button className="btn" onClick={() => start("all")}>Practise all topics</button></div>
        </div>
      )}
      <p className="text-[13px] text-muted">Answer <b>out loud</b> as if you&apos;re in the interview, then show the answer and be honest. &quot;Didn&apos;t know&quot; comes back tomorrow; &quot;Knew it&quot; comes back after 2, 4, 7, 15, then 30 days.</p>
    </section>
  );
}
