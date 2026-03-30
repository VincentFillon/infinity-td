# 🌌 Infinity TD

![Statut](https://img.shields.io/badge/status-Professionalized-brightgreen)
![Tech](https://img.shields.io/badge/Tech-Vite%20%7C%20Canvas%20%7C%20Firebase%20%7C%20Capacitor-blue)

**Infinity TD** est un jeu de Tower Defense moderne et addictif, conçu pour offrir une expérience profonde grâce à des mécaniques roguelite, un système de progression permanente et un "game feel" soigné.

---

## 🚀 Fonctionnalités Clés

### 🕹️ Gameplay & Profondeur Tactique
- **3 Types de Tours de base** : Baliste (physique rapide), Cristal Magique (magie ignorant l'armure), Canon (dégâts de zone massifs).
- **Évolution Stellaire** : Jusqu'à 5 étoiles (★) par tour, augmentant drastiquement les dégâts et la vitesse de tir.
- **Spécialisations Ultimates** : Au niveau max, choisissez entre des variantes puissantes (ex: Sniper, Tesla, Mortier, Oeil de Givre).
- **Ciblage Avancé** : Configurez chaque tour pour viser le Premier, le Proche, le Plus Fort ou le Plus Faible.
- **Ennemis Variés** : Volants (immunité aux canons), Boucliers régénérants, Ninjas furtifs (révélés par la magie).

### 💎 Méta-Progression Roguelite
- **Événements de Boss** : Toutes les 5 vagues, choisissez une amélioration temporaire (Frénésie, Perce-blindage, Midas).
- **Système de Prestige** : Réinitialisez votre run contre des **Gemmes** précieuses.
- **Laboratoire Permanent** : Dépensez vos gemmes pour des bonus définitifs (Niveau de départ, Chances de critique, Rendement d'or).

### ✨ Expérience Utilisateur (UI/UX)
- **Game Feel Premium** : Screen shake, hit-flash, audio procédural dynamique et dégâts flottants interactifs.
- **Bestiaire Intégré** : Fiches détaillées pour chaque ennemi avec statistiques et descriptions de lore.
- **Tableau de Bord** : Classement global (Top 100) synchronisé via Firestore.
- **Options & Accessibilité** : Réglages SFX/Musique, mode pause automatique lors de la consultation de documentation.

---

## 🛠️ Architecture du Projet

Le projet est structuré de manière modulaire pour faciliter la maintenance :

- `src/main.js` : Boucle de jeu principale, gestion des vagues et logique globale.
- `src/state.js` : Gestion de l'état centralisé (GameState, UserData).
- `src/config.js` : Toutes les données d'équilibrage (tours, ennemis, upgrades).
- `src/ui.js` : Moteur de rendu de l'interface et gestion des menus.
- `src/entities/` : Logique objet pour les Tours, Ennemis, Projectiles et Particules.
- `src/audio.js` : Système sonore utilisant la **Web Audio API**.
- `src/firebase.js` : Persistance des données et synchronisation du leaderboard.

---

## 📦 Installation & Développement

### 1. Pré-requis
- **Node.js** (v18+)
- **NPM** (v10+)

### 2. Démarrage rapide
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```
Rendez-vous sur [http://localhost:5173/](http://localhost:5173/) (ou le port indiqué par Vite).

### 3. Build pour la production
```bash
npm run build
```

---

## 📱 Déploiement Mobile (Capacitor)

Infinity TD est prêt pour une compilation native Android via **Capacitor**.

```bash
# Builder le projet web
npm run build

# Synchroniser avec le projet Android
npx cap add android # Si premier déploiement
npx cap sync

# Ouvrir dans Android Studio
npx cap open android
```

---

## 📜 Licence
Ce projet est open source et distribué sous la licence **MIT**.
