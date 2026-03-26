/* ══════════════════════════════════════════════════════════
   VPL Season 2 · 2026 — script.js
   ══════════════════════════════════════════════════════════ */

'use strict';

// ── CONFIG ──────────────────────────────────────────────────
const CFG = {
  price: 20,
  maxPersons: 20,
  wa: '919427358184',
  adminPass: 'vpl2026admin', // change before deploy
  rateLimitMs: 60000
};

// ── STATE ────────────────────────────────────────────────────
const S = {
  persons: 1,
  file: null,
  fileData: null,
  submitting: false,
  lastSubmit: 0,
  step: 1
};

// ── LOCAL DB ─────────────────────────────────────────────────
const DB = {
  all() { try { return JSON.parse(localStorage.getItem('vpl2_bookings') || '[]'); } catch { return []; } },
  save(b) { const a = this.all(); a.push(b); localStorage.setItem('vpl2_bookings', JSON.stringify(a)); },
  stats() {
    const a = this.all();
    return { bookings: a.length, revenue: a.reduce((s, b) => s + (b.amount || 0), 0), people: a.reduce((s, b) => s + (b.persons || 0), 0) };
  }
};

// ── CUSTOM CURSOR ────────────────────────────────────────────
(function initCursor() {
  const el = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!el || !dot || window.innerWidth < 768) return;

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });

  const hover = ['a', 'button', '.ticket-card', '.av-card', '.gm-item', '.team-card'];
  document.querySelectorAll(hover.join(',')).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    requestAnimationFrame(tick);
  }
  tick();
})();

// ── HERO CANVAS — Floating cricket particles ─────────────────
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  const EMOJIS = ['🏏', '🏆', '⭐', '🔥', '✨'];
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 40;
      this.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      this.size = Math.random() * 20 + 10;
      this.speed = Math.random() * .4 + .15;
      this.drift = (Math.random() - .5) * .3;
      this.alpha = Math.random() * .15 + .05;
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - .5) * .01;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0);
      ctx.restore();
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.rot += this.rotSpeed;
      if (this.y < -40) this.reset();
    }
  }

  for (let i = 0; i < 18; i++) particles.push(new Particle());

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  frame();
})();

// ── NAV SCROLL ───────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav')?.classList.toggle('scrolled', scrollY > 60);
}, { passive: true });

// ── HAMBURGER ────────────────────────────────────────────────
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobileNav')?.classList.toggle('open');
});
function closeMob() { document.getElementById('mobileNav')?.classList.remove('open'); }

// ── SCROLL REVEAL ────────────────────────────────────────────
new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); } });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' })
  .observe && document.querySelectorAll('.reveal').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }).observe(el);
  });

// ── ANIMATED COUNTERS ────────────────────────────────────────
function countTo(el, target, prefix = '', suffix = '', dur = 1800) {
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(step);
}

new IntersectionObserver(([e]) => {
  if (!e.isIntersecting) return;
  const { bookings, revenue, people } = DB.stats();
  const elB = document.getElementById('statBookings');
  const elR = document.getElementById('statRevenue');
  const elP = document.getElementById('statPeople');
  if (elB) countTo(elB, bookings);
  if (elR) countTo(elR, revenue, '₹');
  if (elP) countTo(elP, people);
}, { threshold: 0.3 }).observe(document.getElementById('stats') || document.body);

// ── MODAL ────────────────────────────────────────────────────
function openModal() {
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  toStep(1);
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { resetForm(); toStep(1); }, 350);
}

document.getElementById('modal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function toStep(n) {
  S.step = n;
  document.querySelectorAll('.mstep').forEach((s, i) => s.classList.toggle('active', i + 1 === n));

  // Update step indicators
  const dots = [document.getElementById('dot1'), document.getElementById('dot2'), document.getElementById('dot3')];
  const lines = [document.getElementById('line12'), document.getElementById('line23')];
  dots.forEach((d, i) => {
    if (!d) return;
    d.classList.remove('active', 'done');
    if (i + 1 < n) d.classList.add('done');
    else if (i + 1 === n) d.classList.add('active');
  });
  lines.forEach((l, i) => { if (l) l.classList.toggle('active', i + 1 < n); });

  document.querySelector('.modal')?.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── PERSONS STEPPER ──────────────────────────────────────────
function chPer(d) {
  S.persons = Math.max(1, Math.min(CFG.maxPersons, S.persons + d));
  document.getElementById('perCount').textContent = S.persons;
  const total = S.persons * CFG.price;
  document.getElementById('totalDisplay').textContent = '₹' + total;
  document.getElementById('payBigAmt').textContent = '₹' + total;
}

// ── VALIDATION ───────────────────────────────────────────────
function validate() {
  let ok = true;
  const name = document.getElementById('fName').value.trim();
  const ne = document.getElementById('errName');
  if (name.length < 3) {
    ne.textContent = 'Please enter your full name'; ok = false;
    document.getElementById('fName').style.borderColor = '#ff6060';
  } else { ne.textContent = ''; document.getElementById('fName').style.borderColor = ''; }

  const ph = document.getElementById('fPhone').value.trim();
  const pe = document.getElementById('errPhone');
  if (!/^[6-9]\d{9}$/.test(ph)) {
    pe.textContent = 'Enter a valid 10-digit number'; ok = false;
    document.getElementById('fPhone').style.borderColor = '#ff6060';
  } else { pe.textContent = ''; document.getElementById('fPhone').style.borderColor = ''; }
  return ok;
}

function toPayment() {
  if (!validate()) return;
  toStep(2);
}

// ── FILE UPLOAD ──────────────────────────────────────────────
function handleFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  if (!f.type.startsWith('image/')) { toast('Please upload an image file'); return; }
  if (f.size > 5 * 1024 * 1024) { toast('File too large — max 5MB'); return; }
  S.file = f;
  const reader = new FileReader();
  reader.onload = ev => {
    S.fileData = ev.target.result;
    const prev = document.getElementById('uploadPrev');
    if (prev) prev.innerHTML = `<img src="${ev.target.result}" alt="screenshot"/>`;
    const t = document.getElementById('udText');
    if (t) t.textContent = '✓ ' + f.name;
    document.getElementById('uploadDrop').style.borderColor = 'var(--gold)';
  };
  reader.readAsDataURL(f);
}

// Drag & drop
const drop = document.getElementById('uploadDrop');
if (drop) {
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.borderColor = 'var(--gold)'; drop.style.background = 'rgba(232,160,32,.05)'; });
  drop.addEventListener('dragleave', () => { drop.style.borderColor = ''; drop.style.background = ''; });
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.style.borderColor = ''; drop.style.background = '';
    const f = e.dataTransfer.files[0];
    if (f) { document.getElementById('fileIn').files = e.dataTransfer.files; handleFile({ target: { files: [f] } }); }
  });
}

// Phone: numbers only
document.getElementById('fPhone')?.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 10); });

// ── SUBMIT ───────────────────────────────────────────────────
async function submitBooking() {
  if (S.submitting) return;
  if (Date.now() - S.lastSubmit < CFG.rateLimitMs) {
    const wait = Math.ceil((CFG.rateLimitMs - (Date.now() - S.lastSubmit)) / 1000);
    toast(`Please wait ${wait}s`); return;
  }
  if (!S.file) {
    document.getElementById('errUpload').textContent = 'Please upload payment screenshot';
    document.getElementById('uploadDrop').style.borderColor = '#ff6060'; return;
  }
  document.getElementById('errUpload').textContent = '';

  S.submitting = true;
  S.lastSubmit = Date.now();
  const btn = document.getElementById('confirmBtn');
  if (btn) { btn.textContent = 'Processing…'; btn.disabled = true; }

  const booking = {
    id: 'VPL2-' + Date.now(),
    name: document.getElementById('fName').value.trim(),
    phone: '+91' + document.getElementById('fPhone').value.trim(),
    persons: S.persons,
    amount: S.persons * CFG.price,
    screenshot: S.fileData || null,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-IN')
  };

  try {
    DB.save(booking);

    // Refresh stats
    refreshStats();

    // Fill success ticket
    const st = document.getElementById('successTicket');
    if (st) st.innerHTML =
      `<strong>ID:</strong> ${booking.id}<br/>` +
      `<strong>Name:</strong> ${booking.name}<br/>` +
      `<strong>Phone:</strong> ${booking.phone}<br/>` +
      `<strong>Persons:</strong> ${booking.persons}<br/>` +
      `<strong>Amount Paid:</strong> ₹${booking.amount}<br/>` +
      `<strong>Event:</strong> VPL S2 · 21–31 Mar 2026`;

    // WhatsApp button
    const msg = encodeURIComponent(
      `🏏 *VPL Season 2 – 2026 Booking*\n\n` +
      `📋 ID: ${booking.id}\n👤 Name: ${booking.name}\n📞 Phone: ${booking.phone}\n` +
      `👥 Persons: ${booking.persons}\n💰 Amount: ₹${booking.amount}\n📅 Date: ${booking.date}\n\n` +
      `Organized by Savaso Juth Limbach Samaj 🙏`
    );
    const waBtn = document.getElementById('waBtn');
    if (waBtn) waBtn.onclick = () => window.open(`https://wa.me/${CFG.wa}?text=${msg}`, '_blank');

    toStep(3);
    launchConfetti();

  } catch (err) {
    console.error(err);
    toast('Something went wrong. Please try again.');
  } finally {
    S.submitting = false;
    if (btn) { btn.textContent = 'Confirm Booking'; btn.disabled = false; }
  }
}

// ── CONFETTI ─────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confCanvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const ctx = canvas.getContext('2d');

  const colors = ['#e8a020', '#f5c050', '#d4780a', '#22c55e', '#ec4899', '#38bdf8', '#f97316'];
  const pieces = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    w: Math.random() * 8 + 4,
    h: Math.random() * 14 + 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - .5) * 4,
    vy: Math.random() * 5 + 2,
    spin: (Math.random() - .5) * .2,
    angle: Math.random() * Math.PI * 2
  }));

  let f = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - f / 150);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.vy += .08;
    });
    f++;
    if (f < 160) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ── RESET ────────────────────────────────────────────────────
function resetForm() {
  S.persons = 1; S.file = null; S.fileData = null;
  ['fName', 'fPhone'].forEach(id => { const el = document.getElementById(id); if (el) { el.value = ''; el.style.borderColor = ''; } });
  const pc = document.getElementById('perCount'); if (pc) pc.textContent = '1';
  document.getElementById('totalDisplay').textContent = '₹20';
  document.getElementById('payBigAmt').textContent = '₹20';
  const prev = document.getElementById('uploadPrev'); if (prev) prev.innerHTML = '';
  const ut = document.getElementById('udText'); if (ut) ut.textContent = 'Drop screenshot here or click to browse';
  const ud = document.getElementById('uploadDrop'); if (ud) ud.style.borderColor = '';
  const fi = document.getElementById('fileIn'); if (fi) fi.value = '';
  document.querySelectorAll('.mf-err').forEach(e => e.textContent = '');
}

// ── STATS REFRESH ────────────────────────────────────────────
function refreshStats() {
  const { bookings, revenue, people } = DB.stats();
  const elB = document.getElementById('statBookings');
  const elR = document.getElementById('statRevenue');
  const elP = document.getElementById('statPeople');
  if (elB) countTo(elB, bookings);
  if (elR) countTo(elR, revenue, '₹');
  if (elP) countTo(elP, people);
}

// ── QR FALLBACK ──────────────────────────────────────────────
document.getElementById('qrImg')?.addEventListener('error', function () {
  // Generate simple placeholder QR
  const c = document.createElement('canvas');
  c.width = 160; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 160, 160);
  x.fillStyle = '#000';
  // Corner squares
  [[8,8],[112,8],[8,112]].forEach(([px,py]) => {
    x.fillRect(px,py,40,40); x.fillStyle='#fff'; x.fillRect(px+6,py+6,28,28);
    x.fillStyle='#000'; x.fillRect(px+12,py+12,16,16);
  });
  // Random dots
  for(let i=0;i<10;i++) for(let j=0;j<10;j++) {
    if(Math.random()>.5) x.fillRect(56+i*7,56+j*7,5,5);
  }
  this.src = c.toDataURL();
});

// ── TOAST ────────────────────────────────────────────────────
let _tt;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── TICKER LOOP ──────────────────────────────────────────────
// The .hero-pitch-line ticker already runs via CSS; JS extends it
(function duplicateTicker() {
  const line = document.querySelector('.hero-pitch-line');
  if (!line) return;
  const spans = [...line.querySelectorAll('span')];
  // Already has enough duplicates in HTML for seamless loop
})();

// ── SERVICE WORKER ───────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  refreshStats();
  // Trigger visible reveals in viewport
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  }, 100);
});

console.log('%c🏏 VPL Season 2 – 2026', 'color:#e8a020;font-family:serif;font-size:18px;font-weight:bold');
console.log('%cOrganized by Savaso Juth Limbach Samaj', 'color:#a09070;font-size:11px');
