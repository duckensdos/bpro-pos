// "Eseye kounya" (like odoo.com/trial): 1) business type, 2) base apps (always included, locked),
// 3) optional modules — the type pre-checks its recommended modules. Then company form, then
// create the business account (app register page) or send choices on WhatsApp. Demo is only a side link.
// Nothing is sent automatically: WhatsApp opens only when the visitor clicks.
(function(){
  var C=window.BPRO_TRIAL, root=document.getElementById('trial'); if(!C||!root)return;
  var all=[].slice.call(root.querySelectorAll('input[name=app]')),
      mods=all.filter(function(b){return !b.disabled}),
      types=[].slice.call(root.querySelectorAll('input[name=btype]')),
      cnt=document.getElementById('cnt'), bar=document.getElementById('tbarApps'), cont=document.getElementById('contBtn'),
      form=document.getElementById('tform'), hint=document.getElementById('recHint'), auto=[];
  var q=new URLSearchParams(location.search);
  function chosen(){return all.filter(function(b){return b.checked})}
  function type(){return types.filter(function(t){return t.checked})[0]}
  function upd(){
    var c=chosen(), m=mods.filter(function(b){return b.checked}), t=type();
    mods.forEach(function(b){b.closest('.pick').classList.toggle('on',b.checked)});
    cnt.textContent=c.length; bar.textContent=m.length?'+ '+m.map(function(b){return b.dataset.n}).join(' · '):'';
    cont.disabled=!t; cont.title=t?'':C.none;
  }
  function pickType(t){
    var rec=(t.dataset.mods||'').split(',').filter(Boolean);
    auto.forEach(function(b){b.checked=false}); auto=[];       // undo the previous type's suggestions
    mods.forEach(function(b){                                   // put every tile back in its own category
      var pk=b.closest('.pick'); if(pk.parentNode===recGrid)pk.homeGrid.insertBefore(pk,pk.homeNext);
    });
    mods.forEach(function(b){
      var pk=b.closest('.pick'), r=rec.indexOf(b.value)>-1; pk.querySelector('.tagr').hidden=!r;
      if(r){if(!b.checked){b.checked=true;auto.push(b)} recGrid.appendChild(pk)}
    });
    recBox.hidden=!rec.length; recBox.querySelector('legend').textContent=recBox.dataset.l.replace('{}',t.dataset.n);
    [].slice.call(root.querySelectorAll('.modsbox .pcat')).forEach(function(fs){if(fs!==recBox)fs.hidden=!fs.querySelector('.pick')});
    hint.textContent=rec.length?C.rec_p.replace('{}',t.dataset.n):hint.dataset.def;
    form.elements.type.value=t.dataset.n; upd();
  }
  hint.dataset.def=hint.textContent;
  // "Recommended for <type>" row at the top of the modules step; tiles remember their home category
  var recBox=document.createElement('fieldset'); recBox.className='pcat recbox'; recBox.hidden=true; recBox.dataset.l=C.rec_l;
  recBox.innerHTML='<legend></legend><div class="pgrid"></div>'; var recGrid=recBox.querySelector('.pgrid');
  hint.parentNode.insertBefore(recBox,hint.nextSibling);
  mods.forEach(function(b){var pk=b.closest('.pick');pk.homeGrid=pk.parentNode;pk.homeNext=pk.nextSibling});
  var wa=document.querySelector('.wa'); if(wa)wa.classList.add('wa-up');
  // choosing a type moves the visitor on to the modules step (Duckens 2026-10-21)
  var mbox=root.querySelector('.modsbox'), reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  types.forEach(function(t){t.addEventListener('change',function(){
    pickType(t);
    var y=mbox.getBoundingClientRect().top+window.scrollY-(document.querySelector('header')||{offsetHeight:0}).offsetHeight-12;
    window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
    mbox.classList.remove('flash'); void mbox.offsetWidth; mbox.classList.add('flash');
  })});
  mods.forEach(function(b){b.addEventListener('change',function(){var i=auto.indexOf(b);if(i>-1)auto.splice(i,1);upd()})});
  // deep links: ?type=famasi, ?app=crm, ?int=affiliate
  if(q.get('type')){var tt=types.filter(function(t){return t.value===q.get('type')})[0];if(tt){tt.checked=true;pickType(tt)}}
  if(q.get('app'))q.get('app').split(',').forEach(function(s){mods.forEach(function(b){if(b.value===s)b.checked=true})});
  if(q.get('int')){var ri=form.querySelector('input[name=int][value="'+q.get('int')+'"]');if(ri)ri.checked=true}
  upd();
  function chips(el){el.innerHTML=chosen().map(function(b){return '<span>'+b.parentNode.querySelector('.ic').innerHTML+b.dataset.n+'</span>'}).join('')}
  function go(n){root.dataset.step=n;window.scrollTo({top:0,behavior:'smooth'});if(n===2){chips(document.getElementById('chosen2'));setTimeout(function(){form.elements.name.focus()},300)}}
  cont.addEventListener('click',function(){if(type())go(2);else{root.querySelector('.tsel').scrollIntoView({behavior:'smooth'})}});
  root.querySelector('.js-back').addEventListener('click',function(){go(1)});
  root.querySelector('.js-back2').addEventListener('click',function(){go(1)});
  function plan(f){
    var m=mods.filter(function(b){return b.checked}).map(function(b){return b.value}), size=f.size.selectedIndex, t=type();
    if(t&&t.value==='lekol')return 'education';
    if(m.indexOf('woocommerce')>-1||size>=3)return 'corporate';
    if(size>=1)return 'business';
    return 'start';
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();var f=form.elements,ok=true;
    ['name','biz','email','tel','country','lang','size'].forEach(function(k){var el=f[k],v=el.value.trim();var bad=!v||(k==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));el.classList.toggle('bad',bad);if(bad&&ok){ok=false;el.focus()}});
    if(!ok||!type())return;
    var it=form.querySelector('input[name=int]:checked').value, p=plan(f), aff=(it==='affiliate'||it==='partner');
    document.getElementById('planName').textContent='BPRO '+p.toUpperCase();
    document.getElementById('planPrice').textContent=C.plans[p];
    document.getElementById('planBox').hidden=aff; document.getElementById('affNote').hidden=!aff;
    document.getElementById('regBtn').hidden=aff;
    // pass the business type to the app sign-up, which pre-selects it (added by another session, 1065cfa; fixed: it used an undefined variable)
    var bt=type(); document.getElementById('regBtn').href='https://app.pointofsales.fr/business/register'+(bt&&bt.value!=='other'?'?type='+encodeURIComponent(bt.value):'');
    var m=mods.filter(function(b){return b.checked}).map(function(b){return b.dataset.n});
    var lines=[C.wa_head,'',C.name+': '+f.name.value.trim(),C.biz+': '+f.biz.value.trim(),C.email+': '+f.email.value.trim(),C.tel+': '+f.tel.value.trim(),
      C.country+': '+f.country.value,C.lang+': '+f.lang.value,C.size+': '+f.size.value,C.int+': '+C.ints[it],C.type+': '+f.type.value,'',
      C.wa_apps+': '+(m.length?m.join(', '):'-')];
    if(!aff)lines.push('Plan: BPRO '+p.toUpperCase());
    document.getElementById('waBtn').href='https://wa.me/'+C.wa+'?text='+encodeURIComponent(lines.join('\n'));
    chips(document.getElementById('chosen3'));go(3);
  });
})();
