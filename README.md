# IA Sensibilisation — Ynov Y-Days 2026

Kit de sensibilisation à l'IA pour salariés d'entreprise. Application web qui valorise les **possibilités** de l'IA tout en alertant sur ses **dangers** et ses **limites**, via des sessions de quiz/scénarios de 10 minutes.

> Projet de la semaine interfilière **Y-Days 2026** (Ynov Connect, Mérignac).

## Stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **ESLint**

## Démarrage

```bash
npm install      # installer les dépendances
npm run dev      # serveur local -> http://localhost:5173
npm run build    # build de production -> dist/
npm run preview  # prévisualiser le build de prod
```

## Parcours utilisateur (MVP)

1. **Connexion** — login simulé (SSO Microsoft/Google mocké)
2. **Profilage** — service + niveau IA estimé
3. **Session 10 min** — quiz et scénarios métiers, sans timer
4. **Score & progression** — points, courbe d'évolution, bénéfices acquis

## Déploiement

Build statique déployable sur **Vercel** ou **Netlify** :
- Build command : `npm run build`
- Output directory : `dist`

## Équipe

Groupe interfilière (Full Stack · Product Manager · UX/UI · DA · Comm · Social Media).
