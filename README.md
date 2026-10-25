# Blindtest

Webapp de blindtest pour iPhone, avec les extraits Apple Music (30 s).
Pas de compte, pas d'inscription, pas de build : c'est du HTML/CSS/JS statique.

## Jouer

- **Solo**
  - *Saisie libre* : tape l'artiste et le titre. Les fautes de frappe, les accents et les « feat. » sont tolérés. 1 pt par champ trouvé, +1 bonus si tu trouves les deux.
  - *4 choix* : 2 pts par bonne réponse, 3 si tu réponds en moins de 10 s.
- **Soirée** : un seul iPhone pour tout le monde. L'iPhone joue l'extrait, les joueurs crient leur réponse, puis l'animateur révèle le titre et attribue les points (artiste / titre).

Thèmes : Hits du moment, années 80 à 2010, rap FR, variété française, pop, rock, électro, Disney (là, on devine le film : 2 pts, et la chanson en bonus), ou ta propre liste d'artistes. On peut en cocher plusieurs.
Chaque titre révélé a un bouton « Écouter en entier » qui l'ouvre dans l'app Musique (morceau complet avec un abonnement Apple Music).

## Installer sur iPhone

1. Ouvre l'URL du site dans **Safari**.
2. Partager → **Sur l'écran d'accueil**.
3. L'app s'ouvre en plein écran, comme une app native.

## Mettre en ligne (GitHub Pages)

Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
Le site sera servi sur `https://<utilisateur>.github.io/blindtest/`.

En local : `python3 -m http.server` puis ouvrir `http://localhost:8000`.

## Détails techniques

- Les extraits viennent de l'[API iTunes Search](https://performance-partners.apple.com/search-api) (publique, CORS autorisé). Le paramètre `media=music` n'est volontairement pas envoyé : avec un User-Agent iPhone, Apple redirige alors la requête vers `musics://`, ce qui la fait échouer dans Safari.
- L'API est limitée à environ 20 requêtes par minute. Les résultats par artiste sont mis en cache 3 jours dans `localStorage`, et les titres déjà joués récemment passent en fin de file.
- Sur iOS, le son ne peut démarrer qu'après un geste de l'utilisateur. L'élément audio est donc « débloqué » au tap sur *Lancer la partie*. Si la lecture est quand même bloquée, un bouton ▶︎ apparaît.

| Fichier | Rôle |
| --- | --- |
| `index.html` | écrans (accueil, jeu, résultats) |
| `styles.css` | style |
| `app.js` | logique du jeu, recherche iTunes, comparaison des réponses |
| `sw.js`, `manifest.webmanifest`, `icons/` | PWA (écran d'accueil, cache de l'interface) |
