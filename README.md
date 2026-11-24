# Omra Comparateur 🕋

Site web statique pour **rechercher, comparer et classer les offres Omra** des agences de voyages marocaines.

- 🔎 **Recherche entre deux dates** (départ dans la période, ou séjour entièrement dans la période), type de chambre, ville de départ, budget
- ⚖️ **Comparateur** côte à côte (jusqu'à 4 offres) : prix, prix/nuit, étoiles et distance des hôtels à Makkah (Masjid al-Haram) et Médine (Masjid an-Nabawi), vol direct/escale, prestations incluses — la meilleure valeur de chaque ligne est surlignée
- 🏆 **Classement** par : score global (pondération réglable), prix ↑/↓, prix par nuit, vols directs d'abord, étoiles, distance Makkah, distance Médine, date, durée
- ✅ Chaque offre est **vérifiée dans l'annuaire officiel** des agences agréées et renvoie vers l'annonce d'origine
- 🏢 **Annuaire des 1 513 agences agréées** (source : [MTAESS](https://mtaess.gov.ma/fr/annuaires/annuaire-des-agences-de-voyages/organisateurs-distributeurs-de-voyages/)) avec recherche par nom/ville

Aucune dépendance, aucun build : HTML + CSS + JavaScript. Fonctionne aussi en ouvrant `index.html` directement.

## Données

| Fichier | Contenu |
|---|---|
| `data/agences.js` | Les **1 513 agences** de l'annuaire officiel MTAESS (extrait du 24/11/2026), avec repérage automatique des noms évoquant l'Omra (`omra_probable`). |
| `data/offres.js` | **Offres réelles** relevées sur les sites des agences agréées (collecte du 24/11/2026), chacune avec son lien `source`. Les champs non publiés par l'agence valent `null` et s'affichent « n.c. ». |
| `scripts/brut/agences_*.txt` | Export brut de l'annuaire (contrôlé par empreinte SHA-256 avec le site officiel). |

> ⚠️ Prix et disponibilités changent : le site affiche la date de collecte et renvoie toujours vers l'annonce d'origine. Les distances marquées « ≈ » sont des estimations de référence, pas des données d'agence.

## Structure

```
index.html                    Recherche + résultats + comparateur
agences.html                  Annuaire des 1 513 agences agréées
assets/logic.js               Filtres, score, tris (testable avec Node)
assets/app.js                 Interface
data/offres.js                Offres réelles (window.OFFRES)
data/agences.js               Annuaire officiel (window.AGENCES)
scripts/construire_agences.py Reconstruit data/agences.js depuis scripts/brut/
scripts/import_agences.py     Ré-importe l'annuaire depuis le site du ministère
scripts/rechercher_agences.py Recherche web automatique agence par agence (API Brave, gratuite)
```

## Ajouter une offre

Ajoutez un objet dans `data/offres.js` (laissez `null` ce que l'agence ne publie pas) :

```json
{
  "id": "AGENCE-RJ-01",
  "titre": "Omra Rajab Confort",
  "saison": "Rajab",
  "agence": "NOM EXACT DANS L'ANNUAIRE",
  "ville_agence": "Casablanca",
  "ville_depart": "Casablanca",
  "dates": ["2026-12-16", "2027-01-06"],
  "duree_jours": 12,
  "periode": null,
  "prix": {"double": 24000, "triple": 22000, "quadruple": 20000},
  "hotel_makkah": {"nom": "Nom de l'hôtel", "etoiles": 4, "distance_m": 300},
  "hotel_medine": {"nom": "Nom de l'hôtel", "etoiles": 4, "distance_m": 200},
  "vol": {"type": "direct", "compagnie": "Royal Air Maroc"},
  "repas": "Petit-déjeuner",
  "inclus": ["Billet A/R", "Visa", "Transferts"],
  "source": "https://site-de-l-agence/offre"
}
```

- `prix` : MAD par personne, par type de chambre (`single`, `double`, `triple`, `quadruple`, `quintuple`) ou `{"min": 15900}` si seul un « à partir de » est publié
- `dates` : dates de départ exactes ; sinon `periode: {"debut", "fin", "libelle"}`
- `agence` : doit correspondre au nom de l'annuaire officiel (sinon le site affiche « ⚠ Non trouvée »)

## Trouver d'autres offres

La plupart des 1 513 agences n'ont pas de site web (Facebook / WhatsApp). Pour les passer en revue automatiquement :

```bash
export BRAVE_API_KEY=...            # clé gratuite : https://brave.com/search/api/
python3 scripts/rechercher_agences.py --omra     # d'abord les ~78 agences « Omra »
python3 scripts/rechercher_agences.py --max 500  # puis le reste, par lots (quota gratuit mensuel)
```

Le script produit `data/recherche_agences.json` (site, Facebook, mention Omra, prix repérés) : une liste de pistes à vérifier avant de saisir les offres.

## Mettre à jour l'annuaire

```bash
pip install requests beautifulsoup4
python3 scripts/import_agences.py              # depuis le site du ministère
python3 scripts/import_agences.py --csv a.csv  # ou depuis un CSV nom;ville;adresse
```

## Score global

Score de 0 à 100, calculé **relativement aux offres affichées** :
prix par jour (40 %), étoiles moyennes (25 %), proximité des mosquées en échelle logarithmique (25 %), vol direct (10 %). Une information non publiée reçoit une note neutre. Les poids sont réglables dans « Pondération du score global ».

## Hébergement gratuit : GitHub Pages

1. Créez un dépôt vide sur GitHub (ex. `omra-comparateur`), sans README.
2. Dans ce dossier :
   ```bash
   git remote add origin https://github.com/mhammam/omra-comparateur.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Source : Deploy from a branch → `main` / `/ (root)`** → Save.
4. Le site est en ligne après ~1 min sur `https://mhammam.github.io/omra-comparateur/`.

Alternatives gratuites : Netlify ou Cloudflare Pages (connecter le dépôt, aucune commande de build, dossier de publication = racine).

## Évolutions possibles

- Back-office pour que les agences saisissent leurs offres (ex. Supabase / Firebase gratuits, ou formulaire → Google Sheets)
- Vérification automatique : n'afficher que les agences présentes dans l'annuaire officiel
- Alertes prix par e-mail, page détail par offre, version arabe
