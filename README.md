# Frontend Trio - Application de Gestion des Demandes

## Description

Application frontend développée avec Next.js pour la gestion des demandes d'achat. Cette application permet de visualiser, créer, modifier et gérer le cycle de vie complet des demandes d'achat avec un système de validation et de workflow.

## 🚀 Technologies Utilisées

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : Shadcn/ui
- **Form Management** : React Hook Form
- **Data Fetching** : TanStack Query
- **Validation** : Zod
- **Icons** : Lucide React
- **Notifications** : Sonner

## 📁 Structure du Projet

```
front/
├── app/                          # Pages et composants Next.js
│   ├── demandes/                 # Module de gestion des demandes
│   │   ├── [id]/                 # Page de détail d'une demande
│   │   │   ├── components/       # Composants modulaires
│   │   │   ├── hooks/           # Hooks personnalisés
│   │   │   └── page.tsx         # Page principale (refactorisée)
│   │   ├── hooks.ts             # Hooks pour les demandes
│   │   ├── page.tsx             # Liste des demandes
│   │   ├── schema.ts            # Schémas de validation
│   │   ├── types.ts             # Types TypeScript
│   │   ├── utils.tsx            # Utilitaires
│   │   └── validation-schema.ts # Schémas Zod
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Page d'accueil
│   └── providers.tsx            # Providers React
├── components/                   # Composants réutilisables
│   ├── ui/                      # Composants UI Shadcn
│   ├── Footer.tsx               # Pied de page
│   └── Header.tsx               # En-tête
├── lib/                         # Utilitaires et configuration
│   ├── api-config.ts            # Configuration API
│   └── utils.ts                 # Utilitaires généraux
├── middleware.ts                # Middleware Next.js
├── public/                      # Assets statiques
└── package.json                 # Dépendances
```

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation des dépendances

```bash
npm install
# ou
yarn install
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Configuration API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Autres variables selon les besoins
```

### Lancement en développement

```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Architecture

### Composants Modulaires

L'application utilise une architecture modulaire avec des composants réutilisables :

- **StatusBadge** : Affichage du statut avec icône et couleur
- **ActionButtons** : Boutons d'action selon le contexte
- **GeneralInfoCard** : Informations générales de la demande
- **FinancialSummaryCard** : Récapitulatif financier
- **ItemsTable** : Tableau des articles commandés
- **ContactInfoCards** : Informations de contact
- **FilesSection** : Gestion des fichiers attachés

### Hooks Personnalisés

- **useValidation** : Validation en temps réel des formulaires
- **useFileManagement** : Gestion des fichiers (upload, suppression, téléchargement)
- **useDemande** : Récupération des données de demande
- **useUpdateDemandeWithJsonFile** : Mise à jour des demandes

### Gestion d'État

- **React Hook Form** : Gestion des formulaires avec validation
- **TanStack Query** : Cache et synchronisation des données
- **useState/useEffect** : État local des composants

## 📋 Fonctionnalités

### Gestion des Demandes

- ✅ Visualisation détaillée des demandes
- ✅ Mode édition avec validation en temps réel
- ✅ Gestion des statuts (Brouillon, En attente, Approuvée, Rejetée, etc.)
- ✅ Actions contextuelles selon le statut
- ✅ Gestion des fichiers (devis, factures)
- ✅ Validation complète des formulaires

### Interface Utilisateur

- ✅ Design responsive avec Tailwind CSS
- ✅ Composants UI modernes avec Shadcn/ui
- ✅ Notifications toast avec Sonner
- ✅ Dialogues de confirmation
- ✅ Tableaux interactifs
- ✅ Formulaires avec validation

### Validation et Sécurité

- ✅ Validation côté client avec Zod
- ✅ Validation en temps réel
- ✅ Gestion des erreurs
- ✅ Types TypeScript stricts

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancement en production
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## 📦 Build et Déploiement

### Build de Production

```bash
npm run build
```

### Déploiement

L'application peut être déployée sur :
- Vercel (recommandé pour Next.js)
- Netlify
- AWS Amplify
- Serveur Node.js traditionnel

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Conventions de Code

### TypeScript
- Utiliser des types stricts
- Éviter `any` autant que possible
- Documenter les interfaces complexes

### React
- Utiliser des composants fonctionnels avec hooks
- Préférer les props typées
- Utiliser React.memo pour l'optimisation si nécessaire

### CSS
- Utiliser Tailwind CSS en priorité
- Éviter les styles inline
- Respecter la hiérarchie des classes

## 🐛 Débogage

### Outils de Développement

- React Developer Tools
- Next.js DevTools
- TanStack Query DevTools

### Logs

```bash
# Logs détaillés
DEBUG=* npm run dev

# Logs Next.js uniquement
DEBUG=next:* npm run dev
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- Développé par l'équipe Trio
- Support : [email@trio.com](mailto:email@trio.com)

---

**Note** : Ce README est un document vivant qui sera mis à jour au fur et à mesure de l'évolution du projet.
