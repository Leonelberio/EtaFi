# 🧪 Test Rapide des API

## Test des Codes de Taxe

### 1. Lister les codes de taxe
```bash
curl http://localhost:3000/api/tax-codes
```

### 2. Créer un nouveau code de taxe
```bash
curl -X POST http://localhost:3000/api/tax-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TVA25",
    "label": "TVA 25%",
    "rate": 0.25,
    "accountCollectedNumber": "44571",
    "accountDeductibleNumber": "44566"
  }'
```

## Test des Activités

### 1. Lister les activités
```bash
curl http://localhost:3000/api/activities
```

### 2. Créer une nouvelle activité
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Activity"
  }'
```

## Test des Comptes Comptables

### 1. Lister les comptes
```bash
curl http://localhost:3000/api/chart-accounts
```

## Test du Grand Livre

### 1. Récupérer les écritures
```bash
curl "http://localhost:3000/api/ledger?limit=10"
```

## Test avec l'Interface

1. **Ouvrir** : http://localhost:3000/dashboard/tax-codes
2. **Créer** un code de taxe via le formulaire
3. **Vérifier** qu'il apparaît dans la liste

## Vérification des Données

### Via Prisma Studio
```bash
npx prisma studio
```

### Via la Base de Données
```sql
-- Vérifier les codes de taxe
SELECT * FROM "TaxCode";

-- Vérifier les activités
SELECT * FROM "Activity";

-- Vérifier les comptes
SELECT * FROM "ChartAccount";

-- Vérifier les mappings
SELECT * FROM "PostingMap";
```

## Résolution des Problèmes

### Erreur 401 Unauthorized
- Vérifier que l'authentification NextAuth est configurée
- Vérifier que l'utilisateur a accès à une organisation

### Erreur de Validation
- Vérifier que les données respectent les schémas Zod
- Vérifier les types et formats des champs

### Erreur de Base de Données
- Vérifier la connexion PostgreSQL
- Vérifier que le schéma Prisma est synchronisé
