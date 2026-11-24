/* Interface : recherche, filtres, tri, comparateur. */
(function () {
  "use strict";
  const L = window.OmraLogic;
  const OFFRES = window.OFFRES || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const MAX_COMP = 4;
  const selection = new Set();
  let etoilesMin = 0;

  const fmtPrix = (n) => new Intl.NumberFormat("fr-MA").format(Math.round(n)) + " MAD";
  const fmtDate = (s) => new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const fmtDist = (m) => (m >= 1000 ? (m / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " km" : m + " m");
  const etoiles = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  /* ---------- Initialisation ---------- */
  const villes = [...new Set(OFFRES.map((o) => o.ville_depart))].sort((a, b) => a.localeCompare(b, "fr"));
  villes.forEach((v) => $("#f-ville").add(new Option(v, v)));
  Object.entries(L.CRITERES).forEach(([k, c]) => $("#tri").add(new Option(c.libelle, k)));
  if (OFFRES.some((o) => o.demo)) $("#bandeau-demo").hidden = false;

  // Lecture des paramètres d'URL (recherche partageable)
  const params = new URLSearchParams(location.search);
  const champs = { debut: "#f-debut", fin: "#f-fin", ville: "#f-ville", prixMax: "#f-prix", tri: "#tri" };
  Object.entries(champs).forEach(([k, sel]) => { if (params.get(k)) $(sel).value = params.get(k); });
  if (params.get("vol")) { const r = $(`input[name=vol][value="${params.get("vol")}"]`); if (r) r.checked = true; }

  /* ---------- Lecture des filtres ---------- */
  function lireFiltres() {
    const num = (sel) => { const v = parseFloat($(sel).value); return isNaN(v) ? 0 : v; };
    const dm = num("#f-makkah"), dd = num("#f-medine");
    return {
      debut: $("#f-debut").value,
      fin: $("#f-fin").value,
      mode: $("input[name=mode]:checked").value,
      ville: $("#f-ville").value,
      prixMax: num("#f-prix"),
      vol: $("input[name=vol]:checked").value,
      etoilesMin,
      distMakkah: dm >= +$("#f-makkah").max ? 0 : dm,
      distMedine: dd >= +$("#f-medine").max ? 0 : dd,
      nuitsMin: num("#f-nmin"),
      nuitsMax: num("#f-nmax"),
      agence: $("#f-agence").value.trim(),
    };
  }
  function lirePoids() {
    return { prix: +$("#w-prix").value, etoiles: +$("#w-etoiles").value, distance: +$("#w-distance").value, direct: +$("#w-direct").value };
  }

  function majSorties() {
    const m = +$("#f-makkah").value, d = +$("#f-medine").value;
    $("#o-makkah").textContent = m >= +$("#f-makkah").max ? "toutes" : "≤ " + fmtDist(m);
    $("#o-medine").textContent = d >= +$("#f-medine").max ? "toutes" : "≤ " + fmtDist(d);
    const poids = lirePoids(), tot = Object.values(poids).reduce((a, b) => a + b, 0) || 1;
    $$(".poids output").forEach((o) => { const k = o.dataset.for.slice(2); o.textContent = Math.round((100 * poids[k]) / tot) + " %"; });
  }

  /* ---------- Rendu ---------- */
  let derniers = [];
  let scores = new Map();

  function rendre() {
    majSorties();
    const f = lireFiltres();
    if (f.debut && f.fin && f.debut > f.fin) {
      $("#compte").textContent = "La date de début doit précéder la date de fin.";
      $("#liste").innerHTML = "";
      return;
    }
    const filtrees = L.filtrer(OFFRES, f);
    scores = L.scorer(filtrees, lirePoids());
    derniers = L.trier(filtrees, $("#tri").value, scores);

    $("#compte").textContent = `${derniers.length} offre${derniers.length > 1 ? "s" : ""} sur ${OFFRES.length}`;
    const liste = $("#liste");
    liste.innerHTML = "";
    if (!derniers.length) {
      liste.innerHTML = '<li class="vide">Aucune offre ne correspond. Élargissez les dates, le budget ou la distance.</li>';
      return;
    }
    const tpl = $("#tpl-offre");
    derniers.forEach((o, i) => {
      const n = tpl.content.cloneNode(true);
      const li = $(".offre", n);
      li.dataset.id = o.id;
      $(".agence", n).innerHTML = `<span class="rang">#${i + 1}</span>`;
      $(".agence", n).append(`${o.agence} · départ ${o.ville_depart}`);
      $(".dates", n).textContent = `${fmtDate(o.date_depart)} → ${fmtDate(o.date_retour)} · ${L.nuits(o)} nuits · chambre ${o.chambre.toLowerCase()}`;
      $(".score span", n).textContent = scores.get(o.id);
      [["hm", o.hotel_makkah, o.nuits_makkah], ["hd", o.hotel_medine, o.nuits_medine]].forEach(([c, h, nb]) => {
        const b = $("." + c, n);
        $(".nuits", b).textContent = `${nb} nuits`;
        $(".nom", b).textContent = h.nom;
        $(".etoiles", b).textContent = etoiles(h.etoiles);
        $(".dist", b).textContent = fmtDist(h.distance_m);
      });
      $(".vol .nom", n).textContent = o.vol.compagnie + (o.vol.arrivee ? ` → ${o.vol.arrivee}` : "");
      const p = $(".pastille", n);
      p.className = "pastille " + o.vol.type;
      p.textContent = o.vol.type === "direct" ? "Direct" : `Escale · ${o.vol.escale}`;
      $(".inclus", n).textContent = "Inclus : " + o.inclus.join(" · ");
      $(".prix strong", n).textContent = fmtPrix(o.prix);
      $(".prix small", n).textContent = `/ pers. · ${fmtPrix(L.prixNuit(o))} / nuit`;
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
    if ($("#tri").value !== "score") p.set("tri", $("#tri").value);
    const q = p.toString();
    try { history.replaceState(null, "", q ? "?" + q : location.pathname); } catch (e) { /* aperçu sandboxé */ }
  }

  /* ---------- Comparateur ---------- */
  function basculer(id, cb, li) {
    if (cb.checked) {
      if (selection.size >= MAX_COMP) { cb.checked = false; alertDouce(`Maximum ${MAX_COMP} offres à comparer.`); return; }
      selection.add(id);
    } else selection.delete(id);
    li.classList.toggle("selection", cb.checked);
    majBarre();
  }
  function alertDouce(msg) { $("#comp-compte").textContent = msg; $("#barre-comp").hidden = false; setTimeout(majBarre, 1800); }
  function majBarre() {
    $("#barre-comp").hidden = selection.size === 0;
    $("#comp-compte").textContent = `${selection.size} offre${selection.size > 1 ? "s" : ""} sélectionnée${selection.size > 1 ? "s" : ""}` + (selection.size < 2 ? " — choisissez-en au moins 2" : "");
    $("#comp-ouvrir").disabled = selection.size < 2;
  }

  function ouvrirComparateur() {
    const offres = OFFRES.filter((o) => selection.has(o.id));
    const sc = L.scorer(offres, lirePoids());
    // [libellé, valeur affichée, valeur numérique, sens ("min"|"max"|null)]
    const lignes = [
      ["Score (entre ces offres)", (o) => sc.get(o.id), (o) => sc.get(o.id), "max"],
      ["Prix / personne", (o) => fmtPrix(o.prix), (o) => o.prix, "min"],
      ["Prix / nuit", (o) => fmtPrix(L.prixNuit(o)), (o) => L.prixNuit(o), "min"],
      ["Dates", (o) => `${fmtDate(o.date_depart)} → ${fmtDate(o.date_retour)}`, null, null],
      ["Nuits Makkah / Médine", (o) => `${o.nuits_makkah} / ${o.nuits_medine}`, (o) => L.nuits(o), "max"],
      ["Départ", (o) => o.ville_depart, null, null],
      ["Vol", (o) => `${o.vol.compagnie} — ${o.vol.type === "direct" ? "direct" : "escale " + o.vol.escale}`, (o) => (o.vol.type === "direct" ? 1 : 0), "max"],
      ["Hôtel Makkah", (o) => o.hotel_makkah.nom, null, null],
      ["Étoiles Makkah", (o) => etoiles(o.hotel_makkah.etoiles), (o) => o.hotel_makkah.etoiles, "max"],
      ["Distance Haram", (o) => fmtDist(o.hotel_makkah.distance_m), (o) => o.hotel_makkah.distance_m, "min"],
      ["Hôtel Médine", (o) => o.hotel_medine.nom, null, null],
      ["Étoiles Médine", (o) => etoiles(o.hotel_medine.etoiles), (o) => o.hotel_medine.etoiles, "max"],
      ["Distance Mosquée du Prophète", (o) => fmtDist(o.hotel_medine.distance_m), (o) => o.hotel_medine.distance_m, "min"],
      ["Chambre", (o) => o.chambre, null, null],
      ["Inclus", (o) => o.inclus.join(", "), (o) => o.inclus.length, "max"],
    ];
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    let html = "<table><thead><tr><th></th>" + offres.map((o) => `<td>${esc(o.agence)}<br><small>${esc(o.id)}</small></td>`).join("") + "</tr></thead><tbody>";
    lignes.forEach(([lib, aff, val, sens]) => {
      let best = null;
      if (val && sens) {
        const vs = offres.map(val);
        const b = sens === "min" ? Math.min(...vs) : Math.max(...vs);
        if (vs.some((v) => v !== b)) best = b;
      }
      html += `<tr><th>${lib}</th>` + offres.map((o) => `<td class="${best !== null && val(o) === best ? "meilleur" : ""}">${esc(aff(o))}</td>`).join("") + "</tr>";
    });
    $("#comp-table").innerHTML = html + "</tbody></table>";
    $("#comparateur").showModal();
  }

  /* ---------- Événements ---------- */
  $("#recherche").addEventListener("submit", (e) => { e.preventDefault(); rendre(); $(".resultats").scrollIntoView({ behavior: "smooth" }); });
  ["#f-debut", "#f-fin", "#f-ville", "#f-prix", "#tri", "#f-nmin", "#f-nmax"].forEach((s) => $(s).addEventListener("change", rendre));
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
    ["#f-nmin", "#f-nmax", "#f-agence"].forEach((s) => ($(s).value = ""));
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
