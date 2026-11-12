import { useSyncExternalStore } from "react";
import type { Answer } from "./scoring";

const KEY = "mh-quiz-v1";

export type Progress = {
  pid?: string;
  startedAt?: number;
  answers: Record<string, { answer: Answer; correct: boolean }>;
  sentModules: string[];
  completionSent?: boolean;
  feedbackSent?: boolean;
  last?: string;
  order: Record<string, string[]>;
};

const empty: Progress = { answers: {}, sentModules: [], order: {} };
let state: Progress = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

export function getProgress() {
  load();
  return state;
}

export function setProgress(fn: (p: Progress) => Progress) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function resetProgress() {
  setProgress(() => empty);
}

export function useProgress() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getProgress,
    () => empty,
  );
}
