import { badges, modules, type Question } from "@/content/quiz";

export type Answer =
  | { choice: string }
  | { value: boolean }
  | { value: number }
  | { placements: Record<string, string> };

export function classifyHits(q: Extract<Question, { type: "classify" }>, placements: Record<string, string>) {
  return q.items.filter((it) => placements[it.id] === it.bucket).length;
}

export function isCorrect(q: Question, a: Answer): boolean {
  switch (q.type) {
    case "single":
      return "choice" in a && a.choice === q.correct;
    case "truefalse":
      return "value" in a && a.value === q.answer;
    case "slider":
      return "value" in a && typeof a.value === "number" && Math.abs(a.value - q.answer) <= q.tolerance;
    case "classify":
      return "placements" in a && classifyHits(q, a.placements) >= q.passThreshold;
  }
}

export function badgeFor(score: number) {
  return badges.find((b) => score >= b.min && score <= b.max) ?? badges[0]!;
}

export function scoreFor(answers: Record<string, { correct: boolean }>, moduleId?: string) {
  return modules
    .filter((m) => !moduleId || m.id === moduleId)
    .flatMap((m) => m.questions)
    .filter((q) => answers[q.id]?.correct).length;
}
