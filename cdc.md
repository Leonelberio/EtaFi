1.      Vision & périmètre
 
Développer une application web complète de comptabilité et gestion par projet (type QuickBooks + module projet) conforme aux NCECF et à la LPRPDE, destinée aux PME (construction, ingénierie, services professionnels, commerce). L’ERP doit être multi-entreprise, multi-exercice et en devise canadienne (CAD par défaut).
Elle doit permettre une automatisation de tâches par IA, faire de la comptabilité par projet, fournir des états financiers, rapports de gestion en temps réel,  faire des analyses financières approfondies et concises par IA, et gérer les flux de liquidités. Cela devra aussi permettre d’avoir un tableau de bord accessible au client qui peut avoir accès à des données clés, aux états financiers sans possibilité de modification
Au-delà des fonctionnalités traditionnelles que l’on retrouve dans un logiciel comptable, le système doit intégrer un haut niveau d’automatisation des tâches comptables répétitives et sans valeur ajoutée humaine, telles que : le classement automatisé des factures reçues, , l’appariement des bons de commande et des factures, la saisie des factures, le rapprochement/conciliation bancaire des opérations, ou encore la génération d’écritures récurrentes (amortissements, régularisations, provisions), l’analyse financière.
L’objectif est de libérer les ressources humaines (techniciens, contrôleurs, CPA, gestionnaires de projets) des tâches mécaniques, afin qu’elles se concentrent sur les tâches à vraie valeur ajoutée : planification stratégique et le conseil à la direction.
Ainsi, l’ERP ne sera pas seulement un outil de saisie, mais un levier de performance et de productivité qui :
Réduit les risques d’erreurs humaines grâce à des traitements automatisés et standardisés
Accélère la production d’informations financières fiables et en temps réel
Renforce la capacité décisionnelle des dirigeants de PME en mettant l’accent sur l’intelligence des données plutôt que sur la lourdeur administrative
Permet de gérer davantage de projets/clients sans alourdir les équipes comptables
 
2.      Objectifs spécifiques
·   	Développer une application web comptable sécurisée et conforme aux NCECF et LPRPDE (Loi 25)
·   	Permettre la tenue de livres comptables (cycle comptable complet soit : la saisie des données comme les achats, les ventes, les écritures de journal, encaissement, décaissement, etc. à La conciliation bancaire à Les régularisations), la gestion des taxes, la production des états financiers.
 
·   	Offrir des outils de suivi et de gestion de projets intégrés à la comptabilité.
·   	Être multi-utilisateur, multi-entreprise et multi-exercice.
·   	L’application doit être développée pour pouvoir être bonifiée plus tard (possibilité d’intégrer d’autres fonctionnalités)
·   	La performance est primordiale. La rapidité d’exécution de l’application même lorsque plusieurs utilisateurs sont connectés et que les données deviennent super denses.
·   	Plusieurs utilisateurs doivent pouvoir se connecter à la même entreprise simultanément et y travailler
·   	Automatisation du workflow de réquisition, Bon de commande (BC), Matching de BC et factures, envoi en approbation automatisé, saisie de factures d’achats automatisées
·   	Tous les rapports devront être exportables en PDF avec une belle mise en forme
·   	Tous les rapports devront être exportables en Excel avec une belle mise en forme
 
Modules à développer
·   	Module de comptabilité/Grand livre
·   	Module de Projet
·   	Module des achats et déboursés
·   	Module des ventes et recettes
·   	Module de paie simplifiée : ventilation de coûts selon projets et activités
·   	Module de rapports incluant états financiers
·   	Module analyse financière détaillée
·   	Module de gestion de prévision de trésorerie
3. Principes directeurs & conformité
• Conformité NCECF : production de bilan, résultat, capitaux propres, flux de trésorerie; régularisations;
• LPRPDE : minimisation des données, consentement, droit d’accès/suppression; journalisation des incidents; avis en cas d’atteinte.
• Traçabilité : piste d’audit immuable (écritures, connexions, approbations) et pièces justificatives attachées.
• Séparation des tâches : demandeur ≠ approbateur ≠ payeur; rôles & permissions (RBAC), MFA, SSO (OAuth2/OIDC).
• Performance/UX : actions clés < 2 s (95e percentile); interface accessible (WCAG 2.1 AA) et responsive.
4. Personae & rôles
Possibilité de donner accès à des fonctions spécifiques selon les utilisateurs internes?
• Administrateur : paramétrage global, sécurité, matrices d’approbation, plans de comptes. Contrôle sur tout
• CPA/Contrôleur : Contrôle sur tout sauf sécurité et création d’utilisateurs.
• Technicien comptable : opérations courantes Grand livre/comptes fournisseurs/comptes à recevoir/banques/taxes / projets/ écritures de journal. Ne doit pas avoir accès aux états financiers
• Gestionnaire de projet/ approbateur : budgets par activités et catégories de coûts (Matériel, Sous-traitance, Divers, Équipement, Main d’œuvre) , suivis coûts/BC/ réquisitions, Rapports de gestion de projets/ approbations
• Demandeur/Chantier : réquisitions, réceptions de BC
• Lecture/Client : accès lecture sécurisé aux rapports
5. Module comptabilité et grand livre(GL)
-          Fonctions
o   Création de plan comptable personnalisé
o   Création de gabarits (modèles de plans comptables)
o   Possibilité de voir l’historique (détail des comptes)
o   Opérations récurrentes ex : achats récurrents, ventes récurrentes, écritures de journal récurrentes
o   Entrée de journal (écritures) : comptabilité partie double. Possibilité de joindre un fournisseur afin qu’on puisse retrouver dans Journal des achats s’il s’agit d’une écriture relative à un achat ou vente. Possibilité de mettre aussi les codes de taxes
o   Clôture de période : mois
Interdire toute possibilité de pouvoir modifier toute écriture/achat/vente et toute autre transaction déjà postée dans le système

-          Journaux
o   Journal des achats
o   Journal des ventes
o   Journal des déboursés
o   Journal des recettes
o   Journal des écritures
o   Journal général
-          Rapports
o   Grand livre
o   Balance de vérification
o   État des résultats/ Bilan/État des capitaux propres
o   État des flux de trésorerie
o   Âge des comptes à payer
o   Âge des comptes à recevoir
o   Et autres
6. Module de projets
-          Fonctions
o   Création et gestion des paramètres de projets et des activités/sous-activités (sous-sections dans un projet)
§  Créer Code projet/Nom projet/ Gestionnaire projet principal/ Gestion projet temporaire avec délai spécifique/ Client/ règles d’approbation
§  Créer Code d’activités par projet incluant les Groupes (M, S, D, E, MOD) et numéro de compte Grand livre lié aux activités/groupes (personnalisables)
§  Créer sous-activité. Voir ci-dessous l’explication. Même principe de création que les activités.
Exemple de projet (en vert): Chantier 2025
Exemple activités (en bleu) :
§  01010 : Organisation chantier
§  01135 : Déplacement
§  01220 : Toiture
Exemple sous activités (en orange)
§  01010 : Organisation de chantier
·       01010-01 : Outils santé sécurité
·       01010-02 : Formation
·       01010-03 : Mobilisation
Permet une traçabilité fine des coûts.
Sert de clé d’imputation analytique (au même titre qu’un centre de coûts).
Rend possible la comparaison budget vs réel à un niveau granulaire.
Facilite les rapports par projet, activité et sous-activité.
Note : une entreprise peut dire que le système de sous-activité est trop détaillé pour elle et qu’elle veut se limiter aux activités. Pas de souci, elle peut donc créer ses groupes dans les activités.
Cependant si une entreprise dit qu’elle a besoin de plus de détails, elle peut utiliser les sous activités et utiliser les groupes dans les sous activités. Dans ce cas, les groupes dans les activités seront donc la somme des groupes des sous-activités
o   Gestion des gabarits (modèles) de projets : C’est comme un modèle de plan comptable. Une entreprise peut dire qu’il a 3 gabarits de modèles de projets et il va toujours utiliser ces 3. On devrait donc avoir cette possibilité
o   Création de budget par activité ou sous-activité dans un projet selon les groupes M, S, D, E, MOD
o   Transfert de coûts entre projets. C’est comme une écriture. On peut donc dire de créditer tel cout de tel projet/activité/sous-activité et le débiter dans tel projet/activité/sous-activité
-          Rapports
o   Liste des transactions de projet
o   Rapports de coûts réels
o   Rapports de budget vs coûts réels
o   Compte à payer détaillé par projet
o   Comptes à recevoir détaillé par projet
o   Et autres rapports
7. Module de paie simple (pour un début)
On ne fera pas la paie directement dans le logiciel pour commencer. C’est assez complexe. La paie sera traitée à l’externe. Nous on viendra juste répartir les coûts reliés à la paie dans le logiciel. On a juste besoin du coût total par employé par semaine et en le mettant dans notre logiciel, étant donné qu’il y aura les heures par projet/activité et sous-activité, le calcul de la répartition se fera au prorata et aboutira aux états financiers.
-          Création des employés
-          Création de feuilles de temps travaillé par semaine en lien avec projets, activités et sous-activités par employé
-          Répartition des coûts globaux de la paie de chaque employé selon la période
-          Rapports concernant les heures opérés par employé par projet et activités
8. Module Facturation
-          Principales Fonctions
o   Création de devis
o   Création de factures selon devis
o   Création de clients
o   Recettes
o   Recettes individuelles sans création de factures (ex : le gouvernement envoie une subvention, on ne peut pas faire une facture au gouvernement)
o   Annulation de recettes
o   Impression et réimpression de factures
 
-          Rapports concernant les facturations et recette par projet et client
 
9. Module des taxes
Conciliation et rapport des taxes TPS et TVQ : taxes à payer sur ventes, taxes à recevoir sur achats et solde
10. Module des achats et automatisations
-          Principales fonctions
o   Création de fournisseurs
o   Création et gestion de bons de commande
o   Impression et réimpression de bons de commande
o   Saisie de factures d’achats
o   Saisie d’achat en lot (entrer plusieurs factures d’achat d’un même fournisseur en une seule transaction)
o   Paiement de fournisseurs
o   Paiement individuel (même principe que recette individuelle)
o   Et autres
 
-          Rapports concernant les comptes fournisseurs : divers rapports utiles
Vue d’ensemble (qui fait quoi)
Demandeur (chantier/équipe) : envoie les besoins, dépose des factures reçues par courriel, crée des réquisitions.
Gestionnaire de projet : approuve les réquisitions et surveille le budget.
Achat/Approvisionnements : émet les bons de commande (BC) aux fournisseurs.
Magasin/Réception : confirme ce qui a été reçu (quantité/qualité).
Comptes fournisseurs (AP) : vérifie les factures, fait l’appariement avec le BC et la réception, lance les approbations, comptabilise.
Finance/Direction : approuve les cas sensibles (montants élevés, écarts), supervise.
Système : classe les courriels, relie automatiquement les documents, alerte et notifie.

1) Réception et classement des courriels (factures & demandes)
Les fournisseurs envoient leurs factures à une adresse dédiée (ex. ap@votreentreprise.ca).
Le système range automatiquement ces courriels :
Factures → dossiers du fournisseur concerné.
Demandes d’achat (réquisitions) → en attente de création.
Autres → en revue manuelle.
Les pièces jointes (PDF de facture) sont lisibles et les infos clés sont repérées : fournisseur, numéro de facture, date, montant, taxes, n° de BC s’il existe.
👉 But : éviter les pertes, classer automatiquement, et gagner du temps.

2) Réquisition (demande d’achat)
Le demandeur décrit le besoin (produit/service), précise le projet, l’activité et la sous‑activité, et joint, au besoin, des devis.
Le gestionnaire de projet est alerté et approuve (ou refuse) selon :
Le budget restant du projet,
La catégorie de dépense,
Le montant (seuils d’autorisation).
Après approbation, la réquisition passe en « OK pour achat ».
👉 But : contrôler les achats avant qu’ils n’arrivent en facture, et protéger le budget.

3) Bon de commande (BC)
À partir d’une réquisition approuvée, le service Achats génère un BC (quantités, prix, délais, lieu de livraison, taxes).
Si le montant dépasse certains seuils, une chaîne d’approbation (direction/finance) est déclenchée automatiquement.
Le BC est envoyé au fournisseur et au demandeur (copie) — tout le monde sait ce qui a été commandé.
👉 But : transformer un besoin approuvé en engagement ferme vis‑à‑vis du fournisseur, avec les bonnes conditions.

4) Réception (sur le terrain ou au magasin)
Le magasin/chantier confirme la réception : ce qui est reçu, en quelle quantité, à quelle date, et en bon état.
En cas d’écart (manquant, endommagé), c’est noté.
Le BC reste ouvert tant que tout n’a pas été reçu (livraisons partielles possibles).
👉 But : savoir exactement ce qui a été livré, pour comparer ensuite à la facture.

5) Facture fournisseur (depuis le courriel)
La facture arrive par courriel, elle est classée automatiquement et rattachée au BC si le numéro est indiqué (sinon, le système propose une correspondance).
Le système compare :
Prix facturé vs prix du BC,
Quantité facturée vs quantité reçue,
Taxes appliquées.
👉 Résultat :
Si tout colle (ou écart dans une petite tolérance), la facture peut passer en approbation simplifiée ou être acceptée directement.
Si l’écart dépasse la tolérance, la facture part en approbation Finance/Direction avec un avertissement.

6) Approvals (réquisitions, BC et factures)
Règles d’approbation paramétrées par projet, département, montant, type de dépense.
Notifications automatiques aux bonnes personnes (et rappel si ça traîne).
Traçabilité complète : qui a approuvé, quand, et pourquoi.
Remplacements possibles (vacances), pour éviter les blocages.
👉 But : qu’aucune dépense importante ne passe sans double regard et que tout soit documenté.

7) Comptabilisation (après approbation)
Une facture approuvée est comptabilisée automatiquement :
Affectée au projet, à l’activité, à la sous‑activité et au groupe analytique,
Comptes comptables et taxes correctement appliqués,
Écriture enregistrée dans les journaux.
Après comptabilisation, la facture n’est plus modifiable :
Si une erreur est découverte, on annule par une écriture inverse puis on recrée correctement (piste d’audit).
👉 But : garantir la conformité NCECF et une piste d’audit solide.

8) Paiement (hors périmètre demandé, mais logique)
Les factures approuvées et comptabilisées alimentent la proposition de paiement, triée par échéance et escompte possible.
Lots de paiement (transfert, chèque) avec notifications au fournisseur.

9) Notifications & tableaux de bord
Qui reçoit quoi :
Demandeur : statut de sa réquisition, puis du BC.
Gestionnaire de projet : demandes à approuver, dépassements de budget.
AP/Finance : factures à vérifier/à approuver, anomalies.
Approvisionnements : BC à émettre, réceptions en retard.
Indicateurs clés :
Délai moyen d’approbation par étape (goulots d’étranglement),
Taux d’appariement automatique (plus il est élevé, mieux c’est),
Montant des écarts détectés,
Réquisitions/BC/factures en attente,
Respect des budgets projets.

10) Règles d’or (contrôles)
Toujours un BC avant la livraison/facture (sauf exceptions cadrées).
Jamais d’édition d’une facture ou d’une écriture déjà comptabilisée.
Approbations obligatoires selon seuils et catégories.
Réception documentée avant paiement (pour biens).
Piste d’audit : tout est archivé (courriels, PDF de factures, BC, approbations, réceptions).
Respect des taxes (TPS/TVQ/TVH) et des budgets projets.

Résumé visuel (ultra‑simple)
« Courriel facture » → Classement auto →
 Réquisition (si besoin) → Approbation →
 BC → Envoi fournisseur → Réception →
 Facture → Comparaison (BC/Réception/Taxes) →
 Approbation (si écart) → Comptabilisation → Paiement.
 
Voici les groupes à utiliser
Voici 5 groupes applicables à toutes les entreprises :

1. Matériel & Fournitures
Tout ce qui est consommable ou utilisé pour les opérations (matières premières, fournitures de bureau, pièces, petits équipements).
Ex. : béton pour construction, papier pour bureau, pièces détachées pour un atelier.

2. Sous-traitance & Services externes
Travaux ou services confiés à des tiers.
Ex. : consultant TI, sous-traitant en construction, services de nettoyage, comptabilité externe.

3. Équipement & Immobilisations
Biens durables utilisés dans les opérations (achats ou locations d’équipement, machines, véhicules, logiciels).
Ex. : achat d’ordinateurs, location de machinerie, licences logicielles.

4. Main-d’œuvre & Charges sociales
Rémunération directe (salaires) ou indirecte (avantages, charges sociales).
Peut couvrir employés de production, administration, ou projet.

5. Frais généraux & Divers
Dépenses indirectes liées au fonctionnement de l’entreprise.
Ex. : électricité, télécom, assurances, publicité, frais bancaires.

👉 Ces 5 groupes couvrent l’essentiel des charges, qu’on soit dans :
Services → ex. consultants (Main-d’œuvre, Services externes, Frais généraux).
Commerce → ex. distribution (Matériel, Frais généraux, Équipement).
Construction/projets → ex. chantiers (Sous-traitance, Matériel, Main-d’œuvre).
Manufacturier → ex. usine (Matériel, Main-d’œuvre, Équipement).
Ils peuvent ensuite être mappés à des comptes de grand livre universels (5000-5999).

⚖️ Avantage :
Simplicité → 5 groupes = assez détaillé pour suivre, assez générique pour tout domaine.
Uniformité → toutes les entreprises parlent le même langage.
Extensibilité → si une entreprise veut du détail, elle peut ajouter des sous-groupes (ex. Frais généraux → Marketing, Assurance, Télécom).
 
📑 Spécifications – Enregistrement des Achats en Comptabilité par Projet
1. Objectif
Mettre en place un système d’enregistrement des achats qui permet :
De ventiler chaque dépense selon Projet → Activité → Sous-activité → Groupe.
De relier automatiquement chaque groupe à un compte du grand livre (GL), afin que les achats soient intégrés correctement dans la comptabilité et les états financiers.
De fournir une traçabilité par projet pour le suivi budgétaire, la gestion de coûts et l’analyse de rentabilité.

2. Structure analytique
a) Projet
Chaque achat doit obligatoirement être rattaché à un Code Projet unique.
Le projet représente l’entité principale de suivi (ex. : Chantier 2025-001).
b) Activité
À l’intérieur d’un projet, les dépenses sont découpées en activités (grandes étapes ou lots de travail).
Exemple : Fondations, Charpente, Finitions, Administration de projet.
c) Sous-activité
Chaque activité peut être subdivisée en sous-activités pour un suivi plus précis.
Exemple : Finitions → Peinture, Plomberie, Électricité.
d) Groupe
Chaque sous-activité comprend des groupes normalisés correspondant aux grandes catégories de dépenses :
Matériel
Sous-traitant
Équipement
Main-d’œuvre
Divers

3. Lien avec la comptabilité (Grand Livre)
Chaque groupe est relié à un compte GL unique et obligatoire.
Ce lien est paramétrable par l’administrateur comptable.
Exemple de correspondance :
Groupe Matériel → Compte GL 5000 – Achats de matériel
Groupe Sous-traitant → Compte GL 5100 – Sous-traitance
Groupe Équipement → Compte GL 5200 – Location/achat d’équipement
Groupe Main-d’œuvre → Compte GL 5300 – Charges de main-d’œuvre
Groupe Divers → Compte GL 5400 – Dépenses diverses
👉 Ainsi, lors de l’enregistrement d’une facture fournisseur, le logiciel :
Affecte automatiquement l’achat au bon compte comptable,
Tout en conservant l’information analytique (Projet, Activité, Sous-activité, Groupe).

4. Processus d’enregistrement d’un achat
Saisie de la facture fournisseur (automatisée ou manuelle).
Sélection obligatoire :
Code Projet,
Code Activité,
Code Sous-activité,
Groupe (liste fermée).
Le système attribue automatiquement :
Le compte GL lié au groupe choisi,
La ventilation comptable dans le journal d’achats.
La facture est enregistrée :
En ventilation analytique (Projet, Activité, Sous-activité, Groupe),
En comptabilité légale (compte GL, taxes, fournisseur, date).

5. Sorties attendues
États financiers conformes aux NCECF (bilan, état des résultats).
Rapports par projet :
Dépenses par activité et sous-activité,
Dépenses par groupe (Matériel, Sous-traitant, etc.),
Comparaison réel vs budget.
Piste d’audit : chaque facture garde son rattachement complet (Projet → Activité → Sous-activité → Groupe → Compte GL).

6. Règles de contrôle
Aucun achat ne peut être validé sans :
Projet, Activité, Sous-activité et Groupe.
Les comptes GL sont gérés uniquement par l’équipe Finance, pas par les utilisateurs.
Toute modification d’une facture après validation se fait par contre-passation (pas d’édition directe).

✅ En résumé :
 Le module doit forcer la saisie analytique complète, relier automatiquement chaque groupe à un compte GL, et produire à la fois des rapports de gestion par projet et des états financiers normatifs.
 
Note : Pour la saisie des factures, toute information concernant projet, activité, sous-activité, groupe, montant HT, TPS, TVQ, doit pouvoir être inscrite sur plusieurs lignes
Une fonction importante à inclure dans le module de saisie de facture d’achat et ventes : Les retenues contractuelles. Possibilité de mentionner les % de retenues. Exemple :
Montant HT : 10 000
Retenue (10%) : -1000
HT après retenue : 9000
TPS :
TVQ
Total
 
