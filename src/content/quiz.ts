// Tout le contenu du parcours : textes, questions, réponses, explications, vidéos.
// Modifiez ce fichier pour faire évoluer le quiz sans toucher aux composants.

export type ChapterColor = "turquoise" | "violet" | "mint" | "magenta";

export type Option = { id: string; label: string };

type QBase = { id: string; prompt: string; explanation: string };
export type SingleQ = QBase & { type: "single"; options: Option[]; correct: string; shuffle: boolean };
export type TrueFalseQ = QBase & { type: "truefalse"; answer: boolean };
export type SliderQ = QBase & { type: "slider"; min: number; max: number; step: number; unit: string; answer: number; tolerance: number };
export type ClassifyQ = QBase & {
  type: "classify";
  buckets: Option[];
  items: { id: string; label: string; bucket: string }[];
  passThreshold: number;
};
export type Question = SingleQ | TrueFalseQ | SliderQ | ClassifyQ;

export type LearnBlock =
  | { kind: "text"; title: string; body: string; icon?: string }
  | { kind: "counters"; title: string; items: { value: number; prefix?: string; suffix: string; label: string }[]; footnote?: string }
  | { kind: "trajectory"; title: string; caption: string }
  | { kind: "info"; title: string; body: string; icon: string }
  | { kind: "flip"; title: string; items: { front: string; back: string }[] }
  | { kind: "levers"; title: string; items: { icon: string; label: string }[] }
  | { kind: "small"; title: string; body: string }
  | { kind: "mh"; title: string; body: string }
  | { kind: "ecogeste"; title: string; body: string }
  | { kind: "timeline"; title: string; steps: { date: string; text: string }[]; notes: string[] }
  | { kind: "tiles"; title: string; items: { icon: string; title: string; text: string }[] }
  | { kind: "submeter"; title: string; caption: string; shares: { label: string; value: number }[] }
  | { kind: "scopes"; title: string; items: { title: string; subtitle: string; examples: string }[]; caption: string }
  | { kind: "comparator"; title: string; items: { label: string; value: number }[]; conclusion: string; source: string }
  | { kind: "materiality"; title: string; left: { title: string; text: string }; right: { title: string; text: string } };

export type Module = {
  id: "m1" | "m2" | "m3";
  number: string;
  title: string;
  shortTitle: string;
  color: ChapterColor;
  teaser: string;
  videoUrl: string; // vide = pas de vidéo affichée (YouTube ou .mp4)
  blocks: LearnBlock[];
  questions: Question[];
  takeaway: string;
};

export const site = {
  title: "Quiz Performance environnementale – Malakoff Humanis",
  heroTitle: "Nos bâtiments, notre énergie : 3 réglementations à connaître",
  heroSubtitle:
    "Un parcours ludique de 10 minutes pour découvrir mon métier et les enjeux de la performance environnementale chez Malakoff Humanis.",
  role: {
    title: "Mon métier : la performance environnementale de nos bâtiments",
    bullets: [
      { icon: "FileCheck", text: "Je pilote le décret tertiaire : déclarations annuelles sur OPERAT, suivi des consommations, plans d'actions." },
      { icon: "Gauge", text: "Je déploie les outils de mesure et de pilotage : sous-comptage, GTB, GTB light (décret BACS)." },
      { icon: "Leaf", text: "Je contribue, avec l'équipe RSE, au bilan carbone et au reporting CSRD du groupe." },
    ],
    goal: "Mon objectif : consommer moins, sans dégrader votre confort.",
  },
  chips: [
    { icon: "Clock", label: "~10 min" },
    { icon: "ListChecks", label: "15 questions" },
    { icon: "ShieldCheck", label: "100 % anonyme" },
  ],
  start: "C'est parti",
  feedbackTeaser: "À la fin : votre avis compte",
  correctMessages: ["Bien joué !", "Excellent !", "Bravo, c'est ça !", "Dans le mille !", "Parfait !"],
  wrongMessage: "Pas tout à fait…",
};

export const modules: Module[] = [
  {
    id: "m1",
    number: "01",
    title: "Décret tertiaire",
    shortTitle: "Décret tertiaire",
    color: "turquoise",
    teaser: "La feuille de route énergie de nos bureaux jusqu'en 2050.",
    videoUrl: "",
    blocks: [
      { kind: "text", title: "C'est quoi ?", icon: "BookOpen", body: "Issu de la loi ELAN (2018), le décret du 23 juillet 2019 – dispositif Éco Énergie Tertiaire – oblige à réduire la consommation d'énergie finale des bâtiments tertiaires." },
      {
        kind: "counters",
        title: "Les chiffres clés",
        items: [
          { value: 1000, suffix: " m²", label: "surface tertiaire cumulée à partir de laquelle un site est concerné" },
          { value: 40, prefix: "-", suffix: " %", label: "en 2030" },
          { value: 50, prefix: "-", suffix: " %", label: "en 2040" },
          { value: 60, prefix: "-", suffix: " %", label: "en 2050" },
        ],
        footnote: "Par rapport à une année de référence (2010 au plus tôt).",
      },
      { kind: "trajectory", title: "La trajectoire", caption: "Autre option : atteindre un seuil en valeur absolue (kWh/m²/an) fixé selon l'activité." },
      { kind: "info", title: "OPERAT", icon: "CalendarCheck", body: "Chaque année, avant le 30 septembre, on déclare les consommations de l'année précédente sur OPERAT, la plateforme de l'ADEME. Les résultats sont ajustés selon la météo et l'intensité d'usage : un hiver très froid ne pénalise pas." },
      {
        kind: "flip",
        title: "Qui est responsable ?",
        items: [
          { front: "Le propriétaire ?", back: "Oui, pour le bâti et les équipements." },
          { front: "Le locataire ?", back: "Oui, pour l'exploitation et les usages. Au-delà de 2 000 m² de bureaux loués, une annexe environnementale (« bail vert ») est obligatoire." },
          { front: "Les occupants ?", back: "Oui ! Nos gestes du quotidien font partie des leviers." },
        ],
      },
      {
        kind: "levers",
        title: "5 leviers d'action",
        items: [
          { icon: "House", label: "Améliorer le bâti (isolation, vitrages)" },
          { icon: "Cpu", label: "Installer des équipements performants (et une GTB)" },
          { icon: "SlidersHorizontal", label: "Optimiser l'exploitation (réglages, horaires)" },
          { icon: "LayoutGrid", label: "Adapter les locaux à leur usage" },
          { icon: "HandHeart", label: "Adopter les bons gestes" },
        ],
      },
      { kind: "small", title: "Sanctions", body: "En cas de manquement : mise en demeure, publication du nom de l'entreprise (« name and shame ») et amende jusqu'à 7 500 € pour une entreprise." },
      { kind: "mh", title: "Chez Malakoff Humanis", body: "Plusieurs de nos sites dépassent 1 000 m² de surface tertiaire et sont donc concernés. Mon rôle : déclarer chaque année sur OPERAT, suivre nos consommations en conciliant économies et confort, et planifier les diagnostics et les plans d'actions." },
      { kind: "ecogeste", title: "Éco-geste", body: "1°C de moins = environ 7 % de consommation de chauffage en moins (ADEME). Consignes : 19°C en chauffage, 26°C minimum en climatisation." },
    ],
    questions: [
      {
        id: "m1q1", type: "single", shuffle: false,
        prompt: "À partir de quelle surface tertiaire cumulée un site est-il concerné par le décret tertiaire ?",
        options: [ { id: "a", label: "500 m²" }, { id: "b", label: "1 000 m²" }, { id: "c", label: "2 000 m²" }, { id: "d", label: "5 000 m²" } ],
        correct: "b",
        explanation: "Dès 1 000 m² de surface à usage tertiaire, sur un même bâtiment ou un même site. Les 2 000 m², c'est le seuil du bail vert.",
      },
      {
        id: "m1q2", type: "slider", min: 0, max: 100, step: 5, unit: "%", answer: 40, tolerance: 5,
        prompt: "Selon vous, de combien un site doit-il réduire sa consommation d'énergie d'ici 2030 ?",
        explanation: "-40 % en 2030, -50 % en 2040 et -60 % en 2050 par rapport à l'année de référence.",
      },
      {
        id: "m1q3", type: "single", shuffle: true,
        prompt: "Sur quelle plateforme déclare-t-on chaque année les consommations ?",
        options: [ { id: "a", label: "Base Empreinte" }, { id: "b", label: "OPERAT" }, { id: "c", label: "Géorisques" }, { id: "d", label: "France Rénov'" } ],
        correct: "b",
        explanation: "OPERAT, gérée par l'ADEME, avant le 30 septembre de chaque année.",
      },
      {
        id: "m1q4", type: "truefalse", answer: false,
        prompt: "Un hiver très froid fait grimper la consommation : le site est forcément en échec cette année-là.",
        explanation: "OPERAT corrige les consommations selon les données climatiques et l'intensité d'usage, pour comparer ce qui est comparable.",
      },
      {
        id: "m1q5", type: "single", shuffle: false,
        prompt: "Baisser le chauffage de 1°C permet d'économiser environ…",
        options: [ { id: "a", label: "2 %" }, { id: "b", label: "7 %" }, { id: "c", label: "15 %" }, { id: "d", label: "25 %" } ],
        correct: "b",
        explanation: "Environ 7 % de consommation de chauffage en moins selon l'ADEME. Un petit geste, un grand effet sur plusieurs milliers de m² !",
      },
    ],
    takeaway: "Décret tertiaire : -40 % d'énergie en 2030 pour nos sites de plus de 1 000 m², déclarés chaque année sur OPERAT.",
  },
  {
    id: "m2",
    number: "02",
    title: "Décret BACS / GTB",
    shortTitle: "BACS / GTB",
    color: "violet",
    teaser: "Le cerveau de nos bâtiments : mesurer pour mieux piloter.",
    videoUrl: "",
    blocks: [
      { kind: "text", title: "C'est quoi ?", icon: "BookOpen", body: "BACS = Building Automation & Control Systems, en français systèmes d'automatisation et de contrôle des bâtiments. Le décret BACS (juillet 2020, renforcé en 2023) impose d'équiper les bâtiments tertiaires d'un système capable de mesurer et piloter leurs consommations." },
      {
        kind: "timeline",
        title: "Le calendrier des obligations",
        steps: [
          { date: "Depuis le 1er janvier 2025", text: "Chauffage et/ou climatisation de plus de 290 kW" },
          { date: "Au 1er janvier 2030", text: "À partir de 70 kW" },
        ],
        notes: [
          "Bâtiments neufs : dès la construction (permis déposés depuis juillet 2021).",
          "Exemption possible si le retour sur investissement dépasse 10 ans (étude à l'appui).",
        ],
      },
      {
        kind: "tiles",
        title: "Ce que doit faire un BACS",
        items: [
          { icon: "Activity", title: "Mesurer & enregistrer", text: "par zone, au pas horaire" },
          { icon: "Archive", title: "Conserver", text: "les données mensuelles pendant 5 ans" },
          { icon: "BellRing", title: "Comparer & alerter", text: "détecter les dérives et prévenir l'exploitant" },
          { icon: "Power", title: "Piloter", text: "arrêt manuel, gestion autonome, systèmes interopérables" },
        ],
      },
      { kind: "info", title: "GTB / GTB light", icon: "Cpu", body: "La GTB (Gestion Technique du Bâtiment) centralise chauffage, climatisation, ventilation, éclairage. La GTB light est une version allégée, adaptée aux sites plus petits." },
      {
        kind: "submeter",
        title: "Sans / Avec sous-comptage",
        caption: "Le sous-comptage montre où part l'énergie… et repère par exemple une clim qui tourne tout le week-end.",
        shares: [
          { label: "Chauffage", value: 40 },
          { label: "Climatisation", value: 15 },
          { label: "Éclairage", value: 15 },
          { label: "Informatique & prises", value: 20 },
          { label: "Autres", value: 10 },
        ],
      },
      { kind: "info", title: "Lien avec le décret tertiaire", icon: "Link", body: "Le BACS est l'outil qui nous permet d'atteindre les objectifs du décret tertiaire : on ne réduit bien que ce que l'on mesure." },
      { kind: "mh", title: "Chez Malakoff Humanis", body: "Nous identifions les bâtiments concernés selon la puissance de leurs installations, déployons le sous-comptage et menons un projet GTB et GTB light sur nos sites." },
    ],
    questions: [
      {
        id: "m2q1", type: "single", shuffle: true,
        prompt: "Que signifie BACS ?",
        options: [
          { id: "a", label: "Building Automation & Control Systems" },
          { id: "b", label: "Bâtiment À Consommation Surveillée" },
          { id: "c", label: "Bilan Annuel des Consommations et Services" },
          { id: "d", label: "Building Air Conditioning Standard" },
        ],
        correct: "a",
        explanation: "Systèmes d'automatisation et de contrôle des bâtiments : en pratique, une GTB.",
      },
      {
        id: "m2q2", type: "single", shuffle: false,
        prompt: "Depuis le 1er janvier 2025, le BACS est obligatoire au-delà de quelle puissance de chauffage ou de climatisation ?",
        options: [ { id: "a", label: "70 kW" }, { id: "b", label: "150 kW" }, { id: "c", label: "290 kW" }, { id: "d", label: "1 MW" } ],
        correct: "c",
        explanation: "290 kW depuis 2025, puis 70 kW à partir du 1er janvier 2030.",
      },
      {
        id: "m2q3", type: "truefalse", answer: false,
        prompt: "Une GTB sert uniquement à allumer et éteindre le chauffage à distance.",
        explanation: "Elle mesure, enregistre, analyse, alerte en cas de dérive et pilote l'ensemble des équipements.",
      },
      {
        id: "m2q4", type: "single", shuffle: true,
        prompt: "Lundi matin, le sous-comptage révèle que la climatisation d'un étage a tourné tout le week-end. Que permet la GTB ?",
        options: [
          { id: "a", label: "Rien, il faut attendre la facture" },
          { id: "b", label: "Détecter la dérive, alerter et corriger la programmation" },
          { id: "c", label: "Couper l'électricité de tout le bâtiment" },
          { id: "d", label: "Ouvrir les fenêtres automatiquement" },
        ],
        correct: "b",
        explanation: "C'est tout l'intérêt : repérer vite les anomalies et ajuster les horaires de fonctionnement.",
      },
      {
        id: "m2q5", type: "single", shuffle: false,
        prompt: "Combien de temps faut-il conserver les données de consommation (au pas mensuel) ?",
        options: [ { id: "a", label: "1 an" }, { id: "b", label: "3 ans" }, { id: "c", label: "5 ans" }, { id: "d", label: "10 ans" } ],
        correct: "c",
        explanation: "5 ans, pour suivre les tendances et comparer d'une année sur l'autre.",
      },
    ],
    takeaway: "BACS / GTB : au-delà de 290 kW (70 kW en 2030), nos bâtiments doivent mesurer, alerter et piloter leurs consommations.",
  },
  {
    id: "m3",
    number: "03",
    title: "CSRD & Bilan carbone",
    shortTitle: "CSRD & Bilan carbone",
    color: "mint",
    teaser: "Mesurer l'empreinte de toute l'entreprise, au-delà des murs.",
    videoUrl: "",
    blocks: [
      { kind: "text", title: "Changement d'échelle", icon: "Building2", body: "Ici, on ne raisonne plus bâtiment par bâtiment mais à l'échelle de toute l'entreprise." },
      { kind: "info", title: "Bilan carbone (BEGES réglementaire)", icon: "Footprints", body: "Obligatoire pour les entreprises de plus de 500 salariés (250 en outre-mer), à mettre à jour tous les 4 ans, avec un plan de transition. Depuis 2023, les émissions indirectes significatives (scope 3) doivent être incluses. Unité : la tonne équivalent CO₂ (tCO₂e)." },
      {
        kind: "scopes",
        title: "Les 3 scopes",
        items: [
          { title: "Scope 1", subtitle: "Émissions directes", examples: "Gaz brûlé dans nos chaudières, carburant des véhicules de société, fuites de fluides frigorigènes des climatisations." },
          { title: "Scope 2", subtitle: "Émissions indirectes liées à l'énergie", examples: "Électricité, réseaux de chaleur et de froid." },
          { title: "Scope 3", subtitle: "Toutes les autres émissions indirectes", examples: "Achats, numérique, déplacements domicile-travail et professionnels, déchets, immobilisations… et, pour un assureur, les placements financiers." },
        ],
        caption: "Dans une entreprise de services, le scope 3 représente généralement l'essentiel des émissions.",
      },
      {
        kind: "comparator",
        title: "Électricité ou gaz ?",
        items: [
          { label: "1 kWh d'électricité en France", value: 0.05 },
          { label: "1 kWh de gaz naturel", value: 0.23 },
        ],
        conclusion: "Le gaz émet environ 4 fois plus",
        source: "Source : Base Empreinte ADEME, ordres de grandeur.",
      },
      { kind: "info", title: "CSRD", icon: "FileText", body: "Directive européenne de 2022 sur le reporting de durabilité, transposée en France fin 2023. Les entreprises concernées publient un rapport de durabilité selon des normes européennes (ESRS) : Environnement (E1 Climat à E5), Social (S1 à S4), Gouvernance (G1). Ce rapport est vérifié par un tiers indépendant. Le paquet de simplification « Omnibus » a recentré l'obligation sur les plus grandes entreprises et allégé le nombre d'indicateurs." },
      {
        kind: "materiality",
        title: "La double matérialité",
        left: { title: "Impact", text: "Ce que l'entreprise fait à l'environnement et à la société" },
        right: { title: "Financier", text: "Ce que les enjeux de durabilité font à l'entreprise" },
      },
      { kind: "info", title: "Le lien avec nos bâtiments", icon: "Link", body: "Les consommations suivies pour le décret tertiaire et la GTB alimentent directement les scopes 1 et 2 du bilan carbone et les indicateurs climat (ESRS E1) de la CSRD." },
      { kind: "mh", title: "Chez Malakoff Humanis", body: "Le bilan carbone et le reporting CSRD sont portés avec la direction RSE ; mon rôle est de fournir des données énergie fiables et de piloter les actions sur nos bâtiments." },
    ],
    questions: [
      {
        id: "m3q1", type: "classify", passThreshold: 4,
        prompt: "Classez chaque source d'émission dans le bon scope",
        buckets: [ { id: "s1", label: "Scope 1" }, { id: "s2", label: "Scope 2" }, { id: "s3", label: "Scope 3" } ],
        items: [
          { id: "i1", label: "Gaz brûlé dans la chaudière du site", bucket: "s1" },
          { id: "i2", label: "Électricité achetée pour les bureaux", bucket: "s2" },
          { id: "i3", label: "Trajets domicile-travail des collaborateurs", bucket: "s3" },
          { id: "i4", label: "Fuite de gaz réfrigérant d'une climatisation", bucket: "s1" },
          { id: "i5", label: "Achat d'ordinateurs portables", bucket: "s3" },
        ],
        explanation: "Scope 1 : ce que l'on brûle ou laisse fuir sur place. Scope 2 : l'énergie achetée. Scope 3 : tout le reste de la chaîne de valeur.",
      },
      {
        id: "m3q2", type: "single", shuffle: false,
        prompt: "Dans une entreprise de services comme la nôtre, quel scope pèse généralement le plus lourd ?",
        options: [ { id: "a", label: "Scope 1" }, { id: "b", label: "Scope 2" }, { id: "c", label: "Scope 3" }, { id: "d", label: "Ils sont équivalents" } ],
        correct: "c",
        explanation: "Achats, numérique, déplacements, placements : le scope 3 représente généralement la grande majorité des émissions d'une entreprise de services.",
      },
      {
        id: "m3q3", type: "single", shuffle: true,
        prompt: "Que signifie la « double matérialité » de la CSRD ?",
        options: [
          { id: "a", label: "Un double audit par deux cabinets" },
          { id: "b", label: "Analyser l'impact de l'entreprise sur le monde ET l'impact des enjeux de durabilité sur l'entreprise" },
          { id: "c", label: "Publier le rapport en deux langues" },
          { id: "d", label: "Réaliser deux bilans carbone par an" },
        ],
        correct: "b",
        explanation: "C'est le cœur de la CSRD : deux regards croisés pour identifier les sujets vraiment importants.",
      },
      {
        id: "m3q4", type: "single", shuffle: false,
        prompt: "En France, pour 1 kWh consommé, le gaz naturel émet environ… par rapport à l'électricité",
        options: [ { id: "a", label: "2 fois moins" }, { id: "b", label: "Autant" }, { id: "c", label: "4 fois plus" }, { id: "d", label: "20 fois plus" } ],
        correct: "c",
        explanation: "≈ 0,23 kg CO₂e pour le gaz contre ≈ 0,05 kg pour l'électricité française, très décarbonée.",
      },
      {
        id: "m3q5", type: "truefalse", answer: false,
        prompt: "Le bilan carbone réglementaire se réalise bâtiment par bâtiment.",
        explanation: "Il couvre toute l'entreprise, tous les 4 ans pour les entreprises de plus de 500 salariés. Les données de nos bâtiments en sont une brique essentielle.",
      },
    ],
    takeaway: "CSRD & Bilan carbone : on mesure l'empreinte de toute l'entreprise (scopes 1, 2, 3), et nos bâtiments en sont une brique clé.",
  },
];

export const MAX_SCORE = modules.reduce((n, m) => n + m.questions.length, 0);

export const badges = [
  { min: 0, max: 5, label: "Graine d'éco-acteur", icon: "Sprout" },
  { min: 6, max: 10, label: "Éco-acteur confirmé", icon: "Leaf" },
  { min: 11, max: 13, label: "Expert énergie", icon: "Zap" },
  { min: 14, max: 15, label: "Champion de la performance environnementale", icon: "Trophy" },
];

export function moduleScoreMessage(score: number, max: number) {
  const r = score / max;
  if (r === 1) return "Sans faute !";
  if (r >= 0.8) return "Bravo !";
  if (r >= 0.6) return "Bien joué !";
  if (r >= 0.4) return "Pas mal !";
  return "On continue d'apprendre !";
}

export const feedbackForm = {
  title: "Votre avis compte",
  intro: "1 minute pour nous aider à améliorer ce format.",
  rating: { label: "Globalement, ce quiz vous a plu ?", faces: ["😞", "🙁", "😐", "🙂", "😍"], names: ["Pas du tout", "Peu", "Moyennement", "Oui", "Beaucoup"] },
  learned: { label: "Avez-vous appris des choses ?", options: ["Beaucoup", "Un peu", "Pas vraiment"] },
  duration: { label: "La durée était…", options: ["Trop courte", "Parfaite", "Trop longue"] },
  favorite: { label: "Le thème qui vous a le plus intéressé", options: ["Décret tertiaire", "BACS-GTB", "CSRD & Bilan carbone"] },
  prior: { label: "Avant ce quiz, ces sujets étaient pour vous…", options: ["Inconnus", "Vaguement connus", "Bien connus"] },
  formats: { label: "Pour la suite, quels formats préférez-vous ?", options: ["Webinaire", "Vidéo courte", "Fiche synthèse", "Visite d'un site", "Un autre quiz comme celui-ci"] },
  topic: { label: "Un sujet que vous aimeriez qu'on aborde ?", max: 300 },
  comment: { label: "Un commentaire, une suggestion ?", max: 1000 },
  anonHint: "Pour rester anonyme, n'indiquez pas votre nom.",
  submit: "Envoyer mon avis",
  thanks: "Merci ! Chaque kWh économisé compte, et vous en faites partie.",
  reminder: "1°C de moins = environ 7 % d'économie de chauffage",
};

export function getQuestion(id: string): { module: Module; question: Question } | undefined {
  for (const m of modules) {
    const q = m.questions.find((x) => x.id === id);
    if (q) return { module: m, question: q };
  }
  return undefined;
}
