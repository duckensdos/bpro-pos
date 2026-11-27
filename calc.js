/* BPRO price calculator (2026-11-25): "how much does it cost for what I want".
   Renders into <div class="calc" data-lang="kr|fr">. Vanilla JS, no library.
   ONLY prices already published on the site: plans START 15,000 / BUSINESS 50,000 / CORPORATE 250,000 HTG per year,
   1 USD ≈ 137 HTG (same rate as signup.js and pay.pointofsales.fr). Plan rules = the site's own:
   START = 1 location, up to 5 users; BUSINESS = several locations, more than 5 users; CORPORATE = Website / WooCommerce,
   unlimited branches and users (trial.js also sends 51+ people to CORPORATE). Anything without a published price
   (monthly billing, optional modules) is shown as "sur devis", never as a number.
   The button goes to the app's one-page sign-up with the same type/apps parameters trial.js builds (+ plan). */
(function () {
  var box = document.querySelector('.calc[data-lang]'); if (!box) return;
  var FR = box.dataset.lang === 'fr';
  var RATE = 137, PRICE = { start: 15000, business: 50000, corporate: 250000 };
  var BASE = ['pos', 'lavant', 'fakti', 'livrezon', 'stock', 'founise', 'depans', 'rapo', 'kliyan', 'katalog-qr', 'kommand-whatsapp'];
  // [site key, recommended modules, Kreyòl, French] — same list and keys as /eseye and /fr/essayer
  var TYPES = [
    ['boutik-market', 'kontablite', 'Boutik ak market', 'Boutique et supermarché'],
    ['famasi', 'kontablite', 'Famasi', 'Pharmacie'],
    ['quincaillerie', 'kontablite,resous-imen', 'Quincaillerie', 'Quincaillerie'],
    ['auto-parts', 'resous-imen,prezans,kontablite', 'Auto parts', 'Pièces auto'],
    ['restoran', 'resous-imen,prezans', 'Restoran', 'Restaurant'],
    ['barbershop-salon', 'resous-imen,prezans', 'Barbershop ak salon', 'Barbershop et salon'],
    ['gym', 'gym,prezans', 'Gym', 'Gym'],
    ['rad-tenis', 'kontablite', 'Magazen rad ak tenis', 'Vêtements et chaussures'],
    ['garaj-repair', 'reparasyon', 'Garaj ak repair shop', 'Garage et atelier'],
    ['manufacturing', 'fabrikasyon,kontablite', 'Fabrikasyon', 'Fabrication'],
    ['patisri', 'fabrikasyon', 'Patisri', 'Pâtisserie'],
    ['depo', 'resous-imen,prezans,kontablite', 'Depo ak distribitè', 'Dépôt et distributeur'],
    ['klinik', 'kontablite,resous-imen', 'Klinik', 'Clinique'],
    ['otel', 'otel,kontablite', 'Otèl', 'Hôtel'],
    ['miltiservis', 'reparasyon', 'Miltisèvis', 'Multiservices'],
    ['location-machin', 'aktif,kontablite', 'Location machin', 'Location de voitures'],
    ['imobilye', 'crm,pwoje', 'Ajans imobilye', 'Agence immobilière'],
    ['asirans', 'crm,kontablite', 'Asirans', 'Assurance'],
    ['ajans-maketing', 'crm,pwoje', 'Ajans maketing ak sèvis', 'Agence marketing et services'],
    ['biwo-pwofesyonel', 'crm,pwoje,kontablite', 'Biwo pwofesyonèl (kontab, avoka, konsiltan)', 'Cabinet (comptable, avocat, consultant)'],
    ['konstriksyon', 'crm,pwoje', 'Konstriksyon ak sèvis lakay', 'Construction et services à domicile'],
    ['ajans-vwayaj', 'crm,kontablite', 'Ajans vwayaj', 'Agence de voyage'],
    ['other', '', 'Lòt', 'Autre']
  ];
  var MODS = [
    ['woocommerce', 'WooCommerce', 'WooCommerce'], ['kontablite', 'Kontablite', 'Comptabilité'], ['crm', 'CRM', 'CRM'],
    ['asistan-ai', 'Asistan AI', 'Assistant IA'], ['resous-imen', 'Resous imen', 'Ressources humaines'], ['prezans', 'Prezans', 'Présence'],
    ['pwoje', 'Pwojè ak travay', 'Projets et tâches'], ['aktif', 'Aktif', 'Gestion des actifs'], ['fabrikasyon', 'Fabrikasyon', 'Fabrication'],
    ['reparasyon', 'Reparasyon', 'Réparations'], ['gym', 'Gym', 'Gym'], ['otel', 'Otèl', 'Hôtel']
  ];
  var L = FR ? {
    eyebrow: 'Calculateur', title: 'Combien ça coûte pour ce que je veux ?', sub: 'Choisissez votre activité, vos points de vente, vos utilisateurs et vos applications. Le prix se met à jour tout de suite.',
    act: 'Votre activité', loc: 'Points de vente', usr: 'Utilisateurs', apps: 'Applications en plus', base: 'Déjà inclus dans tous les comptes : caisse (POS), ventes, factures, stock, achats, dépenses, clients, rapports, catalogue QR, commandes WhatsApp.',
    bill: 'Paiement', year: 'Annuel', month: 'Mensuel', reset: 'Réinitialiser', perMonth: 'HTG / mois', billedYear: function (n) { return 'Payé ' + n + ' HTG par an'; },
    quote: 'Sur devis', monthNote: function (n) { return 'Le paiement mensuel n\'a pas encore de prix publié. En annuel, cela revient à ' + n + ' HTG / mois.'; },
    plan: 'Plan conseillé', detail: 'Détail par an', partBase: 'Plan de base START (1 point de vente, 5 utilisateurs)',
    partVol: function (p) { return 'Plusieurs points de vente / plus de 5 utilisateurs (' + p + ')'; }, partVolBig: 'Plus de 50 utilisateurs (CORPORATE)',
    partWoo: 'Site web / WooCommerce (CORPORATE)', partMods: function (l) { return 'Modules : ' + l; }, incl: 'Inclus', total: 'Total par an',
    cta: 'Créer mon compte avec cette formule', wa: 'Demander le prix exact sur WhatsApp',
    fine: 'Prix publiés sur ce site. « Sur devis » = pas encore de prix publié : nous vous le donnons sur WhatsApp. Matériel en option, payé une seule fois.',
    waHi: 'Bonjour BPRO POS, je veux un prix pour cette formule :', waAct: 'Activité', waLoc: 'Points de vente', waUsr: 'Utilisateurs', waApps: 'Applications en plus', waBill: 'Paiement', none: 'aucune',
    unit: 'HTG', usd: function (n) { return '≈ $' + n + ' USD / mois'; }, cnt: function (n) { return n + ' choisie' + (n > 1 ? 's' : ''); }
  } : {
    eyebrow: 'Kalkilatè', title: 'Konbyen sa ap koute pou sa m vle a?', sub: 'Chwazi aktivite ou, kantite lokal, kantite itilizatè ak aplikasyon ou bezwen yo. Pri a chanje touswit.',
    act: 'Aktivite ou', loc: 'Pwen de vant (lokal)', usr: 'Itilizatè', apps: 'Aplikasyon anplis', base: 'Deja enkli nan tout kont: POS, lavant, fakti, stock, acha, depans, kliyan, rapò, katalòg QR, kòmand WhatsApp.',
    bill: 'Peman', year: 'Chak ane', month: 'Chak mwa', reset: 'Rekòmanse', perMonth: 'GDES / mwa', billedYear: function (n) { return 'Ou peye ' + n + ' GDES pa ane'; },
    quote: 'Sou demann', monthNote: function (n) { return 'Peman chak mwa poko gen pri pibliye. Pa ane, sa fè ' + n + ' GDES / mwa.'; },
    plan: 'Plan nou konseye', detail: 'Detay pa ane', partBase: 'Plan baz START (1 lokal, 5 itilizatè)',
    partVol: function (p) { return 'Plizyè lokal / plis pase 5 itilizatè (' + p + ')'; }, partVolBig: 'Plis pase 50 itilizatè (CORPORATE)',
    partWoo: 'Website / WooCommerce (CORPORATE)', partMods: function (l) { return 'Modil: ' + l; }, incl: 'Enkli', total: 'Total pa ane',
    cta: 'Kreye kont mwen ak fòmil sa a', wa: 'Mande pri egzak la sou WhatsApp',
    fine: 'Pri ki pibliye sou sit la. « Sou demann » = poko gen pri pibliye: n ap ba ou l sou WhatsApp. Materyèl an opsyon, yon sèl peman.',
    waHi: 'Bonjou BPRO POS, mwen vle pri pou fòmil sa a:', waAct: 'Aktivite', waLoc: 'Lokal', waUsr: 'Itilizatè', waApps: 'Aplikasyon anplis', waBill: 'Peman', none: 'okenn',
    unit: 'GDES', usd: function (n) { return '≈ $' + n + ' USD / mwa'; }, cnt: function (n) { return n + ' chwazi'; }
  };
  var DEF = { type: 'boutik-market', loc: 1, usr: 1, bill: 'year' };
  var fmt = function (n) { return Math.round(n).toLocaleString(FR ? 'fr-FR' : 'en-US').replace(/ | /g, FR ? ' ' : ','); };
  var nm = function (row) { return FR ? row[3] : row[2]; };
  var uid = 'calc' + Math.random().toString(36).slice(2, 7);

  function range(id, label, max, val) {
    return '<div class="calc__f"><div class="calc__row"><label for="' + uid + id + 'n">' + label + '</label>' +
      '<input class="calc__num" id="' + uid + id + 'n" data-k="' + id + '" type="number" inputmode="numeric" min="1" max="999" value="' + val + '"></div>' +
      '<input class="calc__rng" type="range" data-k="' + id + '" min="1" max="' + max + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  box.innerHTML =
    '<div class="calc__head"><span class="eyebrow">' + L.eyebrow + '</span><h3>' + L.title + '</h3><p>' + L.sub + '</p></div>' +
    '<div class="calc__card"><form class="calc__in" novalidate>' +
      '<div class="calc__f"><label for="' + uid + 't">' + L.act + '</label><select id="' + uid + 't" name="type">' +
        TYPES.map(function (t) { return '<option value="' + t[0] + '">' + nm(t) + '</option>'; }).join('') + '</select></div>' +
      range('loc', L.loc, 20, 1) + range('usr', L.usr, 60, 1) +
      '<fieldset class="calc__f"><legend>' + L.apps + ' <small class="calc__cnt"></small></legend><div class="calc__chips">' +
        MODS.map(function (m) { return '<label class="calc__chip"><input type="checkbox" name="mod" value="' + m[0] + '"><span>' + (FR ? m[2] : m[1]) + '</span></label>'; }).join('') +
      '</div><p class="calc__base">' + L.base + '</p></fieldset>' +
      '<fieldset class="calc__f"><legend>' + L.bill + '</legend><div class="calc__seg">' +
        '<label><input type="radio" name="bill" value="year" checked><span>' + L.year + '</span></label>' +
        '<label><input type="radio" name="bill" value="month"><span>' + L.month + '</span></label></div></fieldset>' +
    '</form>' +
    '<div class="calc__out" aria-live="polite">' +
      '<div class="calc__top"><span class="calc__plan"></span><button type="button" class="calc__reset" hidden>' + L.reset + '</button></div>' +
      '<div class="calc__big"></div><div class="calc__sub"></div>' +
      '<div class="calc__bar" aria-hidden="true"></div>' +
      '<p class="calc__dh">' + L.detail + '</p><ul class="calc__list"></ul>' +
      '<a class="btn btn-p calc__cta" href="#" target="_blank" rel="noopener">' + L.cta + '</a>' +
      '<a class="calc__wa" href="#" target="_blank" rel="noopener">' + L.wa + '</a>' +
      '<p class="calc__fine">' + L.fine + '</p>' +
    '</div></div>';

  var form = box.querySelector('form'), sel = form.elements.type, mods = [].slice.call(form.querySelectorAll('input[name=mod]'));
  var nums = [].slice.call(box.querySelectorAll('.calc__num')), rngs = [].slice.call(box.querySelectorAll('.calc__rng'));
  var st = { loc: 1, usr: 1 }, auto = [], recSet = '';

  function setVal(k, v, from) {
    v = parseInt(v, 10); if (!(v >= 1)) v = from === 'num-typing' ? null : 1; if (v > 999) v = 999;
    if (v === null) return; st[k] = v;
    nums.forEach(function (n) { if (n.dataset.k === k && from !== 'num-typing') n.value = v; });
    rngs.forEach(function (r) { if (r.dataset.k === k) { r.value = Math.min(v, +r.max); r.style.setProperty('--p', ((Math.min(v, +r.max) - 1) / (r.max - 1) * 100) + '%'); } });
  }
  function recommend() {
    var t = TYPES.filter(function (x) { return x[0] === sel.value; })[0], rec = (t[1] || '').split(',').filter(Boolean);
    auto.forEach(function (b) { b.checked = false; }); auto = [];
    mods.forEach(function (b) { if (rec.indexOf(b.value) > -1 && !b.checked) { b.checked = true; auto.push(b); } });
    recSet = rec.slice().sort().join(',');
  }
  function render() {
    var bill = form.querySelector('input[name=bill]:checked').value, chosen = mods.filter(function (b) { return b.checked; });
    var woo = chosen.some(function (b) { return b.value === 'woocommerce'; });
    var others = chosen.filter(function (b) { return b.value !== 'woocommerce'; }).map(function (b) { return b.nextElementSibling.textContent; });
    var vol = st.usr > 50 ? 'corporate' : (st.loc > 1 || st.usr > 5) ? 'business' : 'start';
    var tier = woo ? 'corporate' : vol, year = PRICE[tier];
    var parts = [{ c: 'a', t: L.partBase, v: PRICE.start }];
    if (vol !== 'start') parts.push({ c: 'b', t: vol === 'corporate' ? L.partVolBig : L.partVol('BUSINESS'), v: PRICE[vol] - PRICE.start });
    if (woo) parts.push({ c: 'c', t: L.partWoo, v: PRICE.corporate - PRICE[vol] });
    box.querySelector('.calc__plan').innerHTML = L.plan + ' <b>BPRO ' + tier.toUpperCase() + '</b>';
    var big = box.querySelector('.calc__big'), sub = box.querySelector('.calc__sub');
    if (bill === 'year') {
      big.innerHTML = fmt(year / 12) + ' <small>' + L.perMonth + '</small>';
      sub.innerHTML = L.billedYear(fmt(year)) + ' · ' + L.usd(fmt(year / 12 / RATE));
    } else {
      big.textContent = L.quote;
      sub.textContent = L.monthNote(fmt(year / 12));
    }
    box.querySelector('.calc__bar').innerHTML = parts.filter(function (p) { return p.v > 0; }).map(function (p) {
      return '<i class="calc__s' + p.c + '" style="flex:' + p.v + '"></i>'; }).join('');
    var rows = parts.filter(function (p) { return p.v > 0; }).map(function (p) {
      return '<li><span class="calc__dot calc__s' + p.c + '"></span><span>' + p.t + '</span><b>' + (p === parts[0] ? '' : '+') + fmt(p.v) + ' ' + L.unit + '</b></li>'; });
    if (others.length) rows.push('<li class="calc__q"><span class="calc__dot"></span><span>' + L.partMods(others.join(', ')) + '</span><b>' + L.quote + '</b></li>');
    rows.push('<li class="calc__tot"><span></span><span>' + L.total + '</span><b>' + fmt(year) + ' ' + L.unit + (others.length ? ' +' : '') + '</b></li>');
    box.querySelector('.calc__list').innerHTML = rows.join('');
    box.querySelector('.calc__cnt').textContent = chosen.length ? L.cnt(chosen.length) : '';
    mods.forEach(function (b) { b.parentNode.classList.toggle('on', b.checked); });
    // same link trial.js builds for the app sign-up (type + every app, base included), plus the plan
    var q = [];
    if (sel.value !== 'other') {
      q.push('type=' + encodeURIComponent(sel.value));
      q.push('apps=' + encodeURIComponent(BASE.concat(chosen.map(function (b) { return b.value; })).join(',')));
    }
    q.push('plan=' + tier);
    box.querySelector('.calc__cta').href = 'https://app.pointofsales.fr/eseye?' + q.join('&');
    var t = TYPES.filter(function (x) { return x[0] === sel.value; })[0];
    var msg = [L.waHi, '', L.waAct + ': ' + nm(t), L.waLoc + ': ' + st.loc, L.waUsr + ': ' + st.usr,
      L.waApps + ': ' + (chosen.length ? chosen.map(function (b) { return b.nextElementSibling.textContent; }).join(', ') : L.none),
      L.waBill + ': ' + (bill === 'year' ? L.year : L.month), 'Plan: BPRO ' + tier.toUpperCase()].join('\n');
    box.querySelector('.calc__wa').href = 'https://wa.me/50943830148?text=' + encodeURIComponent(msg);
    var changed = sel.value !== DEF.type || st.loc !== DEF.loc || st.usr !== DEF.usr || bill !== DEF.bill || chosen.map(function (b) { return b.value; }).sort().join(',') !== recSet;
    box.querySelector('.calc__reset').hidden = !changed;
  }
  function reset() {
    sel.value = DEF.type; mods.forEach(function (b) { b.checked = false; }); auto = [];
    form.querySelector('input[name=bill][value=year]').checked = true;
    setVal('loc', DEF.loc); setVal('usr', DEF.usr); recommend(); render();
  }
  sel.addEventListener('change', function () { recommend(); render(); });
  rngs.forEach(function (r) { r.addEventListener('input', function () { setVal(r.dataset.k, r.value); render(); }); });
  nums.forEach(function (n) {
    n.addEventListener('input', function () { setVal(n.dataset.k, n.value, 'num-typing'); render(); });
    n.addEventListener('change', function () { setVal(n.dataset.k, n.value); render(); });
  });
  mods.forEach(function (b) { b.addEventListener('change', function () { var i = auto.indexOf(b); if (i > -1) auto.splice(i, 1); render(); }); });
  form.addEventListener('change', function (e) { if (e.target.name === 'bill') render(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  box.querySelector('.calc__reset').addEventListener('click', reset);
  reset();
})();
