// URL de l'application Web Google Apps Script qui enregistre les réponses
// dans votre Google Sheet (voir apps-script/README.md). Elle se termine par /exec.
export const API_URL: string =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbyyK-_BLM26nwPINMwtHijHWZDdaTMY6CgJG4NjjysklteHJd5viMf6ui8T5SaKg048Wg/exec";
