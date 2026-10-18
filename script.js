(() => {
  const EVENT_START = new Date('2026-10-19T16:00:00+05:30');
  const EVENT_END = new Date('2026-10-19T18:00:00+05:30');

  /* ---------- Performance tier ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weak = reduced || (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
  const veryWeak = reduced || (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 1;
  if (veryWeak) document.documentElement.classList.add('lite');
  const MAX_PARTS = weak ? 25 : 55;

  /* ---------- Falling petals ---------- */
  const petalBox = document.getElementById('petals');
  const PETALS = veryWeak ? 0 : weak ? 7 : 12;
  for (let i = 0; i < PETALS; i++) {
    const p = document.createElement('span');
    p.className = 'petal' + (i % 4 === 0 ? ' rose' : '');
    p.style.left = Math.random() * 100 + '%';
    p.style.setProperty('--sway', (Math.random() * 160 - 80) + 'px');
    p.style.animationDuration = 9 + Math.random() * 10 + 's';
    p.style.animationDelay = -Math.random() * 18 + 's';
    const s = 0.6 + Math.random() * 0.9;
    p.style.width = 14 * s + 'px';
    p.style.height = 18 * s + 'px';
    petalBox.appendChild(p);
  }

  /* ---------- Sparkle / firework canvas ---------- */
  const cv = document.getElementById('fx');
  const ctx = cv.getContext('2d');
  let W, H, dpr;
  const parts = [];
  const resize = () => {
    dpr = 1;
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
  };
  addEventListener('resize', resize);
  resize();

  const gold = ['#fff0b8', '#f6d77a', '#e8b84a', '#ffb347', '#ff8a3c'];
  const sprites = gold.map(c => {
    const o = document.createElement('canvas'); o.width = o.height = 16;
    const x = o.getContext('2d'), g = x.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, c); g.addColorStop(.35, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 16, 16); return o;
  });
  const rand = (a, b) => a + Math.random() * (b - a);

  function spawnTwinkle() {
    parts.push({
      x: Math.random() * W, y: Math.random() * H, vx: 0, vy: -rand(.05, .25) * dpr,
      life: 0, max: rand(120, 260), r: rand(.6, 2.2) * dpr, c: (Math.random() * sprites.length) | 0, g: 0, tw: true
    });
  }
  function burst(x, y, n = weak ? 24 : 40) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rand(1, 6) * dpr;
      parts.push({
        x: x * dpr, y: y * dpr, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0, max: rand(50, 100), r: rand(1, 2.8) * dpr, c: (Math.random() * sprites.length) | 0, g: .06 * dpr
      });
    }
  }

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    if (parts.length < MAX_PARTS && Math.random() < .25) spawnTwinkle();
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= p.tw ? 1 : .985;
      const t = p.life / p.max;
      if (t >= 1) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = p.tw ? Math.sin(t * Math.PI) : 1 - t;
      const d = p.r * 4;
      ctx.drawImage(sprites[p.c], p.x - d / 2, p.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  if (!veryWeak) frame();

  function fireworks(count = 6) {
    if (veryWeak) return;
    count = weak ? Math.min(count, 3) : count;
    for (let i = 0; i < count; i++) {
      setTimeout(() => { burst(rand(.1, .9) * innerWidth, rand(.1, .55) * innerHeight); }, i * 280);
    }
  }

  /* Cursor / touch sparkle trail */
  let last = 0;
  addEventListener('pointermove', e => {
    const now = performance.now();
    if (weak || now - last < 60) return;
    last = now;
    for (let i = 0; i < 1; i++) {
      parts.push({
        x: e.clientX * dpr, y: e.clientY * dpr, vx: rand(-.6, .6) * dpr, vy: rand(-.6, .6) * dpr,
        life: 0, max: rand(30, 55), r: rand(.8, 2) * dpr, c: (Math.random() * sprites.length) | 0, g: .02 * dpr
      });
    }
  });
  addEventListener('pointerdown', e => burst(e.clientX, e.clientY, 14));

  /* ---------- Cracker intro ---------- */
  const intro = document.getElementById('intro');
  const icv = document.getElementById('introCv');
  const ictx = icv.getContext('2d');
  const iparts = [];
  let iW, iH, introState = 'run', revealed = false;
  const isprites = ['#fff6d0', '#ffd96a', '#e8b84a', '#ff9a3c', '#ff4d3a', '#ffffff'].map(c => {
    const o = document.createElement('canvas'); o.width = o.height = 16;
    const x = o.getContext('2d'), g = x.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, c); g.addColorStop(.4, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 16, 16); return o;
  });
  const iresize = () => { iW = icv.width = innerWidth; iH = icv.height = innerHeight; };
  iresize();

  function reveal() {
    if (revealed) return;
    revealed = true;
    intro.classList.add('reveal-now');
    document.body.classList.remove('locked');
    document.body.classList.add('entered');
  }
  function endIntro() {
    intro.classList.add('done');
    setTimeout(() => intro.remove(), 1700);
    introState = 'end';
    if (!veryWeak) setTimeout(() => fireworks(3), 300);
  }

  /* ---------- Three crackers: left, right, then the big centre one ---------- */
  const rockets = [
    { x: .2, to: .46, at: 400, dur: 1100, size: .7, big: false },
    { x: .8, to: .46, at: 650, dur: 1100, size: .7, big: false },
    { x: .5, to: .34, at: 900, dur: 1300, size: 1, big: true }
  ].map(r => Object.assign(r, { state: 'wait', y: 0, t0: 0 }));

  function explode(r) {
    r.state = 'done';
    const bxp = r.x * iW, byp = r.to * iH;
    intro.style.setProperty('--bx', (r.x * 100) + '%');
    intro.style.setProperty('--by', (r.to * 100) + '%');
    intro.classList.remove('burst'); void intro.offsetWidth; intro.classList.add('burst');
    const R = Math.min(iW, iH) * (weak ? .02 : .024) * r.size;
    const n = Math.round((veryWeak ? 60 : weak ? 100 : 190) * (r.big ? 1.2 : .7));
    for (let i = 0; i < n; i++) {
      const ring = i % 3, a = Math.random() * 6.283;
      const v = (ring === 0 ? rand(.35, .5) : ring === 1 ? rand(.6, .8) : rand(.85, 1.05)) * R;
      iparts.push({
        x: bxp, y: byp, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 0, max: rand(70, 120), r: rand(1.4, 2.6), c: (Math.random() * isprites.length) | 0, g: .045, drag: .955
      });
    }
    if (r.big) { setTimeout(reveal, 700); setTimeout(endIntro, 2400); }
  }

  function iframe(now) {
    if (introState === 'end') return;
    ictx.globalCompositeOperation = 'destination-out';
    ictx.fillStyle = 'rgba(0,0,0,.22)';
    ictx.fillRect(0, 0, iW, iH);
    ictx.globalCompositeOperation = 'source-over';

    for (const r of rockets) {
      if (r.state === 'wait' && now > r.at) { r.state = 'fly'; r.t0 = now; }
      if (r.state !== 'fly') continue;
      const t = Math.min((now - r.t0) / r.dur, 1), e = 1 - Math.pow(1 - t, 2.2);
      const from = iH + 20, to = r.to * iH;
      const y = from + (to - from) * e, x = r.x * iW + Math.sin(t * 22) * 5 * (1 - t);
      for (let i = 0; i < (weak ? 2 : 4); i++) {
        iparts.push({
          x: x + rand(-3, 3), y: y + rand(0, 10), vx: rand(-.7, .7), vy: rand(1, 3),
          life: 0, max: rand(25, 50), r: rand(1, 2.4), c: 1 + ((Math.random() * 3) | 0), g: .03, drag: .98
        });
      }
      ictx.globalAlpha = 1;
      const k = r.big ? 1 : .75;
      ictx.drawImage(isprites[0], x - 22 * k, y - 22 * k, 44 * k, 44 * k);
      ictx.drawImage(isprites[3], x - 10 * k, y + 4, 20 * k, 40 * k);
      if (t >= 1) explode(r);
    }
    for (let i = iparts.length - 1; i >= 0; i--) {
      const p = iparts[i];
      p.life++; p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy;
      const t = p.life / p.max;
      if (t >= 1) { iparts.splice(i, 1); continue; }
      ictx.globalAlpha = t < .6 ? 1 : 1 - (t - .6) / .4;
      const d = p.r * 5;
      ictx.drawImage(isprites[p.c], p.x - d / 2, p.y - d / 2, d, d);
    }
    ictx.globalAlpha = 1;
    requestAnimationFrame(iframe);
  }

  if (reduced) {
    intro.remove(); reveal();
  } else {
    addEventListener('resize', iresize);
    requestAnimationFrame(iframe);
  }
  document.getElementById('burst').addEventListener('click', () => fireworks(6));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Countdown ---------- */
  const els = { d: 'cd-d', h: 'cd-h', m: 'cd-m', s: 'cd-s' };
  Object.keys(els).forEach(k => els[k] = document.getElementById(els[k]));
  const note = document.getElementById('cdNote');
  const pad = n => String(n).padStart(2, '0');
  const set = (el, v) => { if (el.textContent !== v) { el.textContent = v; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } };

  function tick() {
    const now = new Date();
    let diff = EVENT_START - now;
    if (diff <= 0) {
      note.textContent = now < EVENT_END ? '🪔 The pooja is happening now — join us!' : 'Thank you for celebrating with us 🙏';
      diff = 0;
    }
    const s = Math.floor(diff / 1000);
    set(els.d, pad(Math.floor(s / 86400)));
    set(els.h, pad(Math.floor(s % 86400 / 3600)));
    set(els.m, pad(Math.floor(s % 3600 / 60)));
    set(els.s, pad(s % 60));
  }
  tick(); setInterval(tick, 1000);
})();
