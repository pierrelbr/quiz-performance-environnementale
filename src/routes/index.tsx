import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircleHeart } from "lucide-react";
import { modules, site } from "@/content/quiz";
import { Blob, BigNumber, Icon, SmileMark, chapterBg } from "@/components/brand";
import { TopBar } from "@/components/top-bar";
import { resetProgress, useProgress } from "@/lib/progress";
import { startParticipation } from "@/lib/db";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const p = useProgress();
  const navigate = useNavigate();
  const resume = p.pid && p.last && p.last !== "/";

  const start = async () => {
    void startParticipation();
    navigate({ to: "/module/$moduleId/$step", params: { moduleId: "m1", step: "chapitre" } });
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-16">
        <section className="relative pb-10 pt-8">
          <Blob className="-right-24 -top-10 h-72 w-72 bg-mh-pink-200" />
          <Blob className="-left-28 top-40 h-56 w-56 bg-mh-red/80" delay={-5} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
            <p className="label-caps mb-3 text-mh-red">Quiz · Immobilier</p>
            <h1 className="m-0 text-3xl font-semibold leading-tight text-balance sm:text-5xl">{site.heroTitle}</h1>
            <p className="mt-4 max-w-xl text-base text-mh-black/75 sm:text-lg">{site.heroSubtitle}</p>
            <ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
              {site.chips.map((c) => (
                <li key={c.label} className="flex items-center gap-2 rounded-full bg-mh-white px-3 py-1.5 text-sm font-medium ring-1 ring-mh-pink-200">
                  <Icon name={c.icon} className="h-4 w-4 text-mh-red" /> {c.label}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-mh relative overflow-hidden p-6">
          <SmileMark className="absolute -right-3 -top-3 h-16 w-20 text-mh-pink-200" />
          <p className="label-caps mb-2 text-mh-red">Mon rôle</p>
          <h2 className="mb-4 mt-0 pr-12 text-xl font-semibold">{site.role.title}</h2>
          <ul className="m-0 list-none space-y-3 p-0">
            {site.role.bullets.map((b) => (
              <li key={b.text} className="flex gap-3">
                <Icon name={b.icon} className="mt-0.5 h-6 w-6 shrink-0 text-mh-red" />
                <span className="text-sm leading-relaxed sm:text-base">{b.text}</span>
              </li>
            ))}
          </ul>
          <p className="mb-0 mt-5 rounded-2xl bg-mh-pink-50 p-4 font-medium">{site.role.goal}</p>
        </motion.section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          {modules.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className={`relative overflow-hidden rounded-3xl p-5 ${chapterBg[m.color]} text-mh-black`}
            >
              <Blob className="-bottom-12 -right-10 h-36 w-36 bg-mh-white/30" delay={-i * 3} />
              <BigNumber n={m.number} className="relative text-5xl" />
              <p className="relative mb-0 mt-3 text-lg font-semibold">{m.title}</p>
              <p className="relative m-0 text-sm">{m.teaser}</p>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative flex flex-col justify-end overflow-hidden rounded-3xl bg-mh-magenta p-5 text-mh-white">
            <MessageCircleHeart className="h-10 w-10" strokeWidth={1.75} aria-hidden="true" />
            <p className="mb-0 mt-3 text-lg font-semibold">{site.feedbackTeaser}</p>
          </motion.div>
        </section>

        <div className="mt-10 flex flex-col items-center gap-3">
          {resume ? (
            <>
              <button type="button" className="btn-mh w-full text-lg sm:w-auto" onClick={() => navigate({ to: p.last! })}>
                Reprendre où j'en étais <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" className="bg-transparent text-sm underline underline-offset-4" onClick={() => { resetProgress(); start(); }}>
                Recommencer depuis le début
              </button>
            </>
          ) : (
            <button type="button" className="btn-mh w-full text-lg sm:w-auto sm:px-12" onClick={start}>
              {site.start} <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
