/* Logique métier : filtres, score, tris. Sans dépendance DOM (testable avec Node).
   Les données réelles sont souvent incomplètes : toute valeur peut être null ("non communiqué"). */
(function (racine) {
  "use strict";

  const CHAMBRES = ["single", "double", "triple", "quadruple", "quintuple"];
  const DUREE_TYPE = 12; // durée utilisée pour estimer un prix/jour quand l'agence ne la publie pas

  const ajouterJours = (iso, n) => {
    const d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };

  /** Prix pour un type de chambre ("min" = le moins cher publié). null si non publié. */
  function prixPour(o, chambre = "min") {
    const p = o.prix || {};
    if (chambre === "min") {
      const v = Object.values(p).filter((x) => typeof x === "number");
      return v.length ? Math.min(...v) : null;
    }
    return typeof p[chambre] === "number" ? p[chambre] : null;
  }

  /** Liste des départs : dates exactes si publiées, sinon la période annoncée (estime = true). */
  function departs(o) {
    if (o.dates && o.dates.length) {
      return o.dates.map((d) => ({ debut: d, fin: o.duree_jours ? ajouterJours(d, o.duree_jours - 1) : d, estime: false }));
    }
    if (o.periode) return [{ debut: o.periode.debut, fin: o.periode.fin, estime: true }];
    return [];
  }

  /** Départs compatibles avec la fenêtre [debut, fin]. */
  function departsDansPeriode(o, debut, fin, mode = "depart") {
    return departs(o).filter((d) => {
      if (d.estime) return (!fin || d.debut <= fin) && (!debut || d.fin >= debut); // chevauchement
      if (debut && d.debut < debut) return false;
      if (fin && (mode === "sejour" ? d.fin : d.debut) > fin) return false;
      return true;
    });
  }

  const etoilesMoy = (o) => {
    const v = [o.hotel_makkah, o.hotel_medine].map((h) => h && h.etoiles).filter((x) => typeof x === "number");
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const distance = (h) => (h && typeof h.distance_m === "number" ? h.distance_m : null);
  const distanceMoy = (o) => {
    const v = [distance(o.hotel_makkah), distance(o.hotel_medine)].filter((x) => x !== null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const typeVol = (o) => (o.vol && o.vol.type) || null;
  const prixJour = (o, chambre) => {
    const p = prixPour(o, chambre);
    return p === null ? null : p / (o.duree_jours || DUREE_TYPE);
  };
  /** Part des informations clés publiées (0–1). */
  function completude(o) {
    const champs = [
      o.dates && o.dates.length, o.duree_jours, o.hotel_makkah && o.hotel_makkah.nom, o.hotel_medine && o.hotel_medine.nom,
      etoilesMoy(o) !== null, distanceMoy(o) !== null, typeVol(o), CHAMBRES.some((c) => prixPour(o, c) !== null),
    ];
    return champs.filter(Boolean).length / champs.length;
  }

  /**
   * f = { debut, fin, mode, ville, chambre, prixMax, etoilesMin, distMakkah, distMedine, vol, agence,
   *       dureeMin, dureeMax, completes }
   * Un filtre actif exclut les offres dont la donnée n'est pas publiée.
   */
  function filtrer(offres, f = {}) {
    const ch = f.chambre || "min";
    return offres.filter((o) => {
      if ((f.debut || f.fin) && !departsDansPeriode(o, f.debut, f.fin, f.mode).length) return false;
      if (f.ville && f.ville !== "toutes" && o.ville_depart !== f.ville) return false;
      const p = prixPour(o, ch);
      if (ch !== "min" && p === null) return false;
      if (f.prixMax && (p === null || p > f.prixMax)) return false;
      if (f.etoilesMin) {
        const hs = [o.hotel_makkah, o.hotel_medine];
        if (hs.some((h) => !h || typeof h.etoiles !== "number" || h.etoiles < f.etoilesMin)) return false;
      }
      if (f.distMakkah) { const d = distance(o.hotel_makkah); if (d === null || d > f.distMakkah) return false; }
      if (f.distMedine) { const d = distance(o.hotel_medine); if (d === null || d > f.distMedine) return false; }
      if (f.vol && f.vol !== "tous" && typeVol(o) !== f.vol) return false;
      if (f.dureeMin && (!o.duree_jours || o.duree_jours < f.dureeMin)) return false;
      if (f.dureeMax && (!o.duree_jours || o.duree_jours > f.dureeMax)) return false;
      if (f.agence) {
        const q = f.agence.toLowerCase();
        if (![o.agence, o.marque, o.titre, o.ville_agence].filter(Boolean).some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (f.completes && completude(o) < 0.6) return false;
      return true;
    });
  }

  const POIDS_DEFAUT = { prix: 40, etoiles: 25, distance: 25, direct: 10 };

  /** Score 0–100 relatif aux offres fournies. Donnée inconnue = note neutre (0,5). */
  function scorer(offres, poids = POIDS_DEFAUT, chambre = "min") {
    const scores = new Map();
    if (!offres.length) return scores;
    const pj = offres.map((o) => prixJour(o, chambre));
    const pjc = pj.filter((x) => x !== null);
    const minP = Math.min(...pjc), maxP = Math.max(...pjc);
    const ld = offres.map((o) => { const d = distanceMoy(o); return d === null ? null : Math.log10(Math.max(20, d)); });
    const ldc = ld.filter((x) => x !== null);
    const minD = Math.min(...ldc), maxD = Math.max(...ldc);
    const norm = (v, min, max) => (v === null || !isFinite(min) ? 0.5 : max === min ? 1 : (max - v) / (max - min));
    const total = Object.values(poids).reduce((a, b) => a + b, 0) || 1;
    offres.forEach((o, i) => {
      const e = etoilesMoy(o);
      const v = typeVol(o);
      const s =
        poids.prix * norm(pj[i], minP, maxP) +
        poids.etoiles * (e === null ? 0.5 : (e - 3) / 2) +
        poids.distance * norm(ld[i], minD, maxD) +
        poids.direct * (v === "direct" ? 1 : v === "escale" ? 0 : 0.5);
      scores.set(o.id, Math.round((100 * s) / total));
    });
    return scores;
  }

  // Tri : valeurs inconnues toujours en fin de liste
  const asc = (fa) => (a, b) => { const x = fa(a), y = fa(b); return x === null ? (y === null ? 0 : 1) : y === null ? -1 : x - y; };
  const desc = (fa) => (a, b) => { const x = fa(a), y = fa(b); return x === null ? (y === null ? 0 : 1) : y === null ? -1 : y - x; };
  const premierDepart = (o) => { const d = departs(o)[0]; return d ? Date.parse(d.debut) : null; };

  const CRITERES = {
    score: { libelle: "Meilleur score global", cmp: (s) => (a, b) => s.get(b.id) - s.get(a.id) },
    prix_asc: { libelle: "Prix croissant", cmp: (s, ch) => asc((o) => prixPour(o, ch)) },
    prix_desc: { libelle: "Prix décroissant", cmp: (s, ch) => desc((o) => prixPour(o, ch)) },
    prix_jour: { libelle: "Prix par jour", cmp: (s, ch) => asc((o) => prixJour(o, ch)) },
    direct: { libelle: "Vols directs d'abord", cmp: (s, ch) => (a, b) => ({ direct: 0, escale: 2 }[typeVol(a)] ?? 1) - ({ direct: 0, escale: 2 }[typeVol(b)] ?? 1) || asc((o) => prixPour(o, ch))(a, b) },
    etoiles: { libelle: "Classement hôtels (étoiles)", cmp: () => desc(etoilesMoy) },
    distance_makkah: { libelle: "Hôtel le + proche du Haram (Makkah)", cmp: () => asc((o) => distance(o.hotel_makkah)) },
    distance_medine: { libelle: "Hôtel le + proche de la Mosquée du Prophète", cmp: () => asc((o) => distance(o.hotel_medine)) },
    date: { libelle: "Date de départ", cmp: () => asc(premierDepart) },
    duree: { libelle: "Durée la plus longue", cmp: () => desc((o) => o.duree_jours || null) },
    complet: { libelle: "Offres les plus détaillées", cmp: () => desc(completude) },
  };

  function trier(offres, critere = "score", scores, chambre = "min") {
    const sc = scores || scorer(offres, POIDS_DEFAUT, chambre);
    const c = CRITERES[critere] || CRITERES.score;
    return [...offres].sort(c.cmp(sc, chambre));
  }

  const api = { CHAMBRES, prixPour, prixJour, departs, departsDansPeriode, etoilesMoy, distanceMoy, distance, typeVol, completude, filtrer, scorer, trier, CRITERES, POIDS_DEFAUT };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else racine.OmraLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
