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
