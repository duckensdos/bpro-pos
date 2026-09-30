/* BPRO demo request: every link marked [data-demo] opens this form.
   One question per screen. "Voye sou WhatsApp" opens WhatsApp with the answers already written.
   It also sends the same answers to a GoHighLevel inbound webhook (if GHL_WEBHOOK is set).
   Without JS, the link itself still opens WhatsApp. */
(function () {
  const WA_NUMBER = '50943830148';
  // Paste the GHL workflow "Inbound Webhook" URL here. Empty = WhatsApp only.
  const GHL_WEBHOOK = '';
  // Kreyòl by default; French on pages with <html lang="fr">.
  const FR = (document.documentElement.lang || '').toLowerCase().startsWith('fr');
  const L = FR ? {
    types: ['Boutique et supermarché', 'Pharmacie', 'Quincaillerie', 'Pièces auto', 'Restaurant', 'Barbershop et salon de beauté',
      'Gym', 'Vêtements et chaussures', 'Garage et atelier de réparation', 'Fabrication', 'Pâtisserie', 'École'],
    start: ['Tout de suite', 'Cette semaine', 'Ce mois-ci', 'Dans 1 à 3 mois', 'J\'y réfléchis encore'],
    invest: ['Oui, je suis prêt', 'Non, pas maintenant', 'J\'ai besoin de plus d\'informations'],
    q: ['Quel est le nom de votre entreprise ?', 'Quel est votre numéro WhatsApp ?', 'Quelle est l\'adresse de l\'entreprise ?', 'Quel type d\'entreprise avez-vous ?', 'Quand voulez-vous commencer ?', 'Êtes-vous prêt à investir 15 000 HTG pour le système ?'],
    ph: ['Exemple : Boutique Belle Espérance', 'Exemple : +509 3X XX XXXX', 'Exemple : Delmas 33, Port-au-Prince', 'Exemple : boutique, restaurant, pharmacie…'],
    hintTel: 'Pour vous contacter au sujet de la démo.', hintType: 'Écrivez-le librement.',
    title: 'Demander une démo gratuite', next: 'Continuer', back: '← Retour', send: 'Envoyer sur WhatsApp', fine: 'Démo gratuite, sans engagement.',
    count: (i, n) => `Question ${i} sur ${n}`, errChoice: 'Choisissez une réponse.', errEmpty: 'Merci de répondre à cette question.', errTel: 'Entrez un numéro WhatsApp valide.',
    msg: ['Bonjour BPRO, je voudrais une démo.', 'Entreprise', 'WhatsApp', 'Adresse', 'Type d\'entreprise', 'Je veux commencer', 'Prêt à investir 15 000 HTG'],
    close: 'Fermer',
  } : {
    types: ['Boutik ak market', 'Famasi', 'Quincaillerie', 'Auto parts', 'Restoran', 'Barbershop ak salon',
      'Gym', 'Magazen rad ak tenis', 'Garaj ak repair shop', 'Manufacturing', 'Patisri', 'Lekòl'],
    start: ['Touswit', 'Semèn sa a', 'Mwa sa a', 'Nan 1 a 3 mwa', 'M ap reflechi toujou'],
    invest: ['Wi, mwen pare', 'Non, pa kounye a', 'Mwen bezwen plis enfòmasyon'],
    q: ['Ki non biznis ou?', 'Ki nimewo WhatsApp ou?', 'Ki adrès biznis la?', 'Ki kalite biznis ou genyen?', 'Kilè ou vle kòmanse?', 'Èske ou pare pou envesti 15,000 GDES pou sistèm nan?'],
    ph: ['Egzanp: Boutik Bèl Espwa', 'Egzanp: +509 3X XX XXXX', 'Egzanp: Delmas 33, Pòtoprens', 'Egzanp: Boutik, restoran, famasi…'],
    hintTel: 'Pou nou ka kontakte w pou demo a.', hintType: 'Ekri l jan ou vle.',
    title: 'Mande yon demo gratis', next: 'Kontinye', back: '← Retounen', send: 'Voye sou WhatsApp', fine: 'Demo a gratis, san obligasyon.',
    count: (i, n) => `Kesyon ${i} sou ${n}`, errChoice: 'Chwazi youn nan repons yo.', errEmpty: 'Tanpri reponn kesyon sa a.', errTel: 'Mete yon nimewo WhatsApp ki valab.',
    msg: ['Bonjou BPRO, mwen vle yon demo.', 'Non biznis', 'WhatsApp', 'Adrès', 'Kalite biznis', 'Kilè m vle kòmanse', 'Pare pou envesti 15,000 GDES'],
    close: 'Fèmen',
  };
  const TYPES = L.types, START = L.start, INVEST = L.invest;

  const css = `
  .df { width: min(32rem, calc(100vw - 32px)); max-height: calc(100dvh - 32px); padding: 0; border: 1px solid rgba(242,244,241,.16);
    border-radius: 18px; background: #111413; color: #F2F4F1; box-shadow: 0 24px 64px rgba(0,0,0,.55); font: inherit; }
  .df::backdrop { background: rgba(4,6,5,.72); backdrop-filter: blur(4px); }
  .df form { display: grid; gap: 18px; padding: 24px; }
  .df__head { display: grid; gap: 10px; padding-right: 40px; }
  .df__title { margin: 0; font-size: .8rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #22C56B; }
  .df__count { font-size: .8rem; color: #9FA8A2; }
  .df__bar { height: 4px; border-radius: 999px; background: rgba(242,244,241,.1); overflow: hidden; }
  .df__bar i { display: block; height: 100%; width: 0; background: #22C56B; border-radius: inherit; transition: width 240ms ease; }
  .df__step { display: none; gap: 14px; }
  .df__step.is-on { display: grid; animation: dfIn 220ms ease both; }
  @keyframes dfIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .df__step.is-on { animation: none; } .df__bar i { transition: none; } }
  .df__q { margin: 0; font-size: 1.45rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.2; }
  .df__hint { margin: -6px 0 0; color: #9FA8A2; font-size: .9rem; }
  .df input[type=text], .df input[type=tel] { font: inherit; font-size: 1.05rem; color: #F2F4F1; background: #0B0D0C; border: 1px solid rgba(242,244,241,.18);
    border-radius: 12px; padding: 14px 16px; width: 100%; box-sizing: border-box; min-height: 52px; }
  .df input:focus-visible { outline: 2px solid #22C56B; outline-offset: 1px; border-color: transparent; }
  .df__choices { display: grid; gap: 8px; }
  .df__choice { display: flex; gap: 12px; align-items: center; padding: 14px 16px; border: 1px solid rgba(242,244,241,.18); border-radius: 12px; cursor: pointer; font-size: 1rem; }
  .df__choice input { accent-color: #22C56B; width: 18px; height: 18px; margin: 0; }
  .df__choice:has(input:checked) { border-color: #22C56B; background: rgba(34,197,107,.1); }
  .df__choice:has(input:focus-visible) { outline: 2px solid #22C56B; outline-offset: 1px; }
  .df__nav { display: flex; gap: 10px; align-items: center; }
  .df__back { border: 0; background: transparent; color: #9FA8A2; font: inherit; padding: 12px 6px; cursor: pointer; }
  .df__back:hover { color: #F2F4F1; }
  .df__back[hidden] { display: none; }
  .df__next, .df__send { flex: 1; display: flex; gap: 10px; align-items: center; justify-content: center; min-height: 52px; border: 0; border-radius: 999px;
    font: inherit; font-weight: 700; font-size: 1.05rem; cursor: pointer; }
  .df__next { background: #22C56B; color: #04140A; }
  .df__send { white-space: nowrap; flex: 1 0 100%; order: -1; gap: 8px; padding: 0 16px; }
  .df__nav { flex-wrap: wrap; }
  .df__send svg { flex: none; }
  .df__back { white-space: nowrap; flex: none; }
  .df__nav { gap: 6px; }
  .df input[list]::-webkit-calendar-picker-indicator { display: none !important; }
  .df__send { background: #25D366; color: #04140A; }
  .df__next:hover, .df__send:hover { filter: brightness(1.06); }
  .df__next[hidden], .df__send[hidden] { display: none; }
  .df__err { margin: -4px 0 0; color: #FF8A7A; font-size: .9rem; min-height: 1.2em; }
  .df__close { position: absolute; top: 12px; right: 12px; width: 40px; height: 40px; border: 0; border-radius: 999px; background: transparent; color: #9FA8A2; font-size: 26px; line-height: 1; cursor: pointer; }
  .df__close:hover { color: #F2F4F1; background: rgba(242,244,241,.08); }
  .df__fine { margin: 0; font-size: .8rem; color: #9FA8A2; text-align: center; }`;

  const choices = (name, list) => `<div class="df__choices" role="radiogroup">${list.map(v =>
    `<label class="df__choice"><input type="radio" name="${name}" value="${v}">${v}</label>`).join('')}</div>`;
  // One question per screen. type: text fields need "Kontinye"; choice fields move on when picked.
  const STEPS = [
    { name: 'biznis', q: L.q[0], field: `<input type="text" name="biznis" autocomplete="organization" placeholder="${L.ph[0]}">` },
    { name: 'telefon', q: L.q[1], hint: L.hintTel, field: `<input type="tel" name="telefon" autocomplete="tel" inputmode="tel" placeholder="${L.ph[1]}">` },
    { name: 'adres', q: L.q[2], field: `<input type="text" name="adres" autocomplete="street-address" placeholder="${L.ph[2]}">` },
    { name: 'tip', q: L.q[3], hint: L.hintType, field: `<input type="text" name="tip" list="dfTypes" autocomplete="off" placeholder="${L.ph[3]}"><datalist id="dfTypes">${TYPES.map(t => `<option value="${t}">`).join('')}</datalist>` },
    { name: 'kile', q: L.q[4], choice: true, field: choices('kile', START) },
    { name: 'envesti', q: L.q[5], choice: true, last: true, field: choices('envesti', INVEST) },
  ];
  const WA_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>';
  const html = `
  <dialog class="df" id="demoForm" aria-labelledby="dfTitle">
    <button type="button" class="df__close" aria-label="${L.close}">×</button>
    <form novalidate>
      <div class="df__head">
        <p class="df__title" id="dfTitle">${L.title}</p>
        <div class="df__bar" aria-hidden="true"><i></i></div>
        <span class="df__count" aria-live="polite"></span>
      </div>
      ${STEPS.map((st, i) => `<section class="df__step" data-i="${i}">
        <label class="df__q" ${st.choice ? '' : `for="df_${st.name}"`}>${st.q}</label>
        ${st.hint ? `<p class="df__hint">${st.hint}</p>` : ''}
        ${st.choice ? st.field : st.field.replace('<input', `<input id="df_${st.name}"`)}
      </section>`).join('')}
      <p class="df__err" role="alert"></p>
      <div class="df__nav">
        <button type="button" class="df__back">${L.back}</button>
        <button type="submit" class="df__next">${L.next}</button>
        <button type="submit" class="df__send" hidden>${WA_ICON} ${L.send}</button>
      </div>
      <p class="df__fine">${L.fine}</p>
    </form>
  </dialog>`;

  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', html);

    const dlg = document.getElementById('demoForm');
    const form = dlg.querySelector('form');
    const f = form.elements;
    const steps = [...form.querySelectorAll('.df__step')];
    const err = form.querySelector('.df__err');
    const back = form.querySelector('.df__back');
    const next = form.querySelector('.df__next');
    const send = form.querySelector('.df__send');
    const preset = document.body.dataset.biznis || '';
    let at = 0;

    function show(i) {
      at = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      const st = STEPS[i];
      form.querySelector('.df__bar i').style.width = `${(i / STEPS.length) * 100}%`;
      form.querySelector('.df__count').textContent = L.count(i + 1, STEPS.length);
      err.textContent = '';
      back.hidden = i === 0;
      next.hidden = !!st.last || !!st.choice;
      send.hidden = !st.last;
      const focusable = steps[i].querySelector('input:checked') || steps[i].querySelector('input');
      if (focusable) focusable.focus({ preventScroll: true });
    }

    function value(name) {
      const el = f[name];
      return (el.value || '').trim();
    }

    function check(i) {
      const st = STEPS[i];
      const v = value(st.name);
      if (!v) return st.choice ? L.errChoice : L.errEmpty;
      if (st.name === 'telefon' && v.replace(/\D/g, '').length < 8) return L.errTel;
      return '';
    }

    function reset() {
      form.reset();
      if (preset) f.tip.value = preset;
      show(0);
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-demo]');
      if (!a || typeof dlg.showModal !== 'function') return;
      e.preventDefault();
      reset();
      dlg.showModal();
      show(0);
    });
    dlg.querySelector('.df__close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    back.addEventListener('click', () => show(Math.max(0, at - 1)));

    // A picked answer moves on by itself (except the last question, which shows the send button).
    // Listen to clicks, not changes, so re-picking the same answer after "Retounen" still moves on.
    form.addEventListener('click', (e) => {
      if (!e.target.matches('input[type=radio]')) return;
      err.textContent = '';
      if (!STEPS[at].last) setTimeout(() => show(at + 1), 180);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const problem = check(at);
      if (problem) { err.textContent = problem; return; }
      if (at < STEPS.length - 1) { show(at + 1); return; }

      const msg = [
        L.msg[0],
        '',
        `${L.msg[1]}: ${value('biznis')}`,
        `${L.msg[2]}: ${value('telefon')}`,
        `${L.msg[3]}: ${value('adres')}`,
        `${L.msg[4]}: ${value('tip')}`,
        `${L.msg[5]}: ${value('kile')}`,
        `${L.msg[6]}: ${value('envesti')}`,
      ].join('\n');
      if (GHL_WEBHOOK) {
        const payload = {
          business_name: value('biznis'),
          phone: value('telefon'),
          address: value('adres'),
          business_type: value('tip'),
          start_timing: value('kile'),
          ready_to_invest_15000_gdes: value('envesti'),
          page: location.href,
          source: 'pointofsales.fr demo form',
        };
        fetch(GHL_WEBHOOK, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          .catch(() => {});
      }
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      const win = window.open(url, '_blank');
      if (win) win.opener = null; else location.href = url;
      dlg.close();
      reset();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
