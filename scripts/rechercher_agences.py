#!/usr/bin/env python3
"""Recherche web automatique pour chaque agence de l'annuaire (site, Facebook, offres Omra).

Utilise l'API Brave Search (offre gratuite : https://brave.com/search/api/ — ~2 000 requêtes/mois).
Le résultat (data/recherche_agences.json) sert à REPÉRER les agences qui publient des offres ;
la saisie des offres dans data/offres.js reste manuelle (vérifier chaque prix sur la source).

Usage :
  export BRAVE_API_KEY=xxxx
  python3 scripts/rechercher_agences.py --omra          # seulement les ~78 agences au nom évoquant l'Omra
  python3 scripts/rechercher_agences.py --ville Casablanca --max 100
  python3 scripts/rechercher_agences.py                # les 1 513 agences (reprend là où il s'est arrêté)
"""
import argparse, json, os, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

R = Path(__file__).resolve().parent.parent
SORTIE = R / "data" / "recherche_agences.json"
PRIX = re.compile(r"(\d{1,3}(?:[ . ]?\d{3})+|\d{4,6})\s*(?:dh|mad|dhs|درهم)", re.I)


def charger_agences():
    t = (R / "data" / "agences.js").read_text(encoding="utf-8")
    return json.loads(t[t.index("["): t.rindex("]") + 1])


def brave(q, cle):
    url = "https://api.search.brave.com/res/v1/web/search?" + urllib.parse.urlencode({"q": q, "count": 8, "country": "MA"})
    req = urllib.request.Request(url, headers={"Accept": "application/json", "X-Subscription-Token": cle})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r).get("web", {}).get("results", [])


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--omra", action="store_true", help="seulement les agences au nom évoquant l'Omra")
    p.add_argument("--ville")
    p.add_argument("--max", type=int, default=0)
    a = p.parse_args()
    cle = os.environ.get("BRAVE_API_KEY") or sys.exit("Définissez BRAVE_API_KEY (clé gratuite sur brave.com/search/api).")

    agences = charger_agences()
    if a.omra:
        agences = [x for x in agences if x.get("omra_probable")]
    if a.ville:
        agences = [x for x in agences if x["ville"].lower() == a.ville.lower()]
    deja = json.loads(SORTIE.read_text(encoding="utf-8")) if SORTIE.exists() else {}
    a_faire = [x for x in agences if f'{x["nom"]}|{x["ville"]}' not in deja]
    if a.max:
        a_faire = a_faire[: a.max]
    print(f"{len(a_faire)} agences à rechercher ({len(deja)} déjà faites)")

    for i, ag in enumerate(a_faire, 1):
        cle_ag = f'{ag["nom"]}|{ag["ville"]}'
        try:
            res = brave(f'"{ag["nom"]}" {ag["ville"]} omra', cle)
        except Exception as e:  # quota, réseau…
            print("Arrêt :", e)
            break
        liens = [{"titre": r.get("title"), "url": r.get("url"), "extrait": r.get("description", "")[:300]} for r in res]
        textes = " ".join(l["extrait"] or "" for l in liens)
        deja[cle_ag] = {
            "agence": ag,
            "site": next((l["url"] for l in liens if not re.search(r"facebook|instagram|tiktok|youtube|google|annuaire|mtaess", l["url"] or "")), None),
            "facebook": next((l["url"] for l in liens if "facebook.com" in (l["url"] or "")), None),
            "parle_omra": bool(re.search(r"omra|umrah|عمرة", textes, re.I)),
            "prix_vus": sorted({m.group(0) for m in PRIX.finditer(textes)})[:10],
            "resultats": liens,
        }
        if i % 10 == 0:
            SORTIE.write_text(json.dumps(deja, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"[{i}/{len(a_faire)}] {ag['nom']} — omra:{deja[cle_ag]['parle_omra']} prix:{deja[cle_ag]['prix_vus'][:3]}")
        time.sleep(1.1)  # limite gratuite : 1 requête/seconde
    SORTIE.write_text(json.dumps(deja, ensure_ascii=False, indent=1), encoding="utf-8")
    pistes = [v for v in deja.values() if v["parle_omra"] and v["prix_vus"]]
    print(f"Terminé. {len(pistes)} agences avec mention Omra + prix → à vérifier et ajouter dans data/offres.js")


if __name__ == "__main__":
    main()
