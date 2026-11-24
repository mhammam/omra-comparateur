/* Interface : recherche, filtres, tri, comparateur. */
(function () {
  "use strict";
  const L = window.OmraLogic;
  const OFFRES = window.OFFRES || [];
  const AGENCES = window.AGENCES || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const MAX_COMP = 4;
  const NC = "n.c.";
  const selection = new Set();
  let etoilesMin = 0;

  const fmtPrix = (n) => (n === null || n === undefined ? NC : new Intl.NumberFormat("fr-MA").format(Math.round(n)) + " MAD");
  const fmtDate = (s, an = true) => new Date(s + "T12:00:00").toLocaleDateString("fr-FR", an ? { day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "short" });
  const fmtDist = (h) => {
    if (!h || typeof h.distance_m !== "number") return "distance " + NC;
    const m = h.distance_m, txt = m >= 1000 ? (m / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " km" : m + " m";
    return (h.distance_source === "estimation" ? "≈ " : "") + txt;
  };
  const etoiles = (h) => (h && typeof h.etoiles === "number" ? "★".repeat(h.etoiles) + "☆".repeat(5 - h.etoiles) : "étoiles " + NC);
  const nomHotel = (h) => (h && h.nom) || NC;
  const libVol = (o) => (!o.vol ? "Vol " + NC : o.vol.type === "direct" ? "Direct" : "Escale" + (o.vol.escale ? " · " + o.vol.escale : ""));
  const CH_LIB = { single: "Single", double: "Double", triple: "Triple", quadruple: "Quadruple", quintuple: "Quintuple", min: "à partir de" };

  // Vérification dans l'annuaire officiel
  const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
  const ANNUAIRE = new Map(AGENCES.map((a) => [norm(a.nom), a]));
  const agreee = (o) => ANNUAIRE.get(norm(o.agence));

  /* ---------- Initialisation ---------- */
  const villes = [...new Set(OFFRES.map((o) => o.ville_depart).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
  villes.forEach((v) => $("#f-ville").add(new Option(v, v)));
  Object.entries(L.CRITERES).forEach(([k, c]) => $("#tri").add(new Option(c.libelle, k)));
  const nbAgences = new Set(OFFRES.map((o) => o.agence)).size;
  $("#bandeau-info").innerHTML = `<strong>${OFFRES.length} offres réelles</strong> de ${nbAgences} agences agréées, relevées le ${fmtDate(window.COLLECTE || "2026-11-24")} sur leurs sites. Informations non publiées : « n.c. ». Confirmez toujours auprès de l'agence.`;

  const params = new URLSearchParams(location.search);
  const champs = { debut: "#f-debut", fin: "#f-fin", ville: "#f-ville", prixMax: "#f-prix", tri: "#tri", chambre: "#f-chambre" };
  Object.entries(champs).forEach(([k, sel]) => { if (params.get(k)) $(sel).value = params.get(k); });
  if (params.get("vol")) { const r = $(`input[name=vol][value="${params.get("vol")}"]`); if (r) r.checked = true; }

  /* ---------- Lecture des filtres ---------- */
  function lireFiltres() {
    const num = (sel) => { const v = parseFloat($(sel).value); return isNaN(v) ? 0 : v; };
    const dm = num("#f-makkah"), dd = num("#f-medine");
    return {
      debut: $("#f-debut").value, fin: $("#f-fin").value,
      mode: $("input[name=mode]:checked").value,
      ville: $("#f-ville").value, chambre: $("#f-chambre").value,
      prixMax: num("#f-prix"), vol: $("input[name=vol]:checked").value, etoilesMin,
      distMakkah: dm >= +$("#f-makkah").max ? 0 : dm,
      distMedine: dd >= +$("#f-medine").max ? 0 : dd,
      dureeMin: num("#f-dmin"), dureeMax: num("#f-dmax"),
      agence: $("#f-agence").value.trim(), completes: $("#f-completes").checked,
    };
  }
  const lirePoids = () => ({ prix: +$("#w-prix").value, etoiles: +$("#w-etoiles").value, distance: +$("#w-distance").value, direct: +$("#w-direct").value });

  function majSorties() {
    const m = +$("#f-makkah").value, d = +$("#f-medine").value;
    $("#o-makkah").textContent = m >= +$("#f-makkah").max ? "toutes" : "≤ " + fmtDist({ distance_m: m });
    $("#o-medine").textContent = d >= +$("#f-medine").max ? "toutes" : "≤ " + fmtDist({ distance_m: d });
    const poids = lirePoids(), tot = Object.values(poids).reduce((a, b) => a + b, 0) || 1;
    $$(".poids output").forEach((o) => { const k = o.dataset.for.slice(2); o.textContent = Math.round((100 * poids[k]) / tot) + " %"; });
  }

  /* ---------- Rendu ---------- */
  function rendre() {
    majSorties();
    const f = lireFiltres();
    if (f.debut && f.fin && f.debut > f.fin) {
      $("#compte").textContent = "La date de début doit précéder la date de fin.";
      $("#liste").innerHTML = "";
      return;
    }
    const filtrees = L.filtrer(OFFRES, f);
    const scores = L.scorer(filtrees, lirePoids(), f.chambre);
    const liste_ = L.trier(filtrees, $("#tri").value, scores, f.chambre);

    $("#compte").textContent = `${liste_.length} offre${liste_.length > 1 ? "s" : ""} sur ${OFFRES.length}`;
    const liste = $("#liste");
    liste.innerHTML = "";
    if (!liste_.length) {
      liste.innerHTML = '<li class="vide">Aucune offre ne correspond. Élargissez les dates, le budget, ou retirez les filtres étoiles / distance (beaucoup d\'agences ne publient pas ces informations).</li>';
      return;
    }
    const tpl = $("#tpl-offre");
    liste_.forEach((o, i) => {
      const n = tpl.content.cloneNode(true);
      const li = $(".offre", n);
      li.dataset.id = o.id;
      $(".titre", n).innerHTML = `<span class="rang">#${i + 1}</span>`;
      $(".titre", n).append(o.titre);
      const ag = agreee(o);
      const agEl = $(".agence", n);
      agEl.textContent = (o.marque ? `${o.marque} — ` : "") + `${ag ? ag.nom : o.agence} · ${o.ville_agence || ""}`;
      const badge = document.createElement("span");
      badge.className = ag ? "badge ok" : "badge ko";
      badge.textContent = ag ? "✓ Agréée MTAESS" : "⚠ Non trouvée dans l'annuaire";
      agEl.append(" ", badge);
      $(".score span", n).textContent = scores.get(o.id);

      // Départs
      const dps = L.departsDansPeriode(o, f.debut, f.fin, f.mode);
      const dEl = $(".departs", n);
      if (!dps.length) dEl.textContent = "Dates : " + NC;
      else if (dps[0].estime) dEl.textContent = `📅 ${o.periode.libelle} — dates exactes à demander à l'agence`;
      else dEl.textContent = "📅 Départs : " + dps.map((d) => fmtDate(d.debut, false)).join(" · ") + (o.ville_depart ? ` — de ${o.ville_depart}` : "");

      [["hm", o.hotel_makkah], ["hd", o.hotel_medine]].forEach(([c, h]) => {
        const b = $("." + c, n);
        $(".nom", b).textContent = nomHotel(h);
        $(".etoiles", b).textContent = etoiles(h);
        $(".dist", b).textContent = fmtDist(h);
        if (!h || !h.nom) b.classList.add("inconnu");
      });
      $(".vol .nom", n).textContent = o.duree_jours ? `${o.duree_jours} jours` : "Durée " + NC;
      const p = $(".pastille", n);
      p.className = "pastille " + (L.typeVol(o) || "nc");
      p.textContent = libVol(o);

      // Prix par chambre
      const ch = $(".chambres", n);
      L.CHAMBRES.filter((c) => L.prixPour(o, c) !== null).forEach((c) => {
        const s = document.createElement("span");
        s.className = "chip" + (c === f.chambre ? " actif" : "");
        s.textContent = `${CH_LIB[c]} ${fmtPrix(L.prixPour(o, c))}`;
        ch.append(s);
      });
      $(".inclus", n).textContent = [o.repas, ...(o.inclus || [])].filter(Boolean).length ? "Inclus : " + [o.repas, ...(o.inclus || [])].filter(Boolean).join(" · ") : "";
      $(".note", n).textContent = o.note ? "ℹ️ " + o.note : "";
      const prix = L.prixPour(o, f.chambre);
      $(".prix strong", n).textContent = fmtPrix(prix);
      const pj = L.prixJour(o, f.chambre);
      $(".prix small", n).textContent = (f.chambre === "min" ? "à partir de, par pers." : `par pers. en ${CH_LIB[f.chambre].toLowerCase()}`) + (pj && o.duree_jours ? ` · ${fmtPrix(pj)} / jour` : "");
      const a = $(".lien-source", n);
      a.href = o.source;
      const cb = $(".comp-case input", n);
      cb.checked = selection.has(o.id);
      li.classList.toggle("selection", cb.checked);
      cb.addEventListener("change", () => basculer(o.id, cb, li));
      liste.append(n);
    });
    majUrl(f);
  }

  function majUrl(f) {
    const p = new URLSearchParams();
    ["debut", "fin", "prixMax"].forEach((k) => f[k] && p.set(k, f[k]));
    if (f.ville !== "toutes") p.set("ville", f.ville);
    if (f.vol !== "tous") p.set("vol", f.vol);
    if (f.chambre !== "min") p.set("chambre", f.chambre);
    if ($("#tri").value !== "score") p.set("tri", $("#tri").value);
    const q = p.toString();
    try { history.replaceState(null, "", q ? "?" + q : location.pathname); } catch (e) { /* aperçu sandboxé */ }
  }

  /* ---------- Comparateur ---------- */
  function basculer(id, cb, li) {
    if (cb.checked) {
      if (selection.size >= MAX_COMP) { cb.checked = false; $("#comp-compte").textContent = `Maximum ${MAX_COMP} offres à comparer.`; return; }
      selection.add(id);
    } else selection.delete(id);
    li.classList.toggle("selection", cb.checked);
    majBarre();
  }
  function majBarre() {
    $("#barre-comp").hidden = selection.size === 0;
    $("#comp-compte").textContent = `${selection.size} offre${selection.size > 1 ? "s" : ""} sélectionnée${selection.size > 1 ? "s" : ""}` + (selection.size < 2 ? " — choisissez-en au moins 2" : "");
    $("#comp-ouvrir").disabled = selection.size < 2;
  }

  function ouvrirComparateur() {
    const ch = $("#f-chambre").value;
    const offres = OFFRES.filter((o) => selection.has(o.id));
    const sc = L.scorer(offres, lirePoids(), ch);
    const num = (v) => (v === null || v === undefined ? null : v);
    const dist = (h) => (h && typeof h.distance_m === "number" ? h.distance_m : null);
    const et = (h) => (h && typeof h.etoiles === "number" ? h.etoiles : null);
    // [libellé, affichage, valeur numérique, sens]
    const lignes = [
      ["Score (entre ces offres)", (o) => sc.get(o.id), (o) => sc.get(o.id), "max"],
      ...L.CHAMBRES.map((c) => [`Prix ${CH_LIB[c].toLowerCase()}`, (o) => fmtPrix(L.prixPour(o, c)), (o) => L.prixPour(o, c), "min"])
        .filter(([, , v]) => offres.some((o) => v(o) !== null)),
      ["Prix / jour", (o) => (o.duree_jours ? fmtPrix(L.prixJour(o, ch)) : NC), (o) => (o.duree_jours ? L.prixJour(o, ch) : null), "min"],
      ["Départs", (o) => { const d = L.departs(o); return !d.length ? NC : d[0].estime ? o.periode.libelle : d.map((x) => fmtDate(x.debut, false)).join(", "); }, null, null],
      ["Durée", (o) => (o.duree_jours ? o.duree_jours + " jours" : NC), (o) => num(o.duree_jours), "max"],
      ["Vol", libVol, (o) => ({ direct: 1, escale: 0 }[L.typeVol(o)] ?? null), "max"],
      ["Hôtel Makkah", (o) => nomHotel(o.hotel_makkah), null, null],
      ["Étoiles Makkah", (o) => etoiles(o.hotel_makkah), (o) => et(o.hotel_makkah), "max"],
      ["Distance Haram", (o) => fmtDist(o.hotel_makkah), (o) => dist(o.hotel_makkah), "min"],
      ["Hôtel Médine", (o) => nomHotel(o.hotel_medine), null, null],
      ["Étoiles Médine", (o) => etoiles(o.hotel_medine), (o) => et(o.hotel_medine), "max"],
      ["Distance Mosquée du Prophète", (o) => fmtDist(o.hotel_medine), (o) => dist(o.hotel_medine), "min"],
      ["Repas", (o) => o.repas || NC, null, null],
      ["Inclus", (o) => (o.inclus && o.inclus.length ? o.inclus.join(", ") : NC), null, null],
      ["Agréée MTAESS", (o) => (agreee(o) ? "✓ Oui" : "⚠ Non trouvée"), (o) => (agreee(o) ? 1 : 0), "max"],
    ];
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    let html = "<table><thead><tr><th></th>" + offres.map((o) => `<td>${esc(o.titre)}<br><small>${esc(o.agence)} · <a href="${esc(o.source)}" target="_blank" rel="noopener">source ↗</a></small></td>`).join("") + "</tr></thead><tbody>";
    lignes.forEach(([lib, aff, val, sens]) => {
      let best = null;
      if (val && sens) {
        const vs = offres.map(val).filter((v) => v !== null && v !== undefined);
        if (vs.length > 1) {
          const b = sens === "min" ? Math.min(...vs) : Math.max(...vs);
          if (vs.some((v) => v !== b)) best = b;
        }
      }
      html += `<tr><th>${lib}</th>` + offres.map((o) => {
        const v = val ? val(o) : null, txt = aff(o);
        const cls = best !== null && v === best ? "meilleur" : String(txt).includes(NC) ? "nc" : "";
        return `<td class="${cls}">${esc(txt)}</td>`;
      }).join("") + "</tr>";
    });
    $("#comp-table").innerHTML = html + "</tbody></table>";
    $("#comparateur").showModal();
  }

  /* ---------- Événements ---------- */
  $("#recherche").addEventListener("submit", (e) => { e.preventDefault(); rendre(); $(".resultats").scrollIntoView({ behavior: "smooth" }); });
  ["#f-debut", "#f-fin", "#f-ville", "#f-prix", "#tri", "#f-dmin", "#f-dmax", "#f-chambre", "#f-completes"].forEach((s) => $(s).addEventListener("change", rendre));
  ["#f-makkah", "#f-medine", "#f-agence", "#w-prix", "#w-etoiles", "#w-distance", "#w-direct"].forEach((s) => $(s).addEventListener("input", rendre));
  $$("input[name=mode], input[name=vol]").forEach((r) => r.addEventListener("change", rendre));
  $$("#f-etoiles button").forEach((b) => b.addEventListener("click", () => {
    $$("#f-etoiles button").forEach((x) => x.classList.remove("actif"));
    b.classList.add("actif");
    etoilesMin = +b.dataset.v;
    rendre();
  }));
  $("#reinit").addEventListener("click", () => {
    $("#recherche").reset();
    ["#f-dmin", "#f-dmax", "#f-agence"].forEach((s) => ($(s).value = ""));
    $("#f-ville").value = "toutes";
    $("#f-completes").checked = false;
    $("#f-makkah").value = $("#f-makkah").max;
    $("#f-medine").value = $("#f-medine").max;
    $("input[name=vol][value=tous]").checked = true;
    $("input[name=mode][value=depart]").checked = true;
    $$("#f-etoiles button")[0].click();
  });
  $("#comp-ouvrir").addEventListener("click", ouvrirComparateur);
  $("#comp-vider").addEventListener("click", () => { selection.clear(); majBarre(); rendre(); });
  $("#comp-fermer").addEventListener("click", () => $("#comparateur").close());
  $("#comparateur").addEventListener("click", (e) => { if (e.target.id === "comparateur") e.target.close(); });

  rendre();
})();
