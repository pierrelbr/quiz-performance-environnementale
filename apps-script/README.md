# Brancher le quiz sur votre Google Sheet (5 minutes)

Les réponses des collègues arrivent, anonymes, dans un Google Sheet qui vous appartient.

1. Ouvrez https://sheets.new (connecté à votre compte Google) et nommez le fichier « Quiz MH – Réponses ».
2. Menu **Extensions → Apps Script**. Effacez le contenu de `Code.gs`, puis collez tout le fichier `Code.gs` de ce dossier.
3. Ligne 14, remplacez `changez-moi` par le mot de passe de votre choix (il protège la page des résultats). Enregistrez (icône disquette).
4. En haut, choisissez la fonction **setup** puis cliquez **Exécuter**. Google demande une autorisation : « Examiner les autorisations » → votre compte → « Paramètres avancés » → « Accéder au projet (non sécurisé) » → « Autoriser ». C'est normal, c'est votre propre script.
   Les onglets Participations, Reponses, Completions et Avis apparaissent dans le Sheet.
5. **Déployer → Nouveau déploiement** → roue dentée → **Application Web** :
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   Cliquez **Déployer** et copiez l'**URL de l'application Web** (elle se termine par `/exec`).
6. Envoyez cette URL à Claude, qui la branche sur le quiz et remet le site en ligne.

Ce qui est enregistré : la date, un identifiant aléatoire par participation, les réponses, le score et l'avis. Jamais de nom, d'e-mail ni d'adresse IP.

Pour changer le mot de passe plus tard : modifiez la ligne 14, puis **Déployer → Gérer les déploiements → crayon → Version : Nouvelle version → Déployer** (l'URL ne change pas).
