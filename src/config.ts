// URL de l'application Web Google Apps Script qui enregistre les réponses
// dans votre Google Sheet (voir apps-script/README.md). Elle se termine par /exec.
export const API_URL: string =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbzDROCTant_eaS_Hkuip281-Y7V8MemDtRqGLe5zRIeak9vzQww0HCaVpHPSw_eExRKng/exec";
