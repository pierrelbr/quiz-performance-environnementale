import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Thermometer } from "lucide-react";
import { feedbackForm as f } from "@/content/quiz";
import { Blob, Logo, SmileMark } from "@/components/brand";
import { TopBar } from "@/components/top-bar";
import { setProgress, useProgress } from "@/lib/progress";
import { sendFeedback } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/avis")({
  component: Feedback,
});

function Choice({ label, options, value, onChange }: { label: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-3 p-0 font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(value === o ? null : o)}
            className={cn("rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-95", value === o ? "bg-mh-magenta text-mh-white" : "bg-mh-white ring-1 ring-mh-pink-200")}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Feedback() {
  const p = useProgress();
  const [rating, setRating] = useState<number | null>(null);
  const [learned, setLearned] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [favorite, setFavorite] = useState<string | null>(null);
  const [prior, setPrior] = useState<string | null>(null);
  const [formats, setFormats] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setProgress((s) => ({ ...s, last: "/avis" })), []);

  if (p.feedbackSent) return <Thanks />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError("Merci d'indiquer une note.");
    setSending(true);
    setError(null);
    try {
      await sendFeedback({
        rating,
        learned,
        duration_opinion: duration,
        favorite_module: favorite,
        prior_knowledge: prior,
        preferred_formats: formats,
        topic_suggestion: topic.trim().slice(0, f.topic.max) || null,
        comment: comment.trim().slice(0, f.comment.max) || null,
      });
    } catch {
      setError("L'envoi a échoué. Réessayez dans un instant.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="relative overflow-hidden bg-mh-magenta pb-12 text-mh-white">
        <TopBar current="avis" white />
        <Blob className="-right-20 -top-10 h-64 w-64 bg-mh-white/15" />
        <div className="relative mx-auto max-w-xl px-4 pt-6">
          <p className="text-7xl font-semibold">04<span className="text-mh-white/70">.</span></p>
          <h1 className="mt-2 text-3xl font-semibold">{f.title}</h1>
          <p className="mt-2">{f.intro}</p>
        </div>
      </div>
      <form onSubmit={submit} className="mx-auto -mt-6 max-w-xl space-y-8 px-4 pb-16">
        <fieldset className="card-mh relative m-0 border-0 p-5">
          <legend className="sr-only">{f.rating.label}</legend>
          <p className="mb-4 font-semibold" aria-hidden="true">{f.rating.label} <span className="text-mh-red">*</span></p>
          <div className="flex justify-between gap-1">
            {f.rating.faces.map((face, i) => (
              <motion.button
                key={face}
                type="button"
                whileTap={{ scale: 0.85 }}
                aria-label={`${i + 1} sur 5 : ${f.rating.names[i]}`}
                aria-pressed={rating === i + 1}
                onClick={() => setRating(i + 1)}
                className={cn("flex h-14 w-14 items-center justify-center rounded-full text-3xl transition sm:h-16 sm:w-16", rating === i + 1 ? "scale-110 bg-mh-magenta/15 ring-2 ring-mh-magenta" : "opacity-70 grayscale-[40%] hover:opacity-100")}
              >
                {face}
              </motion.button>
            ))}
          </div>
        </fieldset>
        <Choice label={f.learned.label} options={f.learned.options} value={learned} onChange={setLearned} />
        <Choice label={f.duration.label} options={f.duration.options} value={duration} onChange={setDuration} />
        <Choice label={f.favorite.label} options={f.favorite.options} value={favorite} onChange={setFavorite} />
        <Choice label={f.prior.label} options={f.prior.options} value={prior} onChange={setPrior} />
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-3 p-0 font-semibold">{f.formats.label}</legend>
          <div className="flex flex-wrap gap-2">
            {f.formats.options.map((o) => {
              const on = formats.includes(o);
              return (
                <button key={o} type="button" aria-pressed={on} onClick={() => setFormats((x) => (on ? x.filter((y) => y !== o) : [...x, o]))}
                  className={cn("flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-95", on ? "bg-mh-magenta text-mh-white" : "bg-mh-white ring-1 ring-mh-pink-200")}>
                  {on && <Check className="h-4 w-4" aria-hidden="true" />}{o}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="block" htmlFor="topic">
          <span className="mb-2 block font-semibold">{f.topic.label}</span>
          <input id="topic" value={topic} maxLength={f.topic.max} onChange={(e) => setTopic(e.target.value)} className="box-border w-full rounded-2xl border-0 bg-mh-white p-4 ring-1 ring-mh-pink-200 focus:outline-none focus:ring-2 focus:ring-mh-red" />
          <span className="mt-1 flex justify-between gap-2 text-xs text-mh-black/60"><span>{f.anonHint}</span><span>{topic.length}/{f.topic.max}</span></span>
        </label>
        <label className="block" htmlFor="comment">
          <span className="mb-2 block font-semibold">{f.comment.label}</span>
          <textarea id="comment" value={comment} maxLength={f.comment.max} rows={4} onChange={(e) => setComment(e.target.value)} className="box-border w-full rounded-2xl border-0 bg-mh-white p-4 ring-1 ring-mh-pink-200 focus:outline-none focus:ring-2 focus:ring-mh-red" />
          <span className="mt-1 flex justify-between gap-2 text-xs text-mh-black/60"><span>{f.anonHint}</span><span>{comment.length}/{f.comment.max}</span></span>
        </label>
        {error && <p role="alert" className="rounded-2xl bg-mh-red p-3 text-sm text-mh-white">{error}</p>}
        <button type="submit" disabled={sending || !rating} className="btn-mh w-full">
          {sending ? "Envoi…" : f.submit}
        </button>
      </form>
    </div>
  );
}

function Thanks() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-mh-red px-6 text-center text-mh-white">
      <Blob className="-left-20 -top-20 h-80 w-80 bg-mh-white/10" />
      <Blob className="-bottom-24 -right-16 h-96 w-96 bg-mh-magenta/40" delay={-4} />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-md">
        <Logo white className="mx-auto mb-10 h-12" />
        <SmileMark className="mx-auto mb-6 block h-12 w-16 text-mh-white" />
        <h1 className="text-3xl font-semibold leading-tight">{f.thanks}</h1>
        <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-mh-white/15 px-4 py-2 text-sm">
          <Thermometer className="h-4 w-4" aria-hidden="true" /> {f.reminder}
        </p>
      </motion.div>
    </div>
  );
}
