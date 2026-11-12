import { API_URL } from "@/config";

export const backendConfigured = API_URL.trim().length > 0;

// Requête "simple" (text/plain) : pas de pré-vol CORS, compatible Google Apps Script.
export async function post<T = { ok: boolean; error?: string }>(body: Record<string, unknown>): Promise<T> {
  const r = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as T;
}

export async function get<T>(params: Record<string, string>): Promise<T> {
  const u = new URL(API_URL);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u.toString(), { redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as T;
}
