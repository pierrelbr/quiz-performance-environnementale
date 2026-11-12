import { modules } from "@/content/quiz";
import { getProgress, setProgress } from "./progress";
import { backendConfigured, post } from "./api";
import { API_URL } from "@/config";

// Envoi anonyme des réponses vers le Google Sheet (via Apps Script).
// Aucune donnée personnelle : seulement un identifiant aléatoire par participation.

async function send(body: Record<string, unknown>) {
  if (!backendConfigured) return true; // mode démo : rien n'est enregistré
  try {
    const r = await post(body);
    if (!r.ok) console.error(r.error);
    return r.ok;
  } catch (e) {
    // Google renvoie sa réponse via une redirection (googleusercontent.com) que certains
    // réseaux d'entreprise ou navigateurs bloquent, alors que l'envoi a bien été reçu.
    // On renvoie en mode "no-cors" : la réponse est illisible mais la requête arrive.
    // Le script ignore les doublons, ce second envoi est donc sans risque.
    console.warn("Réponse illisible, renvoi en mode no-cors", e);
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
      });
      return true;
    } catch (e2) {
      console.error(e2);
      return false;
    }
  }
}

export async function startParticipation() {
  const p = getProgress();
  if (p.pid) return p.pid;
  const pid = crypto.randomUUID();
  setProgress((s) => ({ ...s, pid, startedAt: Date.now() }));
  await send({ action: "participation", pid });
  return pid;
}

async function ensurePid() {
  const p = getProgress();
  if (p.pid) return p.pid;
  return startParticipation();
}

export async function sendModuleAnswers(moduleId: string) {
  const p = getProgress();
  if (p.sentModules.includes(moduleId)) return;
  const pid = await ensurePid();
  const m = modules.find((x) => x.id === moduleId)!;
  const rows = m.questions
    .filter((q) => p.answers[q.id])
    .map((q) => ({
      module_id: m.id,
      question_id: q.id,
      answer: JSON.stringify(p.answers[q.id]!.answer),
      is_correct: p.answers[q.id]!.correct,
    }));
  if (await send({ action: "answers", pid, rows })) {
    setProgress((s) => ({ ...s, sentModules: [...s.sentModules, moduleId] }));
  }
}

export async function sendCompletion(total: number, max: number) {
  const p = getProgress();
  if (p.completionSent) return;
  const pid = await ensurePid();
  for (const m of modules) await sendModuleAnswers(m.id);
  const duration = p.startedAt ? Math.min(86400, Math.round((Date.now() - p.startedAt) / 1000)) : null;
  if (await send({ action: "completion", pid, total_score: total, max_score: max, duration_seconds: duration })) {
    setProgress((s) => ({ ...s, completionSent: true }));
  }
}

export type FeedbackInput = {
  rating: number;
  learned: string | null;
  duration_opinion: string | null;
  favorite_module: string | null;
  prior_knowledge: string | null;
  preferred_formats: string[];
  comment: string | null;
  topic_suggestion: string | null;
};

export async function sendFeedback(f: FeedbackInput) {
  const pid = await ensurePid();
  if (!(await send({ action: "feedback", pid, ...f }))) throw new Error("send failed");
  setProgress((s) => ({ ...s, feedbackSent: true, last: "/avis" }));
}
