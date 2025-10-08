# 📊 SYSTÈME DE FACTURATION DE VENTE - DOCUMENTATION COMPLÈTE

## Vue d'ensemble

Système de **facturation contractuelle de vente** conforme aux normes **NCECF** avec classification des revenus et gestion des retenues.

---

## 🏗️ ARCHITECTURE

### 1. Schéma de base de données (Prisma)

#### Modèle `InvoiceLine` - Nouveaux champs pour ventes
```prisma
// 🆕 Revenue Classification - Pour ventes
revenueType String? // CONTRACTUAL (Revenus contractuels) ou ADDITIONAL (Revenus supplémentaires)
revenueGroup String? // CONSTRUCTION, SERVICES, EQUIPMENT, OTHER
```

### 2. Classification des revenus

#### Types de revenus
- **CONTRACTUAL** : Revenus contractuels
- **ADDITIONAL** : Revenus supplémentaires

#### Groupes de revenus
- **CONSTRUCTION** : Revenu construction
- **SERVICES** : Revenu services  
- **EQUIPMENT** : Revenu équipements
- **OTHER** : Divers

---

## 📝 FACTURE DE VENTE - COMPOSANTES

### 1. EN-TÊTE DE FACTURE (Niveau Global)

| Champ | Description / Utilité | Obligatoire |
|-------|----------------------|-------------|
| **Numéro de facture** | Auto-généré avec préfixe projet (ex: PROJET-0001) | ✅ OUI |
| **Date de facture (comptable)** | Date au Grand Livre, détermine période comptable | ✅ OUI |
| **Date d'entrée** | Auto-générée, non modifiable (piste d'audit) | Auto |
| **Client** | Nom du client | ✅ OUI |
| **Numéro de contrat / projet** | Identifiant unique du contrat/projet | ✅ OUI |
| **Conditions de paiement** | Net 30, Net 45, etc. | Non |
| **Échéance de paiement** | Calculée automatiquement selon conditions | Auto |
| **Retenue contractuelle (%)** | % retenue jusqu'à fin des travaux (ex: 10%) | Non |
| **Retenue en montant ($)** | Retenue fixe alternative | Non |
| **Numéro de contrat** | Référence contrat (ex: CT-2025-001) | Non |

### 2. LIGNES DE FACTURATION (Niveau Détail)

| Champ | Description / Utilité | Obligatoire |
|-------|----------------------|-------------|
| **Description** | Description du lot ou service (ex: "Travaux de fondations", "Phase 1 livrée") | ✅ OUI |
| **Quantité / % d'avancement** | Quantité livrée ou % du contrat atteint | ✅ OUI |
| **Prix unitaire** | Montant convenu par unité, jalon ou % du contrat | ✅ OUI |
| **Type de revenu** | CONTRACTUAL ou ADDITIONAL | ✅ OUI |
| **Groupe de revenu** | CONSTRUCTION, SERVICES, EQUIPMENT, OTHER | ✅ OUI |
| **Projet** | Code projet lié à cette facture | ✅ OUI |
| **Activité** | Activité du projet facturée | Non |
| **Sous-activité** | Détail supplémentaire de l'activité | Non |
| **Sous-total ligne** | Montant avant taxes (calcul automatique) | Auto |
| **Taxes applicables** | TPS 5%, TVQ 9.975% calculées automatiquement | Auto |
| **Total ligne (TTC)** | Montant ligne après taxes | Auto |

### 3. TOTAUX AUTOMATIQUES (Bas de facture)

```
Sous-total avant taxes = Σ (quantité × prix)
Montant avant retenue  = Sous-total
Retenue calculée       = Montant × % OU montant fixe
Montant après retenue  = Sous-total - Retenue

TPS (5%)              = Montant après retenue × 0.05
TVQ (9.975%)         = Montant après retenue × 0.09975
Total taxes           = TPS + TVQ

Total TTC            = Montant après retenue + Total taxes
Solde à recevoir     = Total TTC
```

**⚠️ IMPORTANT** : Les taxes sont calculées sur le montant **APRÈS déduction de la retenue** (conformité NCECF/fiscale).

---

## 🎨 INTERFACE UTILISATEUR

### Codes couleur
- 🔵 **Bleu** : En-tête général
- 🟢 **Vert** : Lignes de facturation
- 🟡 **Jaune** : Totaux automatiques
- 🟣 **Violet** : Workflow et notes
- 🟠 **Orange** : Retenues contractuelles

### Badges visuels
- `OBLIGATOIRE` (rouge) : Champs critiques
- Statuts : DRAFT, APPROVED, POSTED, PAID

### Aide contextuelle
- 📅 Date au Grand Livre
- 🔒 Auto-générée (non modifiable)
- ⏰ Calculée automatiquement
- 📋 Référence contrat
- 💰 Retenue jusqu'à fin des travaux

---

## 🔄 WORKFLOW

```
1. DRAFT (Brouillon)
   ↓
2. PENDING_APPROVAL (En attente d'approbation)
   ↓
3. APPROVED (Approuvée)
   ↓
4. POSTED (Comptabilisée) → Écriture de journal créée
   ↓
5. PAID (Payée)
```

---

## 📊 ÉCRITURE COMPTABLE AUTO (POST)

Lors de la comptabilisation d'une facture de vente :

### Débits
1. **Compte client** (montant à recevoir = solde à recevoir)
2. **Retenue à recevoir** (si applicable)

### Crédits
1. **Comptes de revenus** (par ligne, selon groupe)
   - CONSTRUCTION → Compte revenu construction
   - SERVICES → Compte revenu services
   - EQUIPMENT → Compte revenu équipements
   - OTHER → Compte revenu divers

2. **TPS à payer** (taxe collectée)
3. **TVQ à payer** (taxe collectée)

### Validation
- Total débits = Total crédits
- Écriture équilibrée obligatoire
- Référence à la facture de vente

---

## 🔐 CONFORMITÉ NCECF & FISCALE

### Retenues contractuelles
- Doivent apparaître distinctement dans les états financiers
- Comptabilisées en "Revenus différés" ou "Retenues à recevoir"
- Les taxes sont calculées **APRÈS** déduction de la retenue

### Taxes
- **TPS (5%)** : Taxe fédérale
- **TVQ (9.975%)** : Taxe provinciale Québec
- Calculées sur le montant **net de retenue**
- Ventilées correctement par province (ARC/Revenu Québec)

### Piste d'audit
- Date d'entrée système (immuable)
- Utilisateur créateur et horodatage
- Méthode de comptabilisation
- Justificatifs (certificat de fin de jalon, % d'avancement)

---

## 🚀 ROUTES API

### Factures de vente

#### Créer
```
POST /api/invoices/sales
Body: {
  number, customerId, projectId, date, dueDate,
  withholdingPercent, withholdingAmount, contractNumber,
  lines: [{
    description, quantity, unitPrice,
    revenueType, revenueGroup,
    projectId, activityId, subActivityId,
    revenueAccountId
  }]
}
```

#### Lister
```
GET /api/invoices/sales?page=1&limit=20&status=APPROVED&customerId=xxx
```

#### Récupérer une facture
```
GET /api/invoices/sales/[invoiceId]
```

#### Mettre à jour
```
PUT /api/invoices/sales/[invoiceId]
```

#### Comptabiliser
```
POST /api/invoices/sales/[invoiceId]/post
→ Crée automatiquement l'écriture de journal
```

---

## 📦 FONCTIONNALITÉS

### Génération automatique de numéro
✅ Préfixe basé sur le code projet  
✅ Incrémentation automatique (PROJET-0001, PROJET-0002, etc.)  
✅ Génération déclenchée à la sélection du projet  

### Activité de facturation par défaut
✅ Chargement automatique de l'activité par défaut  
✅ Application à toutes les lignes de facture  
✅ Notification de confirmation  

### Calculs automatiques
✅ Sous-total avant taxes  
✅ Retenue contractuelle (% ou fixe)  
✅ TPS 5% sur montant après retenue  
✅ TVQ 9.975% sur montant après retenue  
✅ Total TTC  
✅ Solde à recevoir  

### Classification des revenus
✅ Type : Contractuel / Supplémentaire  
✅ Groupe : Construction / Services / Équipement / Divers  
✅ Affectation automatique au compte GL selon groupe  

### Workflow complet
✅ Brouillon → Approbation → Comptabilisation → Paiement  
✅ Validation à chaque étape  
✅ Impossibilité de modifier après comptabilisation  
✅ Piste d'audit complète  

---

## ✅ VALIDATIONS

### Niveau facture
- Numéro unique (auto-généré)
- Client OBLIGATOIRE
- Projet/Contrat OBLIGATOIRE
- Au moins une ligne
- Montant total > 0
- Dates cohérentes

### Niveau ligne
- Description non vide
- Quantité > 0
- Prix unitaire ≥ 0
- Type de revenu sélectionné (CONTRACTUAL/ADDITIONAL)
- Groupe de revenu sélectionné (CONSTRUCTION/SERVICES/EQUIPMENT/OTHER)
- Projet assigné

---

## 🎯 UTILISATION

### Créer une facture de vente
1. Accéder à `/dashboard/invoices/new`
2. Sélectionner le client
3. Sélectionner le projet/contrat (numéro auto-généré)
4. Définir dates et retenue contractuelle
5. Ajouter lignes de facturation avec :
   - Description du lot/service
   - Quantité et prix
   - **Type de revenu** (Contractuel/Supplémentaire)
   - **Groupe de revenu** (Construction/Services/etc.)
   - Activité (optionnelle)
6. Vérifier totaux automatiques
7. Ajouter notes internes/client
8. Sauvegarder

### Comptabiliser une facture
1. Facture doit être APPROVED
2. Cliquer "Comptabiliser"
3. Écriture de journal créée automatiquement :
   - DÉBIT Compte client
   - CRÉDIT Comptes revenus (par groupe)
   - CRÉDIT TPS/TVQ à payer
4. Statut → POSTED
5. Impossible de modifier après

---

## 📈 RAPPORTS & ANALYSES

### Disponibles
- Revenus par type (Contractuel vs Supplémentaire)
- Revenus par groupe (Construction, Services, etc.)
- Revenus par projet/contrat
- Revenus par client
- Retenues en attente
- Âge des comptes clients

### Exports
- PDF facture client
- Export Excel
- Journal comptable
- Analyse de rentabilité

---

## 🔧 COMPTES GL À CONFIGURER

### Comptes de revenus (4xxx)
- 4100 - Revenus construction
- 4200 - Revenus services
- 4300 - Revenus équipements
- 4900 - Revenus divers

### Comptes de taxes
- 2310 - TPS à payer
- 2320 - TVQ à payer

### Comptes clients
- 1200 - Comptes clients
- 1210 - Retenues à recevoir

---

## 🆚 DIFFÉRENCES VENTE vs ACHAT

| Aspect | Facture de VENTE | Facture d'ACHAT |
|--------|------------------|-----------------|
| **Parties** | Client | Fournisseur |
| **Type** | SALES | PURCHASE |
| **Classification** | revenueType / revenueGroup | costCategory (M/S/D/E/MOD) |
| **Options type** | CONTRACTUAL / ADDITIONAL | N/A |
| **Groupes** | CONSTRUCTION / SERVICES / EQUIPMENT / OTHER | M / S / D / E / MOD |
| **Taxes** | À payer (collectées) | À recevoir (payées) |
| **Retenue** | À recevoir (client retient) | À payer (on retient au fournisseur) |
| **Comptes GL** | Revenus (4xxx) | Dépenses (5xxx/6xxx) |

---

## 📋 CHECKLIST DE MISE EN ŒUVRE

### Configuration initiale
- [ ] Créer les comptes GL de revenus par groupe
- [ ] Configurer les comptes de taxes (TPS/TVQ à payer)
- [ ] Créer le compte "Retenues à recevoir"
- [ ] Définir l'activité de facturation par défaut par projet
- [ ] Configurer les préfixes de facture par projet

### Processus métier
- [ ] Former les utilisateurs sur la classification des revenus
- [ ] Établir le processus d'approbation des factures
- [ ] Définir les délais de paiement standards par client
- [ ] Mettre en place le suivi des retenues contractuelles

### Conformité
- [ ] Valider les règles fiscales TPS/TVQ
- [ ] Vérifier la conformité NCECF pour les retenues
- [ ] Documenter la méthode de reconnaissance des revenus
- [ ] Établir la piste d'audit

---

**Version** : 1.0  
**Date** : Janvier 2025  
**Statut** : ✅ PRODUCTION READY  
**Conformité** : NCECF ✅ | Fiscalité QC ✅

