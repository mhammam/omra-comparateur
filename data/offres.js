// OFFRES RÉELLES relevées sur les sites des agences (collecte du 2026-11-24).
// Chaque offre renvoie vers sa source. Les champs à null n'étaient PAS publiés par l'agence.
// Les distances marquées "estimation" viennent d'une table de référence (scripts/hotels_ref.json), pas de l'agence.
// Prix en MAD par personne. Toujours reconfirmer auprès de l'agence avant de payer.
window.COLLECTE = "2026-11-24";
window.OFFRES = [
  {
    "id": "MAN-RJ-TOPVIP", "titre": "Omra Rajab TOP VIP", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": ["2026-12-02","2026-12-09","2026-12-15","2026-12-23","2026-12-30","2027-01-06"], "duree_jours": 10,
    "periode": null,
    "prix": {"single": 75000, "double": 48900, "triple": 39900},
    "hotel_makkah": {"nom": "Raffles Makkah Palace", "etoiles": 5, "distance_m": 100, "distance_source": "estimation"},
    "hotel_medine": {"nom": "The Biltmore Almadinah", "etoiles": null, "distance_m": null},
    "vol": null, "repas": "Petit-déjeuner",
    "inclus": ["Billet A/R", "Visa", "Assurance", "Transport bus", "Ziyarates"],
    "source": "https://manasiki.ma/fr/tour/omra-rajab-2026-maroc-manasiki-travel-casa-maroc/"
  },
  {
    "id": "MAN-RJ-VIP2", "titre": "Omra Rajab VIP 2", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": ["2026-12-02","2026-12-09","2026-12-15","2026-12-23","2026-12-30","2027-01-02","2027-01-06"], "duree_jours": 12,
    "periode": null,
    "prix": {"single": 49000, "double": 29000, "triple": 27900, "quadruple": 25900},
    "hotel_makkah": {"nom": "Jumeirah Jabal Omar Makkah", "etoiles": 5, "distance_m": 400, "distance_source": "estimation"},
    "hotel_medine": {"nom": "Worth Peninsula Madinah", "etoiles": null, "distance_m": null},
    "vol": null, "repas": null,
    "inclus": ["Billet A/R", "Visa", "Assurance", "Transport bus", "Ziyarates"],
    "source": "https://manasiki.ma/fr/tour/omra-rajab-2026-manasiki-travel-casablanca/"
  },
  {
    "id": "MAN-RJ-LUXE1", "titre": "Omra Rajab Luxe 1", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": ["2026-12-02","2026-12-09","2026-12-16","2026-12-23","2027-01-02","2027-01-06","2027-01-20"], "duree_jours": 12,
    "periode": null,
    "prix": {"single": 46000, "double": 26900, "triple": 24500, "quadruple": 22500},
    "hotel_makkah": {"nom": "Address Jabal Omar Makkah", "etoiles": 5, "distance_m": 350, "distance_source": "estimation"},
    "hotel_medine": {"nom": "Dar Al Eiman Al Haram", "etoiles": null, "distance_m": 100, "distance_source": "estimation"},
    "vol": null, "repas": "Petit-déjeuner",
    "inclus": ["Billet A/R", "Visa", "Assurance", "Transport bus", "Ziyarates"],
    "source": "https://manasiki.ma/fr/tour/omra-rajab-2026-maroc-manasiki-tave-casablanca/"
  },
  {
    "id": "MAN-RJ-MOMAYAZ", "titre": "Omra Rajab Al Momayaz", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": ["2026-12-02","2026-12-09","2026-12-16","2026-12-23","2026-12-30","2027-01-02","2027-01-06"], "duree_jours": 12,
    "periode": null,
    "prix": {"single": 32000, "double": 21500, "triple": 19500, "quadruple": 17500},
    "hotel_makkah": {"nom": "Emaar Grand Hotel", "etoiles": null, "distance_m": null},
    "hotel_medine": {"nom": "Ancyra Madinah Hotel", "etoiles": null, "distance_m": null},
    "vol": null, "repas": null,
    "inclus": ["Billet A/R", "Visa", "Assurance", "Transport bus", "Ziyarates"],
    "source": "https://manasiki.ma/fr/tour/omra-rajab-2025-maroc-manasiki-travel-casablanca-2/"
  },
  {
    "id": "MAN-RJ-VIP1", "titre": "Omra Rajab VIP 1", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": 12, "periode": {"debut": "2026-12-01", "fin": "2027-01-20", "libelle": "Rajab (déc. – janv.)"},
    "prix": {"min": 35000},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": "Petit-déjeuner", "inclus": [],
    "source": "https://manasiki.ma/fr/tour-category/omra-rajab-manasiki-travel-2026-maroc/"
  },
  {
    "id": "MAN-RJ-LUXE2", "titre": "Omra Rajab Luxe 2", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": 15, "periode": {"debut": "2026-12-01", "fin": "2027-01-20", "libelle": "Rajab (déc. – janv.)"},
    "prix": {"min": 26900},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": "Petit-déjeuner", "inclus": [],
    "source": "https://manasiki.ma/fr/tour-category/omra-rajab-manasiki-travel-2026-maroc/"
  },
  {
    "id": "MAN-RJ-TOUR1", "titre": "Omra Rajab Touristique 1", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": 12, "periode": {"debut": "2026-12-01", "fin": "2027-01-20", "libelle": "Rajab (déc. – janv.)"},
    "prix": {"min": 16900},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": "Petit-déjeuner", "inclus": [],
    "source": "https://manasiki.ma/fr/tour-category/omra-rajab-manasiki-travel-2026-maroc/"
  },
  {
    "id": "MAN-RJ-ECO1", "titre": "Omra Rajab Eco 1", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": 12, "periode": {"debut": "2026-12-01", "fin": "2027-01-20", "libelle": "Rajab (déc. – janv.)"},
    "prix": {"min": 15900},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": "Sans repas", "inclus": [],
    "source": "https://manasiki.ma/fr/tour-category/omra-rajab-manasiki-travel-2026-maroc/"
  },
  {
    "id": "MAN-RJ-ECO2", "titre": "Omra Rajab Eco 2", "saison": "Rajab",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": 14, "periode": {"debut": "2026-12-01", "fin": "2027-01-20", "libelle": "Rajab (déc. – janv.)"},
    "prix": {"min": 15500},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": "Sans repas", "inclus": [],
    "source": "https://manasiki.ma/fr/tour-category/omra-rajab-manasiki-travel-2026-maroc/"
  },
  {
    "id": "MAN-RM-TOUR2", "titre": "Omra Ramadan Touristic 2", "saison": "Ramadan",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": ["2027-01-27","2027-02-07","2027-02-10","2027-02-20","2027-02-24","2027-03-01"], "duree_jours": 14,
    "periode": null,
    "prix": {"single": 45000, "double": 30900, "triple": 28000, "quadruple": 26000},
    "hotel_makkah": {"nom": "Prestige Ajyad Hotel", "etoiles": null, "distance_m": null},
    "hotel_medine": {"nom": "Ancyra Madinah Hotel", "etoiles": null, "distance_m": null},
    "vol": null, "repas": null,
    "inclus": ["Billet A/R", "Visa", "Assurance", "Transport bus", "Ziyarates"],
    "source": "https://manasiki.ma/fr/tour/omra-touristic-ramadan-2027-manasiki-travel-casa/"
  },
  {
    "id": "MAN-RM-LUXE2", "titre": "Omra Ramadan Luxe 2", "saison": "Ramadan",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": ["2027-01-27","2027-02-22","2027-02-24","2027-03-01"], "duree_jours": 15,
    "periode": null,
    "prix": {"single": 65000, "double": 44500, "triple": 39500, "quadruple": 36500},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": null,
    "inclus": ["Billet A/R", "Visa", "Assurance", "Transport bus", "Ziyarates"],
    "note": "Hôtels non nommés dans le texte de l'annonce.",
    "source": "https://manasiki.ma/fr/tour/omra-ramadan2027-maroc-manasiki-travel-casablanca/"
  },
  {
    "id": "MAN-RM-TOUR1", "titre": "Omra Ramadan Touristic 1", "saison": "Ramadan",
    "agence": "MANASIKI TRAVEL", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": null, "periode": {"debut": "2027-01-27", "fin": "2027-03-08", "libelle": "Ramadan 2027"},
    "prix": {"min": 27000},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": null, "inclus": [],
    "source": "https://manasiki.ma/fr/tour/omra-touristic-ramadan-2027-maroc-casablanca/"
  },
  {
    "id": "ITP-RM-INDIRECT", "titre": "Omra Ramadan – vol avec escale", "saison": "Ramadan",
    "agence": "itinerance-plus", "marque": "Labayyk / Package Omra Pas Cher", "ville_agence": "Marrakech", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": null, "periode": {"debut": "2027-02-07", "fin": "2027-03-08", "libelle": "Ramadan 2027 (dates sur demande)"},
    "prix": {"quintuple": 23500, "double": 32500},
    "hotel_makkah": {"nom": "Hotel Makkah (ou Maysan Al Safa / Abraj Al Taysir)", "etoiles": null, "distance_m": null},
    "hotel_medine": {"nom": "Al Markaziya", "etoiles": null, "distance_m": null},
    "vol": {"type": "escale", "compagnie": null}, "repas": "Sans repas",
    "inclus": ["Billet A/R", "Visa", "Transferts", "Encadrement religieux"],
    "source": "https://www.packageomrapascher.com/fr/programmes-omra-ramadan-2027"
  },
  {
    "id": "ITP-RM-DIRECT", "titre": "Omra Ramadan – vol direct", "saison": "Ramadan",
    "agence": "itinerance-plus", "marque": "Labayyk / Package Omra Pas Cher", "ville_agence": "Marrakech", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": null, "periode": {"debut": "2027-02-07", "fin": "2027-03-08", "libelle": "Ramadan 2027 (dates sur demande)"},
    "prix": {"quintuple": 27000, "triple": 30500, "double": 36000},
    "hotel_makkah": {"nom": "Maysan Al Safa (ou Abraj Al Taysir)", "etoiles": null, "distance_m": null},
    "hotel_medine": null,
    "vol": {"type": "direct", "compagnie": null}, "repas": "Sans repas",
    "inclus": ["Billet A/R direct", "Visa", "Transferts", "Encadrement religieux"],
    "source": "https://www.packageomrapascher.com/fr/omra-ramadan-vol-direct"
  },
  {
    "id": "ITP-RM-15J", "titre": "Omra Ramadan 15 jours", "saison": "Ramadan",
    "agence": "itinerance-plus", "marque": "Labayyk / Package Omra Pas Cher", "ville_agence": "Marrakech", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": 15, "periode": {"debut": "2027-02-07", "fin": "2027-03-08", "libelle": "Ramadan 2027 (dates sur demande)"},
    "prix": {"quintuple": 27000, "triple": 30500, "double": 36000},
    "hotel_makkah": {"nom": "Maysan Al Safa (ou Abraj Al Taysir)", "etoiles": null, "distance_m": null},
    "hotel_medine": null, "vol": null, "repas": "Sans repas",
    "inclus": ["Billet A/R", "Visa", "Transferts", "Encadrement religieux"],
    "source": "https://www.packageomrapascher.com/fr/omra-ramadan-15-jours"
  },
  {
    "id": "LOY-RM", "titre": "Omra Ramadan 2027 – mois complet", "saison": "Ramadan",
    "agence": "LOYAL TOURS", "ville_agence": "Kénitra", "ville_depart": null,
    "dates": [], "duree_jours": 30, "periode": {"debut": "2027-02-07", "fin": "2027-03-10", "libelle": "Ramadan 1448 (mois complet)"},
    "prix": {"min": 18500},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": null,
    "inclus": ["Billet A/R", "Visa", "Hébergement", "Transferts", "Guide religieux", "Ziyarates"],
    "source": "https://loyaltours.ma/omra/"
  },
  {
    "id": "GAL-DEC", "titre": "Omra Décembre 2026", "saison": "Décembre",
    "agence": "GALAXY VOYAGE", "ville_agence": "Casablanca", "ville_depart": null,
    "dates": [], "duree_jours": null, "periode": {"debut": "2026-12-01", "fin": "2026-12-31", "libelle": "Décembre 2026"},
    "prix": {"min": 15500},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": null, "inclus": [],
    "source": "https://www.galaxyvoyage.ma/packages/hajj-omra"
  },
  {
    "id": "ALK-RM", "titre": "Omra Ramadan", "saison": "Ramadan",
    "agence": "ALKHOUZAMA VOYAGES", "ville_agence": "Nador", "ville_depart": null,
    "dates": [], "duree_jours": null, "periode": {"debut": "2027-02-07", "fin": "2027-03-08", "libelle": "Ramadan 2027"},
    "prix": {"min": 18900},
    "hotel_makkah": null, "hotel_medine": null, "vol": null, "repas": null, "inclus": [],
    "note": "Le titre de l'annonce mentionne encore 2024 : faire confirmer l'édition 2027.",
    "source": "https://www.alkhouzama.ma/hajj-omra-maroc"
  },
  {
    "id": "MAR-RM", "titre": "Omra Ramadan 2027 (Standard / Confort / Premium)", "saison": "Ramadan",
    "agence": "MARESOL TOURS", "ville_agence": "Casablanca", "ville_depart": "Casablanca",
    "dates": [], "duree_jours": 12, "periode": {"debut": "2027-02-05", "fin": "2027-03-11", "libelle": "Ramadan 2027 (sur devis)"},
    "prix": {"double": 25500},
    "hotel_makkah": {"nom": "3★ à 5★ selon formule", "etoiles": null, "distance_m": null},
    "hotel_medine": null, "vol": null, "repas": null,
    "inclus": ["Billet A/R", "Visa", "Transport Médine–Makkah", "Guide"],
    "note": "Prix « à partir de » en chambre double ; formules sur devis.",
    "source": "https://www.maresoltours.fr/blog-omra-ramadan-2027-guide.html"
  }
];
