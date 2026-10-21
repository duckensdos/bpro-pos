// "Eseye kounya": choose apps (like odoo.com/trial), then company details, then demo / WhatsApp / pay.
// Nothing is sent automatically: WhatsApp opens only when the visitor clicks.
(function(){
  var C=window.BPRO_TRIAL, root=document.getElementById('trial'); if(!C||!root)return;
  var boxes=[].slice.call(root.querySelectorAll('input[name=app]')), cnt=document.getElementById('cnt'),
      bar=document.getElementById('tbarApps'), cont=document.getElementById('contBtn'), form=document.getElementById('tform');
  var q=new URLSearchParams(location.search);
  function pre(list){boxes.forEach(function(b){if(list.indexOf(b.value)>-1)b.checked=true})}
  if(q.get('app'))pre(q.get('app').split(','));
  if(q.get('type')){var o=form.querySelector('select[name=type] option[value="'+q.get('type')+'"]');if(o){o.selected=true;pre(o.dataset.apps.split(','))}}
  if(!boxes.some(function(b){return b.checked}))pre(['pos','stock']);
  function chosen(){return boxes.filter(function(b){return b.checked})}
  function upd(){var c=chosen();cnt.textContent=c.length;bar.textContent=c.map(function(b){return b.dataset.n}).join(' · ');cont.disabled=!c.length;cont.title=c.length?'':C.none}
  boxes.forEach(function(b){b.addEventListener('change',upd)});upd();
  function chips(el){el.innerHTML=chosen().map(function(b){return '<span>'+b.parentNode.querySelector('.ic').innerHTML+b.dataset.n+'</span>'}).join('')}
  function go(n){root.dataset.step=n;window.scrollTo({top:0,behavior:'smooth'});if(n===2){chips(document.getElementById('chosen2'));setTimeout(function(){form.elements.name.focus()},300)}}
  cont.addEventListener('click',function(){if(chosen().length)go(2)});
  root.querySelector('.js-back').addEventListener('click',function(){go(1)});
  root.querySelector('.js-back2').addEventListener('click',function(){go(1)});
  function plan(f){
    var apps=chosen().map(function(b){return b.value}), size=f.size.selectedIndex;
    if(apps.indexOf('lekol')>-1&&apps.length<=3)return 'education';
    if(apps.indexOf('woocommerce')>-1||size>=3)return 'corporate';
    if(size>=1)return 'business';
    return 'start';
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();var f=form.elements,ok=true;
    ['name','biz','email','tel','country','lang','size'].forEach(function(k){var el=f[k],v=el.value.trim();var bad=!v||(k==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));el.classList.toggle('bad',bad);if(bad&&ok){ok=false;el.focus()}});
    if(!ok)return;
    var it=form.querySelector('input[name=int]:checked').value, p=plan(f), aff=(it==='affiliate'||it==='partner');
    document.getElementById('planName').textContent='BPRO '+p.toUpperCase();
    document.getElementById('planPrice').textContent=C.plans[p];
    document.getElementById('planBox').hidden=aff; document.getElementById('affNote').hidden=!aff;
    var pay=document.getElementById('payBtn'); pay.dataset.plan=p; pay.hidden=aff;
    var t=f.type.options[f.type.selectedIndex];
    var lines=[C.wa_head,'',C.name+': '+f.name.value.trim(),C.biz+': '+f.biz.value.trim(),C.email+': '+f.email.value.trim(),C.tel+': '+f.tel.value.trim(),
      C.country+': '+f.country.value,C.lang+': '+f.lang.value,C.size+': '+f.size.value,C.int+': '+C.ints[it]];
    if(f.type.value)lines.push(t.textContent);
    lines.push('',C.wa_apps+': '+chosen().map(function(b){return b.dataset.n}).join(', '));
    if(!aff)lines.push('Plan: BPRO '+p.toUpperCase());
    document.getElementById('waBtn').href='https://wa.me/'+C.wa+'?text='+encodeURIComponent(lines.join('\n'));
    chips(document.getElementById('chosen3'));go(3);
  });
})();
