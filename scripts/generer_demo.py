#!/usr/bin/env python3
"""Génère data/offres.js avec des OFFRES DE DÉMONSTRATION.

Les agences sont fictives (« Agence démo A », ...) et les prix sont indicatifs.
Remplacez ce fichier par les vraies offres collectées auprès des agences
(même format) avant toute mise en production.

Usage : python3 scripts/generer_demo.py
"""
import json
import random
from datetime import date, timedelta
from pathlib import Path

random.seed(2026)

# Distances approximatives à pied jusqu'au Masjid al-Haram / Masjid an-Nabawi (mètres).
# À VÉRIFIER auprès de l'agence : elles varient selon l'entrée utilisée.
HOTELS_MAKKAH = [
    {"nom": "Swissôtel Makkah (Abraj Al Bait)", "etoiles": 5, "distance_m": 50},
    {"nom": "Pullman ZamZam Makkah", "etoiles": 5, "distance_m": 100},
    {"nom": "Al Marwa Rayhaan by Rotana", "etoiles": 5, "distance_m": 100},
    {"nom": "Hilton Makkah Convention", "etoiles": 5, "distance_m": 450},
    {"nom": "Elaf Ajyad", "etoiles": 4, "distance_m": 300},
    {"nom": "Le Méridien Towers Makkah (navette)", "etoiles": 5, "distance_m": 2500},
    {"nom": "Hôtel 4★ Misfalah (exemple)", "etoiles": 4, "distance_m": 700},
    {"nom": "Hôtel 3★ Aziziyah (exemple, navette)", "etoiles": 3, "distance_m": 4000},
]
HOTELS_MEDINE = [
    {"nom": "The Oberoi Madina", "etoiles": 5, "distance_m": 50},
    {"nom": "Dar Al Taqwa", "etoiles": 5, "distance_m": 50},
    {"nom": "Anwar Al Madinah Mövenpick", "etoiles": 5, "distance_m": 150},
    {"nom": "Pullman ZamZam Madina", "etoiles": 5, "distance_m": 350},
    {"nom": "Dallah Taibah", "etoiles": 4, "distance_m": 200},
    {"nom": "Hôtel 4★ Markazia (exemple)", "etoiles": 4, "distance_m": 450},
    {"nom": "Hôtel 3★ (exemple)", "etoiles": 3, "distance_m": 900},
]
VOLS = [
    {"compagnie": "Royal Air Maroc", "type": "direct", "escale": None},
    {"compagnie": "Saudia", "type": "direct", "escale": None},
    {"compagnie": "Turkish Airlines", "type": "escale", "escale": "Istanbul"},
    {"compagnie": "EgyptAir", "type": "escale", "escale": "Le Caire"},
    {"compagnie": "Emirates", "type": "escale", "escale": "Dubaï"},
]
VILLES = ["Casablanca", "Casablanca", "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Oujda"]
AGENCES = [f"Agence démo {c}" for c in "ABCDEFGH"]
INCLUS_BASE = ["Visa Omra", "Billet d'avion", "Transferts", "Encadrement religieux"]
INCLUS_OPTION = ["Petit-déjeuner", "Demi-pension", "Ziyarates Makkah", "Ziyarates Médine", "Train Haramain", "Assurance"]


def prix_offre(hm, hd, vol, nuits):
    base = 7000 if vol["type"] == "direct" else 5800
    def h(hotel, n):
        tarif = {5: 650, 4: 380, 3: 220}[hotel["etoiles"]]
        if hotel["distance_m"] <= 150:
            tarif *= 1.35
        elif hotel["distance_m"] > 1500:
            tarif *= 0.7
        return tarif * n
    total = base + h(hm, nuits[0]) + h(hd, nuits[1]) + 1500
    total *= random.uniform(0.92, 1.1)
    return int(round(total / 100) * 100)


def main():
    offres = []
    debut = date(2026, 12, 5)
    for i in range(36):
        d = debut + timedelta(days=random.randint(0, 110))
        nm, nd = random.choice([(7, 5), (8, 6), (10, 5), (6, 4), (12, 6), (9, 6)])
        hm = random.choice(HOTELS_MAKKAH)
        hd = random.choice(HOTELS_MEDINE)
        vol = dict(random.choice(VOLS))
        vol["arrivee"] = random.choice(["JED", "MED"])
        inclus = INCLUS_BASE + random.sample(INCLUS_OPTION, random.randint(1, 4))
        offres.append({
            "id": f"DEMO-{i + 1:03d}",
            "agence": random.choice(AGENCES),
            "ville_depart": random.choice(VILLES),
            "date_depart": d.isoformat(),
            "date_retour": (d + timedelta(days=nm + nd + 1)).isoformat(),
            "nuits_makkah": nm,
            "nuits_medine": nd,
            "prix": prix_offre(hm, hd, vol, (nm, nd)),
            "chambre": random.choice(["Quadruple", "Quadruple", "Triple", "Double"]),
            "vol": vol,
            "hotel_makkah": hm,
            "hotel_medine": hd,
            "inclus": inclus,
            "contact": "",
            "demo": True,
        })
    offres.sort(key=lambda o: o["date_depart"])
    out = Path(__file__).resolve().parent.parent / "data" / "offres.js"
    out.write_text(
        "// OFFRES DE DÉMONSTRATION — agences fictives, prix indicatifs.\n"
        "// Format documenté dans README.md. Générées par scripts/generer_demo.py\n"
        "window.OFFRES = " + json.dumps(offres, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"{len(offres)} offres écrites dans {out}")


if __name__ == "__main__":
    main()
