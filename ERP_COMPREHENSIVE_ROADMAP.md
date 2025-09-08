# 🏗️ ERP Comptable Web - Plan de Développement Complet
## Basé sur le Cahier des Charges Révisé

---

## 📋 **RÉSUMÉ EXÉCUTIF**

### Vision Globale
Développer une application web complète de comptabilité et gestion par projet conforme aux **NCECF** et à la **LPRPDE**, destinée aux PME canadiennes (construction, ingénierie, services professionnels, commerce).

### Caractéristiques Clés
- **Multi-entreprise, multi-utilisateur, multi-exercice**
- **Comptabilité par projet** avec ventilation analytique fine
- **Automatisation IA** des tâches répétitives
- **Workflow Purchase-to-Pay** complet
- **5 groupes de coûts universels** (Matériel, Sous-traitance, Équipement, Main-d'œuvre, Divers)
- **Conformité NCECF/LPRPDE** avec piste d'audit immuable

---

## 🎯 **PHASES DE DÉVELOPPEMENT**

### **PHASE 0: FONDATIONS** ✅ *COMPLÉTÉ*
- [x] Setup Next.js 15 + TypeScript + Tailwind CSS
- [x] Authentication NextAuth avec RBAC simplifié
- [x] Base de données Prisma + PostgreSQL
- [x] Interface moderne avec shadcn/ui + design system cohérent
- [x] CRUD complet: Organizations (avec edit/delete/manage)
- [x] CRUD complet: Customers/Clients (avec edit/delete)
- [x] CRUD complet: Projects (avec gestion complète)
- [x] CRUD de base: Vendors/Fournisseurs 
- [x] CRUD de base: Tax Codes (avec page dédiée)
- [x] User Management basique
- [x] Layout responsive avec sidebar moderne
- [x] Pages: Analytics, Reports, Settings, Help
- [x] Chart of Accounts page (structure de base)

### **PHASE 1: INFRASTRUCTURE COMPTABLE** 🔄 *EN COURS*

#### **1.1 Plan Comptable & Grand Livre** ✅ *COMPLÉTÉ*
- [x] **Schéma de base existant** (déjà dans Prisma)
- [x] **Plan comptable fonctionnel**
  - [x] Interface CRUD complète pour comptes GL (ChartAccountForm & ChartAccountList)
  - [x] Gabarits de plans comptables Canadiens (Construction, Services, Petites Entreprises)
  - [x] Types de comptes (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE, TAX)
  - [x] Comptes de contrôle et numérotation NCECF (1000-5999)
  - [x] API routes complètes (/api/chart-accounts et templates)

- [ ] **Journaux comptables**
  - [ ] Journal général
  - [ ] Journal des achats
  - [ ] Journal des ventes  
  - [ ] Journal des déboursés
  - [ ] Journal des recettes
  - [ ] Journal des écritures

- [ ] **Écritures comptables**
  - [ ] Saisie d'écritures manuelles (partie double)
  - [ ] Écritures récurrentes
  - [ ] Validation et équilibrage automatique
  - [ ] Pièces justificatives (upload de fichiers)

#### **1.2 Codes de Taxes (TPS/TVQ/TVH)** ✅ *COMPLÉTÉ*
- [x] **Page Tax Codes existante** (interface de base créée)
- [x] **Configuration des taxes fonctionnelle**
  - [x] CRUD complet pour codes de taxes avec interface moderne canadienne
  - [x] Configuration TPS 5%, TVQ 9.975%, TVH par province
  - [x] Taxes composées et combinées (QST calculée sur TPS + montant)
  - [x] Exemptions et cas particuliers (EXEMPT, ZERO_RATED)
  - [x] **Initialisation automatique** des taxes canadiennes prédéfinies
  - [x] **Composants UI**: TaxCodeForm & TaxCodeList avec préréglages canadiens
  - [x] **API routes**: /api/tax-codes (CRUD complet) + /api/tax-codes/initialize-canadian
  - [x] **Pages**: Liste, Détail, Création, Édition avec navigation complète
  - [x] **Validation**: Codes uniques, calculs composés, exemples de calcul

- [ ] **Rapports de taxes**
  - [ ] Conciliation TPS/TVQ
  - [ ] Taxes à payer/à recevoir
  - [ ] Déclarations préparatoires

#### **1.3 Clôture de période**
- [ ] **Processus de clôture mensuelle**
  - [ ] Verrouillage des transactions
  - [ ] Régularisations automatiques
  - [ ] Amortissements
  - [ ] Report à nouveau

---

### **PHASE 2: GESTION DE PROJETS** ✅ *STRUCTURE DE BASE COMPLÉTÉE*

#### **2.1 Structure des Projets**
- [x] **CRUD complet des projets** (interface moderne créée)
  - [x] Code projet / Nom / Description / Client
  - [x] Gestionnaire principal / Gestionnaire temporaire avec dates
  - [x] Dates début/fin / Budget total en CAD
  - [x] Statut (ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
  - [x] Type de projet (BILLABLE, ADMIN)
  - [x] Pages: Liste, Détail, Création, Édition

- [x] **Activités et Sous-activités** ✅ *COMPLÉTÉ*
  - [x] Création d'activités avec codes (ex: 01010, 01135, 01220)
  - [x] Sous-activités optionnelles (ex: 01010-01, 01010-02)
  - [x] Budget par activité/sous-activité avec ventilation 5 groupes
  - [x] Liens vers comptes GL et écritures journal
  - [x] **Composants UI**: ActivityForm & ActivityList avec interface professionnelle
  - [x] **API routes**: /api/projects/[id]/activities (CRUD complet)
  - [x] **Pages**: Gestion d'activités intégrée aux projets
  - [x] **Suivi budgétaire**: Budget vs Réel par groupe de coûts (M, S, D, E, MOD)
  - [x] **Hiérarchie**: Projet → Activités → Sous-activités → Écritures

- [x] **Groupes de coûts (5 groupes universels)** ✅ *COMPLÉTÉ*
  - [x] **Matériel & Fournitures** (M) - 📦 Blue #3B82F6
  - [x] **Sous-traitance & Services externes** (S) - 🤝 Purple #8B5CF6  
  - [x] **Équipement & Immobilisations** (E) - 🔧 Green #10B981
  - [x] **Main-d'œuvre & Charges sociales** (MOD) - 👥 Red #EF4444
  - [x] **Frais généraux & Divers** (D) - 📋 Amber #F59E0B
  - [x] **UI complète**: CostCategoryList & CostCategoryForm avec couleurs/icônes
  - [x] **API**: /api/cost-categories (CRUD) + /api/cost-categories/initialize
  - [x] **Navigation**: Ajouté "Catégories de Coûts" dans la sidebar
  - [x] **Base de données**: Modèle CostCategory dans Prisma schema

#### **2.2 Gabarits de Projets**
- [ ] **Modèles réutilisables**
  - [ ] Templates avec activités pré-définies
  - [ ] Budgets types par secteur
  - [ ] Application de template à nouveau projet

#### **2.3 Budgétisation**
- [ ] **Budget par projet/activité/sous-activité**
  - [ ] Ventilation par groupe (M, S, E, MOD, D)
  - [ ] Révisions budgétaires avec historique
  - [ ] Alertes de dépassement

#### **2.4 Transferts de coûts**
- [ ] **Mouvements inter-projets**
  - [ ] Transfert entre projets/activités
  - [ ] Écritures de virement avec approbation
  - [ ] Piste d'audit des transferts

---

### **PHASE 3: WORKFLOW PURCHASE-TO-PAY** 

#### **3.1 Réception et Classement des Courriels**
- [ ] **Automatisation des emails**
  - [ ] Adresse dédiée (ap@entreprise.ca)
  - [ ] Classification automatique des factures
  - [ ] OCR pour extraction d'informations
  - [ ] Liaison automatique avec BC existants

#### **3.2 Système de Réquisitions**
- [ ] **Demandes d'achat**
  - [ ] Création de réquisitions par demandeur
  - [ ] Sélection projet/activité/sous-activité/groupe
  - [ ] Workflow d'approbation configurable
  - [ ] Notifications automatiques

#### **3.3 Bons de Commande (BC)**
- [ ] **Génération des BC**
  - [ ] Création depuis réquisition approuvée
  - [ ] Seuils d'approbation par montant
  - [ ] Envoi automatique au fournisseur
  - [ ] Suivi des livraisons partielles

#### **3.4 Réception de Marchandises**
- [ ] **Confirmation de réception**
  - [ ] Interface mobile pour magasin/chantier
  - [ ] Validation quantité/qualité
  - [ ] Gestion des écarts
  - [ ] Photos et commentaires

#### **3.5 Factures Fournisseurs**
- [ ] **Traitement automatisé**
  - [ ] Matching automatique BC/Réception/Facture
  - [ ] Validation des prix, quantités, taxes
  - [ ] Workflow d'approbation par exception
  - [ ] Tolérance d'écarts paramétrables

#### **3.6 Approbations**
- [ ] **Matrices d'approbation**
  - [ ] Règles par projet/département/montant
  - [ ] Délégations et remplacements
  - [ ] Notifications et relances
  - [ ] Piste d'audit complète

#### **3.7 Comptabilisation**
- [ ] **Enregistrement automatique**
  - [ ] Ventilation projet/activité/sous-activité/groupe
  - [ ] Liaison automatique avec comptes GL
  - [ ] Gestion des retenues contractuelles
  - [ ] Immutabilité post-comptabilisation

---

### **PHASE 4: GESTION DES VENTES & FACTURATION**

#### **4.1 Clients et Devis**
- [x] **Gestion clientèle de base** (CRUD complet existant)
  - [x] Fiche client complète (CustomerForm/CustomerList)
  - [x] Informations de contact et adresse
  - [x] Liaison avec organisations
  - [ ] Historique des projets
  - [ ] Conditions de paiement
  - [ ] Limites de crédit

- [ ] **Création de devis**
  - [ ] Templates de devis par secteur
  - [ ] Conversion devis → facture
  - [ ] Versions et révisions

#### **4.2 Facturation**
- [ ] **Factures projet**
  - [ ] Facturation par étapes/jalons
  - [ ] Facturation temps & matériel
  - [ ] Retenues de garantie
  - [ ] Révisions et avoirs

- [ ] **Recettes**
  - [ ] Encaissement sur factures
  - [ ] Recettes diverses (subventions)
  - [ ] Rapprochement bancaire
  - [ ] Comptes à recevoir

---

### **PHASE 5: PAIE SIMPLIFIÉE**

#### **5.1 Employés et Feuilles de Temps**
- [ ] **Gestion des employés**
  - [ ] Fiche employé de base
  - [ ] Taux horaires par projet
  - [ ] Départements et équipes

- [ ] **Saisie du temps**
  - [ ] Feuilles de temps hebdomadaires
  - [ ] Ventilation projet/activité/sous-activité
  - [ ] Validation par gestionnaire de projet
  - [ ] Interface mobile pour chantier

#### **5.2 Répartition des Coûts**
- [ ] **Allocation automatique**
  - [ ] Import des coûts de paie externe
  - [ ] Répartition au prorata des heures
  - [ ] Charges sociales et avantages
  - [ ] Intégration aux projets

---

### **PHASE 6: RAPPORTS & ÉTATS FINANCIERS**

#### **6.1 États Financiers NCECF**
- [ ] **États principaux**
  - [ ] Bilan
  - [ ] État des résultats
  - [ ] État des capitaux propres
  - [ ] État des flux de trésorerie

- [ ] **Comparatifs et périodes multiples**
  - [ ] Exercices comparatifs
  - [ ] Périodes intermédiaires
  - [ ] Budgets vs réel

#### **6.2 Rapports de Gestion**
- [ ] **Grand livre et balances**
  - [ ] Grand livre détaillé
  - [ ] Balance de vérification
  - [ ] Balance âgée (AP/AR)

- [ ] **Rapports de projets**
  - [ ] Coûts réels par projet
  - [ ] Budget vs réel détaillé
  - [ ] Rentabilité par projet
  - [ ] Tableaux de bord en temps réel

#### **6.3 Exports et Mise en Forme**
- [ ] **Formats multiples**
  - [ ] Export PDF professionnel
  - [ ] Export Excel avec formules
  - [ ] Personnalisation des en-têtes
  - [ ] Logos et branding

---

### **PHASE 7: AUTOMATISATION IA** 

#### **7.1 Classification Automatique**
- [ ] **Machine Learning**
  - [ ] Reconnaissance OCR des factures
  - [ ] Classification automatique des dépenses
  - [ ] Proposition de ventilation analytique
  - [ ] Apprentissage des habitudes utilisateur

#### **7.2 Analyses Prédictives**
- [ ] **Intelligence financière**
  - [ ] Prévisions de trésorerie
  - [ ] Détection d'anomalies
  - [ ] Alertes de performance projet
  - [ ] Recommandations d'optimisation

#### **7.3 Rapprochements Automatiques**
- [ ] **Conciliation bancaire IA**
  - [ ] Matching automatique des transactions
  - [ ] Proposition d'écritures
  - [ ] Gestion des écarts récurrents

---

### **PHASE 8: SÉCURITÉ & CONFORMITÉ**

#### **8.1 RBAC Avancé**
- [ ] **Rôles granulaires**
  - [ ] Administrateur système
  - [ ] CPA/Contrôleur
  - [ ] Technicien comptable
  - [ ] Gestionnaire de projet
  - [ ] Demandeur/Chantier
  - [ ] Client (lecture seule)

#### **8.2 Conformité LPRPDE**
- [ ] **Protection des données**
  - [ ] Consentement explicite
  - [ ] Droit d'accès et suppression
  - [ ] Minimisation des données
  - [ ] Journalisation des accès
  - [ ] Notification d'incident

#### **8.3 Piste d'Audit**
- [ ] **Traçabilité complète**
  - [ ] Log de toutes les actions
  - [ ] Immutabilité des transactions
  - [ ] Archivage automatique
  - [ ] Signatures électroniques

---

### **PHASE 9: PERFORMANCE & SCALABILITÉ**

#### **9.1 Optimisation Base de Données**
- [ ] **Performance**
  - [ ] Indexation avancée
  - [ ] Partitioning par exercice
  - [ ] Archivage automatique
  - [ ] Cache Redis

#### **9.2 Interface Utilisateur**
- [ ] **UX/UI Avancée**
  - [ ] Interface responsive
  - [ ] Mode sombre/clair
  - [ ] Accessibilité WCAG 2.1 AA
  - [ ] PWA pour mobile

---

### **PHASE 10: INTÉGRATIONS & API**

#### **10.1 API RESTful**
- [ ] **Interfaces externes**
  - [ ] API publique documentée
  - [ ] Webhooks pour événements
  - [ ] Intégration banques
  - [ ] Import/Export standards

#### **10.2 Écosystème**
- [ ] **Marketplace d'addons**
  - [ ] Modules tiers
  - [ ] Connecteurs spécialisés
  - [ ] Templates sectoriels

---

## 📊 **PLANNING & PRIORITÉS**

### **Priorité 1 (Critique)** 🔴
- Infrastructure comptable de base
- Gestion des projets avec 5 groupes
- Workflow Purchase-to-Pay essentiel
- États financiers NCECF

### **Priorité 2 (Important)** 🟡
- Facturation et recettes
- Paie simplifiée
- Rapports de gestion avancés
- RBAC complet

### **Priorité 3 (Nice-to-have)** 🟢
- Automatisation IA
- Analyses prédictives
- Intégrations avancées
- Marketplace

---

## 🎯 **PROCHAINES ÉTAPES IMMÉDIATES**

1. **Finaliser le schéma de base de données** pour les projets et la comptabilité analytique
2. **Implémenter les 5 groupes de coûts** avec liaison GL
3. **Créer le module de gestion de projets** complet
4. **Développer le workflow de réquisitions** de base
5. **Intégrer la ventilation analytique** dans les achats

---

*Dernière mise à jour: 3 septembre 2025*
*Statut: Analyse terminée, prêt pour implémentation*
