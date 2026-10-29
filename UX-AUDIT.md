# Audit UX/UI — FDA RRM-FT Assistant (FSMA 204)

**Projet audité** : https://visitune.github.io/FDA_RRMT_DATA/ (repo `Visitune/FDA_RRMT_DATA`)
**Date** : 2026-10-29
**Livrable associé** : `prototype-v2.html` + `prototype-v2.css` (refonte UX/UI proposée)

---

## 1. Vue d'ensemble du projet

Application web **100 % client-side** pour l'évaluation des risques de traçabilité (FSMA 204) à partir des données officielles FDA RRM-FT (Tables 1A/2A/2B). Deux implémentations coexistent dans le dépôt :

| Fichier | Rôle | État |
|---|---|---|
| `index.html` | Page servie par GitHub Pages (monolithique, CSS/JS inline) | **Version live** — charge les données depuis la racine (`commodities_table_2A.json`) qui n'existe pas à la racine → 0 denrée en 2A, dégradation silencieuse |
| `index-github.html` + `js/app.js` + `css/styles.css` | Version modulaire | Plus complète (integrity SHA-256, JSZip .RRM) mais **non servie** par défaut |
| `en/`, `i18n/`, `metadata/` | Données + traductions + checksums | OK |

**Conséquence UX majeure** : l'utilisateur qui arrive sur l'URL officielle voit une liste de denrées (depuis les fichiers 2B) mais **0 métadonnée 2A** (pas de catégorie, pas de score agrégé fiable, pas de statut FTL). L'intégrité affiche « OK » alors que les données 2A/1A sont absentes.

---

## 2. Score de maturité UI

**Niveau 2 — Fonctionnel** (score global **2.3 / 5**)

- Composants basiques, tokens CSS partiels, responsive fragile, pas de dark/light toggle, pas de visualisation.
- Deux codebases divergentes → incohérence de comportement.

---

## 3. Heuristiques de Nielsen

| # | Heuristique | Constat | Sévérité |
|---|---|---|---|
| 1 | Visibilité statut système | Badge « loading… » uniquement ; pas de skeleton, pas de progression | 🟡 |
| 2 | Correspondance monde réel | Labels techniques (« C1..C7 », « pairs_table_2B ») non expliqués | 🟡 |
| 3 | Contrôle utilisateur | Pas d'annulation, pas d'undo sur sauvegarde | 🟢 |
| 4 | Consistance | `index.html` vs `index-github.html` : comportements différents (recherche, export) | 🔴 |
| 5 | Prévention erreurs | Aucune validation de saisie projet ; `alert()` bloquant | 🟡 |
| 6 | Reconnaissance vs rappel | Icônes emoji (💾, 📂) non stylables et incohérentes entre OS | 🟡 |
| 7 | Flexibilité / efficacité | Raccourcis clavier présents mais non documentés dans l'UI | 🟡 |
| 8 | Design esthétique | Espacements arbitraires (8/10/12/14/16 px), pas de grille unique | 🟡 |
| 9 | Aide erreurs | Messages d'erreur génériques (« erreur chargement ») | 🟡 |
| 10 | Documentation | Références FDA enfouies dans un `<details>` en bas de page | 🟢 |

---

## 4. Audit 8 dimensions (score /5)

| # | Dimension | Score | Constat principal |
|---|---|---|---|
| 1 | Hiérarchie visuelle | 2.5 | Titre h1 = 22px, mais les badges et compteurs rivalisent ; pas de focus visuel unique |
| 2 | Typographie | 2.0 | 6 tailles distinctes sans échelle ; base 14px (< 16px recommandé) |
| 3 | Système couleur | 2.5 | 3 palettes (ok/warn/bad) mais valeurs en dur, pas de tokens sémantiques |
| 4 | Espacement | 2.0 | Margins/paddings arbitraires ; pas de grille 4/8px cohérente |
| 5 | Interactivité | 2.5 | `:hover` partiel ; `:focus-visible` absent ; transitions sur `transform` OK |
| 6 | Accessibilité | 2.5 | ARIA partiel ; pas de skip link dans `index.html` ; contraste badge vert/blanc 2.75:1 (échoue AA) |
| 7 | Responsive | 2.0 | Flex-wrap fragile ; tableau non scrollable sur mobile dans `index.html` |
| 8 | Chrome vs contenu | 2.0 | Barre de statut + recherche + tableau + projet sur une seule page longue ; pas de navigation structurée |

**Moyenne : 2.25 / 5**

---

## 5. Problèmes critiques (références exactes)

### 🔴 C1 — Double codebase non synchronisée
- `index.html` (live) charge `manifest.json` puis cherche `commodities_table_2A.json` à la racine → absent → `twoA` vide.
- `js/app.js` charge `en/commodities_table_2A.json` (correct) mais n'est pas la page par défaut.
- **Impact** : l'utilisateur live n'a aucune métadonnée 2A (catégorie, score agrégé, FTL).

### 🔴 C2 — Intégrité affichée « OK » alors que 2A/1A manquent
- `index.html:~120` : `badge.textContent = "intégrité OK (si manifest/checksums présents)"` même si `n2A===0`.
- **Impact** : fausse confiance, données incomplètes présentées comme valides.

### 🔴 C3 — Recherche ne filtre que le premier résultat
- `js/app.js:handleSearch` : `options.find(...)` sélectionne le premier match au lieu de filtrer la liste.
- `index.html:populateFromPairs` : filtre correct mais sur `itemsFromPairs` (pas de catégories 2A).

### 🟡 C4 — Accessibilité insuffisante
- `index.html` : pas de `<main>`, pas de skip link, pas de `aria-live`.
- Contraste : `.ok` badge `#38d9a9` sur fond sombre ≈ OK ; mais `.btn.primary` vert `#37b24d` + texte blanc = **2.75:1** (échoue WCAG AA).

### 🟡 C5 — Pas de visualisation
- Les scores C1–C7 sont affichés en tableau uniquement ; aucune vue graphique (barres, radar) pour comparer les dangers.

### 🟡 C6 — Gestion de projet minimaliste
- Pièces jointes acceptées mais jamais listées/prévisualisées.
- Pas d'export PDF/JSON (seulement CSV EN dans `index.html`).

### 🟢 C7 — Icônes emoji
- 💾, 📂 dans les boutons → rendu dépendant de l'OS.

### 🔴 C8 — Incohérence de schéma entre l'UI et les données
- `js/app.js` attend `data.c1..c7` et `data.score`, mais les fichiers `en/pairs_table_2B/*.json` contiennent `hazard_pairs` avec `severity`, `contamination_frequency`, `risk_score` (0–1), `risk_level`.
- Conséquence : colonnes C1–C7 toujours à 0 et score affiché comme 0/1 dans la version modulaire.
- **Correctif dans le prototype v2** : tableau adapté aux champs réels (Sévérité, Fréq. contam., Score %, Niveau).
- 💾, 📂 dans les boutons → rendu dépendant de l'OS.

---

## 6. Recommandations priorisées

### Priorité 1 — Cohérence données (bloquant)
1. Unifier sur `js/app.js` + `index-github.html` comme page par défaut (renommer en `index.html`).
2. Charger `en/commodities_table_2A.json` et `en/ftl_table_1A.json` (chemins corrects).
3. N'afficher « intégrité OK » que si `n2A > 0` et `n1A > 0`.

### Priorité 2 — UX structurelle (fort impact)
4. Layout en 3 colonnes : **sidebar (recherche/filtres/liste)** · **main (résumé + tableau + graphique)** · **panneau (projet/export/journal)**.
5. Recherche qui **filtre** la liste en temps réel (debounce 200 ms) + mise en surbrillance.
6. Tri du tableau par colonne (clic en-tête) avec indicateur ▲/▼.
7. Filtre par score minimal et par texte sur les dangers.
8. Badges FTL et score agrégé dans l'en-tête de la denrée.

### Priorité 3 — Visualisation & lisibilité
9. Graphique en barres des 10 paires à plus haut score (canvas).
10. Code couleur des scores : vert (<50) / orange (50–79) / rouge (≥80) + barre de progression.
11. Thème clair/sombre avec toggle (persistance localStorage).

### Priorité 4 — Accessibilité
12. Skip link, `<main>`, `aria-live` pour le statut.
13. Contraste AA : bouton primaire sur fond vert foncé (`#166534`) avec texte blanc.
14. Navigation clavier complète (Tab, Entrée, Échap).
15. `prefers-reduced-motion` respecté.

### Priorité 5 — Gestion de projet
16. Liste des pièces jointes avec taille et suppression.
17. Export JSON + CSV + impression/PDF.
18. Journal persistant avec horodatage localisé.

---

## 7. Simulations d'usage (scénarios)

### Scénario A — Audit rapide d'une denrée (usage le plus fréquent)
1. L'utilisateur arrive sur l'app → liste chargée, statut « Prêt ».
2. Tape « tom » dans la recherche → liste filtrée à « Tomatoes ».
3. Clique → résumé affiche catégorie, FTL, score max coloré.
4. Tableau des paires trié par score décroissant → danger principal visible en haut.
5. Graphique confirme visuellement la distribution.
**Gain vs actuel** : 1 clic au lieu de défiler dans un `<select>` de 200+ options ; score coloré au lieu d'un nombre brut.

### Scénario B — Comparaison de plusieurs denrées (audit combiné)
1. Sélectionne « Leafy greens » → note le score max 88.
2. Bascule sur « Finfish (histamine) » → 95.
3. Utilise le filtre « Score ≥ 90 » → ne garde que les dangers critiques.
**Gain** : pas de rechargement de page, état conservé.

### Scénario C — Préparation d'un rapport pour un client
1. Remplit Nom / Réf / Notes.
2. Attache 2 fichiers (certificat, photo).
3. Enregistre `.RRM` → archive ZIP avec `project.json` + attachments.
4. Exporte CSV EN pour intégration dans le rapport client.
5. Imprime la page (CSS print masque la chrome).
**Gain** : un seul écran au lieu de 3 sections empilées.

### Scénario D — Utilisation hors ligne / terrain
1. Réseau indisponible → bascule automatique sur les données démo intégrées.
2. Badge « Mode démo » visible → l'utilisateur sait qu'il travaille sur un échantillon.
**Gain** : plus de page blanche ; transparence sur la source des données.

### Scénario E — Accessibilité (utilisateur clavier)
1. Tab depuis le haut → skip link → sidebar → liste → tableau → panneau.
2. Entrée sur une denrée → chargement.
3. Échap ferme les modales/panneaux.
**Gain** : navigation complète sans souris (actuellement impossible sur `index.html`).

---

## 8. Résultat de validation

- **CSS audit (`ux-ui-pro/scripts/audit_css.py`)** : `0 critical, 0 warning` sur `prototype-v2.css`.
- **JS syntax** : `node --check` → OK.
- **Contraste** : bouton primaire passé de 2.75:1 à 7.5:1 (WCAG AA).

---

## 9. Prochaines étapes

1. **Déployer** `prototype-v2.html` comme `index.html` (ou comme `v2/`) sur GitHub Pages pour test utilisateur.
2. **Tests utilisateurs** sur les scénarios A–E avec 3 profils (auditeur, responsable qualité, client).
3. **Itération** : ajouter la vue radar C1–C7 et la comparaison multi-denrées (v3).

---

*Audit réalisé avec le skill `ux-ui-pro` (UI Rescue Protocol, phase 4 validation scriptée).*
