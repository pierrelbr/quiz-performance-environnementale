import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { modules } from "@/content/quiz";
import { useProgress } from "@/lib/progress";
import { Logo, chapterBg } from "./brand";
import { cn } from "@/lib/utils";

export function TopBar({ current, white }: { current?: string; white?: boolean }) {
  const p = useProgress();
  const steps = [
    ...modules.map((m) => ({ id: m.id, label: m.number, name: m.shortTitle, bg: chapterBg[m.color], done: p.sentModules.includes(m.id) })),
    { id: "avis", label: "Avis", name: "Votre avis", bg: "bg-mh-magenta text-mh-white", done: !!p.feedbackSent },
  ];
  return (
    <header className={cn("sticky top-0 z-40 backdrop-blur-md", white ? "bg-transparent" : "bg-mh-pink-50/85")}>
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" aria-label="Accueil">
          <Logo white={white} className="h-7 sm:h-8" />
        </Link>
        <ol className="m-0 flex list-none items-center gap-1.5 p-0" aria-label="Progression">
          {steps.map((s) => {
            const active = s.id === current;
            return (
              <li
                key={s.id}
                aria-label={`${s.name}${s.done ? " – terminé" : active ? " – en cours" : ""}`}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-medium transition-all",
                  s.done || active ? s.bg : "bg-mh-white text-mh-black/50 ring-1 ring-mh-pink-200",
                  active && "ring-2 ring-mh-black/80 scale-110",
                )}
              >
                {s.done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" /> : s.label}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
