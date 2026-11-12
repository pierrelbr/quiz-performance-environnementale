import { FileCheck, Gauge, Leaf, Clock, ListChecks, ShieldCheck, BookOpen, CalendarCheck, House, Cpu, SlidersHorizontal, LayoutGrid, HandHeart, Activity, Archive, BellRing, Power, Link, Building2, Footprints, FileText, Sprout, Zap, Trophy, Circle, type LucideProps } from "lucide-react";

const icons = { FileCheck, Gauge, Leaf, Clock, ListChecks, ShieldCheck, BookOpen, CalendarCheck, House, Cpu, SlidersHorizontal, LayoutGrid, HandHeart, Activity, Archive, BellRing, Power, Link, Building2, Footprints, FileText, Sprout, Zap, Trophy, Circle };
import type { ChapterColor } from "@/content/quiz";
import { cn } from "@/lib/utils";

const base = import.meta.env.BASE_URL;

export function Logo({ white, className }: { white?: boolean | undefined; className?: string | undefined }) {
  return (
    <img
      src={`${base}brand/${white ? "logo-mh-blanc.svg" : "logo-mh-rouge.svg"}`}
      alt="Malakoff Humanis"
      className={cn("h-9 w-auto", className)}
    />
  );
}

export function SmileMark({ className }: { className?: string }) {
  return (
    <svg viewBox="100 125 226 165" className={className} aria-hidden="true" fill="currentColor">
      <path d="M106.9 199.1C106.9 199.1 142.3 239.8 213.8 239.8 285.3 239.8 320.7 199.1 320.7 199.1 320.7 199.1 301.5 283.1 213.8 283.1 126.1 283.1 106.9 199.1 106.9 199.1Z" />
      <path d="M106.9 129.9C106.9 129.9 142.3 170.6 213.8 170.6 285.3 170.6 320.7 129.9 320.7 129.9 320.7 129.9 301.5 213.9 213.8 213.9 126.1 213.9 106.9 129.9 106.9 129.9Z" />
    </svg>
  );
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = icons[name as keyof typeof icons] ?? icons.Circle;
  return <C strokeWidth={1.75} aria-hidden="true" {...props} />;
}

export const chapterBg: Record<ChapterColor, string> = {
  turquoise: "bg-mh-turquoise",
  violet: "bg-mh-violet",
  mint: "bg-mh-mint",
  magenta: "bg-mh-magenta",
};
export const chapterText: Record<ChapterColor, string> = {
  turquoise: "text-mh-black",
  violet: "text-mh-black",
  mint: "text-mh-black",
  magenta: "text-mh-white",
};
export const chapterVar: Record<ChapterColor, string> = {
  turquoise: "var(--mh-turquoise)",
  violet: "var(--mh-violet)",
  mint: "var(--mh-mint)",
  magenta: "var(--mh-magenta)",
};

export function Blob({ className, delay = 0 }: { className?: string; delay?: number }) {
  return <div aria-hidden="true" className={cn("blob", className)} style={{ animationDelay: `${delay}s` }} />;
}

export function BigNumber({ n, className }: { n: string; className?: string }) {
  return (
    <span className={cn("font-semibold leading-none tracking-tight", className)}>
      {n}
      <span className="text-mh-red">.</span>
    </span>
  );
}
