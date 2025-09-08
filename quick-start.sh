#!/bin/bash

echo "🚀 Démarrage rapide du système de comptabilité..."

# Vérifier que pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm n'est pas installé. Installez-le d'abord :"
    echo "npm install -g pnpm"
    exit 1
fi

# Vérifier que Prisma est installé
if ! command -v npx &> /dev/null; then
    echo "❌ npx n'est pas installé. Installez Node.js d'abord."
    exit 1
fi

echo "📦 Installation des dépendances..."
pnpm install

echo "🗄️ Configuration de la base de données..."
echo "⚠️  Assurez-vous d'avoir configuré votre DATABASE_URL dans .env.local"

read -p "Voulez-vous continuer avec la configuration de la base de données ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Génération du client Prisma..."
    npx prisma generate
    
    echo "📊 Mise à jour du schéma de base de données..."
    npx prisma db push
    
    echo "🌱 Exécution du seed de base..."
    npx tsx prisma/seed.ts
    
    echo "🎉 Configuration terminée !"
else
    echo "⏭️  Étape de base de données ignorée"
fi

echo ""
echo "🎯 Prochaines étapes :"
echo "1. Configurer votre .env.local avec DATABASE_URL"
echo "2. Exécuter : npx prisma db push"
echo "3. Exécuter : npx tsx prisma/seed.ts"
echo "4. Démarrer : pnpm dev"
echo ""
echo "📚 Documentation : COMPTABILITE_README.md"
echo "🗄️  Configuration DB : database-setup.md"
