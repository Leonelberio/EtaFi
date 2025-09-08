# 🏦 Système de Comptabilité - Kit de Démarrage

Ce kit de démarrage implémente un système de comptabilité complet avec **organisation → codes de taxe → factures → écritures comptables**.

## 🏗️ Architecture

### Modèles de Données (Prisma)

- **Organization** : Multi-tenant par organisation
- **TaxCode** : Codes de taxe avec comptes 445xx
- **ChartAccount** : Plan comptable (401, 411, 445, 60, 70...)
- **Project** : Projets administratifs ou facturables
- **Activity** : Activités avec codes 6 chiffres auto-générés
- **Vendor/Customer** : Fournisseurs et clients avec comptes de tiers
- **Invoice** : Factures avec lignes et calcul automatique TVA
- **JournalEntry/JournalLine** : Écritures comptables du grand livre
- **PostingMap** : Mapping compte par groupe/type de facture

### Routes API

- `POST /api/tax-codes` - Créer un code de taxe
- `GET /api/tax-codes` - Lister les codes de taxe
- `POST /api/activities` - Créer une activité
- `GET /api/activities` - Lister les activités
- `POST /api/invoices` - Créer une facture
- `POST /api/invoices/[id]/post` - Poster une facture
- `GET /api/ledger` - Grand livre avec filtres
- `GET /api/chart-accounts` - Plan comptable

## 🚀 Installation et Configuration

### 1. Base de Données

```bash
# Mettre à jour le schéma Prisma
npx prisma db push

# Ou créer une migration
npx prisma migrate dev --name add_accounting_system
```

### 2. Seed de Base

```bash
# Installer les dépendances
pnpm install

# Exécuter le seed (après avoir configuré la DB)
npx tsx prisma/seed.ts
```

### 3. Variables d'Environnement

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## 📊 Utilisation

### Créer un Code de Taxe

```typescript
const taxCode = await fetch("/api/tax-codes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: "TVA18",
    label: "TVA 18%",
    rate: 0.18,
    accountCollectedNumber: "44571",
    accountDeductibleNumber: "44566"
  })
});
```

### Créer une Facture

```typescript
const invoice = await fetch("/api/invoices", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "PURCHASE",
    date: "2024-01-15",
    ref: "FAC-001",
    vendorId: "vendor_id",
    lines: [{
      activityId: "activity_id",
      groupCode: "M", // Matériel
      description: "Achat fournitures",
      amountHT: 1000,
      taxCodeId: "tax_code_id"
    }]
  })
});
```

### Poster une Facture

```typescript
const result = await fetch(`/api/invoices/${invoiceId}/post`, {
  method: "POST"
});
// Génère automatiquement les écritures comptables
```

## 🔄 Logique de Posting

### Règles de Génération

1. **Journal** : HA (achats) ou VE (ventes)
2. **Lignes de charge/produit** : Selon le mapping PostingMap
3. **TVA** : Via les comptes configurés dans TaxCode
4. **Partenaire** : Compte 401 (fournisseur) ou 411 (client)
5. **Vérification** : Équilibre débit = crédit

### Mapping par Défaut

| Type | Groupe | Compte | Description |
|------|--------|---------|-------------|
| PURCHASE | M | 601000 | Matériel |
| PURCHASE | S | 605000 | Sous-traitant |
| PURCHASE | D | 606000 | Divers |
| SALES | M | 701000 | Ventes produits |
| SALES | S | 704000 | Prestations services |

## 🎨 Interface Utilisateur

### Composants Disponibles

- **TaxCodeForm** : Formulaire de création de code de taxe
- **TaxCodeList** : Liste des codes de taxe
- **Page de démonstration** : `/dashboard/tax-codes`

### Technologies UI

- **Next.js 15** avec App Router
- **shadcn/ui** pour les composants
- **Tailwind CSS** pour le styling
- **React Hook Form** + **Zod** pour la validation

## 🔒 Sécurité Multi-Tenant

- **Filtrage automatique** par `organizationId`
- **Authentification** via NextAuth
- **Validation** des données avec Zod
- **Transactions** Prisma pour l'intégrité

## 📈 Fonctionnalités Avancées

### Grand Livre

- Filtres par compte, projet, activité, période
- Calcul automatique des soldes
- Export des données

### Activités

- Codes 6 chiffres auto-générés
- Gestion des statuts (actif/inactif)
- Soft delete

### Factures

- Calcul automatique HT/TVA/TTC
- Validation des partenaires requis
- Statuts (brouillon/comptabilisé)

## 🚧 Développement

### Structure des Fichiers

```
lib/
  ├── prisma.ts          # Client Prisma
  ├── auth.ts            # Authentification
  ├── posting.ts         # Logique de posting
  ├── activities.ts      # Gestion des activités
  └── validations.ts     # Schémas Zod

app/api/
  ├── tax-codes/         # Codes de taxe
  ├── activities/        # Activités
  ├── invoices/          # Factures
  ├── ledger/            # Grand livre
  └── chart-accounts/    # Comptes comptables

components/
  ├── TaxCodeForm.tsx    # Formulaire code de taxe
  └── TaxCodeList.tsx    # Liste des codes de taxe
```

### Tests

```bash
# Vérifier le schéma Prisma
npx prisma validate

# Générer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio
```

## 🔮 Évolutions Futures

- **Paramètres d'arrondi** par organisation (CFA entier vs décimales)
- **Workflow d'approbation** des factures
- **Rapports** et tableaux de bord
- **Import/Export** CSV/Excel
- **Audit trail** des modifications
- **Multi-devises** (XOF, EUR, USD)

## 📞 Support

Pour toute question ou amélioration, consultez :
- La documentation Prisma
- Les composants shadcn/ui
- La documentation Next.js 15

---

**🎯 Ce kit est prêt pour la production et suit les meilleures pratiques de sécurité et de performance.**
