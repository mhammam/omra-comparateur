# Omra Comparateur 🕋

Site web statique pour **rechercher, comparer et classer les offres Omra** des agences de voyages marocaines.

- 🔎 **Recherche entre deux dates** (départ dans la période, ou séjour entièrement dans la période), ville de départ, budget
- ⚖️ **Comparateur** côte à côte (jusqu'à 4 offres) : prix, prix/nuit, étoiles et distance des hôtels à Makkah (Masjid al-Haram) et Médine (Masjid an-Nabawi), vol direct/escale, prestations incluses — la meilleure valeur de chaque ligne est surlignée
- 🏆 **Classement** par : score global (pondération réglable), prix ↑/↓, prix par nuit, vols directs d'abord, étoiles, distance Makkah, distance Médine, date, durée
- 🏢 **Annuaire des agences agréées** (source : [MTAESS](https://mtaess.gov.ma/fr/annuaires/annuaire-des-agences-de-voyages/organisateurs-distributeurs-de-voyages/)) avec recherche par nom/ville

Aucune dépendance, aucun build : HTML + CSS + JavaScript. Fonctionne aussi en ouvrant `index.html` directement.

> ⚠️ `data/offres.js` contient des **offres de démonstration** (agences fictives, prix indicatifs). Remplacez-les par les offres réelles des agences avant le lancement. Le bandeau « démonstration » disparaît automatiquement quand aucune offre n'a `"demo": true`.

## Structure

```
index.html            Recherche + résultats + comparateur
agences.html          Annuaire des agences agréées
assets/logic.js       Filtres, score, tris (testable avec Node)
assets/app.js         Interface
assets/style.css
data/offres.js        Offres (window.OFFRES)
data/agences.js       Agences (window.AGENCES) — extrait, voir import ci-dessous
scripts/generer_demo.py    Régénère les offres de démo
scripts/import_agences.py  Importe l'annuaire complet MTAESS
```

## Ajouter une offre

Ajoutez un objet dans `data/offres.js` :

```json
{
  "id": "AGENCE-2027-001",
  "agence": "Nom de l'agence (tel qu'inscrit à l'annuaire)",
  "ville_depart": "Casablanca",
  "date_depart": "2027-01-15",
  "date_retour": "2027-01-29",
  "nuits_makkah": 8,
  "nuits_medine": 5,
  "prix": 17500,
  "chambre": "Quadruple",
  "vol": { "compagnie": "Royal Air Maroc", "type": "direct", "escale": null, "arrivee": "JED" },
  "hotel_makkah": { "nom": "Nom de l'hôtel", "etoiles": 5, "distance_m": 150 },
  "hotel_medine": { "nom": "Nom de l'hôtel", "etoiles": 4, "distance_m": 300 },
  "inclus": ["Visa Omra", "Billet d'avion", "Transferts", "Petit-déjeuner"],
  "contact": "+212 5 22 00 00 00"
}
```

- `prix` : en MAD, par personne, pour le type de chambre indiqué
- `vol.type` : `"direct"` ou `"escale"` (avec `escale` = ville)
- `distance_m` : distance à pied en mètres jusqu'à la mosquée

## Importer l'annuaire complet des agences

```bash
pip install requests beautifulsoup4
python3 scripts/import_agences.py              # depuis le site du ministère
python3 scripts/import_agences.py --csv a.csv  # ou depuis un CSV nom;ville;adresse
```

## Score global

Score de 0 à 100, calculé **relativement aux offres affichées** :
prix par nuit (40 %), étoiles moyennes (25 %), proximité des mosquées en échelle logarithmique (25 %), vol direct (10 %). Les poids sont réglables dans « Pondération du score global ».

## Hébergement gratuit : GitHub Pages

1. Créez un dépôt vide sur GitHub (ex. `omra-comparateur`), sans README.
2. Dans ce dossier :
   ```bash
   git remote add origin https://github.com/<VOTRE_COMPTE>/omra-comparateur.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Source : Deploy from a branch → `main` / `/ (root)`** → Save.
4. Le site est en ligne après ~1 min sur `https://<VOTRE_COMPTE>.github.io/omra-comparateur/`.

Alternatives gratuites : Netlify ou Cloudflare Pages (connecter le dépôt, aucune commande de build, dossier de publication = racine).

## Évolutions possibles

- Back-office pour que les agences saisissent leurs offres (ex. Supabase / Firebase gratuits, ou formulaire → Google Sheets)
- Vérification automatique : n'afficher que les agences présentes dans l'annuaire officiel
- Alertes prix par e-mail, page détail par offre, version arabe
