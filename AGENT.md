# Infinity TD - Guide de l'Assistant

Ce fichier contient les instructions et les principes d'architecture pour aider tout assistant IA à naviguer et modifier ce projet de Tower Defense.

## Architecture du Projet

Le projet est structuré de manière modulaire pour être maintenable et évolutif.

### Dossiers et Fichiers Clés
- **`src/main.js`** : Orchestrateur principal. Gère la boucle de jeu, les vagues et la logique de haut niveau.
- **`src/ui.js`** : Gère toutes les manipulations du DOM et les événements d'interface. Ne doit pas contenir de logique de jeu pure. Communique avec le moteur via des callbacks.
- **`src/input.js`** : Gère la caméra (pan/zoom) et les entrées utilisateur (souris/tactile).
- **`src/state.js`** : Le "Single Source of Truth". Contient les états partagés (`gameState`, `userData`, `camera`).
- **`src/entities/`** : Contient les classes pour les `Enemy`, `Tower`, `Projectile` et `Particle`.
- **`src/utils.js`** : Fonctions utilitaires partagées (ex: `drawPolygon`).

## Principes de Développement

### 1. Pas de liaisons sur `window`
Ne JAMAIS attacher de fonctions ou de variables à l'objet `window` (ex: `window.myAction = ...`). Utilisez des exports/imports ES6 et passez des callbacks aux modules `UI` et `Input` lors de leur initialisation.

### 2. Flux de données
- L'entrée utilisateur est capturée par `input.js` ou `ui.js`.
- Ces modules appellent des callbacks définis dans `main.js`.
- `main.js` met à jour l'état dans `state.js` et lance les actions de jeu.
- L'UI est mise à jour explicitement via les fonctions d'export de `ui.js`.

### 3. Graphismes et Rendu
- Le rendu se fait sur un canvas 2D.
- Utilisez `drawPolygon` de `utils.js` pour dessiner des formes géométriques complexes.
- Respectez le système de `currentScale` et `camera` pour le zoom et le pan.

### 4. Styles
- Utilisation de **Tailwind CSS** pour l'interface.
- Les styles globaux ou complexes sont dans `src/style.css`.

## Technologies Utilisées
- **Bundler** : Vite
- **Langage** : Vanilla JavaScript (ESM)
- **CSS** : Tailwind CSS
- **Backend** : Firebase (Auth & Firestore)
