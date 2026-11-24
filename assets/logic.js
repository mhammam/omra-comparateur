/* Logique métier : filtres, score, tris. Sans dépendance DOM (testable avec Node). */
(function (racine) {
  "use strict";

  const nuits = (o) => o.nuits_makkah + o.nuits_medine;
  const prixNuit = (o) => o.prix / Math.max(1, nuits(o));
  const etoilesMoy = (o) => (o.hotel_makkah.etoiles + o.hotel_medine.etoiles) / 2;
  const distanceMoy = (o) => (o.hotel_makkah.distance_m + o.hotel_medine.distance_m) / 2;

  /**
   * f = { debut, fin, mode: "depart"|"sejour", ville, prixMax, etoilesMin,
   *       distMakkah, distMedine, vol: "tous"|"direct"|"escale", agence, nuitsMin, nuitsMax }
   * Dates au format AAAA-MM-JJ (comparaison lexicographique fiable).
   */
  function filtrer(offres, f = {}) {
    return offres.filter((o) => {
      if (f.debut && o.date_depart < f.debut) return false;
      if (f.fin) {
        const borne = f.mode === "sejour" ? o.date_retour : o.date_depart;
        if (borne > f.fin) return false;
      }
      if (f.ville && f.ville !== "toutes" && o.ville_depart !== f.ville) return false;
      if (f.prixMax && o.prix > f.prixMax) return false;
      if (f.etoilesMin && (o.hotel_makkah.etoiles < f.etoilesMin || o.hotel_medine.etoiles < f.etoilesMin)) return false;
      if (f.distMakkah && o.hotel_makkah.distance_m > f.distMakkah) return false;
      if (f.distMedine && o.hotel_medine.distance_m > f.distMedine) return false;
      if (f.vol && f.vol !== "tous" && o.vol.type !== f.vol) return false;
      if (f.nuitsMin && nuits(o) < f.nuitsMin) return false;
      if (f.nuitsMax && nuits(o) > f.nuitsMax) return false;
      if (f.agence && !o.agence.toLowerCase().includes(f.agence.toLowerCase())) return false;
      return true;
    });
  }

  const POIDS_DEFAUT = { prix: 40, etoiles: 25, distance: 25, direct: 10 };

  /** Score 0–100 relatif à l'ensemble d'offres fourni. Plus haut = meilleur. */
  function scorer(offres, poids = POIDS_DEFAUT) {
    if (!offres.length) return new Map();
    const pn = offres.map(prixNuit);
    const minP = Math.min(...pn), maxP = Math.max(...pn);
    // distance en échelle log : passer de 50 m à 300 m compte plus que de 2 km à 2,3 km
    const ld = offres.map((o) => Math.log10(Math.max(20, distanceMoy(o))));
    const minD = Math.min(...ld), maxD = Math.max(...ld);
    const total = Object.values(poids).reduce((a, b) => a + b, 0) || 1;
    const norm = (v, min, max) => (max === min ? 1 : (max - v) / (max - min)); // 1 = meilleur
    const scores = new Map();
    offres.forEach((o, i) => {
      const s =
        poids.prix * norm(pn[i], minP, maxP) +
        poids.etoiles * ((etoilesMoy(o) - 3) / 2) +
        poids.distance * norm(ld[i], minD, maxD) +
        poids.direct * (o.vol.type === "direct" ? 1 : 0);
      scores.set(o.id, Math.round((100 * s) / total));
    });
    return scores;
  }

  const CRITERES = {
    score: { libelle: "Meilleur score global", cmp: (a, b, s) => s.get(b.id) - s.get(a.id) },
    prix_asc: { libelle: "Prix croissant", cmp: (a, b) => a.prix - b.prix },
    prix_desc: { libelle: "Prix décroissant", cmp: (a, b) => b.prix - a.prix },
    prix_nuit: { libelle: "Prix par nuit", cmp: (a, b) => prixNuit(a) - prixNuit(b) },
    direct: { libelle: "Vols directs d'abord", cmp: (a, b) => (a.vol.type === "direct" ? 0 : 1) - (b.vol.type === "direct" ? 0 : 1) || a.prix - b.prix },
    etoiles: { libelle: "Classement hôtels (étoiles)", cmp: (a, b) => etoilesMoy(b) - etoilesMoy(a) || a.prix - b.prix },
    distance_makkah: { libelle: "Hôtel le + proche du Haram (Makkah)", cmp: (a, b) => a.hotel_makkah.distance_m - b.hotel_makkah.distance_m || a.prix - b.prix },
    distance_medine: { libelle: "Hôtel le + proche de la Mosquée du Prophète (Médine)", cmp: (a, b) => a.hotel_medine.distance_m - b.hotel_medine.distance_m || a.prix - b.prix },
    date: { libelle: "Date de départ", cmp: (a, b) => a.date_depart.localeCompare(b.date_depart) },
    duree: { libelle: "Durée la plus longue", cmp: (a, b) => nuits(b) - nuits(a) || a.prix - b.prix },
  };

  function trier(offres, critere = "score", scores = scorer(offres)) {
    const c = CRITERES[critere] || CRITERES.score;
    return [...offres].sort((a, b) => c.cmp(a, b, scores));
  }

  const api = { filtrer, scorer, trier, CRITERES, POIDS_DEFAUT, nuits, prixNuit, etoilesMoy, distanceMoy };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else racine.OmraLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
