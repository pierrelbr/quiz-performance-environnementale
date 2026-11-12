import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownUp, Download, Lock, RefreshCw, TriangleAlert } from "lucide-react";
import { MAX_SCORE, feedbackForm, modules, type Question } from "@/content/quiz";
import { Logo, chapterVar } from "@/components/brand";
import { getAdminResults, type AdminData } from "@/lib/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resultats")({
  component: Admin,
});

type Data = AdminData;
const SS = "mh-admin-pw";

function ssGet() { try { return sessionStorage.getItem(SS); } catch { return null; } }
function ssSet(v: string | null) { try { if (v) sessionStorage.setItem(SS, v); else sessionStorage.removeItem(SS); } catch { /* ignore */ } }

function Admin() {
  const [pw, setPw] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (password: string) => {
    setLoading(true);
    try {
      const r = await getAdminResults(password);
      if (r.ok) {
        setData(r);
        setPw(password);
        ssSet(password);
        setError(null);
      } else {
        setError(r.error);
        ssSet(null);
        setPw(null);
      }
    } catch {
      setError("Erreur de chargement. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const s = ssGet();
    if (s) void load(s);
  }, [load]);

  useEffect(() => {
    if (!pw) return;
    const t = setInterval(() => load(pw), 60_000);
    return () => clearInterval(t);
  }, [pw, load]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={(e) => { e.preventDefault(); void load(input); }} className="card-mh w-full max-w-sm p-6">
          <Logo className="mb-6 h-8" />
          <Lock className="mb-2 block h-7 w-7 text-mh-red" strokeWidth={1.75} aria-hidden="true" />
          <h1 className="mb-4 text-xl font-semibold">Espace réservé</h1>
          <label className="block text-sm font-medium" htmlFor="admin-pw">
            Mot de passe
            <input id="admin-pw" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="current-password" className="mt-1 box-border w-full rounded-xl border-0 bg-mh-pink-50 p-3 ring-1 ring-mh-pink-200 focus:outline-none focus:ring-2 focus:ring-mh-red" />
          </label>
          {error && <p role="alert" className="mt-3 text-sm text-mh-red">{error}</p>}
          <button className="btn-mh mt-5 w-full" disabled={loading || !input}>{loading ? "Vérification…" : "Accéder"}</button>
        </form>
      </div>
    );
  }
  return <Dashboard data={data} loading={loading} onRefresh={() => pw && load(pw)} />;
}

function inRange(d: string, from: string, to: string) {
  const day = d.slice(0, 10);
  return (!from || day >= from) && (!to || day <= to);
}

function csv(rows: (string | number | boolean | null | undefined)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
}
function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-mh p-4">
      <p className="text-3xl font-semibold text-mh-red tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-mh-black/70">{label}</p>
    </div>
  );
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

function Dashboard({ data, loading, onRefresh }: { data: Data; loading: boolean; onRefresh: () => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"order" | "asc" | "desc">("order");
  const [selected, setSelected] = useState<string | null>(null);

  const d = useMemo(() => {
    const parts = data.participations.filter((x) => inRange(x, from, to));
    const comps = data.completions.filter((x) => inRange(x.created_at, from, to));
    const ans = data.answers.filter((x) => inRange(x.created_at, from, to));
    const fb = data.feedback.filter((x) => inRange(x.created_at, from, to));
    return { parts, comps, ans, fb };
  }, [data, from, to]);

  const correct = d.ans.filter((a) => a.is_correct).length;
  const avgScore = d.comps.length ? d.comps.reduce((s, c) => s + c.total_score, 0) / d.comps.length : 0;
  const avgRating = d.fb.length ? d.fb.reduce((s, c) => s + c.rating, 0) / d.fb.length : 0;
  const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

  const perQ = modules.flatMap((m) =>
    m.questions.map((q, i) => {
      const rows = d.ans.filter((a) => a.question_id === q.id);
      return { q, m, order: modules.indexOf(m) * 10 + i, n: rows.length, rate: pct(rows.filter((r) => r.is_correct).length, rows.length) };
    }),
  );
  const hardest = perQ.filter((x) => x.n > 0).sort((a, b) => a.rate - b.rate)[0];
  const sorted = [...perQ].sort((a, b) => (sort === "order" ? a.order - b.order : sort === "asc" ? a.rate - b.rate : b.rate - a.rate));

  const hist = Array.from({ length: MAX_SCORE + 1 }, (_, s) => ({ s: String(s), n: d.comps.filter((c) => c.total_score === s).length }));

  const dist = (key: "learned" | "duration_opinion" | "favorite_module" | "prior_knowledge", options: string[]) =>
    options.map((o) => ({ o, n: d.fb.filter((x) => x[key] === o).length }));

  const exportAnswers = () =>
    download("reponses.csv", csv([
      ["date", "participant", "module", "question", "reponse", "correct"],
      ...d.ans.map((a) => [a.created_at.slice(0, 10), a.p, a.module_id, a.question_id, a.answer, a.is_correct ? "oui" : "non"]),
    ]));
  const exportFeedback = () =>
    download("avis.csv", csv([
      ["date", "note", "appris", "duree", "theme_prefere", "connaissance_prealable", "formats", "sujet_suggere", "commentaire"],
      ...d.fb.map((f) => [f.created_at.slice(0, 10), f.rating, f.learned, f.duration_opinion, f.favorite_module, f.prior_knowledge, (f.preferred_formats ?? []).join(", "), f.topic_suggestion, f.comment]),
    ]));

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 bg-mh-pink-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo className="h-7" />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-1" htmlFor="from">Du <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border-0 bg-mh-white px-2 py-1 ring-1 ring-mh-pink-200" /></label>
            <label className="flex items-center gap-1" htmlFor="to">au <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border-0 bg-mh-white px-2 py-1 ring-1 ring-mh-pink-200" /></label>
            <button type="button" onClick={onRefresh} className="btn-mh-ghost px-3 py-1.5 text-sm">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" /> Actualiser
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 pt-4">
        <h1 className="text-2xl font-semibold">Résultats du quiz</h1>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Kpi label="Participations commencées" value={String(d.parts.length)} />
          <Kpi label="Parcours terminés" value={String(d.comps.length)} />
          <Kpi label="Taux de complétion" value={`${pct(d.comps.length, d.parts.length)} %`} />
          <Kpi label="Score moyen /15" value={fmt(avgScore)} />
          <Kpi label="Taux de réussite global" value={`${pct(correct, d.ans.length)} %`} />
          <Kpi label="Satisfaction moyenne /5" value={fmt(avgRating)} />
        </section>

        <section className="card-mh p-5">
          <h2 className="mb-4 font-semibold">Réussite par module</h2>
          <div className="space-y-3">
            {modules.map((m) => {
              const rows = d.ans.filter((a) => a.module_id === m.id);
              const r = pct(rows.filter((x) => x.is_correct).length, rows.length);
              return (
                <div key={m.id}>
                  <div className="mb-1 flex justify-between text-sm"><span>{m.number}. {m.title}</span><strong>{r} %</strong></div>
                  <div className="h-4 rounded-full bg-mh-sand"><div className="h-full rounded-full" style={{ width: `${r}%`, background: chapterVar[m.color] }} /></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card-mh p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Réussite par question</h2>
            <button type="button" onClick={() => setSort(sort === "order" ? "asc" : sort === "asc" ? "desc" : "order")} className="flex items-center gap-1 bg-transparent text-sm text-mh-red">
              <ArrowDownUp className="h-4 w-4" aria-hidden="true" /> {sort === "order" ? "Ordre du quiz" : sort === "asc" ? "Plus difficiles d'abord" : "Plus faciles d'abord"}
            </button>
          </div>
          {hardest && (
            <p className="mb-4 flex gap-2 rounded-2xl bg-mh-red p-3 text-sm text-mh-white">
              <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span><strong>Question la plus difficile :</strong> {hardest.q.prompt} ({hardest.rate} %)</span>
            </p>
          )}
          <ul className="m-0 list-none divide-y divide-mh-pink-200 p-0">
            {sorted.map(({ q, m, n, rate }) => (
              <li key={q.id}>
                <button type="button" onClick={() => setSelected(selected === q.id ? null : q.id)} aria-expanded={selected === q.id} className="flex w-full items-center gap-3 bg-transparent py-3 text-left">
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: chapterVar[m.color] }}>{m.number}</span>
                  <span className="min-w-0 flex-1 text-sm">{q.prompt}</span>
                  <span className="w-14 shrink-0 text-right text-sm font-semibold text-mh-red">{rate} %</span>
                  <span className="w-12 shrink-0 text-right text-xs text-mh-black/60">{n} rép.</span>
                </button>
                {selected === q.id && <Distribution q={q} answers={d.ans.filter((a) => a.question_id === q.id).map((a) => a.answer)} />}
              </li>
            ))}
          </ul>
        </section>

        <section className="card-mh p-5">
          <h2 className="mb-4 font-semibold">Distribution des scores</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={hist}>
                <CartesianGrid vertical={false} stroke="var(--mh-pink-200)" />
                <XAxis dataKey="s" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
                <Tooltip formatter={(v) => [v, "Participants"]} labelFormatter={(l) => `Score ${l}/15`} />
                <Bar dataKey="n" fill="var(--mh-red)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Avis ({d.fb.length}) – note moyenne {fmt(avgRating)}/5</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <MiniBars title={feedbackForm.rating.label} data={[1, 2, 3, 4, 5].map((r) => ({ o: `${feedbackForm.rating.faces[r - 1]} ${r}`, n: d.fb.filter((x) => x.rating === r).length }))} />
            <MiniBars title={feedbackForm.learned.label} data={dist("learned", feedbackForm.learned.options)} />
            <MiniBars title={feedbackForm.duration.label} data={dist("duration_opinion", feedbackForm.duration.options)} />
            <MiniBars title={feedbackForm.favorite.label} data={dist("favorite_module", feedbackForm.favorite.options)} />
            <MiniBars title={feedbackForm.prior.label} data={dist("prior_knowledge", feedbackForm.prior.options)} />
            <MiniBars title={feedbackForm.formats.label} data={feedbackForm.formats.options.map((o) => ({ o, n: d.fb.filter((x) => x.preferred_formats?.includes(o)).length }))} />
          </div>
          <TextList title="Commentaires" items={d.fb.filter((x) => x.comment).map((x) => ({ date: x.created_at, text: x.comment! }))} />
          <TextList title="Sujets suggérés" items={d.fb.filter((x) => x.topic_suggestion).map((x) => ({ date: x.created_at, text: x.topic_suggestion! }))} />
        </section>

        <section className="flex flex-wrap gap-3">
          <button type="button" className="btn-mh" onClick={exportAnswers}><Download className="h-4 w-4" aria-hidden="true" /> Exporter les réponses (CSV)</button>
          <button type="button" className="btn-mh-ghost" onClick={exportFeedback}><Download className="h-4 w-4" aria-hidden="true" /> Exporter les avis (CSV)</button>
        </section>
        <p className="text-xs text-mh-black/60">Toutes les réponses sont aussi consultables directement dans votre Google Sheet.</p>
      </main>
    </div>
  );
}

function MiniBars({ title, data }: { title: string; data: { o: string; n: number }[] }) {
  const max = Math.max(1, ...data.map((x) => x.n));
  return (
    <div className="card-mh p-4">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <ul className="m-0 list-none space-y-2 p-0">
        {data.map((x) => (
          <li key={x.o} className="text-xs">
            <div className="mb-0.5 flex justify-between"><span>{x.o}</span><strong>{x.n}</strong></div>
            <div className="h-2.5 rounded-full bg-mh-sand"><div className="h-full rounded-full bg-mh-magenta" style={{ width: `${(x.n / max) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextList({ title, items }: { title: string; items: { date: string; text: string }[] }) {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="card-mh p-4">
      <p className="mb-3 font-semibold">{title} ({items.length})</p>
      {sorted.length === 0 ? <p className="text-sm text-mh-black/60">Rien pour l'instant.</p> : (
        <ul className="m-0 list-none space-y-2 p-0">
          {sorted.map((x, i) => (
            <li key={i} className="rounded-xl bg-mh-pink-50 p-3 text-sm">
              <span className="mb-1 block text-xs text-mh-black/60">{new Date(x.date).toLocaleDateString("fr-FR")}</span>
              {x.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Distribution({ q, answers }: { q: Question; answers: string[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed: any[] = answers.map((a) => { try { return JSON.parse(a); } catch { return {}; } });
  let rows: { o: string; n: number; ok?: boolean }[] = [];
  if (q.type === "single") rows = q.options.map((o) => ({ o: o.label, n: parsed.filter((p) => p.choice === o.id).length, ok: o.id === q.correct }));
  if (q.type === "truefalse") rows = [true, false].map((v) => ({ o: v ? "Vrai" : "Faux", n: parsed.filter((p) => p.value === v).length, ok: v === q.answer }));
  if (q.type === "slider") {
    for (let v = q.min; v <= q.max; v += q.step) rows.push({ o: String(v), n: parsed.filter((p) => p.value === v).length, ok: Math.abs(v - q.answer) <= q.tolerance });
  }
  if (q.type === "classify") {
    rows = q.items.map((it) => ({ o: it.label, n: pct(parsed.filter((p) => p.placements?.[it.id] === it.bucket).length, parsed.length), ok: true }));
  }
  const unit = q.type === "classify" ? " % bien classés" : "";
  return (
    <div className="mb-4 h-56 rounded-2xl bg-mh-pink-50 p-3">
      <ResponsiveContainer>
        <BarChart data={rows} layout={q.type === "slider" ? "horizontal" : "vertical"} margin={{ left: 8, right: 16 }}>
          {q.type === "slider" ? (
            <>
              <XAxis dataKey="o" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} width={24} tick={{ fontSize: 10 }} />
            </>
          ) : (
            <>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} domain={q.type === "classify" ? [0, 100] : undefined} />
              <YAxis type="category" dataKey="o" width={140} tick={{ fontSize: 10 }} />
            </>
          )}
          <Tooltip formatter={(v) => [`${v}${unit}`, ""]} />
          <Bar dataKey="n" radius={4}>
            {rows.map((r, i) => <Cell key={i} fill={r.ok ? "#03dfb2" : "#e2250c"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
