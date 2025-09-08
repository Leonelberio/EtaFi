# 🗄️ Configuration de la Base de Données

## Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (optionnel)
RESEND_API_KEY="your-resend-api-key"
```

## Configuration de la Base de Données

### 1. PostgreSQL Local

```bash
# Installer PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Créer une base de données
createdb compta_projet

# Ou via psql
psql -U postgres
CREATE DATABASE compta_projet;
```

### 2. Base de Données Cloud (Recommandé)

- **Neon** : https://neon.tech
- **Supabase** : https://supabase.com
- **Railway** : https://railway.app

### 3. Mise à Jour du Schéma

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base
npx prisma db push

# Ou créer une migration
npx prisma migrate dev --name add_accounting_system
```

### 4. Seed de Base

```bash
# Exécuter le seed
npx tsx prisma/seed.ts

# Vérifier les données
npx prisma studio
```

## Structure de la Base

### Tables Principales

- `Organization` - Organisations multi-tenant
- `TaxCode` - Codes de taxe (TVA18, TVA20...)
- `ChartAccount` - Plan comptable (401, 411, 445...)
- `Project` - Projets (ADMIN, BILLABLE)
- `Activity` - Activités avec codes 6 chiffres
- `Vendor` - Fournisseurs avec compte 401
- `Customer` - Clients avec compte 411
- `Invoice` - Factures avec lignes
- `JournalEntry` - Écritures comptables
- `JournalLine` - Lignes d'écritures
- `PostingMap` - Mapping compte par groupe

### Relations Clés

- Chaque entité appartient à une `Organization`
- Les factures génèrent des `JournalEntry`
- Les `PostingMap` définissent les comptes par type/groupe
- Les codes de taxe référencent des comptes 445xx

## Sécurité

- **Multi-tenant** : Filtrage automatique par `organizationId`
- **Authentification** : NextAuth avec rôles
- **Validation** : Zod schemas pour toutes les entrées
- **Transactions** : Prisma pour l'intégrité des données

## Performance

- **Index** sur les champs de recherche fréquents
- **Pagination** pour les listes volumineuses
- **Relations** optimisées avec Prisma
- **Cache** possible avec TanStack Query
