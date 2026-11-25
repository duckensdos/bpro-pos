/* BPRO sign-up: pay first, then we create the account.
   Every link marked [data-signup] opens this form (optional data-plan="start|business|corporate|education").
   One question per screen: plan → business type → business name → address → contact → price + payment (MonCash / NatCash / Zelle / Unibank / activation code; 2-column tiles since 2026-11-25).
   "Voye prèv la sou WhatsApp" opens WhatsApp with every answer written, so the client attaches the payment proof photo there.
   It also sends the same answers to a GoHighLevel inbound webhook (if GHL_WEBHOOK is set).
   Without JS, the link itself still opens pay.pointofsales.fr. */
(function () {
  const WA_NUMBER = '50943830148';
  // Paste the GHL workflow "Inbound Webhook" URL here. Empty = WhatsApp only.
  const GHL_WEBHOOK = '';
  const HTG_PER_USD = 137; // same rate as pay.pointofsales.fr
  // Payment details copied from pay.pointofsales.fr on 2026-10-03.
  const PAY = {
    moncash: { label: 'MonCash', lines: [['', '+509 47 49 7805']], name: 'Duckens DOS', qr: 'moncash-qr.jpg' },
    natcash: { label: 'NatCash', lines: [['', '4383 01 48'], ['code', '253013']], name: 'Brullend Solutions', qr: 'natcash-qr.png' },
    bank: { label: 'Unibank', lines: [['htg', '271-2001-3064-6072'], ['usd', '271-2002-3064-6096']], name: 'Brullend Solutions' },
    // Zelle added 2026-11-25: account details NOT known yet -> never invented, sent on WhatsApp instead.
    zelle: { label: 'Zelle', lines: [], name: '', whatsapp: true },
    code: { label: 'Code', lines: [], name: '', code: true },
  };
  // Tiles of the payment step (2 columns, radiogroup). Icons are generic line icons, no brand logos.
  const ICON = {
    moncash: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/><path d="M12 7.5v6M10.2 9.2c0-.8.8-1.3 1.8-1.3s1.8.5 1.8 1.3-.8 1.1-1.8 1.3-1.8.6-1.8 1.4.8 1.3 1.8 1.3 1.8-.5 1.8-1.3"/>',
    natcash: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    zelle: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M14.8 9c0-1.2-1.2-2-2.8-2s-2.8.8-2.8 2 1.2 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2-2.8-.8-2.8-2"/>',
    bank: '<path d="M3 10h18L12 4z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    code: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  };
  const METHODS = ['moncash', 'natcash', 'zelle', 'bank', 'code'];
  const PLANS = [
    { id: 'start', name: 'BPRO START', price: 15000 },
    { id: 'business', name: 'BPRO BUSINESS', price: 50000, pop: true },
    { id: 'corporate', name: 'BPRO CORPORATE', price: 250000 },
    { id: 'education', name: 'BPRO EDUCATION', price: 25000 },
  ];

  // Kreyòl by default; French on pages with <html lang="fr">.
  const FR = (document.documentElement.lang || '').toLowerCase().startsWith('fr');
  const L = FR ? {
    title: 'Créer mon compte BPRO', count: (i, n) => `Étape ${i} sur ${n}`,
    planQ: 'Quel plan voulez-vous ?', planD: { start: '1 site · l\'essentiel', business: 'Plusieurs sites et utilisateurs', corporate: 'Succursales illimitées, API', education: 'Écoles et centres de formation' },
    pop: 'Le plus populaire', perYear: 'HTG / an',
    types: ['Boutique et supermarché', 'Pharmacie', 'Quincaillerie', 'Pièces auto', 'Restaurant', 'Barbershop et salon de beauté',
      'Gym', 'Vêtements et chaussures', 'Garage et atelier de réparation', 'Fabrication', 'Pâtisserie', 'Clinique', 'Dépôt', 'École'],
    tipQ: 'Quel type d\'entreprise avez-vous ?', tipH: 'Écrivez-le librement.', tipPh: 'Exemple : boutique, restaurant, pharmacie…',
    bizQ: 'Quel est le nom de votre entreprise ?', bizPh: 'Exemple : Boutique Belle Espérance',
    adrQ: 'Quelle est l\'adresse de l\'entreprise ?', adrPh: 'Exemple : Delmas 33, Port-au-Prince',
    contactQ: 'Comment vous joindre ?', contactH: 'Nous enverrons vos accès à ces coordonnées.',
    nameL: 'Nom complet', emailL: 'E-mail', telL: 'Téléphone / WhatsApp', namePh: 'Exemple : Marie Joseph', emailPh: 'vous@exemple.com', telPh: '+509 3X XX XXXX',
    payQ: 'Payez votre plan', total: 'Total à payer', change: 'Changer',
    method: 'Mode de paiement', bank: 'Virement Unibank', htg: 'Gourdes', usd: 'Dollars', code: 'Code marchand', holder: 'Nom',
    scan: 'Scannez le QR ou envoyez au numéro.',
    howT: 'Comment ça marche', how: (amt) => [`Envoyez <b>${amt}</b> avec le mode choisi.`, 'Faites une capture d\'écran du reçu.', 'Cliquez sur le bouton vert et joignez la capture dans WhatsApp.'],
    send: 'J\'ai payé : envoyer la preuve sur WhatsApp',
    tiles: { moncash: ['MonCash', 'QR ou numéro, depuis votre téléphone'], natcash: ['NatCash', 'QR ou code marchand'],
      zelle: ['Zelle', 'En dollars, depuis les USA'], bank: ['Unibank', 'Virement en HTG ou en USD'],
      code: ['J\'ai un code d\'activation', 'Vous avez déjà un code ? Saisissez-le ici'] },
    zelleInfo: 'Détails Zelle envoyés par WhatsApp', zelleHint: 'Cliquez sur le bouton vert : nous vous envoyons le compte Zelle sur WhatsApp, puis vous envoyez la preuve dans la même conversation.',
    zelleHow: (amt) => ['Cliquez sur le bouton vert pour recevoir les détails Zelle sur WhatsApp.', `Envoyez <b>${amt}</b> par Zelle.`, 'Joignez la capture du paiement dans la même conversation WhatsApp.'],
    codeL: 'Code d\'activation', codePh: 'Exemple : BPRO-XXXX', codeHint: 'Le code remplace le paiement. Nous le vérifions puis nous activons votre compte.',
    codeHow: ['Saisissez votre code d\'activation.', 'Cliquez sur le bouton vert : le code part sur WhatsApp avec vos informations.', 'Après vérification, nous activons votre compte.'],
    sendCode: 'Envoyer mon code sur WhatsApp', sendZelle: 'Recevoir les détails Zelle sur WhatsApp', errCode: 'Entrez votre code d\'activation.',
    fine: 'Votre compte est activé après la vérification du paiement. Installation, formation et matériel sont facturés à part.',
    doneQ: (n) => `Merci${n ? ', ' + n : ''} !`, done: 'Dans WhatsApp, joignez la capture du paiement et envoyez le message. Après vérification, nous vous envoyons vos accès par WhatsApp et par e-mail.',
    reopen: 'Rouvrir WhatsApp', close: 'Fermer',
    next: 'Continuer', back: '← Retour',
    errChoice: 'Choisissez une réponse.', errEmpty: 'Merci de répondre à cette question.', errTel: 'Entrez un numéro valide.', errEmail: 'Entrez un e-mail valide.', errName: 'Entrez votre nom complet.',
    msg: { hi: 'Bonjour BPRO, j\'ai payé mon plan. Merci d\'activer mon compte.', plan: 'Plan', amount: 'Montant', method: 'Paiement', name: 'Nom', email: 'E-mail', tel: 'Téléphone', biz: 'Entreprise', tip: 'Type d\'entreprise', adr: 'Adresse', proof: '(Je joins la capture du paiement.)', code: 'Code d\'activation', hiCode: 'Bonjour BPRO, j\'ai un code d\'activation. Merci d\'activer mon compte.', hiZelle: 'Bonjour BPRO, je veux payer mon plan par Zelle. Merci de m\'envoyer les détails Zelle.', proofZelle: '(J\'enverrai la capture du paiement ici.)' },
  } : {
    title: 'Kreye kont BPRO ou', count: (i, n) => `Etap ${i} sou ${n}`,
    planQ: 'Ki plan ou vle?', planD: { start: '1 lokal · tout sa ki esansyèl', business: 'Plizyè lokal ak itilizatè', corporate: 'Branch san limit, API', education: 'Lekòl ak sant fòmasyon' },
    pop: 'Pi popilè', perYear: 'GDES / ane',
    types: ['Boutik ak market', 'Famasi', 'Quincaillerie', 'Auto parts', 'Restoran', 'Barbershop ak salon',
      'Gym', 'Magazen rad ak tenis', 'Garaj ak repair shop', 'Manufacturing', 'Patisri', 'Klinik', 'Depo', 'Lekòl'],
    tipQ: 'Ki kalite biznis ou genyen?', tipH: 'Ekri l jan ou vle.', tipPh: 'Egzanp: Boutik, restoran, famasi…',
    bizQ: 'Ki non biznis ou?', bizPh: 'Egzanp: Boutik Bèl Espwa',
    adrQ: 'Ki adrès biznis la?', adrPh: 'Egzanp: Delmas 33, Pòtoprens',
    contactQ: 'Kijan pou nou jwenn ou?', contactH: 'N ap voye aksè ou sou enfòmasyon sa yo.',
    nameL: 'Non konplè', emailL: 'Imèl', telL: 'Telefòn / WhatsApp', namePh: 'Egzanp: Marie Joseph', emailPh: 'ou@egzanp.com', telPh: '+509 3X XX XXXX',
    payQ: 'Peye plan ou', total: 'Total pou peye', change: 'Chanje',
    method: 'Metòd peman', bank: 'Vire labank Unibank', htg: 'Goud', usd: 'Dola', code: 'Kòd machann', holder: 'Non',
    scan: 'Skane QR la oswa voye sou nimewo a.',
    howT: 'Kijan sa mache', how: (amt) => [`Voye <b>${amt}</b> ak metòd ou chwazi a.`, 'Pran yon screenshot resi peman an.', 'Klike bouton vèt la epi tache screenshot la nan WhatsApp.'],
    send: 'Mwen peye: voye prèv la sou WhatsApp',
    tiles: { moncash: ['MonCash', 'QR oswa nimewo, sou telefòn ou'], natcash: ['NatCash', 'QR oswa kòd machann'],
      zelle: ['Zelle', 'An dola, depi Etazini'], bank: ['Unibank', 'Vire labank an goud oswa dola'],
      code: ['Mwen gen yon kòd aktivasyon', 'Ou deja gen yon kòd? Antre l la a'] },
    zelleInfo: 'Detay Zelle yo voye sou WhatsApp', zelleHint: 'Klike bouton vèt la: n ap voye kont Zelle la ba ou sou WhatsApp, epi ou voye prèv la nan menm konvèsasyon an.',
    zelleHow: (amt) => ['Klike bouton vèt la pou resevwa detay Zelle yo sou WhatsApp.', `Voye <b>${amt}</b> pa Zelle.`, 'Tache screenshot peman an nan menm konvèsasyon WhatsApp la.'],
    codeL: 'Kòd aktivasyon', codePh: 'Egzanp: BPRO-XXXX', codeHint: 'Kòd la ranplase peman an. N ap verifye l epi aktive kont ou.',
    codeHow: ['Antre kòd aktivasyon ou.', 'Klike bouton vèt la: kòd la ale sou WhatsApp ak enfòmasyon ou yo.', 'Lè nou fin verifye l, n ap aktive kont ou.'],
    sendCode: 'Voye kòd mwen sou WhatsApp', sendZelle: 'Resevwa detay Zelle yo sou WhatsApp', errCode: 'Antre kòd aktivasyon ou.',
    fine: 'Nou aktive kont ou apre nou fin verifye peman an. Enstalasyon, fòmasyon ak materyèl chaje apa.',
    doneQ: (n) => `Mèsi${n ? ', ' + n : ''}!`, done: 'Nan WhatsApp, tache screenshot peman an epi voye mesaj la. Lè nou fin verifye l, n ap voye aksè ou sou WhatsApp ak imèl.',
    reopen: 'Relouvri WhatsApp', close: 'Fèmen',
    next: 'Kontinye', back: '← Retounen',
    errChoice: 'Chwazi youn nan repons yo.', errEmpty: 'Tanpri reponn kesyon sa a.', errTel: 'Mete yon nimewo ki valab.', errEmail: 'Mete yon imèl ki valab.', errName: 'Mete non konplè ou.',
    msg: { hi: 'Bonjou BPRO, mwen peye plan mwen. Tanpri aktive kont mwen.', plan: 'Plan', amount: 'Montan', method: 'Peman', name: 'Non', email: 'Imèl', tel: 'Telefòn', biz: 'Biznis', tip: 'Kalite biznis', adr: 'Adrès', proof: '(M ap tache screenshot peman an.)', code: 'Kòd aktivasyon', hiCode: 'Bonjou BPRO, mwen gen yon kòd aktivasyon. Tanpri aktive kont mwen.', hiZelle: 'Bonjou BPRO, mwen vle peye plan mwen pa Zelle. Tanpri voye detay Zelle yo ban mwen.', proofZelle: '(M ap voye screenshot peman an la a.)' },
  };

  // Path to assets/ from this script's own URL, so it works from /, /fr/, /biznis/ and /logiciel-*/.
  const ASSETS = (() => {
    const s = document.currentScript && document.currentScript.src;
    return s ? new URL('assets/pay/', s).href : '/assets/pay/';
  })();
  const fmt = (n) => n.toLocaleString(FR ? 'fr-FR' : 'en-US').replace(/ | /g, FR ? ' ' : ',');
  const gdes = (n) => `${fmt(n)} ${FR ? 'HTG' : 'GDES'}`;

  const css = `
  .su { width: min(34rem, calc(100vw - 24px)); max-height: calc(100dvh - 24px); margin: auto; padding: 0; border: 1px solid rgba(242,244,241,.16);
    border-radius: 18px; background: #111413; color: #F2F4F1; box-shadow: 0 24px 64px rgba(0,0,0,.55); font: inherit; overflow: auto; overscroll-behavior: contain; }
  .su::backdrop { background: rgba(4,6,5,.72); backdrop-filter: blur(4px); }
  .su form { display: grid; gap: 18px; padding: 24px; }
  @media (max-width: 420px) { .su form { padding: 20px 16px; } }
  .su__head { display: grid; gap: 10px; padding-right: 40px; }
  .su__title { margin: 0; font-size: .8rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #22C56B; }
  .su__count { font-size: .8rem; color: #9FA8A2; }
  .su__bar { height: 4px; border-radius: 999px; background: rgba(242,244,241,.1); overflow: hidden; }
  .su__bar i { display: block; height: 100%; width: 0; background: #22C56B; border-radius: inherit; transition: width 240ms ease; }
  .su__step { display: none; gap: 14px; }
  .su__step.is-on { display: grid; animation: suIn 220ms ease both; }
  @keyframes suIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .su__step.is-on { animation: none; } .su__bar i { transition: none; } }
  .su__q { margin: 0; font-size: 1.45rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.2; }
  .su__hint { margin: -6px 0 0; color: #9FA8A2; font-size: .9rem; }
  .su__field { display: grid; gap: 6px; font-size: .85rem; color: #C9D0CB; }
  .su input[type=text], .su input[type=tel], .su input[type=email] { font: inherit; font-size: 1.05rem; color: #F2F4F1; background: #0B0D0C; border: 1px solid rgba(242,244,241,.18);
    border-radius: 12px; padding: 14px 16px; width: 100%; box-sizing: border-box; min-height: 52px; }
  .su input:focus-visible { outline: 2px solid #22C56B; outline-offset: 1px; border-color: transparent; }
  .su input[list]::-webkit-calendar-picker-indicator { display: none !important; }
  .su__plans, .su__methods { display: grid; gap: 8px; }
  .su__plan { display: grid; grid-template-columns: auto 1fr auto; gap: 4px 12px; align-items: center; padding: 14px 16px; border: 1px solid rgba(242,244,241,.18); border-radius: 12px; cursor: pointer; }
  .su__plan input, .su__method input { accent-color: #22C56B; width: 18px; height: 18px; margin: 0; }
  .su__plan b { font-size: 1rem; }
  .su__plan small { grid-column: 2 / 4; color: #9FA8A2; font-size: .85rem; }
  .su__plan em { font-style: normal; font-weight: 700; white-space: nowrap; }
  .su__pop { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: #22C56B; color: #04140A; font-size: .7rem; font-weight: 700; vertical-align: 2px; }
  .su__plan:has(input:checked), .su__method:has(input:checked) { border-color: #22C56B; background: rgba(34,197,107,.1); }
  .su__plan:has(input:focus-visible), .su__method:has(input:focus-visible) { outline: 2px solid #22C56B; outline-offset: 1px; }
  .su__sum { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 12px; padding: 14px 16px; border-radius: 12px; background: #0B0D0C; border: 1px solid rgba(242,244,241,.12); }
  .su__sum span { color: #9FA8A2; font-size: .9rem; }
  .su__sum strong { font-size: 1.6rem; letter-spacing: -.02em; }
  .su__sum small { color: #9FA8A2; }
  .su__sum button { border: 0; background: none; color: #22C56B; font: inherit; font-size: .9rem; padding: 4px 0; cursor: pointer; text-decoration: underline; }
  .su__label { margin: 0; font-size: .85rem; color: #C9D0CB; }
  .su__methods { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .su__tile { display: grid; grid-template-columns: 36px 1fr; grid-template-rows: auto auto; align-content: center; gap: 2px 10px; text-align: left; padding: 12px; min-height: 72px;
    border: 1px solid rgba(242,244,241,.18); border-radius: 12px; cursor: pointer; position: relative; transition: border-color 150ms ease, background 150ms ease; }
  .su__tile input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; pointer-events: none; }
  .su__tile .su__ti { grid-row: 1 / 3; align-self: center; width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: rgba(242,244,241,.08); color: #C9D0CB; }
  .su__tile b { font-size: .98rem; line-height: 1.25; }
  .su__tile small { grid-column: 2; color: #9FA8A2; font-size: .8rem; line-height: 1.35; }
  .su__tile:hover { border-color: rgba(242,244,241,.32); }
  .su__tile:has(input:checked) { border-color: #22C56B; background: rgba(34,197,107,.12); }
  .su__tile:has(input:checked) .su__ti { background: #22C56B; color: #04140A; }
  .su__tile:has(input:checked)::after { content: ''; position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; border-radius: 50%; background: #22C56B; }
  .su__tile:has(input:focus-visible) { outline: 2px solid #22C56B; outline-offset: 2px; }
  .su__tile--wide { grid-column: 1 / -1; }
  @media (max-width: 360px) { .su__methods { grid-template-columns: 1fr; } }
  @media (prefers-reduced-motion: reduce) { .su__tile { transition: none; } }
  .su__note { margin: 0; font-size: 1rem; font-weight: 700; color: #F2F4F1; }
  .su__info .su__field { grid-column: 1 / -1; justify-self: stretch; text-align: left; }
  .su__info input[name=kod]:not(:placeholder-shown) { text-transform: uppercase; letter-spacing: .04em; }
  .su__method { display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center; text-align: center; padding: 12px 8px; border: 1px solid rgba(242,244,241,.18); border-radius: 12px; cursor: pointer; font-weight: 600; font-size: .95rem; min-height: 64px; }
  .su__method input { position: absolute; opacity: 0; pointer-events: none; }
  .su__method { position: relative; }
  .su__info { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; padding: 16px; border-radius: 12px; background: #0B0D0C; border: 1px solid rgba(242,244,241,.12); }
  .su__info img { width: 132px; height: auto; border-radius: 10px; background: #fff; }
  .su__info dl { margin: 0; display: grid; gap: 8px; }
  .su__info dt { font-size: .8rem; color: #9FA8A2; }
  .su__info dd { margin: 0; font-size: 1.15rem; font-weight: 700; letter-spacing: .01em; overflow-wrap: anywhere; }
  .su__info p { grid-column: 1 / -1; margin: 0; color: #9FA8A2; font-size: .85rem; }
  .su__info--noqr { grid-template-columns: 1fr; }
  @media (max-width: 420px) { .su__info { grid-template-columns: 1fr; justify-items: center; text-align: center; } .su__info img { width: 180px; } }
  .su__how { margin: 0; padding-left: 1.3em; display: grid; gap: 6px; color: #C9D0CB; font-size: .95rem; }
  .su__nav { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .su__back { border: 0; background: transparent; color: #9FA8A2; font: inherit; padding: 12px 6px; cursor: pointer; white-space: nowrap; flex: none; }
  .su__back:hover { color: #F2F4F1; }
  .su__back[hidden] { display: none; }
  .su__next, .su__send { flex: 1; display: flex; gap: 8px; align-items: center; justify-content: center; min-height: 52px; border: 0; border-radius: 999px;
    font: inherit; font-weight: 700; font-size: 1.02rem; cursor: pointer; padding: 0 16px; text-align: center; line-height: 1.2; }
  .su__next { background: #22C56B; color: #04140A; }
  .su__send { background: #25D366; color: #04140A; flex: 1 0 100%; order: -1; padding: 10px 16px; }
  .su__send svg { flex: none; }
  .su__next:hover, .su__send:hover { filter: brightness(1.06); }
  .su__next[hidden], .su__send[hidden] { display: none; }
  .su__err { margin: -4px 0 0; color: #FF8A7A; font-size: .9rem; min-height: 1.2em; }
  .su__err:empty { min-height: 0; margin: 0; }
  .su__close { position: absolute; top: 12px; right: 12px; width: 40px; height: 40px; border: 0; border-radius: 999px; background: transparent; color: #9FA8A2; font-size: 26px; line-height: 1; cursor: pointer; }
  .su__close:hover { color: #F2F4F1; background: rgba(242,244,241,.08); }
  .su__fine { margin: 0; font-size: .8rem; color: #9FA8A2; text-align: center; }
  .su__done { text-align: center; justify-items: center; }
  .su__done .su__q { font-size: 1.7rem; }
  .su__done p { margin: 0; color: #C9D0CB; }
  .su__check { width: 64px; height: 64px; border-radius: 999px; background: rgba(34,197,107,.14); color: #22C56B; display: grid; place-items: center; }
  .su__done a { color: #22C56B; }`;

  const WA_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>';

  // Steps: kind "plan" and "method" are pick lists; "text" needs Kontinye; "contact" has 3 fields; "pay" is the last; "done" is after sending.
  const STEPS = [
    { name: 'plan', kind: 'plan' },
    { name: 'tip', kind: 'text' },
    { name: 'biznis', kind: 'text' },
    { name: 'adres', kind: 'text' },
    { name: 'contact', kind: 'contact' },
    { name: 'pay', kind: 'pay' },
    { name: 'done', kind: 'done' },
  ];
  const COUNTED = STEPS.length - 1; // the thank-you screen is not counted

  const html = `
  <dialog class="su" id="signupForm" aria-labelledby="suTitle">
    <button type="button" class="su__close" aria-label="${L.close}">×</button>
    <form novalidate>
      <div class="su__head">
        <p class="su__title" id="suTitle">${L.title}</p>
        <div class="su__bar" aria-hidden="true"><i></i></div>
        <span class="su__count" aria-live="polite"></span>
      </div>

      <section class="su__step" data-step="plan">
        <p class="su__q" id="suPlanQ">${L.planQ}</p>
        <div class="su__plans" role="radiogroup" aria-labelledby="suPlanQ">
          ${PLANS.map(p => `<label class="su__plan"><input type="radio" name="plan" value="${p.id}">
            <b>${p.name}${p.pop ? `<span class="su__pop">${L.pop}</span>` : ''}</b><em>${fmt(p.price)}</em>
            <small>${L.planD[p.id]} · ${L.perYear}</small></label>`).join('')}
        </div>
      </section>

      <section class="su__step" data-step="tip">
        <label class="su__q" for="su_tip">${L.tipQ}</label>
        <p class="su__hint">${L.tipH}</p>
        <input id="su_tip" type="text" name="tip" list="suTypes" autocomplete="off" placeholder="${L.tipPh}">
        <datalist id="suTypes">${L.types.map(t => `<option value="${t}">`).join('')}</datalist>
      </section>

      <section class="su__step" data-step="biznis">
        <label class="su__q" for="su_biznis">${L.bizQ}</label>
        <input id="su_biznis" type="text" name="biznis" autocomplete="organization" placeholder="${L.bizPh}">
      </section>

      <section class="su__step" data-step="adres">
        <label class="su__q" for="su_adres">${L.adrQ}</label>
        <input id="su_adres" type="text" name="adres" autocomplete="street-address" placeholder="${L.adrPh}">
      </section>

      <section class="su__step" data-step="contact">
        <p class="su__q">${L.contactQ}</p>
        <p class="su__hint">${L.contactH}</p>
        <label class="su__field">${L.nameL}<input type="text" name="non" autocomplete="name" placeholder="${L.namePh}"></label>
        <label class="su__field">${L.emailL}<input type="email" name="imel" autocomplete="email" inputmode="email" placeholder="${L.emailPh}"></label>
        <label class="su__field">${L.telL}<input type="tel" name="telefon" autocomplete="tel" inputmode="tel" placeholder="${L.telPh}"></label>
      </section>

      <section class="su__step" data-step="pay">
        <p class="su__q">${L.payQ}</p>
        <div class="su__sum">
          <span><b class="su__planName"></b> · <button type="button" class="su__change">${L.change}</button></span>
          <span>${L.total}</span>
          <strong class="su__amount"></strong>
          <small class="su__usd"></small>
        </div>
        <p class="su__label" id="suMethodL">${L.method}</p>
        <div class="su__methods" role="radiogroup" aria-labelledby="suMethodL">
          ${METHODS.map((k, i) => `<label class="su__tile${k === 'code' ? ' su__tile--wide' : ''}"><input type="radio" name="metod" value="${k}"${i === 0 ? ' checked' : ''} aria-describedby="suTd_${k}">
            <span class="su__ti" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg></span>
            <b>${L.tiles[k][0]}</b><small id="suTd_${k}">${L.tiles[k][1]}</small></label>`).join('')}
        </div>
        <div class="su__info" aria-live="polite"></div>
        <p class="su__label">${L.howT}</p>
        <ol class="su__how"></ol>
      </section>

      <section class="su__step su__done" data-step="done">
        <span class="su__check" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>
        <p class="su__q su__doneQ"></p>
        <p>${L.done}</p>
        <p><a class="su__reopen" href="#" target="_blank" rel="noopener">${L.reopen}</a></p>
      </section>

      <p class="su__err" role="alert"></p>
      <div class="su__nav">
        <button type="button" class="su__back">${L.back}</button>
        <button type="submit" class="su__next">${L.next}</button>
        <button type="submit" class="su__send" hidden>${WA_ICON} <span>${L.send}</span></button>
      </div>
      <p class="su__fine">${L.fine}</p>
    </form>
  </dialog>`;

  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', html);

    const dlg = document.getElementById('signupForm');
    const form = dlg.querySelector('form');
    const f = form.elements;
    const steps = [...form.querySelectorAll('.su__step')];
    const err = form.querySelector('.su__err');
    const back = form.querySelector('.su__back');
    const next = form.querySelector('.su__next');
    const send = form.querySelector('.su__send');
    const fine = form.querySelector('.su__fine');
    const preset = document.body.dataset.biznis || '';
    let at = 0;
    let waUrl = '';

    const value = (name) => (f[name] && f[name].value ? f[name].value : '').trim();
    const plan = () => PLANS.find(p => p.id === value('plan')) || PLANS[0];

    function renderPay() {
      const p = plan();
      const m = PAY[value('metod')] || PAY.moncash;
      form.querySelector('.su__planName').textContent = p.name;
      form.querySelector('.su__amount').textContent = gdes(p.price);
      form.querySelector('.su__usd').textContent = `≈ $${fmt(Math.round(p.price / HTG_PER_USD))} USD · 1 USD ≈ ${HTG_PER_USD} HTG`;
      const rows = m.lines.map(([k, v]) => `<dt>${k === 'code' ? L.code : k === 'htg' ? `Unibank ${L.htg}` : k === 'usd' ? `Unibank ${L.usd}` : m.label}</dt><dd>${v}</dd>`).join('');
      const info = form.querySelector('.su__info');
      info.classList.toggle('su__info--noqr', !m.qr);
      const kod = f.kod ? f.kod.value : '';
      if (m.code) {
        info.innerHTML = `<label class="su__field">${L.codeL}<input type="text" name="kod" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${L.codePh}"></label><p>${L.codeHint}</p>`;
        f.kod.value = kod;
      } else if (m.whatsapp) {
        info.innerHTML = `<p class="su__note">${L.zelleInfo}</p><p>${L.zelleHint}</p>`;
      } else {
        info.innerHTML = `${m.qr ? `<img src="${ASSETS}${m.qr}" width="264" height="320" alt="QR ${m.label}, ${m.name}">` : ''}
        <dl>${rows}<dt>${L.holder}</dt><dd>${m.name}</dd></dl>${m.qr ? `<p>${L.scan}</p>` : ''}`;
      }
      const how = m.code ? L.codeHow : m.whatsapp ? L.zelleHow(`$${fmt(Math.round(p.price / HTG_PER_USD))} USD`) : L.how(gdes(p.price));
      form.querySelector('.su__how').innerHTML = how.map(t => `<li>${t}</li>`).join('');
      send.querySelector('span').textContent = m.code ? L.sendCode : m.whatsapp ? L.sendZelle : L.send;
    }

    function show(i) {
      at = i;
      const st = STEPS[i];
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      form.querySelector('.su__bar i').style.width = `${(Math.min(i, COUNTED) / COUNTED) * 100}%`;
      form.querySelector('.su__count').textContent = st.kind === 'done' ? '' : L.count(i + 1, COUNTED);
      err.textContent = '';
      back.hidden = i === 0 || st.kind === 'done';
      next.hidden = st.kind === 'plan' || st.kind === 'pay';
      next.textContent = st.kind === 'done' ? L.close : L.next;
      send.hidden = st.kind !== 'pay';
      fine.hidden = st.kind === 'done';
      if (st.kind === 'pay') renderPay();
      const focusable = steps[i].querySelector('input:checked') || steps[i].querySelector('input[type=text],input[type=tel],input[type=email]');
      if (focusable && st.kind !== 'pay') focusable.focus({ preventScroll: true });
      dlg.scrollTop = 0;
    }

    function check(i) {
      const st = STEPS[i];
      if (st.kind === 'plan') return value('plan') ? '' : L.errChoice;
      if (st.kind === 'text') return value(st.name) ? '' : L.errEmpty;
      if (st.kind === 'contact') {
        if (value('non').length < 3) return L.errName;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('imel'))) return L.errEmail;
        if (value('telefon').replace(/\D/g, '').length < 8) return L.errTel;
      }
      return '';
    }

    // d = the clicked link's data-* (plan, and from /eseye step 3 also tip/biznis/adres/non/imel/telefon):
    // answers already given on the page are filled in, and the form opens on the first one still missing.
    function open(d) {
      const planId = d.plan || '';
      form.reset();
      if (preset) f.tip.value = preset;
      ['tip', 'biznis', 'adres', 'non', 'imel', 'telefon'].forEach(k => { if (d[k]) f[k].value = d[k]; });
      const known = PLANS.some(p => p.id === planId);
      if (known) form.querySelector(`input[name=plan][value="${planId}"]`).checked = true;
      dlg.showModal();
      let i = known ? 1 : 0;
      while (known && i < STEPS.length - 2 && !check(i)) i++;
      show(i);
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-signup]');
      if (!a || typeof dlg.showModal !== 'function') return;
      e.preventDefault();
      open(a.dataset);
    });
    dlg.querySelector('.su__close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    back.addEventListener('click', () => show(Math.max(0, at - 1)));
    form.querySelector('.su__change').addEventListener('click', () => show(0));
    form.querySelector('.su__reopen').addEventListener('click', (e) => {
      if (!waUrl) return;
      e.preventDefault();
      const win = window.open(waUrl, '_blank');
      if (win) win.opener = null; else location.href = waUrl;
    });

    // Picking a plan moves on by itself; picking a payment method redraws the details.
    // Listen to clicks, not changes, so re-picking the same plan after "Retounen" still moves on.
    form.addEventListener('click', (e) => {
      if (!e.target.matches('input[type=radio]')) return;
      err.textContent = '';
      if (e.target.name === 'plan') setTimeout(() => show(STEPS.findIndex(s => s.name === 'tip')), 180);
    });
    form.addEventListener('change', (e) => { if (e.target.name === 'metod') renderPay(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const st = STEPS[at];
      if (st.kind === 'done') { dlg.close(); return; }
      const problem = check(at);
      if (problem) { err.textContent = problem; return; }
      if (st.kind !== 'pay') { show(at + 1); return; }

      const p = plan();
      const m = PAY[value('metod')] || PAY.moncash;
      if (m.code && value('kod').length < 4) { err.textContent = L.errCode; f.kod.focus(); return; }
      const M = L.msg;
      const msg = [
        m.code ? M.hiCode : m.whatsapp ? M.hiZelle : M.hi,
        '',
        `${M.plan}: ${p.name}`,
        m.code ? `${M.code}: ${value('kod').toUpperCase()}` : `${M.amount}: ${gdes(p.price)}`,
        `${M.method}: ${m.code ? L.tiles.code[0] : m.label}`,
        '',
        `${M.name}: ${value('non')}`,
        `${M.email}: ${value('imel')}`,
        `${M.tel}: ${value('telefon')}`,
        `${M.biz}: ${value('biznis')}`,
        `${M.tip}: ${value('tip')}`,
        `${M.adr}: ${value('adres')}`,
        ...(m.code ? [] : ['', m.whatsapp ? M.proofZelle : M.proof]),
      ].join('\n');
      if (GHL_WEBHOOK) {
        const payload = {
          full_name: value('non'), email: value('imel'), phone: value('telefon'),
          business_name: value('biznis'), business_type: value('tip'), address: value('adres'),
          plan: p.name, amount_htg: m.code ? 0 : p.price, payment_method: m.code ? 'activation code' : m.label, activation_code: m.code ? value('kod').toUpperCase() : '',
          page: location.href, source: 'pointofsales.fr signup (pay first)',
        };
        fetch(GHL_WEBHOOK, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          .catch(() => {});
      }
      waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      form.querySelector('.su__doneQ').textContent = L.doneQ(value('non').split(/\s+/)[0]);
      form.querySelector('.su__reopen').href = waUrl;
      const win = window.open(waUrl, '_blank');
      if (win) win.opener = null; else { location.href = waUrl; return; }
      show(STEPS.length - 1);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
