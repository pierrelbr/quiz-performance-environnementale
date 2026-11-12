import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { modules, moduleScoreMessage, site } from "@/content/quiz";
import { Blob, BigNumber, chapterBg, chapterVar } from "@/components/brand";
import { TopBar } from "@/components/top-bar";
import { LearnBlockView, VideoBlock } from "@/components/learn/blocks";
import { FeedbackPanel, QuestionView, ScoreRing } from "@/components/quiz/question";
import { getProgress, setProgress, useProgress } from "@/lib/progress";
import { sendModuleAnswers } from "@/lib/db";
import { burst } from "@/lib/confetti";
import { scoreFor } from "@/lib/scoring";
import { cn } from "@/lib/utils";

const steps = ["chapitre", "apprendre", "quiz"] as const;

export const Route = createFileRoute("/module/$moduleId/$step")({
  loader: ({ params }) => {
    const m = modules.find((x) => x.id === params.moduleId);
    if (!m || !steps.includes(params.step as (typeof steps)[number])) throw notFound();
    return { title: m.title };
  },
  component: ModulePage,
});

function ModulePage() {
  const { moduleId, step } = Route.useParams();
  const m = modules.find((x) => x.id === moduleId)!;
  useEffect(() => {
    setProgress((s) => ({ ...s, last: `/module/${moduleId}/${step}` }));
    window.scrollTo(0, 0);
  }, [moduleId, step]);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step + moduleId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        {step === "chapitre" && <Chapter m={m} />}
        {step === "apprendre" && <Learn m={m} />}
        {step === "quiz" && <Quiz m={m} />}
      </motion.div>
    </AnimatePresence>
  );
}

type M = (typeof modules)[number];

function Chapter({ m }: { m: M }) {
  const navigate = useNavigate();
  return (
    <div className={cn("relative min-h-screen overflow-hidden", chapterBg[m.color])}>
      <TopBar current={m.id} white={false} />
      <Blob className="-right-32 top-24 h-[26rem] w-[26rem] bg-mh-white/30" />
      <Blob className="-left-24 bottom-10 h-64 w-64 bg-mh-white/25" delay={-6} />
      <main className="relative mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 90 }}>
          <BigNumber n={m.number} className="text-[9rem] sm:text-[12rem]" />
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-4xl font-semibold sm:text-5xl">
          {m.title}
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 text-lg">
          {m.teaser}
        </motion.p>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <button type="button" className="btn-mh mt-10" onClick={() => navigate({ to: "/module/$moduleId/$step", params: { moduleId: m.id, step: "apprendre" } })}>
            Découvrir <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

function Learn({ m }: { m: M }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen overflow-x-hidden">
      <TopBar current={m.id} />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-20 pt-4">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", chapterBg[m.color])}>{m.number}.</span>
          <h1 className="text-2xl font-semibold">{m.title}</h1>
        </div>
        <VideoBlock url={m.videoUrl} />
        {m.blocks.map((b, i) => (
          <LearnBlockView key={i} block={b} color={m.color} />
        ))}
        <div className="pt-4 text-center">
          <button type="button" className="btn-mh w-full sm:w-auto" onClick={() => navigate({ to: "/module/$moduleId/$step", params: { moduleId: m.id, step: "quiz" } })}>
            Je teste mes connaissances <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}

function shuffle<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

function Quiz({ m }: { m: M }) {
  const p = useProgress();
  const navigate = useNavigate();
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    const s = getProgress();
    // Ordre des options mélangé une fois par participant, puis stable.
    const order = { ...s.order };
    let changed = false;
    for (const q of m.questions) {
      if (q.type === "single" && q.shuffle && !order[q.id]) {
        order[q.id] = shuffle(q.options.map((o) => o.id));
        changed = true;
      }
    }
    if (changed) setProgress((x) => ({ ...x, order }));
    const first = m.questions.findIndex((q) => !s.answers[q.id]);
    setIdx(first === -1 ? m.questions.length : first);
  }, [m]);

  const done = idx !== null && idx >= m.questions.length;
  const score = useMemo(() => scoreFor(p.answers, m.id), [p.answers, m.id]);

  useEffect(() => {
    if (done) void sendModuleAnswers(m.id);
  }, [done, m.id]);

  if (idx === null) return <div className="min-h-screen"><TopBar current={m.id} /></div>;

  const next = modules[modules.findIndex((x) => x.id === m.id) + 1];

  if (done) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <TopBar current={m.id} />
        <Blob className="-right-24 top-20 h-80 w-80 opacity-60" />
        <main className="relative mx-auto flex max-w-xl flex-col items-center px-4 pt-10 text-center">
          <p className="label-caps text-mh-red">{m.number}. {m.title}</p>
          <div className="relative my-8">
            <div className="blob -inset-8 opacity-60" style={{ background: chapterVar[m.color] }} aria-hidden="true" />
            <ScoreRing score={score} max={m.questions.length} />
          </div>
          <h1 className="text-3xl font-semibold">
            {score}/{m.questions.length} – {moduleScoreMessage(score, m.questions.length)}
          </h1>
          <p className="mt-6 rounded-2xl bg-mh-white p-4 text-sm ring-1 ring-mh-pink-200">
            <span className="label-caps mb-1 block text-mh-red">À retenir</span>
            {m.takeaway}
          </p>
          <button
            type="button"
            className="btn-mh mt-8 w-full sm:w-auto"
            onClick={() =>
              next
                ? navigate({ to: "/module/$moduleId/$step", params: { moduleId: next.id, step: "chapitre" } })
                : navigate({ to: "/resultat" })
            }
          >
            {next ? `Module suivant : ${next.title}` : "Voir mon résultat"} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </main>
      </div>
    );
  }

  const q = m.questions[idx]!;
  const answered = p.answers[q.id];

  return (
    <div className="min-h-screen">
      <TopBar current={m.id} />
      <main className="mx-auto max-w-xl px-4 pb-16 pt-4">
        <div className="mb-6 flex items-center justify-between">
          <p className="label-caps">
            Question {idx + 1}/{m.questions.length}
          </p>
          <div className="flex gap-1.5" aria-hidden="true">
            {m.questions.map((qq, i) => (
              <span
                key={qq.id}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === idx ? "w-6" : "w-2.5",
                  p.answers[qq.id] ? (p.answers[qq.id]!.correct ? "bg-success" : "bg-mh-red") : i === idx ? "bg-mh-black" : "bg-mh-pink-200",
                )}
              />
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <QuestionView
              question={q}
              order={p.order[q.id]}
              answered={answered}
              onAnswer={(answer, correct) => {
                setProgress((s) => ({ ...s, answers: { ...s.answers, [q.id]: { answer, correct } } }));
                if (correct) burst();
              }}
            />
            {answered && (
              <FeedbackPanel
                question={q}
                correct={answered.correct}
                nextLabel={idx + 1 < m.questions.length ? "Question suivante" : "Voir mon score"}
                onNext={() => {
                  setIdx(idx + 1);
                  window.scrollTo({ top: 0 });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        <p className="sr-only">{site.title}</p>
      </main>
    </div>
  );
}
