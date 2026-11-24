#!/usr/bin/env python3
"""Construit data/agences.js depuis scripts/brut/agences_*.txt (export de l'annuaire MTAESS).
Format brut : lignes '#VILLE' puis 'NOM|ADRESSE'."""
import html, json, re, unicodedata
from pathlib import Path
R = Path(__file__).resolve().parent.parent
OMRA = re.compile(r"OMRA|OUMRA|UMRAH|HAJ|MAKK|MEKK|MECCA|MADIN|MEDINE|HARAM|KAABA|QIBLA|MANASI|MANASSI|NUSUK|NOSOK|TAYBA|TAIBA|TIBA|TAYIBA|LABAY|LABYK|ZAMZAM|ZEM ZEM|MAQAM|MIQAT|MACHAA|MASHA|ARAFA|SAFA\b|MARWA\b|HIJAZ|IHRAM|TAWAF|DOYOUF|DUYUF|WOUFOUD|ZOUAR|ZOWAR|BAYT|BAIT|ALBAYT|MOLTAZAM|RAWDA|ANSSAR|SOFARAA|AL OMDA", re.I)
def norm(s): return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").upper()
agences, ville = [], None
for f in sorted((R/"scripts"/"brut").glob("agences_*.txt")):
    for l in f.read_text(encoding="utf-8").splitlines():
        if not l.strip(): continue
        if l.startswith("#"): ville = l[1:].strip(); continue
        nom, _, adr = l.partition("|")
        nom = re.sub(r"\s+", " ", html.unescape(nom).replace("\xa0", " ")).strip()
        adr = re.sub(r"\s+", " ", html.unescape(adr).replace("\xa0", " ")).strip()
        v = ville.title().replace("Mechouar-Fes - El Jadid", "Fès (Mechouar)").replace("Mechouar De Casablanca", "Casablanca")
        a = {"nom": nom, "ville": v, "adresse": adr}
        if OMRA.search(norm(nom)): a["omra_probable"] = True
        agences.append(a)
agences.sort(key=lambda a: (norm(a["ville"]), norm(a["nom"])))
(R/"data"/"agences.js").write_text(
    "// Annuaire officiel MTAESS — Organisateurs/Distributeurs de voyages ("+str(len(agences))+" agences).\n"
    "// Source : https://mtaess.gov.ma/fr/annuaires/annuaire-des-agences-de-voyages/organisateurs-distributeurs-de-voyages/\n"
    "// Extrait le 2026-11-24. omra_probable = nom évoquant l'Omra/Hajj (heuristique).\n"
    "window.AGENCES = " + json.dumps(agences, ensure_ascii=False, indent=0) + ";\n", encoding="utf-8")
print(len(agences), "agences;", sum(1 for a in agences if a.get("omra_probable")), "omra_probable;", len({a['ville'] for a in agences}), "villes")
