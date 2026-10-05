/* Cursor arrow: a dashed curve follows the pointer and points at the main call-to-action.
   Port of the 21st.dev "dynamic hero" arrow to plain JS. Desktop mouse only; off for touch and reduced motion. */
(function () {
  var target = document.querySelector("[data-arrow-target]");
  if (!target) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:40";
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var mouse = { x: null, y: null };
  var rgb = "34,197,107";
  var raf = 0;

  var accent = getComputedStyle(document.documentElement).getPropertyValue("--sc-accent").trim();
  var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(accent);
  if (m) rgb = parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16);

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var r = target.getBoundingClientRect();
    var onScreen = r.bottom > 0 && r.top < window.innerHeight;
    if (mouse.x !== null && onScreen) {
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var a = Math.atan2(cy - mouse.y, cx - mouse.x);
      var x1 = cx - Math.cos(a) * (r.width / 2 + 12);
      var y1 = cy - Math.sin(a) * (r.height / 2 + 12);
      var dist = Math.hypot(x1 - mouse.x, y1 - mouse.y);
      var opacity = Math.min(0.9, (dist - Math.max(r.width, r.height) / 2) / 500);
      if (opacity > 0.02) {
        var midX = (mouse.x + x1) / 2, midY = (mouse.y + y1) / 2;
        var offset = Math.min(200, dist * 0.5);
        var t = Math.max(-1, Math.min(1, (mouse.y - y1) / 200));
        var ctrlY = midY + offset * t;
        ctx.strokeStyle = "rgba(" + rgb + "," + opacity + ")";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.quadraticCurveTo(midX, ctrlY, x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        var ang = Math.atan2(y1 - ctrlY, x1 - midX), head = 13;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - head * Math.cos(ang - Math.PI / 6), y1 - head * Math.sin(ang - Math.PI / 6));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - head * Math.cos(ang + Math.PI / 6), y1 - head * Math.sin(ang + Math.PI / 6));
        ctx.stroke();
      }
    }
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(draw);
  });
  resize();
  raf = requestAnimationFrame(draw);
})();
