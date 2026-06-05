# Documentation — Prisme · Kit Sensibilisation IA

> Application mobile-first de sensibilisation à l'intelligence artificielle, destinée aux collaborateurs d'une organisation. Développée dans le cadre des Y-Days YNOV 2026.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture des fichiers](#3-architecture-des-fichiers)
4. [Flux utilisateur](#4-flux-utilisateur)
5. [Authentification & comptes](#5-authentification--comptes)
6. [Système de quiz](#6-système-de-quiz)
7. [Niveau adaptatif](#7-niveau-adaptatif)
8. [Scores & historique](#8-scores--historique)
9. [Badges](#9-badges)
10. [Profil & paramètres](#10-profil--paramètres)
11. [Base de données Supabase](#11-base-de-données-supabase)
12. [Déploiement](#12-déploiement)
13. [Configuration requise (Supabase)](#13-configuration-requise-supabase)
14. [Améliorations prévues](#14-améliorations-prévues)

---

## 1. Vue d'ensemble

**Prisme** est une Progressive Web App (PWA) mobile permettant aux collaborateurs de :

- Se former à l'IA via des quiz adaptatifs hebdomadaires
- Suivre leur progression (niveau, score, historique)
- Se comparer aux autres via un classement global et par service
- Consulter la Charte IA et la Politique de confidentialité de l'organisation

L'application s'adapte au niveau de chaque utilisateur (Novice → Intermédiaire → Expert) selon ses résultats.

---

## 2. Stack technique

| Couche | Technologie |
|---|---|
| Front-end | React 19 + TypeScript |
| Build | Vite 8 |
| Back-end / BDD | Supabase (PostgreSQL + Auth + Storage) |
| Authentification | Supabase Auth (email/password en dev, SSO en prod) |
| Stockage fichiers | Supabase Storage (bucket `avatars`) |
| Déploiement | GitHub Pages (`gh-pages`) |
| Style | CSS Modules (fichiers `.css` par composant) |

---

## 3. Architecture des fichiers

```
src/
├── App.tsx                    # Routeur principal (gestion des vues et états globaux)
├── components/
│   ├── Onboarding.tsx/.css    # 4 slides d'introduction (1ère visite)
│   ├── CreateAccount.tsx/.css # Création de compte (4 étapes)
│   ├── LoginScreen.tsx/.css   # Connexion
│   ├── ForgotPassword.tsx     # Réinitialisation mot de passe
│   ├── Home.tsx/.css          # Page d'accueil post-login (stats + jauge)
│   ├── Quiz.tsx/.css          # Moteur de quiz (questions + résultats)
│   ├── Leaderboard.tsx/.css   # Classement (global et par service)
│   ├── History.tsx/.css       # Historique des sessions
│   ├── Profile.tsx/.css       # Page profil (badges, stats, avatar)
│   ├── Settings.tsx/.css      # Réglages (7 sous-pages)
│   ├── PrivacyPolicy.tsx/.css # Politique de confidentialité
│   ├── BottomNav.tsx/.css     # Barre de navigation (Accueil / Classement / Profil)
│   └── Logo.tsx/.css          # Composant logo "prisme"
├── contexts/
│   └── AuthContext.tsx        # Session, profil, signIn/signOut/signUp/refreshProfile
├── lib/
│   ├── supabase.ts            # Client Supabase initialisé
│   └── quizResults.ts         # Logique score, niveau adaptatif, historique
├── assets/
│   ├── questions-*.json       # Banques de questions par service (12 fichiers)
│   └── *.png                  # Illustrations onboarding
└── types/
    └── database.ts            # Types TypeScript générés depuis le schéma Supabase
```

---

## 4. Flux utilisateur

```
Lancement
    │
    ├─ 1ère visite ──► Onboarding (4 slides) ──► CreateAccount
    │
    └─ Visite suivante
            │
            ├─ Non connecté ──► CreateAccount
            │                        │
            │                        ├─ "Se connecter" ──► LoginScreen
            │                        │                         │
            │                        │                    "Mot de passe oublié ?"
            │                        │                         │
            │                        │                    ForgotPassword (email Supabase)
            │                        │
            │                        └─ Création (4 étapes) ──► Home
            │
            └─ Connecté ──► Home (stats + jauge moyenne)
                                │
                                ├─ "Nouveau quiz" ──► Quiz ──► Résultats ──► Home
                                ├─ "Historique"   ──► History
                                ├─ BottomNav: Classement ──► Leaderboard
                                └─ BottomNav: Profil ──► Profile
                                                              │
                                                         "Réglages" ──► Settings
```

---

## 5. Authentification & comptes

### Création de compte (4 étapes)

| Étape | Contenu |
|---|---|
| 1 | Prénom, Nom, Email, Mot de passe (≥12 car., majuscule, chiffre, spécial), Confirmer MDP |
| 2 | Choix du service / département |
| 3 | Niveau IA déclaré (Novice / Intermédiaire / Avancé) |
| 4 | Photo de profil (optionnel, upload vers Supabase Storage) |

### Validation mot de passe

- Minimum 12 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (`*?!_-@#$%^&`)

### Réinitialisation mot de passe

`supabase.auth.resetPasswordForEmail(email)` — envoie un lien de réinitialisation par email.

### Déconnexion

`signOut()` depuis `AuthContext` → redirige automatiquement vers `LoginScreen`.

### Suppression de compte

Appel à `supabase.rpc('delete_user_account')` avec confirmation. Nécessite la création de la fonction SQL côté Supabase.

---

## 6. Système de quiz

### Questions

Les questions sont chargées depuis des fichiers JSON locaux (`src/assets/questions-*.json`). **Le choix de la banque est automatique selon le service de l'utilisateur** (mapping dans `Quiz.tsx`).

| Service (table `services`) | Fichier JSON |
|---|---|
| Stratégie | `questions-strategie.json` |
| Ressources Humaines | `questions-rh.json` |
| Finance | `questions-finance.json` |
| Informatique | `questions-informatique.json` |
| Direction | `questions-direction.json` |
| Administratif | `questions-administratif.json` |
| Communication & Marketing | `questions-communication-marketing.json` |
| Commercial | `questions-commercial.json` |
| Juridique | `questions-juridique.json` |
| Autre / non reconnu | `questions-general.json` (fallback) |

Les noms des services dans le mapping doivent correspondre **exactement** aux valeurs de la colonne `name` dans la table `services` de Supabase.

Chaque question contient :

```ts
{
  id: number
  difficulty: number
  difficulty_label: 'beginner' | 'curious' | 'expert'
  category: string
  question: string
  options: string[]         // 4 choix
  correct_index: number
  correct_answer: string
  explanation: string       // explication affichée après réponse
}
```

### Déroulement d'une session

1. 8 questions tirées aléatoirement pour le niveau de l'utilisateur (Fisher-Yates shuffle)
2. Options mélangées à chaque tirage
3. L'utilisateur répond → valide → peut lire l'explication
4. Navigation avant/arrière entre les questions
5. Fin → affichage du score et jauge de résultat

### Points

`10 points × nombre de bonnes réponses` (constante `BASE_POINTS = 10`).

---

## 7. Niveau adaptatif

Après chaque session, le niveau `current_level` est mis à jour automatiquement :

| Taux de réussite | Action |
|---|---|
| ≥ 80 % | Monte d'un niveau |
| 50 – 79 % | Maintenu |
| < 50 % | Descend d'un niveau |

Ordre : `beginner` → `curious` → `expert` (et inversement).

Le niveau `declared_level` (déclaré à l'inscription) peut être modifié manuellement dans les Paramètres du profil.

---

## 8. Scores & historique

### Enregistrement

À chaque fin de quiz, `saveQuizResult()` :
1. Crée une entrée dans `quiz_sessions` (type `custom`, statut `closed`)
2. Crée une entrée dans `user_quiz_sessions` (score, taux de réussite, niveau snapshot)
3. Incrémente `users.total_score`
4. Met à jour `users.current_level`

### Page Historique

Affiche les 50 dernières sessions complétées (date, score, taux de réussite, niveau).

### Page Accueil (Home)

Affiche :
- **Jauge moyenne** : moyenne des `success_rate` × 10 sur toutes les sessions
- **Nombre de quiz complétés**

---

## 9. Badges

Les badges sont calculés dynamiquement depuis `user_quiz_sessions` et affichés sur la page Profil :

| Badge | Condition |
|---|---|
| Premier quiz ! | ≥ 1 session complétée |
| 5 quiz complétés | ≥ 5 sessions |
| 10 quiz complétés | ≥ 10 sessions |
| Score parfait | Au moins 1 session avec `success_rate = 1.0` |
| Top 15% | Classé dans les 15% meilleurs de son service |
| Top 25% | Classé dans les 25% meilleurs de son service |

Les slots vides (jusqu'à 6) affichent un badge "???" verrouillé.

---

## 10. Profil & paramètres

### Page Profil

- Avatar (upload vers Supabase Storage bucket `avatars/{userId}`, upsert)
- Nom, service
- Compteur de quiz complétés
- Grille de badges 3×2

### Page Paramètres — sous-pages

| Sous-page | Fonctionnel |
|---|---|
| Charte IA | Texte statique (règles d'usage responsable de l'IA) |
| Paramètres du profil | Édition prénom, nom, poste, service, niveau déclaré → sauvegarde Supabase |
| Confidentialité | Toggles "Apparaître dans le classement" et "Partager mes statistiques" (localStorage) |
| Langue | Français actif, autres langues bientôt (localStorage) |
| Musique | Toggle on/off (localStorage `pref_music`) |
| Effets sonores | Toggle on/off (localStorage `pref_sounds`) |
| Volume | Slider 0-100 (localStorage `pref_volume`) |
| FAQ | 5 questions accordéon sur le fonctionnement |
| Contact | Lien `mailto:support@prisme-ia.fr` |
| CGU | Texte légal statique |
| Politique de confidentialité | Composant `PrivacyPolicy` |
| Déconnexion | `signOut()` → redirige vers Login |
| Supprimer le compte | Confirmation + `supabase.rpc('delete_user_account')` |

---

## 11. Base de données Supabase

### Tables principales

| Table | Description |
|---|---|
| `auth.users` | Géré par Supabase Auth |
| `public.users` | Profils utilisateurs (lié à auth.users) |
| `services` | Services / départements de l'organisation |
| `quiz_sessions` | Sessions de quiz (hebdo ou custom) |
| `user_quiz_sessions` | Participation d'un user à une session |
| `questions` | Banque de questions (peuplée via seed) |
| `answer_options` | Options de réponse par question |
| `session_questions` | Questions rattachées à une session |
| `user_answers` | Réponses individuelles |

### Politiques RLS nécessaires

```sql
-- Table users
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Storage avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

---

## 12. Déploiement

```bash
# Installer les dépendances
npm install

# Développement local
npm run dev

# Build production
npm run build

# Déployer sur GitHub Pages
npm run deploy
```

Le déploiement utilise `gh-pages` et publie le dossier `dist/` sur la branche `gh-pages`.

Variables d'environnement requises (`.env`) :

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## 13. Configuration requise (Supabase)

| Action | Où |
|---|---|
| Désactiver la confirmation email | Auth → Providers → Email → désactiver "Confirm email" |
| Créer le bucket avatars | Storage → New bucket → `avatars` (Public) |
| Ajouter les RLS policies | SQL Editor (voir section 11) |
| Créer la fonction delete_user_account | SQL Editor (voir ci-dessous) |

```sql
-- Fonction suppression de compte
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.users WHERE id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
```

---

## 14. Améliorations prévues

### Fonctionnalités

- [ ] **Sessions hebdomadaires automatiques** — quiz programmés chaque semaine (type `weekly`) avec code d'accès, déclenchés côté admin
- [ ] **Interface admin** — création de sessions custom, gestion des utilisateurs, visualisation des stats par service
- [ ] **Questions depuis la BDD** — remplacer les JSON locaux par un fetch depuis la table `questions` Supabase (permettra de mettre à jour les questions sans redéployer)
- [ ] **Appels IA** — A terme, l'objectif est de remplacer les fichiers JSON par des appels API a une IA qui va générer de nouvelles questions pour les stocker dans la base
- [ ] **Notifications push** — rappel hebdomadaire pour compléter le quiz
- [ ] **Mode audio** — lecture des questions et des réponses (accessibilité)
- [ ] **Photo de profil depuis CreateAccount** — actuellement désactivé (code commenté), à réactiver avec le bucket Storage
- [ ] **SSO Google / Microsoft Azure AD** — configuré côté Supabase mais pas encore activé dans l'app

### UX / Design

- [ ] **Jauge Home** — adapter la taille dynamiquement selon la largeur du card (100% width responsive)
- [ ] **Animations de transition** — entre les pages (slide, fade)
- [ ] **Dark mode** — support du mode sombre système
- [ ] **Multi-langue** — l'infrastructure existe (localStorage `pref_lang`), ajouter les traductions EN/ES/DE
- [ ] **Onboarding rejoué** — possibilité de revoir l'onboarding depuis les paramètres

### Performance & technique

- [ ] **Génération des types Supabase** — automatiser `npx supabase gen types typescript` en CI
- [ ] **Tests** — ajouter des tests unitaires sur la logique adaptative (`quizResults.ts`) et les validations
- [ ] **Service Worker / PWA** — manifeste et cache pour usage hors-ligne
- [ ] **Vue Supabase `daily_ranking`** — créer la vue SQL du classement quotidien (définie dans `DATABASE_SCHEMA.md`)
- [ ] **Préférences sonores actives** — brancher `pref_music` / `pref_sounds` / `pref_volume` sur un contexte audio réel
- [ ] **Préférences confidentialité actives** — brancher `priv_leaderboard` sur la requête du Leaderboard pour masquer les utilisateurs qui ont désactivé la visibilité
