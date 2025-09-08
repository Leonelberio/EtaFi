# 🧪 Test du Système de Comptabilité

## Tests de Base

### 1. Vérification du Schéma Prisma

```bash
# Valider le schéma
npx prisma validate

# Générer le client
npx prisma generate

# Vérifier la connexion DB
npx prisma db pull
```

### 2. Test des Routes API

#### Test des Codes de Taxe

```bash
# Créer un code de taxe
curl -X POST http://localhost:3000/api/tax-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TVA18",
    "label": "TVA 18%",
    "rate": 0.18,
    "accountCollectedNumber": "44571",
    "accountDeductibleNumber": "44566"
  }'

# Lister les codes de taxe
curl http://localhost:3000/api/tax-codes
```

#### Test des Activités

```bash
# Créer une activité
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Activity"
  }'

# Lister les activités
curl http://localhost:3000/api/activities
```

#### Test des Factures

```bash
# Créer une facture d'achat
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PURCHASE",
    "date": "2024-01-15",
    "ref": "TEST-001",
    "vendorId": "vendor_id_here",
    "lines": [{
      "activityId": "activity_id_here",
      "groupCode": "M",
      "description": "Test achat",
      "amountHT": 1000,
      "taxCodeId": "tax_code_id_here"
    }]
  }'

# Poster la facture
curl -X POST http://localhost:3000/api/invoices/invoice_id_here/post
```

### 3. Test de l'Interface

1. **Accéder à la page** : `http://localhost:3000/dashboard/tax-codes`
2. **Créer un code de taxe** via le formulaire
3. **Vérifier la liste** des codes créés
4. **Tester la validation** avec des données invalides

## Tests Avancés

### Test du Posting

```typescript
// Vérifier que les écritures sont équilibrées
const journalLines = await prisma.journalLine.findMany({
  where: { entryId: "entry_id" }
});

const totalDebit = journalLines.reduce((sum, line) => sum + Number(line.debit), 0);
const totalCredit = journalLines.reduce((sum, line) => sum + Number(line.credit), 0);

console.log(`Débit: ${totalDebit}, Crédit: ${totalCredit}`);
console.log(`Équilibré: ${Math.abs(totalDebit - totalCredit) < 0.01}`);
```

### Test Multi-Tenant

```typescript
// Vérifier que les données sont bien filtrées par organisation
const taxCodes = await prisma.taxCode.findMany({
  where: { organizationId: "org1" }
});

// Ne doit retourner que les codes de l'organisation 1
console.log(`Codes trouvés: ${taxCodes.length}`);
```

## Tests de Performance

### Test de Charge

```bash
# Test avec Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/tax-codes

# Test avec wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/tax-codes
```

### Test de Base de Données

```bash
# Vérifier les index
npx prisma studio

# Analyser les requêtes lentes
# (dépend de votre base de données)
```

## Tests de Sécurité

### Test d'Authentification

```bash
# Test sans authentification
curl http://localhost:3000/api/tax-codes
# Doit retourner 401 Unauthorized

# Test avec token invalide
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/tax-codes
# Doit retourner 401 Unauthorized
```

### Test Multi-Tenant

```typescript
// Vérifier qu'un utilisateur ne peut pas accéder aux données d'une autre organisation
const otherOrgData = await prisma.taxCode.findFirst({
  where: { 
    id: "tax_code_id",
    organizationId: "other_org_id" // Organisation différente
  }
});

// Doit retourner null
console.log(`Accès interdit: ${otherOrgData === null}`);
```

## Tests d'Intégration

### Workflow Complet

1. **Créer** un code de taxe
2. **Créer** une activité
3. **Créer** un fournisseur
4. **Créer** une facture d'achat
5. **Poster** la facture
6. **Vérifier** les écritures comptables
7. **Vérifier** l'équilibre débit/crédit

### Validation des Données

```typescript
// Tester les contraintes de validation
const invalidTaxCode = {
  code: "", // Trop court
  label: "", // Trop court
  rate: 1.5 // Hors limites
};

// Doit échouer avec Zod
try {
  taxCodeSchema.parse(invalidTaxCode);
} catch (error) {
  console.log("Validation échouée comme attendu:", error.errors);
}
```

## Résolution des Problèmes

### Erreurs Communes

1. **Connexion DB échouée**
   - Vérifier DATABASE_URL dans .env.local
   - Vérifier que PostgreSQL est démarré

2. **Schéma Prisma invalide**
   - Exécuter `npx prisma validate`
   - Vérifier les relations manquantes

3. **Authentification échouée**
   - Vérifier NEXTAUTH_SECRET
   - Vérifier la configuration NextAuth

4. **Erreurs de validation**
   - Vérifier les schémas Zod
   - Vérifier les types TypeScript

### Logs et Debug

```bash
# Activer les logs Prisma
DEBUG="prisma:*" pnpm dev

# Vérifier les logs Next.js
tail -f .next/server.log

# Vérifier la base de données
npx prisma studio
```

## Métriques de Qualité

- **Couverture de tests** : Objectif >80%
- **Temps de réponse API** : <200ms
- **Taux d'erreur** : <1%
- **Performance DB** : <100ms par requête
- **Sécurité** : 0 vulnérabilités critiques
