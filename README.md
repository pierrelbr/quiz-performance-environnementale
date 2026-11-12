# Quiz Performance environnementale

Parcours d'apprentissage + quiz (décret tertiaire, décret BACS / GTB, CSRD & bilan carbone), avec réponses anonymes enregistrées dans un Google Sheet.

- Contenu (textes, questions, vidéos) : `src/content/quiz.ts`
- Backend Google Sheet : `apps-script/` (voir le README)
- Tableau de bord des résultats : page `#/resultats` (mot de passe défini dans le script)

```bash
npm install
VITE_API_URL="https://script.google.com/macros/s/.../exec" npm run build
```
