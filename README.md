# SolarQuote Pro

Application web destinée aux installateurs de modules photovoltaïques pour créer des devis précis et centraliser tous leurs projets clients.

## Description

SolarQuote Pro offre des outils de simulation basés sur l'adresse du client, permettant d'optimiser la pose des panneaux solaires et de calculer automatiquement la production énergétique et les économies réalisables.

## Fonctionnalités principales

- Gestion et centralisation des projets clients
- Génération de devis précis en quelques minutes
- Récupération automatique de la consommation électrique via PDL
- Visualisation de la toiture du client via son adresse
- Définition d'une zone de calepinage sur la toiture
- Simulation automatique de la production d'électricité
- Sauvegarde et génération d'offres commerciales complètes

## Technologies

- **Frontend**: React.js avec Next.js, Tailwind CSS
- **Backend**: Supabase (authentification, base de données, stockage)
- **APIs**: Enedis, Cartographie, Météo et ensoleillement

## Structure du projet

- `/app`: Routes et composants principaux de l'application Next.js
- `/components`: Composants réutilisables
- `/lib`: Utilitaires et services
- `/public`: Ressources statiques
- `/styles`: Feuilles de style globales

## Installation

```bash
npm install
npm run dev
```

## Environnement de développement

Copier le fichier `.env.example` vers `.env.local` et remplir les variables d'environnement nécessaires pour Supabase et les autres APIs.