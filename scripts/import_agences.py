#!/usr/bin/env python3
"""Importe l'annuaire officiel des agences de voyages (MTAESS) dans data/agences.js.

Source : https://mtaess.gov.ma/fr/annuaires/annuaire-des-agences-de-voyages/organisateurs-distributeurs-de-voyages/

Deux modes :
  1) Téléchargement direct (à lancer depuis votre ordinateur) :
       pip install requests beautifulsoup4
       python3 scripts/import_agences.py
  2) À partir d'un CSV (nom;ville;adresse) si vous exportez/copiez la liste :
       python3 scripts/import_agences.py --csv agences.csv

Le script essaie d'abord de lire un <table>, puis des listes (<li>). Les entrées
qu'il n'arrive pas à découper sont écrites dans data/agences_a_verifier.txt.
"""
import argparse
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

URL = "https://mtaess.gov.ma/fr/annuaires/annuaire-des-agences-de-voyages/organisateurs-distributeurs-de-voyages/"
RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / "data" / "agences.js"
A_VERIFIER = RACINE / "data" / "agences_a_verifier.txt"

# Villes fréquentes, utilisées pour découper « NOM VILLE ADRESSE » quand rien ne sépare les champs.
VILLES = [
    "AGADIR", "AIN EL AOUDA", "AIT BAHA", "AL HOCEIMA", "AZILAL", "BEN GUERIR", "BENI MELLAL", "BERKANE",
    "BERRECHID", "CASABLANCA", "CHEFCHAOUEN", "DAKHLA", "EL JADIDA", "ERRACHIDIA", "ESSAOUIRA", "FES",
    "GUELMIM", "IFRANE", "INEZGANE", "KENITRA", "KHEMISSET", "KHENIFRA", "KHOURIBGA", "LAAYOUNE", "LARACHE",
    "MARRAKECH", "MEKNES", "MOHAMMEDIA", "NADOR", "OUARZAZATE", "OUJDA", "RABAT", "SAFI", "SALE", "SETTAT",
    "SIDI KACEM", "SIDI SLIMANE", "TANGER", "TAROUDANT", "TAZA", "TEMARA", "TETOUAN", "TIZNIT", "ZAGORA",
]


def sans_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").upper()


def decouper(ligne: str):
    """Découpe une ligne concaténée en (nom, ville, adresse) via la liste de villes."""
    norm = sans_accents(ligne)
    meilleur = None
    for v in sorted(VILLES, key=len, reverse=True):
        m = re.search(r"\b" + re.escape(v) + r"\b", norm)
        if m and m.start() > 2 and (meilleur is None or m.start() < meilleur[0]):
            meilleur = (m.start(), m.end(), v)
    if not meilleur:
        return None
    a, b, v = meilleur
    return ligne[:a].strip(" -;,"), v.title(), ligne[b:].strip(" -;,")


def depuis_web():
    import requests
    from bs4 import BeautifulSoup

    html = requests.get(URL, timeout=60, headers={"User-Agent": "Mozilla/5.0"}).text
    soup = BeautifulSoup(html, "html.parser")
    agences, rejets = [], []

    for tr in soup.select("table tr"):
        tds = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
        if len(tds) >= 3 and tds[0]:
            agences.append({"nom": tds[0], "ville": tds[1].title(), "adresse": tds[2]})
    if agences:
        return agences, rejets

    for li in soup.select("li"):
        txt = li.get_text(" ", strip=True)
        if len(txt) < 12 or len(txt) > 300:
            continue
        r = decouper(txt)
        if r:
            agences.append({"nom": r[0], "ville": r[1], "adresse": r[2]})
        else:
            rejets.append(txt)
    return agences, rejets


def depuis_csv(chemin):
    with open(chemin, encoding="utf-8-sig") as f:
        lecteur = csv.reader(f, delimiter=";")
        lignes = [l for l in lecteur if l]
    if lignes and sans_accents(lignes[0][0]).startswith("NOM"):
        lignes = lignes[1:]
    return [{"nom": l[0].strip(), "ville": l[1].strip().title(), "adresse": (l[2] if len(l) > 2 else "").strip()} for l in lignes], []


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--csv", help="Fichier CSV nom;ville;adresse")
    args = p.parse_args()
    agences, rejets = depuis_csv(args.csv) if args.csv else depuis_web()
    vus, uniques = set(), []
    for a in agences:
        cle = (sans_accents(a["nom"]), sans_accents(a["ville"]))
        if cle not in vus:
            vus.add(cle)
            uniques.append(a)
    uniques.sort(key=lambda a: (a["ville"], a["nom"]))
    if not uniques:
        sys.exit("Aucune agence trouvée : la structure de la page a peut-être changé. Utilisez --csv.")
    SORTIE.write_text(
        "// Annuaire officiel MTAESS — organisateurs/distributeurs de voyages.\n"
        f"// Source : {URL}\n"
        "window.AGENCES = " + json.dumps(uniques, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8",
    )
    print(f"{len(uniques)} agences écrites dans {SORTIE}")
    if rejets:
        A_VERIFIER.write_text("\n".join(rejets), encoding="utf-8")
        print(f"{len(rejets)} lignes non découpées -> {A_VERIFIER}")


if __name__ == "__main__":
    main()
