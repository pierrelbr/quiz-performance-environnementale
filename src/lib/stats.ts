import { backendConfigured, get, post } from "./api";

export type PublicStats = { completions: number; averageScore: number };

export async function getPublicStats(): Promise<PublicStats | null> {
  if (!backendConfigured) return null;
  try {
    return await get<PublicStats>({ action: "stats" });
  } catch {
    return null;
  }
}

export type AdminData = {
  ok: true;
  participations: string[];
  completions: { p: number; total_score: number; max_score: number; duration_seconds: number | null; created_at: string }[];
  answers: { p: number; module_id: string; question_id: string; answer: string; is_correct: boolean; created_at: string }[];
  feedback: {
    rating: number; learned: string | null; duration_opinion: string | null; favorite_module: string | null;
    prior_knowledge: string | null; preferred_formats: string[] | null; comment: string | null; topic_suggestion: string | null; created_at: string;
  }[];
};

export async function getAdminResults(password: string): Promise<AdminData | { ok: false; error: string }> {
  if (!backendConfigured) return { ok: false, error: "Le Google Sheet n'est pas encore connecté (API_URL vide dans src/config.ts)." };
  return post<AdminData | { ok: false; error: string }>({ action: "admin", password });
}
