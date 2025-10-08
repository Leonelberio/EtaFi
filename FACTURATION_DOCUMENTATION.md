# 📑 SYSTÈME DE FACTURATION - DOCUMENTATION COMPLÈTE

## Vue d'ensemble

Système de facturation conforme aux normes **NCECF** (Normes comptables pour les entreprises à capital fermé) avec gestion distincte des factures de vente et d'achat.

---

## 🏗️ ARCHITECTURE

### 1. Schéma de base de données (Prisma)

#### Modèle `Invoice` (Factures)
```prisma
- Type: SALES ou PURCHASE
- Statuts: DRAFT → PENDING_APPROVAL → APPROVED → POSTED → PAID
- Dates multiples (NCECF):
  * date: Date comptable (Grand Livre)
  * actualDate: Date réelle fournisseur
  * entryDate: Date d'entrée système (auto)
  * dueDate: Échéance paiement
  
- Retenues (construction):
  * withholdingPercent: % retenue
  * withholdingAmount: Montant fixe
  
- Taxes détaillées:
  * gstAmount: TPS (5%)
  * qstAmount: TVQ (9.975%)
  * hstAmount: TVH
  * otherTaxes: Autres
  
- Workflow:
  * approvalStatus: PENDING/APPROVED/REJECTED
  * department: Centre de coût
  * attachmentUrl: PDF/image facture
```

#### Modèle `InvoiceLine` (Lignes)
```prisma
- Description, quantité, prix unitaire
- Affectation:
  * projectId (OBLIGATOIRE pour achats)
  * activityId
  * subActivityId
  * costCategory (M/S/D/E/MOD)
  
- Taxes par ligne
- Compte GL automatique selon groupe
```

---

## 📊 FACTURES DE VENTE

### Composants
- **Formulaire**: `components/InvoiceForm.tsx`
- **Routes API**: `/api/invoices/*`

### Fonctionnalités
✅ Génération automatique numéro avec préfixe projet
✅ Activité de facturation par défaut
✅ Calculs automatiques (sous-total, taxes, total)
✅ Support multi-projets

### Workflow
1. Sélection projet → Auto-génération numéro (`PROJET-0001`)
2. Chargement activité par défaut
3. Saisie lignes de facture
4. Calculs automatiques
5. Sauvegarde et envoi

---

## 🛒 FACTURES D'ACHAT

### Composants
- **Formulaire**: `components/PurchaseInvoiceFormEnhanced.tsx`
- **Routes API**: `/api/invoices/purchase/*`

### EN-TÊTE (Niveau Global)

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| **Numéro facture** | Numéro EXACT du fournisseur | ✅ OUI |
| **Code fournisseur** | Identifiant unique | ✅ OUI |
| **Nom fournisseur** | Auto-affiché selon code | Auto |
| **Projet** | Affectation projet | ✅ OUI |
| **Date comptable** | Date au Grand Livre | ✅ OUI |
| **Date réelle** | Date imprimée fournisseur | Non |
| **Date d'entrée** | Auto-générée système | Auto |
| **Échéance paiement** | Calculée auto (Net 30, etc.) | Auto |
| **Numéro commande** | Bon de commande lié | Non |
| **Retenue %** | % retenue contractuelle (ex: 10%) | Non |
| **Retenue $** | Montant fixe alternatif | Non |

### LIGNES DE SAISIE (Niveau Détail)

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| **Description** | Article/service | ✅ OUI |
| **Quantité** | Nombre d'unités | ✅ OUI |
| **Prix unitaire** | Prix par unité | ✅ OUI |
| **Projet** | Code projet (auto-appliqué) | ✅ OUI |
| **Activité** | Activité du projet | Non |
| **Sous-activité** | Détail supplémentaire | Non |
| **Groupe activité** | M/S/D/E/MOD | ✅ OUI |
| **Compte GL** | Auto-affecté selon groupe | Auto |
| **TPS** | 5% auto-calculé | Auto |
| **TVQ** | 9.975% auto-calculé | Auto |

### TOTAUX AUTOMATIQUES

```
Sous-total avant taxes    = Σ (quantité × prix)
TPS (5%)                  = Sous-total × 0.05
TVQ (9.975%)             = Sous-total × 0.09975
Total TTC                = Sous-total + TPS + TVQ
Retenue calculée         = Sous-total × % OU montant fixe
SOLDE À PAYER           = Total TTC - Retenue
```

### WORKFLOW D'APPROBATION

```
1. DRAFT (Brouillon)
   ↓
2. PENDING_APPROVAL (En attente)
   ↓
3. APPROVED (Approuvée)
   ↓
4. POSTED (Comptabilisée) → Écriture de journal créée
   ↓
5. PAID (Payée)
```

---

## 🔄 ROUTES API

### Factures d'achat

#### Créer
```
POST /api/invoices/purchase
Body: {
  number, vendorId, projectId, date, actualDate, dueDate,
  withholdingPercent, withholdingAmount,
  lines: [{ description, quantity, unitPrice, projectId, costGroup, ... }]
}
```

#### Lister
```
GET /api/invoices/purchase?page=1&limit=20&status=APPROVED&vendorId=xxx
```

#### Récupérer une facture
```
GET /api/invoices/purchase/[invoiceId]
```

#### Mettre à jour
```
PUT /api/invoices/purchase/[invoiceId]
```

#### Approuver
```
POST /api/invoices/purchase/[invoiceId]/approve
Body: { approved: true, comments: "..." }
```

#### Comptabiliser
```
POST /api/invoices/purchase/[invoiceId]/post
→ Crée automatiquement l'écriture de journal
```

#### Supprimer (soft delete)
```
DELETE /api/invoices/purchase/[invoiceId]
→ Marque comme inactive, statut → CANCELLED
```

### Autres routes

#### Générer numéro facture vente
```
POST /api/invoices/generate-number
Body: { projectId }
→ Retourne: { invoiceNumber: "PROJET-0001", nextNumber, prefix }
```

#### Activité de facturation par défaut
```
GET /api/projects/[projectId]/billing-activity
PUT /api/projects/[projectId]/billing-activity
Body: { activityId }
```

---

## 📝 ÉCRITURE COMPTABLE AUTO (POST)

Lors de la comptabilisation d'une facture d'achat :

### Débits
1. **Comptes de dépenses** (par groupe de coût)
   - M → Compte matériel
   - S → Compte sous-traitance
   - D → Compte divers
   - E → Compte équipement
   - MOD → Compte main-d'œuvre

2. **TPS à recevoir** (si applicable)
3. **TVQ à recevoir** (si applicable)

### Crédits
1. **Compte fournisseur** (montant net à payer)
2. **Retenue à payer** (si applicable)

### Validation
- Total débits = Total crédits
- Écriture équilibrée obligatoire
- Référence à la facture d'achat

---

## 🎨 INTERFACE UTILISATEUR

### Codes couleur
- 🔵 **Bleu**: En-tête général
- 🟢 **Vert**: Lignes de saisie
- 🟡 **Jaune**: Totaux calculés
- 🔴 **Rouge**: Champs obligatoires
- 🟠 **Orange**: Alertes/avertissements

### Badges visuels
- `OBLIGATOIRE` (rouge) : Champs critiques
- `Code unique` : Identifiants
- Auto-complétions avec ✅ confirmation

### Aide contextuelle
- 📅 Date au Grand Livre
- 📄 Date imprimée fournisseur
- 🔒 Auto-générée (non modifiable)
- ⏰ Calculée automatiquement
- 📋 Bon de commande lié
- 💰 Retenue contractuelle
- 📌 Bonne pratique NCECF

---

## ✅ VALIDATIONS

### Niveau facture
- Numéro fournisseur unique (par fournisseur)
- Projet OBLIGATOIRE
- Au moins une ligne
- Montant total > 0
- Dates cohérentes
- Pas de modification si POSTED/PAID

### Niveau ligne
- Description non vide
- Quantité > 0
- Prix unitaire ≥ 0
- Groupe de coût sélectionné
- Projet assigné

---

## 🔐 SÉCURITÉ & AUDIT

### Piste d'audit complète
- `createdBy`: Utilisateur créateur
- `createdAt`: Date création
- `approvedBy`: Utilisateur approbateur
- `postedBy`: Utilisateur comptabilisation
- `postedAt`: Date comptabilisation
- `entryDate`: Date saisie (immuable)

### Contrôles d'intégrité
- Validation unicité numéro facture
- Workflow d'approbation obligatoire
- Impossibilité modification après POSTED
- Soft delete (conservation données)
- Traçabilité complète

---

## 📦 FONCTIONNALITÉS AVANCÉES

### Intégration fournisseur
- Pré-remplissage retenue depuis fiche fournisseur
- Groupe de coût par défaut appliqué
- Conditions paiement standards
- Calcul auto échéance

### Calculs intelligents
- Taxes en temps réel par ligne
- Retenue % ou fixe
- Solde à payer net
- Ventilation automatique par groupe

### Workflow robuste
- Statuts multiples
- Approbation multi-niveaux
- Notes publiques/internes
- Pièces jointes (PDF/images)

---

## 🚀 UTILISATION

### Créer une facture d'achat
1. Accéder à `/dashboard/purchase-invoices/new`
2. Saisir numéro facture fournisseur
3. Sélectionner fournisseur (auto-complétion)
4. Sélectionner projet (OBLIGATOIRE)
5. Définir dates et retenue
6. Ajouter lignes de facture
7. Vérifier totaux automatiques
8. Sauvegarder

### Approuver une facture
1. Accéder à la facture en attente
2. Vérifier détails et montants
3. Cliquer "Approuver" ou "Rejeter"
4. Ajouter commentaires si nécessaire

### Comptabiliser une facture
1. Facture doit être APPROVED
2. Cliquer "Comptabiliser"
3. Écriture de journal créée automatiquement
4. Statut → POSTED
5. Impossible de modifier après

---

## 📊 RAPPORTS & ANALYSES

### Disponibles
- Liste factures par statut
- Factures par fournisseur
- Factures par projet
- Âge des comptes fournisseurs
- Retenues en attente

### Exports
- PDF facture
- Export Excel
- Journal comptable
- Balance fournisseurs

---

## 🔧 MAINTENANCE

### Comptes GL à configurer
- Comptes de dépenses par groupe (M/S/D/E/MOD)
- Compte TPS à recevoir
- Compte TVQ à recevoir
- Comptes fournisseurs
- Compte retenue à payer

### Paramètres projet
- Préfixe facture vente
- Activité facturation par défaut
- Conditions paiement standards

---

**Version**: 1.0  
**Dernière mise à jour**: Janvier 2025  
**Conformité**: NCECF (Normes comptables canadiennes)

