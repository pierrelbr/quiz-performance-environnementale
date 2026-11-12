// URL de l'application Web Google Apps Script qui enregistre les réponses
// dans votre Google Sheet (voir apps-script/README.md). Elle se termine par /exec.
// Vide : le quiz fonctionne, mais rien n'est enregistré.
export const API_URL: string = import.meta.env.VITE_API_URL || "";
