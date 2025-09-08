#!/bin/bash

echo "🚀 Installation des dépendances pour le système de comptabilité..."

# Installer les dépendances principales
echo "📦 Installation des dépendances principales..."
pnpm add @hookform/resolvers react-hook-form zod

# Installer les dépendances de développement
echo "🔧 Installation des dépendances de développement..."
pnpm add -D @types/node

echo "✅ Dépendances installées avec succès!"

echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurer votre base de données PostgreSQL"
echo "2. Mettre à jour le schéma Prisma : npx prisma db push"
echo "3. Exécuter le seed : npx tsx prisma/seed.ts"
echo "4. Démarrer l'application : pnpm dev"
echo ""
echo "📚 Consultez COMPTABILITE_README.md pour plus d'informations"
