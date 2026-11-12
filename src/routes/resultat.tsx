import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { MAX_SCORE, modules } from "@/content/quiz";
import { Blob, Icon, SmileMark, chapterVar } from "@/components/brand";
import { TopBar } from "@/components/top-bar";
import { ScoreRing } from "@/components/quiz/question";
import { setProgress, useProgress } from "@/lib/progress";
import { badgeFor, scoreFor } from "@/lib/scoring";
import { sendCompletion } from "@/lib/db";
import { celebrate } from "@/lib/confetti";
import { getPublicStats, type PublicStats } from "@/lib/stats";

export const Route = createFileRoute("/resultat")({
  component: Result,
});

function Result() {
  const p = useProgress();
  const navigate = useNavigate();
  const all = modules.flatMap((m) => m.questions);
  const answeredCount = all.filter((q) => p.answers[q.id]).length;
  const complete = answeredCount === all.length;
  const total = scoreFor(p.answers);
  const badge = badgeFor(total);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    setProgress((s) => ({ ...s, last: "/resultat" }));
  }, []);
  useEffect(() => {
    if (!complete) return;
    sendCompletion(total, MAX_SCORE).then(() => getPublicStats()).then(setStats);
    if (total >= 11) setTimeout(celebrate, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  if (!complete) {
    const firstMissing = modules.find((m) => m.questions.some((q) => !p.answers[q.id])) ?? modules[0]!;
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-xl px-4 pt-16 text-center">
          <h1 className="text-2xl font-semibold">Encore un petit effort !</h1>
          <p className="mt-3">Vous avez répondu à {answeredCount} question{answeredCount > 1 ? "s" : ""} sur {all.length}.</p>
          <Link to="/module/$moduleId/$step" params={{ moduleId: firstMissing.id, step: "quiz" }} className="btn-mh mt-8">
            Continuer le parcours <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TopBar current="avis" />
      <main className="relative mx-auto max-w-xl px-4 pb-16 pt-6">
        <section className="relative flex flex-col items-center text-center">
          <Blob className="-top-6 h-72 w-72 bg-mh-pink-200" />
          <p className="label-caps relative text-mh-red">Votre score</p>
          <div className="relative mt-4">
            <ScoreRing score={total} max={MAX_SCORE} size={200} />
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: -6 }}
            transition={{ delay: 1, type: "spring", stiffness: 140 }}
            className="relative mt-6 flex h-44 w-44 flex-col items-center justify-center rounded-full bg-mh-red p-4 text-mh-white shadow-xl ring-8 ring-mh-white"
          >
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-mh-white/50" aria-hidden="true" />
            <Icon name={badge.icon} className="h-9 w-9" />
            <p className="mt-1 text-sm font-semibold leading-tight">{badge.label}</p>
            <SmileMark className="mt-1 h-4 w-6 text-mh-white" />
          </motion.div>
        </section>

        <section className="card-mh mt-8 space-y-4 p-5">
          <h2 className="font-semibold">Par module</h2>
          {modules.map((m) => {
            const s = scoreFor(p.answers, m.id);
            return (
              <div key={m.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{m.number}. {m.title}</span>
                  <strong>{s}/{m.questions.length}</strong>
                </div>
                <div className="h-3 rounded-full bg-mh-sand">
                  <motion.div className="h-full rounded-full" style={{ background: chapterVar[m.color] }} initial={{ width: 0 }} animate={{ width: `${(s / m.questions.length) * 100}%` }} transition={{ duration: 1, delay: 0.3 }} />
                </div>
              </div>
            );
          })}
        </section>

        {stats && stats.completions >= 5 && (
          <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-mh-white p-4 text-sm ring-1 ring-mh-pink-200">
            <Users className="h-5 w-5 shrink-0 text-mh-red" strokeWidth={1.75} aria-hidden="true" />
            <span>La moyenne de vos collègues : <strong>{stats.averageScore.toLocaleString("fr-FR")}/{MAX_SCORE}</strong> ({stats.completions} participants)</span>
          </p>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">À retenir</h2>
          <ul className="m-0 list-none space-y-3 p-0">
            {modules.map((m) => (
              <li key={m.id} className="flex gap-3 rounded-2xl p-4" style={{ background: chapterVar[m.color] }}>
                <span className="font-semibold">{m.number}<span className="text-mh-red">.</span></span>
                <span className="text-sm">{m.takeaway}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 text-center">
          <button type="button" className="btn-mh w-full sm:w-auto" style={{ background: "var(--mh-magenta)" }} onClick={() => navigate({ to: "/avis" })}>
            Donner mon avis (1 min) <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}
