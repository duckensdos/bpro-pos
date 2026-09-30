/* BPRO demo request: every link marked [data-demo] opens this form.
   "Voye sou WhatsApp" opens WhatsApp with the answers already written.
   Without JS, the link itself still opens WhatsApp. */
(function () {
  const WA_NUMBER = '50943830148';
  const TYPES = ['Boutik ak market', 'Famasi', 'Quincaillerie', 'Auto parts', 'Restoran', 'Barbershop ak salon',
    'Gym', 'Magazen rad ak tenis', 'Garaj ak repair shop', 'Manufacturing', 'Patisri', 'Lekòl', 'Lòt'];
  const START = ['Touswit', 'Semèn sa a', 'Mwa sa a', 'Nan 1 a 3 mwa', 'M ap reflechi toujou'];
  const INVEST = ['Wi, mwen pare', 'Non, pa kounye a', 'Mwen bezwen plis enfòmasyon'];

  const css = `
  .df { width: min(34rem, calc(100vw - 32px)); max-height: calc(100dvh - 32px); padding: 0; border: 1px solid rgba(242,244,241,.16);
    border-radius: 18px; background: #111413; color: #F2F4F1; box-shadow: 0 24px 64px rgba(0,0,0,.55); font: inherit; }
  .df::backdrop { background: rgba(4,6,5,.72); backdrop-filter: blur(4px); }
  .df form { display: grid; gap: 14px; padding: 24px; }
  .df h2 { margin: 0; padding-right: 36px; font-size: 1.5rem; letter-spacing: -.02em; line-height: 1.15; }
  .df p.df__sub { margin: 0 0 4px; color: #9FA8A2; font-size: .95rem; }
  .df label { display: grid; gap: 6px; font-size: .9rem; font-weight: 600; }
  .df input, .df select { font: inherit; font-weight: 400; color: #F2F4F1; background: #0B0D0C; border: 1px solid rgba(242,244,241,.18);
    border-radius: 10px; padding: 12px 14px; width: 100%; box-sizing: border-box; min-height: 46px; }
  .df select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #9FA8A2 50%), linear-gradient(135deg, #9FA8A2 50%, transparent 50%);
    background-position: calc(100% - 20px) 50%, calc(100% - 15px) 50%; background-size: 5px 5px; background-repeat: no-repeat; padding-right: 36px; }
  .df input:focus, .df select:focus { outline: 2px solid #22C56B; outline-offset: 1px; border-color: transparent; }
  .df fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: 8px; }
  .df legend { font-size: .9rem; font-weight: 600; margin-bottom: 6px; padding: 0; }
  .df .df__choice { display: flex; gap: 10px; align-items: center; font-weight: 400; padding: 10px 14px; border: 1px solid rgba(242,244,241,.18); border-radius: 10px; cursor: pointer; }
  .df .df__choice input { width: auto; min-height: 0; accent-color: #22C56B; }
  .df .df__choice:has(input:checked) { border-color: #22C56B; background: rgba(34,197,107,.1); }
  .df__send { display: flex; gap: 10px; align-items: center; justify-content: center; margin-top: 6px; min-height: 52px; border: 0; border-radius: 999px;
    background: #25D366; color: #04140A; font: inherit; font-weight: 700; font-size: 1.05rem; cursor: pointer; }
  .df__send:hover { filter: brightness(1.06); }
  .df__close { position: absolute; top: 12px; right: 12px; width: 40px; height: 40px; border: 0; border-radius: 999px; background: transparent; color: #9FA8A2; font-size: 26px; line-height: 1; cursor: pointer; }
  .df__close:hover { color: #F2F4F1; background: rgba(242,244,241,.08); }
  .df__fine { margin: 0; font-size: .8rem; color: #9FA8A2; text-align: center; }`;

  const opts = (list) => list.map(v => `<option>${v}</option>`).join('');
  const html = `
  <dialog class="df" id="demoForm" aria-labelledby="dfTitle">
    <button type="button" class="df__close" aria-label="Fèmen">×</button>
    <form novalidate>
      <div>
        <h2 id="dfTitle">Mande yon demo gratis</h2>
        <p class="df__sub">Ranpli ti fòm sa a. N ap resevwa l sou WhatsApp epi n ap kontakte w.</p>
      </div>
      <label>Non biznis ou<input name="biznis" required autocomplete="organization" placeholder="Egzanp: Boutik Bèl Espwa"></label>
      <label>Adrès biznis la<input name="adres" required autocomplete="street-address" placeholder="Egzanp: Delmas 33, Pòtoprens"></label>
      <label>Kalite biznis<select name="tip" required><option value="">Chwazi…</option>${opts(TYPES)}</select></label>
      <label>Kilè ou vle kòmanse?<select name="kile" required><option value="">Chwazi…</option>${opts(START)}</select></label>
      <fieldset>
        <legend>Èske ou pare pou envesti 15,000 GDES pou sistèm nan?</legend>
        ${INVEST.map((v, i) => `<label class="df__choice"><input type="radio" name="envesti" value="${v}"${i === 0 ? ' required' : ''}>${v}</label>`).join('')}
      </fieldset>
      <button type="submit" class="df__send">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>
        Voye sou WhatsApp
      </button>
      <p class="df__fine">Demo a gratis, san obligasyon.</p>
    </form>
  </dialog>`;

  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', html);

    const dlg = document.getElementById('demoForm');
    const form = dlg.querySelector('form');
    const tip = form.elements.tip;
    const preset = document.body.dataset.biznis;
    if (preset && TYPES.includes(preset)) tip.value = preset;

    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-demo]');
      if (!a || typeof dlg.showModal !== 'function') return;
      e.preventDefault();
      dlg.showModal();
      form.elements.biznis.focus();
    });
    dlg.querySelector('.df__close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const f = form.elements;
      const msg = [
        'Bonjou BPRO, mwen vle yon demo.',
        '',
        `Non biznis: ${f.biznis.value.trim()}`,
        `Adrès: ${f.adres.value.trim()}`,
        `Kalite biznis: ${f.tip.value}`,
        `Kilè m vle kòmanse: ${f.kile.value}`,
        `Pare pou envesti 15,000 GDES: ${f.envesti.value}`,
      ].join('\n');
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      const win = window.open(url, '_blank');
      if (win) win.opener = null; else location.href = url;
      dlg.close();
      form.reset();
      if (preset && TYPES.includes(preset)) tip.value = preset;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
