// BPRO site: reveal on scroll, one video at a time, video tabs.
(function(){
  var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
  document.querySelectorAll('.rv').forEach(function(el,i){if(io){if(el.classList.contains('app'))el.style.transitionDelay=(i%6)*40+'ms';io.observe(el)}else el.classList.add('in')});
  document.addEventListener('play',function(e){document.querySelectorAll('video').forEach(function(v){if(v!==e.target)v.pause()})},true);
  var tabs=document.querySelectorAll('.tab');
  tabs.forEach(function(t){t.addEventListener('click',function(){
    tabs.forEach(function(x){x.classList.toggle('on',x===t)});
    var f=t.dataset.f;document.querySelectorAll('.vsec').forEach(function(s){s.hidden=!(f==='all'||s.dataset.g===f)});
  })});
})();
// YouTube cards: load the player only on click (youtube-nocookie).
document.querySelectorAll('.yt').forEach(function(el){
  function go(){el.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+el.dataset.yt+'?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'}
  el.addEventListener('click',go,{once:true});el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}},{once:true});
});
// WhatsApp gate (Duckens 2026-10-20): nobody opens a WhatsApp chat with us before giving
// name, business name, business type, company size, e-mail and phone. Every wa.me link opens this form first.
// The trial page's own result button (#waBtn) is already behind the full trial form.
(function(){
  var C=window.BPRO_WA; if(!C||!window.HTMLDialogElement)return;
  var KEY='bpro_wa_info', d=document.createElement('dialog'); d.className='wag'; d.setAttribute('aria-labelledby','wagT');
  var opt=function(xs){return xs.map(function(x){return '<option>'+x+'</option>'}).join('')};
  d.innerHTML='<form method="dialog" novalidate><button type="button" class="wag-x" aria-label="'+C.close+'">×</button>'+
   '<h2 id="wagT">'+C.title+'</h2><p>'+C.sub+'</p><div class="fgrid2">'+
   '<label>'+C.name+'<input name="name" required autocomplete="name"></label>'+
   '<label>'+C.biz+'<input name="biz" required autocomplete="organization"></label>'+
   '<label>'+C.type+'<select name="type" required><option value="">'+C.type0+'</option>'+opt(C.types)+'</select></label>'+
   '<label>'+C.size+'<select name="size" required><option value="">'+C.type0+'</option>'+opt(C.sizes)+'</select></label>'+
   '<label>'+C.email+'<input name="email" type="email" required autocomplete="email"></label>'+
   '<label>'+C.tel+'<input name="tel" type="tel" required autocomplete="tel" placeholder="+509"></label>'+
   '</div><p class="wag-bad" hidden>'+C.bad+'</p><button class="btn btn-p big" type="submit">'+C.go+'</button></form>';
  document.body.appendChild(d);
  var f=d.querySelector('form'), target=null, F=['name','biz','type','size','email','tel'];
  try{var saved=JSON.parse(sessionStorage.getItem(KEY)||'{}');F.forEach(function(k){if(saved[k])f.elements[k].value=saved[k]})}catch(e){}
  d.querySelector('.wag-x').addEventListener('click',function(){d.close()});
  d.addEventListener('click',function(e){if(e.target===d)d.close()});
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href*="wa.me/"]'); if(!a||a.id==='waBtn')return;
    e.preventDefault(); target=a; d.querySelector('.wag-bad').hidden=true; d.showModal(); f.elements.name.focus();
  });
  f.addEventListener('submit',function(e){
    e.preventDefault(); var ok=true, v={};
    F.forEach(function(k){var el=f.elements[k],x=el.value.trim();v[k]=x;var bad=!x||(k==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x))||(k==='tel'&&x.replace(/\D/g,'').length<8);el.classList.toggle('bad',bad);if(bad)ok=false});
    d.querySelector('.wag-bad').hidden=ok; if(!ok)return;
    try{sessionStorage.setItem(KEY,JSON.stringify(v))}catch(e){}
    var u=new URL(target.href), msg=u.searchParams.get('text')||'';
    var info=[C.name+': '+v.name,C.biz+': '+v.biz,C.type+': '+v.type,C.size+': '+v.size,C.email+': '+v.email,C.tel+': '+v.tel].join('\n');
    var url='https://wa.me/'+u.pathname.replace(/\D/g,'')+'?text='+encodeURIComponent((msg?msg+'\n\n':'')+info);
    d.close(); window.open(url,'_blank','noopener');
  });
})();
