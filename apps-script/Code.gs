/**
 * Quiz Performance environnementale – Malakoff Humanis
 * Backend Google Apps Script : enregistre les réponses ANONYMES dans ce Google Sheet
 * et sert les statistiques au tableau de bord (page #/resultats du quiz).
 *
 * 1. Changez le mot de passe ci-dessous.
 * 2. Exécutez la fonction "setup" une fois (menu Exécuter).
 * 3. Déployer > Nouveau déploiement > Application Web
 *    - Exécuter en tant que : Moi
 *    - Qui a accès : Tout le monde
 * 4. Copiez l'URL de l'application Web (elle se termine par /exec).
 */
const ADMIN_PASSWORD = "changez-moi";

const MAX_SCORE = 15;
const HEADERS = {
  Participations: ["date", "participation"],
  Reponses: ["date", "participation", "module", "question", "reponse", "correct", "cle"],
  Completions: ["date", "participation", "score", "score_max", "duree_secondes"],
  Avis: ["date", "participation", "note", "appris", "duree", "theme_prefere", "connaissance_prealable", "formats", "commentaire", "sujet_suggere"],
};

function setup() {
  Object.keys(HEADERS).forEach(sheet_);
  const def = SpreadsheetApp.getActive().getSheetByName("Feuille 1") || SpreadsheetApp.getActive().getSheetByName("Sheet1");
  if (def && def.getLastRow() === 0 && SpreadsheetApp.getActive().getSheets().length > 1) SpreadsheetApp.getActive().deleteSheet(def);
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function rows_(name) {
  const sh = sheet_(name);
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, HEADERS[name].length).getValues();
}

function column_(name, col) {
  const sh = sheet_(name);
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, col, n - 1, 1).getValues().map(function (r) { return String(r[0]); });
}

// Empêche Google Sheets d'interpréter un texte libre comme une formule.
function text_(v, max) {
  if (v === null || v === undefined || v === "") return "";
  let s = String(v).slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function iso_(d) {
  return d instanceof Date ? d.toISOString() : String(d);
}

const PID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QID = /^m[1-3]q[1-5]$/;

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  if (action === "stats") return json_(stats_());
  return json_({ ok: true, service: "quiz-mh" });
}

function doPost(e) {
  let b;
  try {
    b = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "Requête invalide." });
  }
  if (b.action === "admin") return json_(admin_(b.password));
  if (!b.pid || !PID.test(b.pid)) return json_({ ok: false, error: "Identifiant de participation invalide." });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const now = new Date();
    switch (b.action) {
      case "participation": {
        if (column_("Participations", 2).indexOf(b.pid) === -1) sheet_("Participations").appendRow([now, b.pid]);
        return json_({ ok: true });
      }
      case "answers": {
        if (!Array.isArray(b.rows) || b.rows.length > 5) return json_({ ok: false, error: "Réponses invalides." });
        const keys = column_("Reponses", 7);
        const out = [];
        for (let i = 0; i < b.rows.length; i++) {
          const r = b.rows[i];
          if (!r || !QID.test(r.question_id) || r.question_id.slice(0, 2) !== r.module_id || typeof r.is_correct !== "boolean") {
            return json_({ ok: false, error: "Réponse invalide." });
          }
          const key = b.pid + "|" + r.question_id;
          if (keys.indexOf(key) !== -1) continue;
          keys.push(key);
          out.push([now, b.pid, r.module_id, r.question_id, text_(r.answer, 1000), r.is_correct, key]);
        }
        if (out.length) {
          const sh = sheet_("Reponses");
          sh.getRange(sh.getLastRow() + 1, 1, out.length, out[0].length).setValues(out);
        }
        return json_({ ok: true });
      }
      case "completion": {
        const t = Number(b.total_score);
        const d = b.duration_seconds === null || b.duration_seconds === undefined ? "" : Number(b.duration_seconds);
        if (!(t >= 0 && t <= MAX_SCORE && Math.floor(t) === t) || Number(b.max_score) !== MAX_SCORE || (d !== "" && !(d >= 0 && d <= 86400))) {
          return json_({ ok: false, error: "Score invalide." });
        }
        if (column_("Completions", 2).indexOf(b.pid) === -1) sheet_("Completions").appendRow([now, b.pid, t, MAX_SCORE, d]);
        return json_({ ok: true });
      }
      case "feedback": {
        const rating = Number(b.rating);
        if (!(rating >= 1 && rating <= 5 && Math.floor(rating) === rating)) return json_({ ok: false, error: "Note invalide." });
        const formats = Array.isArray(b.preferred_formats) ? b.preferred_formats.slice(0, 10).map(function (x) { return String(x).slice(0, 100); }) : [];
        if (column_("Avis", 2).indexOf(b.pid) === -1) {
          sheet_("Avis").appendRow([
            now, b.pid, rating,
            text_(b.learned, 100), text_(b.duration_opinion, 100), text_(b.favorite_module, 100), text_(b.prior_knowledge, 100),
            text_(formats.join(" | "), 1100), text_(b.comment, 1000), text_(b.topic_suggestion, 300),
          ]);
        }
        return json_({ ok: true });
      }
      default:
        return json_({ ok: false, error: "Action inconnue." });
    }
  } finally {
    lock.releaseLock();
  }
}

function stats_() {
  const scores = rows_("Completions").map(function (r) { return Number(r[2]); });
  const n = scores.length;
  const avg = n ? scores.reduce(function (a, b) { return a + b; }, 0) / n : 0;
  return { completions: n, averageScore: Math.round(avg * 10) / 10 };
}

function admin_(password) {
  if (!password || String(password) !== ADMIN_PASSWORD || ADMIN_PASSWORD === "changez-moi") {
    Utilities.sleep(1200);
    return { ok: false, error: ADMIN_PASSWORD === "changez-moi" ? "Mot de passe non configuré dans le script." : "Mot de passe incorrect." };
  }
  // Les identifiants aléatoires sont remplacés par des numéros (1, 2, 3…).
  const idx = {};
  let next = 1;
  const anon = function (id) {
    if (!idx[id]) idx[id] = next++;
    return idx[id];
  };
  const txt = function (v) { return v === "" || v === null || v === undefined ? null : String(v); };
  return {
    ok: true,
    participations: rows_("Participations").map(function (r) { return iso_(r[0]); }),
    completions: rows_("Completions").map(function (r) {
      return { created_at: iso_(r[0]), p: anon(r[1]), total_score: Number(r[2]), max_score: Number(r[3]), duration_seconds: r[4] === "" ? null : Number(r[4]) };
    }),
    answers: rows_("Reponses").map(function (r) {
      return { created_at: iso_(r[0]), p: anon(r[1]), module_id: String(r[2]), question_id: String(r[3]), answer: String(r[4]), is_correct: r[5] === true || r[5] === "TRUE" };
    }),
    feedback: rows_("Avis").map(function (r) {
      return {
        created_at: iso_(r[0]), rating: Number(r[2]),
        learned: txt(r[3]), duration_opinion: txt(r[4]), favorite_module: txt(r[5]), prior_knowledge: txt(r[6]),
        preferred_formats: r[7] ? String(r[7]).split(" | ") : [], comment: txt(r[8]), topic_suggestion: txt(r[9]),
      };
    }),
  };
}
