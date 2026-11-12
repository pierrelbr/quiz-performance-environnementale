import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Lightbulb, RotateCcw, Thermometer } from "lucide-react";
import type { LearnBlock, ChapterColor } from "@/content/quiz";
import { Icon, SmileMark, chapterVar } from "@/components/brand";
import { cn } from "@/lib/utils";

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xl font-semibold">{children}</h2>;
}

function Counter({ value, prefix = "", suffix }: { value: number; prefix?: string | undefined; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(value);
    const c = animate(0, value, { duration: 1.4, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, value, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

function Trajectory({ caption }: { caption: string }) {
  const [year, setYear] = useState(2020);
  const target = year >= 2050 ? 40 : year >= 2040 ? 50 : year >= 2030 ? 60 : 100;
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="label-caps text-mh-black/60">Consommation</span>
        <span className="text-3xl font-semibold text-mh-red tabular-nums">{target} %</span>
      </div>
      <div className="h-10 overflow-hidden rounded-full bg-mh-sand">
        <motion.div
          className="flex h-full items-center justify-end rounded-full pr-3 text-sm font-medium"
          style={{ background: "var(--chapter)" }}
          animate={{ width: `${target}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          {target < 100 && `-${100 - target} %`}
        </motion.div>
      </div>
      <label className="mt-5 block">
        <span className="sr-only">Année</span>
        <input
          type="range"
          min={2020}
          max={2050}
          step={1}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full accent-mh-red"
          aria-valuetext={`${year} : ${target} % de la consommation de référence`}
        />
      </label>
      <div className="mt-1 flex justify-between text-xs text-mh-black/60">
        {[2020, 2030, 2040, 2050].map((y) => (
          <button key={y} type="button" onClick={() => setYear(y)} className={cn("rounded px-1", year >= y && "font-semibold text-mh-black")}>
            {y}
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-sm">
        Année : <strong>{year}</strong>
      </p>
      <p className="mt-4 text-sm text-mh-black/70">{caption}</p>
    </div>
  );
}

function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      className="relative h-44 w-full [perspective:1000px]"
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-mh-white p-4 text-lg font-medium [backface-visibility:hidden] ring-1 ring-mh-pink-200">
          {front}
          <span className="label-caps flex items-center gap-1 text-mh-red">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retourner
          </span>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl p-4 text-sm [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ background: "var(--chapter)" }}
        >
          {back}
        </div>
      </motion.div>
    </button>
  );
}

function SubMeter({ shares, caption }: { shares: { label: string; value: number }[]; caption: string }) {
  const [on, setOn] = useState(false);
  const palette = ["var(--mh-red)", "var(--mh-sky)", "var(--mh-turquoise)", "var(--mh-violet)", "var(--mh-beige)"];
  let acc = 0;
  const R = 40;
  const C = 2 * Math.PI * R;
  return (
    <div>
      <div role="group" aria-label="Affichage" className="mb-5 inline-flex rounded-full bg-mh-sand p-1">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={on === v}
            onClick={() => setOn(v)}
            className={cn("rounded-full px-4 py-2 text-sm font-medium transition", on === v ? "bg-mh-red text-mh-white" : "text-mh-black")}
          >
            {v ? "Avec sous-comptage" : "Sans"}
          </button>
        ))}
      </div>
      <div className="grid items-center gap-5 sm:grid-cols-2">
        <svg viewBox="0 0 160 170" className="mx-auto w-48" role="img" aria-label="Bâtiment illustratif">
          <path d="M20 160 V40 L80 12 L140 40 V160 Z" fill="var(--mh-cream)" stroke="var(--mh-black)" strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <motion.rect
              key={i}
              x="32"
              y={48 + i * 27}
              width="96"
              height="22"
              rx="4"
              initial={{ fill: "#ede8e6" }}
              animate={{ fill: on ? (["#e2250c", "#bde3f2", "#5ad5d9", "#aa89e3"][i] ?? "#ede8e6") : "#ede8e6" }}
              transition={{ delay: on ? i * 0.12 : 0 }}
            />
          ))}
          <rect x="68" y="140" width="24" height="20" fill="var(--mh-black)" />
        </svg>
        {on ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="w-28 shrink-0 -rotate-90" aria-hidden="true">
              {shares.map((s, i) => {
                const len = (s.value / 100) * C;
                const el = (
                  <motion.circle
                    key={s.label}
                    cx="50" cy="50" r={R} fill="none" stroke={palette[i]} strokeWidth="18"
                    strokeDasharray={`${len} ${C}`} strokeDashoffset={-acc}
                    initial={{ strokeDasharray: `0 ${C}` }} animate={{ strokeDasharray: `${len} ${C}` }}
                    transition={{ duration: 0.7, delay: i * 0.1 }}
                  />
                );
                acc += len;
                return el;
              })}
            </svg>
            <ul className="m-0 list-none space-y-1 p-0 text-sm">
              {shares.map((s, i) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: palette[i] }} aria-hidden="true" />
                  {s.label} <strong className="ml-auto pl-2">{s.value} %</strong>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <div className="text-center">
            <p className="label-caps text-mh-black/60">Compteur global</p>
            <p className="text-4xl font-semibold text-mh-red tabular-nums">1 248 300</p>
            <p className="text-sm">kWh / an… mais où part l'énergie ?</p>
          </div>
        )}
      </div>
      <p className="label-caps mt-4 text-mh-black/50">Exemple illustratif</p>
      <p className="mt-1 text-sm text-mh-black/70">{caption}</p>
    </div>
  );
}

function Scopes({ items, caption }: { items: { title: string; subtitle: string; examples: string }[]; caption: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const tints = ["var(--mh-mint)", "var(--mh-sky)", "var(--mh-pink-200)"];
  return (
    <div>
      <div className="grid gap-3">
        {items.map((s, i) => (
          <motion.button
            key={s.title}
            type="button"
            layout
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="overflow-hidden rounded-[2rem] p-5 text-left"
            style={{ background: tints[i], borderRadius: i === 1 ? "2.5rem 1.5rem 2.5rem 1.5rem" : "1.5rem 2.5rem 1.5rem 2.5rem" }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div layout className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-semibold">{s.title}</span>
              <span className="text-right text-sm">{s.subtitle}</span>
            </motion.div>
            {open === i && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm">
                {s.examples}
              </motion.p>
            )}
          </motion.button>
        ))}
      </div>
      <p className="mt-4 text-sm text-mh-black/70">{caption}</p>
    </div>
  );
}

function Comparator({ items, conclusion, source }: { items: { label: string; value: number }[]; conclusion: string; source: string }) {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={it.label}>
          <div className="mb-1 flex justify-between gap-2 text-sm">
            <span>{it.label}</span>
            <strong className="shrink-0">≈ {it.value.toLocaleString("fr-FR")} kg CO₂e</strong>
          </div>
          <div className="h-6 rounded-full bg-mh-sand">
            <motion.div
              className="h-full rounded-full"
              style={{ background: i === 0 ? "var(--mh-sky)" : "var(--mh-red)" }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(it.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.3 }}
            />
          </div>
        </div>
      ))}
      <p className="text-lg font-semibold text-mh-red">{conclusion}</p>
      <p className="text-xs text-mh-black/60">{source}</p>
    </div>
  );
}

function Materiality({ left, right }: { left: { title: string; text: string }; right: { title: string; text: string } }) {
  const [sel, setSel] = useState<"l" | "r" | null>(null);
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[45%_55%_50%_50%] bg-mh-mint text-center text-xs font-semibold sm:w-24 sm:text-sm">Entreprise</div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <button type="button" onClick={() => setSel("l")} aria-pressed={sel === "l"} className={cn("rounded-full px-3 py-2 text-sm font-medium transition", sel === "l" ? "bg-mh-red text-mh-white" : "bg-mh-pink-50 ring-1 ring-mh-pink-200")}>
            {left.title} →
          </button>
          <button type="button" onClick={() => setSel("r")} aria-pressed={sel === "r"} className={cn("rounded-full px-3 py-2 text-sm font-medium transition", sel === "r" ? "bg-mh-red text-mh-white" : "bg-mh-pink-50 ring-1 ring-mh-pink-200")}>
            ← {right.title}
          </button>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[55%_45%_50%_50%] bg-mh-sky text-center text-xs font-semibold sm:w-24 sm:text-sm">Monde</div>
      </div>
      <motion.p key={sel ?? "none"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 min-h-12 text-sm">
        {sel === "l" ? <><strong>{left.title} :</strong> {left.text}</> : sel === "r" ? <><strong>{right.title} :</strong> {right.text}</> : (
          <span className="flex items-center gap-2 text-mh-black/60"><ArrowLeftRight className="h-4 w-4" aria-hidden="true" /> Touchez chaque flèche</span>
        )}
      </motion.p>
    </div>
  );
}

export function LearnBlockView({ block, color }: { block: LearnBlock; color: ChapterColor }) {
  const style = { "--chapter": chapterVar[color] } as React.CSSProperties;
  const card = "card-mh p-5 sm:p-6";
  switch (block.kind) {
    case "text":
      return (
        <Reveal className="relative overflow-hidden rounded-3xl p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 blob opacity-70" style={{ background: chapterVar[color] }} aria-hidden="true" />
          <div className="relative">
            <p className="label-caps mb-2 text-mh-red">{block.title}</p>
            <p className="text-lg font-medium leading-relaxed">{block.body}</p>
          </div>
        </Reveal>
      );
    case "counters":
      return (
        <Reveal className={card}>
          <H>{block.title}</H>
          <div className="grid grid-cols-2 gap-3">
            {block.items.map((c, i) => (
              <div key={i} className={cn("rounded-2xl bg-mh-pink-50 p-4", i === 0 && "col-span-2")}>
                <p className="text-3xl font-semibold text-mh-red sm:text-4xl">
                  <Counter value={c.value} prefix={c.prefix} suffix={c.suffix} />
                </p>
                <p className="mt-1 text-sm">{c.label}</p>
              </div>
            ))}
          </div>
          {block.footnote && <p className="mt-3 text-sm text-mh-black/70">{block.footnote}</p>}
        </Reveal>
      );
    case "trajectory":
      return (
        <Reveal className={card}>
          <div style={style}>
            <H>{block.title}</H>
            <Trajectory caption={block.caption} />
          </div>
        </Reveal>
      );
    case "info":
      return (
        <Reveal className={card}>
          <div className="flex gap-4">
            <Icon name={block.icon} className="h-8 w-8 shrink-0 text-mh-red" />
            <div className="min-w-0">
              <H>{block.title}</H>
              <p className="leading-relaxed">{block.body}</p>
            </div>
          </div>
        </Reveal>
      );
    case "flip":
      return (
        <Reveal>
          <div style={style}>
            <H>{block.title}</H>
            <div className="grid gap-3 sm:grid-cols-3">
              {block.items.map((f) => <FlipCard key={f.front} {...f} />)}
            </div>
          </div>
        </Reveal>
      );
    case "levers":
      return (
        <Reveal>
          <H>{block.title}</H>
          <ul className="-mx-4 m-0 flex list-none snap-x gap-3 overflow-x-auto px-4 pb-2">
            {block.items.map((l, i) => (
              <li key={l.label} className="card-mh flex w-40 shrink-0 snap-start flex-col gap-3 p-4">
                <span className="text-sm font-semibold text-mh-red">{i + 1}</span>
                <Icon name={l.icon} className="h-8 w-8 text-mh-red" />
                <span className="text-sm font-medium">{l.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      );
    case "small":
      return (
        <Reveal className="rounded-2xl border border-dashed border-mh-black/20 p-4">
          <p className="label-caps mb-1 text-mh-black/60">{block.title}</p>
          <p className="text-sm">{block.body}</p>
        </Reveal>
      );
    case "mh":
      return (
        <Reveal className="relative overflow-hidden rounded-3xl bg-mh-pink-200 p-6">
          <SmileMark className="absolute -bottom-4 -right-4 h-24 w-24 text-mh-red/20" />
          <SmileMark className="mb-3 h-6 w-8 text-mh-red" />
          <H>{block.title}</H>
          <p className="relative leading-relaxed">{block.body}</p>
        </Reveal>
      );
    case "ecogeste":
      return (
        <Reveal className="flex gap-4 rounded-3xl bg-mh-red p-6 text-mh-white">
          <Thermometer className="h-8 w-8 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <p className="label-caps mb-1">{block.title}</p>
            <p className="font-medium leading-relaxed">{block.body}</p>
          </div>
        </Reveal>
      );
    case "timeline":
      return (
        <Reveal className={card}>
          <H>{block.title}</H>
          <ol className="relative m-0 ml-3 list-none border-l-2 border-mh-red pl-6">
            {block.steps.map((s, i) => (
              <motion.li
                key={s.date}
                className="relative mb-6"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.25 }}
              >
                <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-mh-red ring-4 ring-mh-white" aria-hidden="true" />
                <p className="label-caps text-mh-red">{s.date}</p>
                <p className="text-lg font-medium">{s.text}</p>
              </motion.li>
            ))}
          </ol>
          <ul className="m-0 list-none space-y-2 p-0">
            {block.notes.map((n) => (
              <li key={n} className="flex gap-2 text-sm"><Lightbulb className="h-4 w-4 shrink-0 text-mh-red" aria-hidden="true" />{n}</li>
            ))}
          </ul>
        </Reveal>
      );
    case "tiles":
      return (
        <Reveal>
          <H>{block.title}</H>
          <div className="grid grid-cols-2 gap-3">
            {block.items.map((t, i) => (
              <motion.div
                key={t.title}
                className="card-mh p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Icon name={t.icon} className="mb-2 h-7 w-7 text-mh-red" />
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm text-mh-black/75">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      );
    case "submeter":
      return (
        <Reveal className={card}>
          <H>{block.title}</H>
          <SubMeter shares={block.shares} caption={block.caption} />
        </Reveal>
      );
    case "scopes":
      return (
        <Reveal>
          <H>{block.title}</H>
          <Scopes items={block.items} caption={block.caption} />
        </Reveal>
      );
    case "comparator":
      return (
        <Reveal className={card}>
          <H>{block.title}</H>
          <Comparator items={block.items} conclusion={block.conclusion} source={block.source} />
        </Reveal>
      );
    case "materiality":
      return (
        <Reveal className={card}>
          <H>{block.title}</H>
          <Materiality left={block.left} right={block.right} />
        </Reveal>
      );
  }
}

export function VideoBlock({ url }: { url: string }) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return (
    <Reveal className="overflow-hidden rounded-3xl bg-mh-black">
      <div className="relative aspect-video">
        {yt ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${yt[1]}`}
            title="Vidéo"
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video className="absolute inset-0 h-full w-full" src={url} controls preload="metadata" />
        )}
      </div>
    </Reveal>
  );
}
