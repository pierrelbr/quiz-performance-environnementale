import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Check, X, Lightbulb } from "lucide-react";
import type { Question, Option } from "@/content/quiz";
import { site } from "@/content/quiz";
import { classifyHits, isCorrect, type Answer } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type Props = {
  question: Question;
  order?: string[] | undefined;
  answered?: { answer: Answer; correct: boolean } | undefined;
  onAnswer: (a: Answer, correct: boolean) => void;
};

const letters = ["A", "B", "C", "D", "E"];

export function QuestionView({ question: q, order, answered, onAnswer }: Props) {
  const submit = (a: Answer) => {
    if (answered) return;
    onAnswer(a, isCorrect(q, a));
  };
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold leading-snug sm:text-2xl">{q.prompt}</h1>
      {q.type === "single" && <Single options={sortOptions(q.options, order)} correct={q.correct} answered={answered} onPick={(id) => submit({ choice: id })} />}
      {q.type === "truefalse" && <TrueFalse answer={q.answer} answered={answered} onPick={(v) => submit({ value: v })} />}
      {q.type === "slider" && <Slider q={q} answered={answered} onSubmit={(v) => submit({ value: v })} />}
      {q.type === "classify" && <Classify q={q} answered={answered} onSubmit={(p) => submit({ placements: p })} />}
    </div>
  );
}

function sortOptions(opts: Option[], order?: string[]) {
  if (!order) return opts;
  return [...opts].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

function stateClass(isRight: boolean, isPicked: boolean, locked: boolean) {
  if (!locked) return "bg-mh-white ring-1 ring-mh-pink-200 hover:ring-mh-red hover:-translate-y-0.5";
  if (isRight) return "bg-success text-success-foreground ring-2 ring-mh-black/10";
  if (isPicked) return "bg-mh-red text-mh-white";
  return "bg-mh-white/60 text-mh-black/50 ring-1 ring-mh-pink-200";
}

function Single({ options, correct, answered, onPick }: { options: Option[]; correct: string; answered?: Props["answered"]; onPick: (id: string) => void }) {
  const picked = answered && "choice" in answered.answer ? answered.answer.choice : undefined;
  return (
    <div className="grid gap-3" role="group" aria-label="Réponses">
      {options.map((o, i) => {
        const right = o.id === correct;
        const isPicked = o.id === picked;
        return (
          <motion.button
            key={o.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={!!answered}
            onClick={() => onPick(o.id)}
            aria-label={`${letters[i]} : ${o.label}${answered ? (right ? " – bonne réponse" : isPicked ? " – votre réponse, incorrecte" : "") : ""}`}
            className={cn("flex items-center gap-4 rounded-2xl p-4 text-left transition-all disabled:cursor-default", stateClass(right, isPicked, !!answered))}
          >
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold", answered ? "bg-mh-white/30" : "bg-mh-pink-50 text-mh-red")}>
              {answered && right ? <Check className="h-5 w-5" aria-hidden="true" /> : answered && isPicked ? <X className="h-5 w-5" aria-hidden="true" /> : letters[i]}
            </span>
            <span className="font-medium">{o.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function TrueFalse({ answer, answered, onPick }: { answer: boolean; answered?: Props["answered"]; onPick: (v: boolean) => void }) {
  const picked = answered && "value" in answered.answer ? answered.answer.value : undefined;
  return (
    <div className="grid grid-cols-2 gap-3">
      {[true, false].map((v) => (
        <motion.button
          key={String(v)}
          type="button"
          whileTap={{ scale: 0.96 }}
          disabled={!!answered}
          onClick={() => onPick(v)}
          className={cn("flex h-32 flex-col items-center justify-center gap-2 rounded-3xl text-2xl font-semibold transition-all", stateClass(v === answer, v === picked, !!answered))}
        >
          {answered && v === answer && <Check className="h-6 w-6" aria-hidden="true" />}
          {answered && v === picked && v !== answer && <X className="h-6 w-6" aria-hidden="true" />}
          {v ? "Vrai" : "Faux"}
        </motion.button>
      ))}
    </div>
  );
}

function Slider({ q, answered, onSubmit }: { q: Extract<Question, { type: "slider" }>; answered?: Props["answered"]; onSubmit: (v: number) => void }) {
  const initial = answered && "value" in answered.answer ? Number(answered.answer.value) : Math.round((q.max - q.min) / 2 / q.step) * q.step + q.min;
  const [v, setV] = useState(initial);
  const pct = (x: number) => ((x - q.min) / (q.max - q.min)) * 100;
  return (
    <div className="card-mh p-6">
      <p className="mb-6 text-center text-5xl font-semibold text-mh-red tabular-nums">
        -{v} {q.unit}
      </p>
      <div className="relative pb-10">
        <input
          type="range"
          min={q.min}
          max={q.max}
          step={q.step}
          value={v}
          disabled={!!answered}
          onChange={(e) => setV(Number(e.target.value))}
          className="w-full accent-mh-red"
          aria-label="Votre estimation"
          aria-valuetext={`${v} ${q.unit}`}
        />
        {answered && (
          <motion.div
            className="absolute top-7 flex -translate-x-1/2 flex-col items-center"
            initial={{ left: `${pct(v)}%`, opacity: 0 }}
            animate={{ left: `${pct(q.answer)}%`, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="h-3 w-0.5 bg-mh-black" />
            <span className="whitespace-nowrap rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground">Réponse : -{q.answer} {q.unit}</span>
          </motion.div>
        )}
      </div>
      <div className="flex justify-between text-xs text-mh-black/60">
        <span>{q.min} {q.unit}</span>
        <span>{q.max} {q.unit}</span>
      </div>
      {!answered && (
        <button type="button" className="btn-mh mt-6 w-full" onClick={() => onSubmit(v)}>
          Valider
        </button>
      )}
    </div>
  );
}

function Classify({ q, answered, onSubmit }: { q: Extract<Question, { type: "classify" }>; answered?: Props["answered"]; onSubmit: (p: Record<string, string>) => void }) {
  const [placements, setPlacements] = useState<Record<string, string>>(
    answered && "placements" in answered.answer ? answered.answer.placements : {},
  );
  const [sel, setSel] = useState<string | null>(null);
  const locked = !!answered;
  const unplaced = q.items.filter((it) => !placements[it.id]);
  const chip = (it: (typeof q.items)[number]) => {
    const placed = placements[it.id];
    const ok = locked && placed === it.bucket;
    const bad = locked && placed !== it.bucket;
    return (
      <motion.button
        layout
        key={it.id}
        type="button"
        disabled={locked}
        aria-pressed={sel === it.id}
        onClick={(e) => {
          // Une autre étiquette est sélectionnée et celle-ci est déjà rangée :
          // on laisse le clic atteindre le scope, qui y range la sélection.
          if (sel && sel !== it.id && placements[it.id]) return;
          e.stopPropagation();
          setSel(sel === it.id ? null : it.id);
        }}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-2 text-left text-sm font-medium transition",
          ok ? "bg-success text-success-foreground" : bad ? "bg-mh-red text-mh-white" : sel === it.id ? "bg-mh-black text-mh-white" : "bg-mh-white ring-1 ring-mh-pink-200",
        )}
      >
        {ok && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {bad && <X className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span>{it.label}</span>
        {bad && <span className="sr-only"> – bonne réponse : {q.buckets.find((b) => b.id === it.bucket)?.label}</span>}
      </motion.button>
    );
  };
  return (
    <div>
      {!locked && (
        <p className="mb-3 text-sm text-mh-black/70">Touchez une étiquette, puis le scope où la ranger.</p>
      )}
      {unplaced.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{unplaced.map(chip)}</div>}
      <div className="grid gap-3">
        {q.buckets.map((b) => (
          <div
            key={b.id}
            role="button"
            tabIndex={locked ? -1 : 0}
            aria-label={`Ranger dans ${b.label}`}
            onClick={() => {
              if (locked || !sel) return;
              setPlacements((p) => ({ ...p, [sel]: b.id }));
              setSel(null);
            }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && sel && !locked) {
                e.preventDefault();
                setPlacements((p) => ({ ...p, [sel]: b.id }));
                setSel(null);
              }
            }}
            className={cn("min-h-20 rounded-3xl border-2 border-dashed p-3 transition", sel ? "border-mh-red bg-mh-pink-200/40" : "border-mh-pink-200 bg-mh-white/60")}
          >
            <p className="label-caps mb-2">{b.label}</p>
            <div className="flex flex-wrap gap-2">{q.items.filter((it) => placements[it.id] === b.id).map(chip)}</div>
          </div>
        ))}
      </div>
      {locked && (
        <p className="mt-3 text-sm font-medium">
          {classifyHits(q, placements)}/{q.items.length} bien classés (il en fallait {q.passThreshold}).
          {q.items.filter((it) => placements[it.id] !== it.bucket).map((it) => (
            <span key={it.id} className="block font-normal">→ « {it.label} » : {q.buckets.find((b) => b.id === it.bucket)?.label}</span>
          ))}
        </p>
      )}
      {!locked && (
        <button type="button" disabled={unplaced.length > 0} className="btn-mh mt-6 w-full" onClick={() => onSubmit(placements)}>
          Valider
        </button>
      )}
    </div>
  );
}

export function FeedbackPanel({ question, correct, onNext, nextLabel }: { question: Question; correct: boolean; onNext: () => void; nextLabel: string }) {
  const reduce = useReducedMotion();
  const [msg] = useState(() => site.correctMessages[Math.floor(Math.random() * site.correctMessages.length)]);
  const correctText = (() => {
    if (question.type === "single") return question.options.find((o) => o.id === question.correct)?.label;
    if (question.type === "truefalse") return question.answer ? "Vrai" : "Faux";
    if (question.type === "slider") return `-${question.answer} ${question.unit}`;
    return null;
  })();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3" aria-live="polite">
      <div className={cn("flex items-center gap-3 rounded-2xl p-4 font-semibold", correct ? "bg-success text-success-foreground" : "bg-mh-red text-mh-white")}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mh-white/30">
          {correct ? <Check className="h-5 w-5" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div>
          <p>{correct ? msg : site.wrongMessage}</p>
          {!correct && correctText && <p className="text-sm font-normal">Bonne réponse : {correctText}</p>}
        </div>
      </div>
      <div className="card-mh flex gap-3 p-4">
        <Lightbulb className="h-6 w-6 shrink-0 text-mh-red" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="label-caps mb-1 text-mh-red">Le saviez-vous ?</p>
          <p className="text-sm leading-relaxed">{question.explanation}</p>
        </div>
      </div>
      <button type="button" className="btn-mh w-full" onClick={onNext} autoFocus>
        {nextLabel}
      </button>
    </motion.div>
  );
}

export function ScoreRing({ score, max, color = "var(--mh-red)", size = 160 }: { score: number; max: number; color?: string; size?: number }) {
  const R = 44;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--mh-white)" strokeWidth="10" />
        <motion.circle
          cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${(score / max) * C} ${C}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold">
        {score}<span className="text-xl text-mh-black/50">/{max}</span>
      </div>
    </div>
  );
}
