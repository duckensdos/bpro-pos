/* BPRO setup assistant (2026-11-26): "describe your business, we pick everything".
   Renders into <div class="assist" data-lang="kr|fr">. Vanilla JS, no library, no server, no AI service:
   a keyword matcher (Kreyòl / French / English) picks the business type and modules, then asks 2-4 short
   questions (points of sale, users, apps) so the setup is right, then shows the plan and price and sends the
   visitor to the app's sign-up (pay, then use) with the same type/apps/plan link as calc.js and trial.js.
   Prices and plan rules = the site's published ones (see calc.js). Nothing is sent anywhere until a click. */
(function () {
  var box = document.querySelector('.assist[data-lang]'); if (!box) return;
  var FR = box.dataset.lang === 'fr';
  var RATE = 137, PRICE = { start: 15000, business: 50000, corporate: 250000 }, WA = '50943830148';
  var BASE = ['pos', 'lavant', 'fakti', 'livrezon', 'stock', 'founise', 'depans', 'rapo', 'kliyan', 'katalog-qr', 'kommand-whatsapp'];
  // key, recommended modules, Kreyòl, French, emoji, keywords (lowercase, no accents)
  var TYPES = [
    ['boutik-market', 'kontablite', 'Boutik ak market', 'Boutique et supermarché', '🛒', 'boutik market supermarche superette epicerie grocery minimarket mini market magasin store depot de vivres provision'],
    ['famasi', 'kontablite', 'Famasi', 'Pharmacie', '💊', 'famasi pharmacie pharmacy medikaman medicament'],
    ['quincaillerie', 'kontablite,resous-imen', 'Quincaillerie', 'Quincaillerie', '🔩', 'quincaillerie hardware materyo materiaux siman ciment fe a beton'],
    ['auto-parts', 'resous-imen,prezans,kontablite', 'Auto parts', 'Pièces auto', '🚗', 'auto parts pyes machin piece auto pieces auto pieces detachees spare parts pneu pneus kawotchou batri batterie batteries lwil huile'],
    ['restoran', 'resous-imen,prezans', 'Restoran', 'Restaurant', '🍽️', 'restoran restaurant manje fast food snack bar cafe kafe resto pizza griyad fritay'],
    ['barbershop-salon', 'resous-imen,prezans', 'Barbershop ak salon', 'Barbershop et salon', '💈', 'barbershop barber barbe salon kwafi coiffure beaute beauty nail esthetique spa'],
    ['gym', 'gym,prezans', 'Gym', 'Gym', '🏋️', 'gym fitness jimnaz salle de sport'],
    ['rad-tenis', 'kontablite', 'Magazen rad ak tenis', 'Vêtements et chaussures', '👟', 'rad tenis soulye vetement vetements chaussure chaussures clothes clothing shoes fashion mode pret a porter'],
    ['garaj-repair', 'reparasyon', 'Garaj ak repair shop', 'Garage et atelier', '🔧', 'garaj garage mekanik mecanique repair shop atelier reparasyon telefon reparation'],
    ['manufacturing', 'fabrikasyon,kontablite', 'Fabrikasyon', 'Fabrication', '🏭', 'fabrik fabrikasyon fabrication usine factory manufacturing production pwodiksyon'],
    ['patisri', 'fabrikasyon', 'Patisri', 'Pâtisserie', '🎂', 'patisri patisserie boulangerie bakery gato gateau'],
    ['depo', 'resous-imen,prezans,kontablite', 'Depo ak distribitè', 'Dépôt et distributeur', '📦', 'depo depot distribite distributeur distribution wholesale en gros an gwo grossiste'],
    ['klinik', 'kontablite,resous-imen', 'Klinik', 'Clinique', '🩺', 'klinik clinique clinic lopital hopital dokte docteur medecin laboratwa laboratoire dentist dantis'],
    ['otel', 'otel,kontablite', 'Otèl', 'Hôtel', '🏨', 'otel hotel guest house guesthouse chanm chambre motel airbnb'],
    ['miltiservis', 'reparasyon', 'Miltisèvis', 'Multiservices', '🖨️', 'miltisevis multiservice multiservices fotokopi photocopie impression cyber transfe transfert'],
    ['location-machin', 'aktif,kontablite', 'Location machin', 'Location de voitures', '🚙', 'location machin lokasyon machin location de voiture location voiture rent a car car rental'],
    ['imobilye', 'crm,pwoje', 'Ajans imobilye', 'Agence immobilière', '🏠', 'imobilye immobilier immobiliere real estate kay pou vann kay pou lwe teren terrain appartement apatman'],
    ['asirans', 'crm,kontablite', 'Asirans', 'Assurance', '🛡️', 'asirans assurance insurance'],
    ['ajans-maketing', 'crm,pwoje', 'Ajans maketing ak sèvis', 'Agence marketing et services', '📣', 'maketing marketing ajans agence publicite piblisite communication design media sosyal'],
    ['biwo-pwofesyonel', 'crm,pwoje,kontablite', 'Biwo pwofesyonèl', 'Cabinet (comptable, avocat, consultant)', '💼', 'cabinet biwo avoka avocat lawyer note notaire konsiltan consultant consulting comptable accountant'],
    ['konstriksyon', 'crm,pwoje', 'Konstriksyon ak sèvis lakay', 'Construction et services à domicile', '🏗️', 'konstriksyon construction batiman chantier plonbye plomberie plumber elektrisyen electricien toiture roofing menuiserie penti peinture entrepreneur'],
    ['ajans-vwayaj', 'crm,kontablite', 'Ajans vwayaj', 'Agence de voyage', '✈️', 'vwayaj voyage travel tike avyon billet avion visa paspo passeport'],
    ['other', '', 'Lòt', 'Autre', '➕', '']
  ];
  // module key, Kreyòl, French, keywords
  var MODS = [
    ['woocommerce', 'Vann sou entènèt (WooCommerce)', 'Vente en ligne (WooCommerce)', 'enternet internet online en ligne site web website woocommerce ecommerce e commerce'],
    ['kontablite', 'Kontablite', 'Comptabilité', 'kontablite comptabilite accounting bilan'],
    ['crm', 'CRM: swiv kliyan ak prospè', 'CRM : suivi clients et prospects', 'crm prospe prospect prospects relance suivi client swiv kliyan pipeline lead leads'],
    ['resous-imen', 'Resous imen ak pewòl', 'Ressources humaines et paie', 'pewol payroll paie salaire sale resous imen ressources humaines rh'],
    ['prezans', 'Prezans anplwaye', 'Présence des employés', 'prezans presence pointage attendance le travay horaire'],
    ['pwoje', 'Pwojè ak travay', 'Projets et tâches', 'pwoje projet projets chantier tach tache taches task'],
    ['asistan-ai', 'Asistan AI', 'Assistant IA', ' ai ia intelligence artificielle asistan'],
    ['aktif', 'Aktif (machin, ekipman)', 'Gestion des actifs', 'aktif actifs ekipman equipement flotte'],
    ['fabrikasyon', 'Fabrikasyon', 'Fabrication', 'fabrikasyon fabrication recette resèt'],
    ['reparasyon', 'Reparasyon', 'Réparations', 'reparasyon reparation repair'],
    ['gym', 'Abònman gym', 'Abonnements gym', 'abonman abonnement membre manm'],
    ['otel', 'Chanm otèl', 'Chambres d\'hôtel', 'chanm chambre reservation rezevasyon']
  ];
  var L = FR ? {
    eyebrow: 'Assistant de configuration', title: 'Décrivez votre entreprise. On choisit tout pour vous.',
    sub: 'Écrivez en quelques mots ce que vous faites. L\'assistant choisit le type d\'entreprise, les applications et le plan, vous pose 2 ou 3 questions, puis vous payez et commencez.',
    ph: 'Exemple : J\'ai une pharmacie à Delmas avec 2 caisses et 4 employés…', send: 'Envoyer', you: 'Vous', bot: 'BPRO',
    ex: ['Pharmacie avec 2 caisses', 'Restaurant avec livraison', 'Agence immobilière', 'Boutique de vêtements et vente en ligne'],
    found: function (t) { return 'Compris : <b>' + t + '</b>. Quelques questions pour bien configurer votre compte.'; },
    notFound: 'Je n\'ai pas bien reconnu votre activité. Choisissez celle qui vous ressemble le plus :',
    qLoc: 'Combien de points de vente (magasins, succursales) avez-vous ?', locs: [['1', 1], ['2 ou 3', 3], ['4 à 10', 10], ['Plus de 10', 11]],
    qUsr: 'Combien de personnes vont utiliser le système ?', usrs: [['1 à 5', 5], ['6 à 20', 20], ['21 à 50', 50], ['Plus de 50', 51]],
    qApps: 'Voici les applications que je vous conseille. Décochez celles dont vous n\'avez pas besoin, puis confirmez.', confirm: 'Confirmer', ok: 'C\'est bon',
    base: 'Toujours inclus : caisse (POS), ventes, factures, stock, achats, dépenses, clients, rapports, catalogue QR, commandes WhatsApp.',
    sum: 'Votre configuration', type: 'Activité', loc: 'Points de vente', usr: 'Utilisateurs', apps: 'Applications en plus', none: 'aucune',
    plan: 'Plan', perYear: 'HTG / an', perMonth: 'HTG / mois', usd: function (n) { return '≈ $' + n + ' USD / an'; },
    quote: 'Les modules en plus sont sur devis : nous vous donnons le prix exact sur WhatsApp.',
    pay: 'Payer et créer mon compte', payH: 'Paiement par MonCash, NatCash, Zelle, Unibank ou code d\'activation. Votre compte est activé après la vérification du paiement.',
    wa: 'Poser une question sur WhatsApp', restart: 'Recommencer', edit: 'Modifier',
    waHi: 'Bonjour BPRO POS, voici ma configuration :', waDesc: 'Ma description'
  } : {
    eyebrow: 'Asistan konfigirasyon', title: 'Eksplike biznis ou. N ap chwazi tout bagay pou ou.',
    sub: 'Ekri an kèk mo sa ou fè. Asistan an chwazi tip biznis la, aplikasyon yo ak plan an, li poze w 2 oswa 3 kesyon, epi ou peye e ou kòmanse.',
    ph: 'Egzanp: Mwen gen yon famasi Delmas, 2 kès ak 4 anplwaye…', send: 'Voye', you: 'Ou', bot: 'BPRO',
    ex: ['Famasi ak 2 kès', 'Restoran ak livrezon', 'Ajans imobilye', 'Boutik rad ak vant sou entènèt'],
    found: function (t) { return 'Mwen konprann: <b>' + t + '</b>. Kèk kesyon pou nou konfigire kont ou byen.'; },
    notFound: 'Mwen pa fin rekonèt aktivite w la. Chwazi sa ki pi pre biznis ou:',
    qLoc: 'Konbyen pwen de vant (lokal, branch) ou genyen?', locs: [['1', 1], ['2 oswa 3', 3], ['4 a 10', 10], ['Plis pase 10', 11]],
    qUsr: 'Konbyen moun ki pral itilize sistèm nan?', usrs: [['1 a 5', 5], ['6 a 20', 20], ['21 a 50', 50], ['Plis pase 50', 51]],
    qApps: 'Men aplikasyon mwen konseye w. Retire sa ou pa bezwen, epi konfime.', confirm: 'Konfime', ok: 'Se bon',
    base: 'Toujou enkli: POS, lavant, fakti, stock, acha, depans, kliyan, rapò, katalòg QR, kòmand WhatsApp.',
    sum: 'Konfigirasyon ou', type: 'Aktivite', loc: 'Pwen de vant', usr: 'Itilizatè', apps: 'Aplikasyon anplis', none: 'okenn',
    plan: 'Plan', perYear: 'GDES / ane', perMonth: 'GDES / mwa', usd: function (n) { return '≈ $' + n + ' USD / ane'; },
    quote: 'Modil anplis yo sou demann: n ap ba ou pri egzak la sou WhatsApp.',
    pay: 'Peye epi kreye kont mwen', payH: 'Peman pa MonCash, NatCash, Zelle, Unibank oswa kòd aktivasyon. Kont ou aktive lè nou fin verifye peman an.',
    wa: 'Poze yon kesyon sou WhatsApp', restart: 'Rekòmanse', edit: 'Chanje',
    waHi: 'Bonjou BPRO POS, men konfigirasyon mwen:', waDesc: 'Deskripsyon mwen'
  };
  var fmt = function (n) { return Math.round(n).toLocaleString(FR ? 'fr-FR' : 'en-US').replace(/ | /g, FR ? ' ' : ','); };
  var tName = function (t) { return FR ? t[3] : t[2]; };
  var mName = function (m) { return FR ? m[2] : m[1]; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var norm = function (s) { return ' ' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ') + ' '; };
  var NUM = { un: 1, une: 1, yon: 1, one: 1, de: 2, deux: 2, two: 2, twa: 3, trois: 3, three: 3, kat: 4, quatre: 4, four: 4, senk: 5, cinq: 5, five: 5,
    sis: 6, six: 6, sèt: 7, set: 7, sept: 7, seven: 7, uit: 8, huit: 8, eight: 8, nef: 9, neuf: 9, nine: 9, dis: 10, dix: 10, ten: 10 };

  if (FR) delete NUM.de; // French 'de' is a preposition, not 'two'
  function has(text, kw) { return text.indexOf(' ' + kw + ' ') > -1 || (kw.length > 5 && text.indexOf(kw) > -1); }
  function detectType(text) {
    var best = null, score = 0;
    TYPES.forEach(function (t) {
      if (!t[5]) return;
      var s = 0, kws = t[5].split(' ');
      // two-word phrases first ("pyes machin", "en gros"), then single words
      for (var i = 0; i < kws.length - 1; i++) if (has(text, kws[i] + ' ' + kws[i + 1])) s += 2;
      kws.forEach(function (k) { if (k.length > 2 && has(text, k)) s += 1; });
      if (s > score) { score = s; best = t; }
    });
    return best;
  }
  function detectMods(text) {
    return MODS.filter(function (m) {
      var k = m[3].split(' ').filter(Boolean);
      for (var i = 0; i < k.length - 1; i++) if (has(text, k[i] + ' ' + k[i + 1])) return true;
      return k.some(function (w) { return w.length > 2 && has(text, w); });
    }).map(function (m) { return m[0]; });
  }
  function detectCount(text, words) {
    var re = new RegExp('(\\d+|' + Object.keys(NUM).join('|') + ')\\s+(?:\\w+\\s+)?(' + words + ')');
    var m = text.match(re); if (!m) return null;
    var n = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : NUM[m[1]];
    return n > 0 ? n : null;
  }

  box.innerHTML =
    '<div class="assist__head"><span class="eyebrow">' + L.eyebrow + '</span><h2>' + L.title + '</h2><p>' + L.sub + '</p></div>' +
    '<div class="assist__log" aria-live="polite"></div>' +
    '<form class="assist__box" novalidate><label class="sr" for="assistIn">' + L.title + '</label>' +
      '<textarea id="assistIn" rows="2" placeholder="' + esc(L.ph) + '" maxlength="600"></textarea>' +
      '<div class="assist__bar"><span class="assist__hint">Enter ↵</span>' +
      '<button type="submit" class="assist__send" aria-label="' + L.send + '" disabled><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div></form>' +
    '<div class="assist__ex">' + L.ex.map(function (e) { return '<button type="button" class="assist__chip">' + esc(e) + '</button>'; }).join('') + '</div>';

  var log = box.querySelector('.assist__log'), form = box.querySelector('form'), ta = form.querySelector('textarea'),
      sendBtn = form.querySelector('.assist__send'), ex = box.querySelector('.assist__ex');
  var st;
  function reset() { st = { desc: '', type: null, loc: null, usr: null, mods: [], detMods: [] }; log.innerHTML = ''; form.hidden = false; ex.hidden = false; ta.value = ''; grow(); }
  function grow() { ta.style.height = 'auto'; ta.style.height = Math.min(Math.max(ta.scrollHeight, 64), 200) + 'px'; sendBtn.disabled = !ta.value.trim(); }
  function say(who, html) {
    var d = document.createElement('div'); d.className = 'assist__msg assist__msg--' + who;
    d.innerHTML = '<span class="assist__who">' + (who === 'me' ? L.you : L.bot) + '</span><div>' + html + '</div>';
    log.appendChild(d); return d;
  }
  function choices(opts, onPick) { // one-tap answers; the answered row is locked and the answer shown as the visitor's message
    var d = document.createElement('div'); d.className = 'assist__opts'; d.setAttribute('role', 'group');
    opts.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'assist__chip'; b.innerHTML = o.label;
      b.addEventListener('click', function () { d.remove(); say('me', o.label); onPick(o.value); });
      d.appendChild(b);
    });
    log.appendChild(d); var first = d.querySelector('button'); if (first) first.focus({ preventScroll: true });
    d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function next() {
    if (!st.type) {
      say('bot', L.notFound);
      return choices(TYPES.map(function (t) { return { label: t[4] + ' ' + esc(tName(t)), value: t }; }), function (t) { st.type = t; next(); });
    }
    if (st.loc === null) { say('bot', L.qLoc); return choices(L.locs.map(function (o) { return { label: o[0], value: o[1] }; }), function (v) { st.loc = v; next(); }); }
    if (st.usr === null) { say('bot', L.qUsr); return choices(L.usrs.map(function (o) { return { label: o[0], value: o[1] }; }), function (v) { st.usr = v; next(); }); }
    if (!st.appsDone) return askApps();
    summary();
  }
  function askApps() {
    var rec = (st.type[1] || '').split(',').filter(Boolean).concat(st.detMods);
    // Keep it simple (Duckens 11/26): only the apps we recommend are shown, ticked; nothing else to scroll through.
    var shown = MODS.filter(function (x) { return rec.indexOf(x[0]) > -1; });
    if (!shown.length) { st.mods = []; st.appsDone = true; say('bot', L.base); return next(); }
    var m = say('bot', L.qApps + '<p class="assist__base">' + L.base + '</p>');
    var g = document.createElement('div'); g.className = 'assist__apps'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', L.apps);
    g.innerHTML = shown.map(function (x) {
      return '<label class="assist__app"><input type="checkbox" value="' + x[0] + '" checked><span>' + esc(mName(x)) + '</span></label>';
    }).join('') + '<button type="button" class="btn btn-p assist__ok">' + L.confirm + '</button>';
    m.lastChild.appendChild(g);
    g.querySelector('.assist__ok').addEventListener('click', function () {
      st.mods = [].slice.call(g.querySelectorAll('input:checked')).map(function (i) { return i.value; });
      [].slice.call(g.querySelectorAll('input')).forEach(function (i) { i.disabled = true; });
      this.remove(); st.appsDone = true;
      say('me', st.mods.length ? st.mods.map(function (k) { return esc(mName(MODS.filter(function (x) { return x[0] === k; })[0])); }).join(', ') : L.none);
      next();
    });
    g.querySelector('input').focus({ preventScroll: true });
    m.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function summary() {
    var woo = st.mods.indexOf('woocommerce') > -1, others = st.mods.filter(function (k) { return k !== 'woocommerce'; });
    var vol = st.usr > 50 ? 'corporate' : (st.loc > 1 || st.usr > 5) ? 'business' : 'start';
    var tier = woo ? 'corporate' : vol, year = PRICE[tier];
    var names = st.mods.map(function (k) { return mName(MODS.filter(function (x) { return x[0] === k; })[0]); });
    var locTxt = L.locs.filter(function (o) { return o[1] === st.loc; })[0], usrTxt = L.usrs.filter(function (o) { return o[1] === st.usr; })[0];
    locTxt = st.locN || (locTxt ? locTxt[0] : st.loc); usrTxt = st.usrN || (usrTxt ? usrTxt[0] : st.usr); // the exact number the visitor wrote wins
    var q = [];
    if (st.type[0] !== 'other') { q.push('type=' + encodeURIComponent(st.type[0])); q.push('apps=' + encodeURIComponent(BASE.concat(st.mods).join(','))); }
    q.push('plan=' + tier);
    var msg = [L.waHi, '', L.waDesc + ': ' + st.desc, L.type + ': ' + tName(st.type), L.loc + ': ' + locTxt, L.usr + ': ' + usrTxt,
      L.apps + ': ' + (names.length ? names.join(', ') : L.none), L.plan + ': BPRO ' + tier.toUpperCase() + ' (' + fmt(year) + ' ' + L.perYear + ')'].join('\n');
    var d = say('bot', '<div class="assist__sum"><p class="assist__st">' + L.sum + '</p><dl>' +
      '<dt>' + L.type + '</dt><dd>' + st.type[4] + ' ' + esc(tName(st.type)) + '</dd>' +
      '<dt>' + L.loc + '</dt><dd>' + esc(locTxt) + '</dd><dt>' + L.usr + '</dt><dd>' + esc(usrTxt) + '</dd>' +
      '<dt>' + L.apps + '</dt><dd>' + (names.length ? esc(names.join(', ')) : L.none) + '</dd></dl>' +
      '<div class="assist__price"><span>' + L.plan + ' <b>BPRO ' + tier.toUpperCase() + '</b></span><strong>' + fmt(year) + ' <small>' + L.perYear + '</small></strong>' +
      '<small>' + fmt(year / 12) + ' ' + L.perMonth + ' · ' + L.usd(fmt(year / RATE)) + '</small></div>' +
      (others.length ? '<p class="assist__note">' + L.quote + '</p>' : '') +
      '<a class="btn btn-p assist__pay" href="https://app.pointofsales.fr/eseye?' + q.join('&') + '" target="_blank" rel="noopener">' + L.pay + ' →</a>' +
      '<p class="assist__note">' + L.payH + '</p>' +
      '<div class="assist__links"><a href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">' + L.wa + '</a>' +
      '<button type="button" class="assist__restart">' + L.restart + '</button></div></div>');
    d.querySelector('.assist__restart').addEventListener('click', function () { reset(); ta.focus(); });
    d.querySelector('.assist__pay').focus({ preventScroll: true });
    d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function start(text) {
    text = text.trim(); if (!text) return;
    st.desc = text; say('me', esc(text)); form.hidden = true; ex.hidden = true;
    var n = norm(text);
    st.type = detectType(n);
    st.detMods = detectMods(n);
    var loc = detectCount(n, 'lokal|branch|branche|succursale|succursales|magazen|magasin|magasins|boutik|boutiques|pwen|points|point|kes|caisse|caisses|store|stores|location|locations|depot|depots');
    var usr = detectCount(n, 'anplwaye|moun|employe|employes|employees|employee|itilizate|utilisateur|utilisateurs|users|user|staff|caissier|caissiers|kesye|vande|vendeur|vendeurs');
    st.locN = loc; st.usrN = usr;
    st.loc = loc ? (loc === 1 ? 1 : loc <= 3 ? 3 : loc <= 10 ? 10 : 11) : null;
    st.usr = usr ? (usr <= 5 ? 5 : usr <= 20 ? 20 : usr <= 50 ? 50 : 51) : null;
    if (st.type) say('bot', L.found(st.type[4] + ' ' + esc(tName(st.type))));
    next();
  }
  ta.addEventListener('input', grow);
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); start(ta.value); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); start(ta.value); });
  [].slice.call(ex.querySelectorAll('button')).forEach(function (b) { b.addEventListener('click', function () { ta.value = b.textContent; start(b.textContent); }); });
  reset();
})();
