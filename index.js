/* ==========================================================================
   MELWIN DAVE D. ABE — BENTO PORTFOLIO ENGINE
   Spotlight cards, live GitHub data, project grid, motion & forms
   ========================================================================== */

'use strict';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const GITHUB_USER = 'abemelwin';

/* --------------------------------------------------------------------------
   1. Toast Notification System
   -------------------------------------------------------------------------- */
function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* --------------------------------------------------------------------------
   2. Copy Email to Clipboard
   -------------------------------------------------------------------------- */
(function initCopyEmail() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-email-btn');
    if (!btn) return;

    e.preventDefault();
    const email = btn.dataset.email || 'abemelwin01@gmail.com';

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      showToast('Email copied to clipboard');
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      showToast(`Email: ${email}`);
    }
  });
})();

/* --------------------------------------------------------------------------
   3. Theme Toggle (Dark / Light)
   -------------------------------------------------------------------------- */
(function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const sync = () => {
    const light = document.documentElement.dataset.theme === 'light';
    btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = light ? '#f6f6f8' : '#08080a';
  };

  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('mda-theme', next); } catch (e) {}
    sync();
  });
  sync();
})();

/* --------------------------------------------------------------------------
   4. Nav: sliding pill, active section, mobile sheet
   -------------------------------------------------------------------------- */
(function initNav() {
  const links = [...document.querySelectorAll('.nav__link')];
  const pill = document.getElementById('nav-pill');
  let active = null;

  const movePill = (link) => {
    if (!pill) return;
    if (!link) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  links.forEach(link => {
    link.addEventListener('mouseenter', () => movePill(link));
  });
  document.querySelector('.nav__links')?.addEventListener('mouseleave', () => movePill(active));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      active = links.find(l => l.getAttribute('href') === `#${entry.target.id}`) || null;
      links.forEach(l => l.classList.toggle('is-active', l === active));
      movePill(active);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  ['work', 'skills', 'experience', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  const hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        active = null;
        links.forEach(l => l.classList.remove('is-active'));
        movePill(null);
      }
    }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
  }

  // Mobile sheet
  const toggle = document.getElementById('nav-toggle');
  const sheet = document.getElementById('sheet');
  if (!toggle || !sheet) return;

  const setOpen = (open) => {
    sheet.classList.toggle('is-open', open);
    sheet.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) sheet.querySelector('a')?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => setOpen(!sheet.classList.contains('is-open')));
  sheet.querySelectorAll('a, [data-sheet-close]').forEach(el => el.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
  });
})();

/* --------------------------------------------------------------------------
   5. Spotlight — cursor-following glow on card fills and borders
   -------------------------------------------------------------------------- */
(function initSpotlight() {
  if (!FINE_POINTER) return;

  const track = (container, cards) => {
    container.addEventListener('mousemove', (e) => {
      cards().forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    }, { passive: true });
  };

  document.querySelectorAll('.spotlight-group').forEach(group => {
    track(group, () => group.querySelectorAll(':scope > .card'));
  });
  document.querySelectorAll('.spotlight-solo').forEach(card => track(card, () => [card]));
})();

/* --------------------------------------------------------------------------
   6. Reveal on scroll + stat counters
   -------------------------------------------------------------------------- */
function countUp(el, target, duration = 1400) {
  if (REDUCED_MOTION) { el.textContent = target.toLocaleString(); return; }
  const from = parseInt(el.textContent.replace(/,/g, ''), 10) || 0;
  const start = performance.now();
  const frame = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

(function initReveals() {
  const els = document.querySelectorAll('.reveal');

  if (REDUCED_MOTION) {
    els.forEach(el => el.classList.add('is-in'));
    document.querySelectorAll('.count').forEach(el => countUp(el, parseInt(el.dataset.target, 10) || 0));
    return;
  }

  let batch = 0;
  let batchTimer = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Stagger elements that enter in the same frame
      el.style.setProperty('--d', `${Math.min(batch, 8) * 0.07}s`);
      batch++;
      clearTimeout(batchTimer);
      batchTimer = setTimeout(() => { batch = 0; }, 60);

      el.classList.add('is-in');
      el.querySelectorAll('.count').forEach(c => {
        setTimeout(() => countUp(c, parseInt(c.dataset.target, 10) || 0), 300);
        c.dataset.counted = '1';
      });
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  els.forEach(el => observer.observe(el));
})();

/* --------------------------------------------------------------------------
   7. Hero: rotating role, photo tilt, local clock
   -------------------------------------------------------------------------- */
(function initRotator() {
  const el = document.getElementById('rotator');
  if (!el || REDUCED_MOTION) return;

  const roles = ['Full-Stack Developer', 'Vue.js Specialist', 'Laravel Engineer', 'TypeScript Developer', 'Internal-Tools Builder'];
  let i = 0;

  setInterval(() => {
    el.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % roles.length;
      el.textContent = roles[i];
      el.classList.remove('is-out');
    }, 350);
  }, 2800);
})();

(function initTilt() {
  if (!FINE_POINTER || REDUCED_MOTION) return;

  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* --------------------------------------------------------------------------
   7b. Shared Three.js loader (hero morph + project carousel)
   -------------------------------------------------------------------------- */
let threePromise = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (!threePromise) {
    threePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('three missing')));
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return threePromise;
}

const HAS_WEBGL = (() => {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
})();

/* --------------------------------------------------------------------------
   7c. Hero: 3D particle morph
   Every shape says something about me; `label` is shown in the hint chip.
   `text` takes a short word or symbol ("\n" for a second line), `image` any
   same-origin picture (its colors are kept), `database` a 3D storage stack.
   -------------------------------------------------------------------------- */
const MORPH_SHAPES = [
  { label: 'My name', type: 'text', text: 'MELWIN' },
  { label: "That's me", type: 'image', src: './images/abe.jpg', crop: { x: 0.22, y: 0.1, w: 0.56, h: 0.64 } },
  { label: 'I write code', type: 'text', text: '</>' },
  { label: 'My core stack', type: 'text', text: 'VUE\nLARAVEL' },
  { label: 'Databases & APIs', type: 'database' },
  { label: 'Years shipping production', type: 'text', text: '3+ YRS' },
];

(function initMorph() {
  const card = document.getElementById('intro');
  const canvas = document.getElementById('morph');
  const hint = document.getElementById('morph-hint');
  const shapeLabel = document.getElementById('morph-shape');
  if (!card || !canvas || !MORPH_SHAPES.length || !HAS_WEBGL) return;

  loadThree().then((THREE) => {
    const fontReady = document.fonts ? document.fonts.load('800 200px Geist').catch(() => {}) : Promise.resolve();
    return fontReady.then(() => start(THREE));
  }).catch(() => {});

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function sampleText(text, n, out) {
    const lines = String(text).split('\n');
    const LINE = 240, W = 1400, H = LINE * lines.length + 80;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.font = "800 220px Geist, system-ui, sans-serif";
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    lines.forEach((line, i) => g.fillText(line, W / 2, 40 + LINE * (i + 0.5)));

    const data = g.getImageData(0, 0, W, H).data;
    const px = [];
    let minX = W, maxX = 0, minY = H, maxY = 0;
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (data[(y * W + x) * 4 + 3] < 128) continue;
        px.push(x, y);
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (!px.length) return;
    const scale = Math.min(7.2 / (maxX - minX || 1), (lines.length > 1 ? 4.6 : 3.6) / (maxY - minY || 1));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    for (let i = 0; i < n; i++) {
      const k = Math.floor(Math.random() * (px.length / 2)) * 2;
      out[i * 3] = (px[k] - cx) * scale;
      out[i * 3 + 1] = -(px[k + 1] - cy) * scale;
      out[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
  }

  // Portrait sampling: crop to head and shoulders, stretch the levels so a dark photo still reads,
  // then place more particles on bright areas and outlines (hair, ears, collar) than on the backdrop
  function sampleImage(img, n, crop) {
    const c0 = crop || { x: 0.22, y: 0.1, w: 0.56, h: 0.64 };
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const SW = 240, SH = Math.max(1, Math.round(SW * (c0.h * ih) / (c0.w * iw)));
    const c = document.createElement('canvas');
    c.width = SW; c.height = SH;
    const g = c.getContext('2d');
    g.drawImage(img, c0.x * iw, c0.y * ih, c0.w * iw, c0.h * ih, 0, 0, SW, SH);
    let data;
    try { data = g.getImageData(0, 0, SW, SH).data; } catch (e) { return null; } // tainted (e.g. opened via file://)

    const total = SW * SH;
    const lum = new Float32Array(total);
    const hist = new Uint32Array(256);
    for (let i = 0; i < total; i++) {
      const o = i * 4;
      lum[i] = (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]) / 255;
      hist[Math.min(255, Math.floor(lum[i] * 255))]++;
    }
    const pct = (q) => { let acc = 0; for (let b = 0; b < 256; b++) { acc += hist[b]; if (acc >= q * total) return b / 255; } return 1; };
    const lo = pct(0.02), hi = Math.max(lo + 0.05, pct(0.995));
    const stretch = (v) => Math.min(1, Math.max(0, (v - lo) / (hi - lo)));

    const s = lum.map(stretch);
    const edge = new Float32Array(total);
    for (let y = 1; y < SH - 1; y++) {
      for (let x = 1; x < SW - 1; x++) {
        const i = y * SW + x;
        const gx = s[i - SW + 1] + 2 * s[i + 1] + s[i + SW + 1] - s[i - SW - 1] - 2 * s[i - 1] - s[i + SW - 1];
        const gy = s[i + SW - 1] + 2 * s[i + SW] + s[i + SW + 1] - s[i - SW - 1] - 2 * s[i - SW] - s[i - SW + 1];
        edge[i] = Math.min(1, Math.hypot(gx, gy) * 2.5);
      }
    }

    const cdf = new Float32Array(total);
    let sum = 0;
    for (let i = 0; i < total; i++) { sum += 0.04 + Math.pow(s[i], 1.1) + 0.4 * edge[i]; cdf[i] = sum; }

    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const cell = 6.2 / SH;
    for (let k = 0; k < n; k++) {
      const r = Math.random() * sum;
      let a = 0, b = total - 1;
      while (a < b) { const m = (a + b) >> 1; if (cdf[m] < r) a = m + 1; else b = m; }
      const x = a % SW, y = Math.floor(a / SW), o = a * 4;
      pos[k * 3] = (x - SW / 2 + Math.random() - 0.5) * cell;
      pos[k * 3 + 1] = (SH / 2 - y + Math.random() - 0.5) * cell;
      pos[k * 3 + 2] = (s[a] - 0.5) * 0.9;
      for (let ch = 0; ch < 3; ch++) col[k * 3 + ch] = Math.max(0.14, Math.pow(stretch(data[o + ch] / 255), 0.8));
    }
    return { pos, col };
  }

  function buildShape(THREE, shape, n) {
    const out = new Float32Array(n * 3);
    if (shape.type === 'text') {
      sampleText(shape.text, n, out);
    } else if (shape.type === 'database') {
      // Three stacked disks — walls, rims, and a filled lid on top
      const R = 1.8, h = 1.05, gap = 1.45;
      for (let i = 0; i < n; i++) {
        const d = Math.floor(Math.random() * 3), cy = (d - 1) * gap;
        const th = Math.random() * Math.PI * 2;
        let r = R, y;
        if (Math.random() < 0.68) {
          y = cy + (Math.random() - 0.5) * h;
        } else {
          y = cy + h / 2;
          r = d === 2 ? R * Math.sqrt(Math.random()) : R * (0.96 + Math.random() * 0.04);
        }
        out[i * 3] = Math.cos(th) * r;
        out[i * 3 + 1] = y;
        out[i * 3 + 2] = Math.sin(th) * r;
      }
    } else {
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const th = i * 2.399963;
        out[i * 3] = Math.cos(th) * r * 2.5;
        out[i * 3 + 1] = y * 2.5;
        out[i * 3 + 2] = Math.sin(th) * r * 2.5;
      }
    }
    return out;
  }

  async function start(THREE) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const TAU = Math.PI * 2;
    const N = window.innerWidth < 760 ? 7000 : 16000;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 10;

    // Pictures that fail to load or can't be read are skipped
    const images = await Promise.all(MORPH_SHAPES.map(s => (s.type === 'image' ? loadImage(s.src) : null)));
    const shapes = [], targets = [], shapeColors = [];
    MORPH_SHAPES.forEach((s, k) => {
      if (s.type === 'image') {
        const sampled = images[k] && sampleImage(images[k], N, s.crop);
        if (!sampled) return;
        shapes.push(s); targets.push(sampled.pos); shapeColors.push(sampled.col);
      } else {
        shapes.push(s); targets.push(buildShape(THREE, s, N)); shapeColors.push(null);
      }
    });
    if (!shapes.length) return;
    const isFlat = (k) => shapes[k].type === 'text' || shapes[k].type === 'image';

    const firstFlat = shapes.findIndex((s, k) => isFlat(k));
    let cur = REDUCED_MOTION && firstFlat >= 0 ? firstFlat : 0;
    let to = targets[cur];
    const pos = new Float32Array(to);
    const from = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const fromCol = new Float32Array(N * 3);
    const gradCol = new Float32Array(N * 3);
    let toCol = gradCol;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const dot = document.createElement('canvas');
    dot.width = dot.height = 64;
    const dg = dot.getContext('2d');
    const grad = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    dg.fillStyle = grad;
    dg.fillRect(0, 0, 64, 64);

    const mat = new THREE.PointsMaterial({
      size: 0.04, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let needsFrame = true, p = 1;

    // Photo colors are dimmed on dark so additive blending doesn't blow them out
    let colorCache = [];
    function colorsFor(k) {
      if (!shapeColors[k]) return gradCol;
      if (!colorCache[k]) {
        const gain = document.documentElement.dataset.theme === 'light' ? 1 : 0.9;
        colorCache[k] = shapeColors[k].map(v => v * gain);
      }
      return colorCache[k];
    }

    // Same gradient stops as --grad in each theme
    function applyTheme() {
      const light = document.documentElement.dataset.theme === 'light';
      const [a, b, c] = (light ? ['#4f6bff', '#8a5cff', '#e0559b'] : ['#7c9cff', '#b18cff', '#ff8fc7']).map(h => new THREE.Color(h));
      const tmp = new THREE.Color();
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        if (t < 0.5) tmp.copy(a).lerp(b, t * 2); else tmp.copy(b).lerp(c, (t - 0.5) * 2);
        gradCol[i * 3] = tmp.r; gradCol[i * 3 + 1] = tmp.g; gradCol[i * 3 + 2] = tmp.b;
      }
      colorCache = [];
      toCol = colorsFor(cur);
      if (p >= 1) { col.set(toCol); geo.attributes.color.needsUpdate = true; }
      mat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      mat.opacity = light ? 0.8 : 0.95;
      mat.needsUpdate = true;
      needsFrame = true;
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Particles sit right of the copy on wide cards, above it on narrow ones
    let fit = 1;
    function resize() {
      const w = Math.max(1, card.clientWidth), h = Math.max(1, card.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const vw = vh * camera.aspect;
      if (camera.aspect >= 1.25) {
        fit = Math.min((vw * 0.36) / 7.4, (vh * 0.8) / 5.4, 1.3);
        points.position.set(vw * 0.28, 0, 0);
      } else {
        fit = Math.min((vw * 0.9) / 7.4, (vh * 0.34) / 5.4, 1.3);
        points.position.set(0, vh * 0.28, 0);
      }
      points.scale.setScalar(fit);
      needsFrame = true;
    }
    resize();
    new ResizeObserver(resize).observe(card);

    let timer = 0;
    function next() {
      from.set(pos);
      fromCol.set(col);
      cur = (cur + 1) % targets.length;
      to = targets[cur];
      toCol = colorsFor(cur);
      timer = 0;
      if (REDUCED_MOTION) {
        pos.set(to); col.set(toCol);
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
        p = 1;
      } else p = 0;
      shapeLabel.textContent = shapes[cur].label;
      needsFrame = true;
    }

    const pointer = { x: 0, y: 0, dx: 0, down: false };
    let lastX = 0, startX = 0, startY = 0;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      if (pointer.down) { pointer.dx += e.clientX - lastX; lastX = e.clientX; }
    }, { passive: true });
    card.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
    card.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('a, button, input, textarea')) return;
      pointer.down = true;
      lastX = startX = e.clientX;
      startY = e.clientY;
    });
    window.addEventListener('pointerup', (e) => {
      if (!pointer.down) return;
      pointer.down = false;
      const moved = Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY);
      if (moved < 6 && !String(window.getSelection())) next();
    });
    window.addEventListener('pointercancel', () => { pointer.down = false; });
    hint.addEventListener('click', next);

    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(card);

    let rotY = 0, vel = 0, t = 0, last = performance.now();
    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;

      if (REDUCED_MOTION) {
        if (needsFrame) { renderer.render(scene, camera); needsFrame = false; }
        return;
      }

      t += dt;
      if (!pointer.down) timer += dt;
      if (timer > (shapes[cur].type === 'image' ? 8 : 6)) next();

      if (p < 1) {
        p = Math.min(1, p + dt / 1.7);
        const e = ease(p), swirl = Math.sin(p * Math.PI) * 0.18;
        for (let k = 0; k < N * 3; k += 3) {
          pos[k] = from[k] + (to[k] - from[k]) * e + Math.sin(k * 1.3 + t) * swirl;
          pos[k + 1] = from[k + 1] + (to[k + 1] - from[k + 1]) * e + Math.cos(k * 0.7 + t) * swirl;
          pos[k + 2] = from[k + 2] + (to[k + 2] - from[k + 2]) * e;
          col[k] = fromCol[k] + (toCol[k] - fromCol[k]) * e;
          col[k + 1] = fromCol[k + 1] + (toCol[k + 1] - fromCol[k + 1]) * e;
          col[k + 2] = fromCol[k + 2] + (toCol[k + 2] - fromCol[k + 2]) * e;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
      }

      vel = (vel + pointer.dx * 0.0006) * 0.94;
      pointer.dx = 0;
      // Words and pictures ease back to face the viewer so they stay readable
      if (isFlat(cur)) {
        rotY += (Math.round(rotY / TAU) * TAU + pointer.x * 0.35 - rotY) * Math.min(1, dt * 3) + vel;
      } else {
        rotY += dt * 0.3 + vel;
      }
      points.rotation.y = rotY;
      points.rotation.x += (pointer.y * 0.3 - points.rotation.x) * Math.min(1, dt * 2);
      points.scale.setScalar(fit * (1 + Math.sin(t * 1.4) * 0.015));

      renderer.render(scene, camera);
    }

    shapeLabel.textContent = shapes[cur].label;
    hint.hidden = false;
    card.classList.add('has-morph');
    canvas.classList.add('is-ready');
    requestAnimationFrame(frame);
  }
})();

/* --------------------------------------------------------------------------
   7d. Core stack: 3D orbit — tech labels circling a crystal core
   -------------------------------------------------------------------------- */
const ORBIT_RINGS = [
  { radius: 2.3, tilt: [1.25, 0, 0.3], speed: 0.35, color: '#7c9cff', items: ['Vue', 'TypeScript', 'Nuxt'] },
  { radius: 3.1, tilt: [1.7, 0.5, -0.4], speed: -0.24, color: '#b18cff', items: ['Laravel', 'PHP', 'Node.js', 'Express'] },
  { radius: 3.9, tilt: [1.05, -0.6, 0.8], speed: 0.16, color: '#ffb547', items: ['PostgreSQL', 'Supabase', 'AWS', 'Docker', 'MySQL'] },
];

(function initStackOrbit() {
  const card = document.getElementById('stack-orbit');
  const canvas = document.getElementById('orbit3d');
  if (!card || !canvas || !HAS_WEBGL) return;

  loadThree().then((THREE) => {
    const fonts = document.fonts ? document.fonts.load('600 32px "Geist Mono"').catch(() => {}) : Promise.resolve();
    return fonts.then(() => start(THREE));
  }).catch(() => {});

  function start(THREE) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const TAU = Math.PI * 2;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 8.8;

    scene.add(new THREE.AmbientLight(0x404070, 0.8));
    const keyLight = new THREE.PointLight(0x7c9cff, 2.2, 30);
    keyLight.position.set(4, 3, 6);
    const rimLight = new THREE.PointLight(0xff8fc7, 1.6, 30);
    rimLight.position.set(-5, -2, 3);
    scene.add(keyLight, rimLight);

    const world = new THREE.Group();
    world.position.y = -0.3;
    scene.add(world);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 0),
      new THREE.MeshPhongMaterial({ color: 0x3a4fd8, emissive: 0x0d1450, shininess: 100, flatShading: true })
    );
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 1),
      new THREE.MeshBasicMaterial({ color: 0x7be0ff, wireframe: true, transparent: true, opacity: 0.35 })
    );

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const gg = glowCanvas.getContext('2d');
    const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(110,150,255,0.55)');
    gr.addColorStop(1, 'rgba(110,150,255,0)');
    gg.fillStyle = gr;
    gg.fillRect(0, 0, 128, 128);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), depthWrite: false }));
    glow.scale.set(6.5, 6.5, 1);
    world.add(glow, core, wire);

    function labelTexture(text, color, light) {
      const c = document.createElement('canvas');
      c.width = 320; c.height = 80;
      const g = c.getContext('2d');
      g.beginPath();
      g.moveTo(40, 4); g.arcTo(316, 4, 316, 76, 36); g.arcTo(316, 76, 4, 76, 36);
      g.arcTo(4, 76, 4, 4, 36); g.arcTo(4, 4, 316, 4, 36); g.closePath();
      g.fillStyle = light ? 'rgba(255,255,255,0.92)' : 'rgba(10,12,28,0.85)';
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = color;
      g.stroke();
      g.fillStyle = light ? '#111114' : '#eef1ff';
      g.font = '600 32px "Geist Mono", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(text, 160, 42);
      return new THREE.CanvasTexture(c);
    }

    const rings = ORBIT_RINGS.map((cfg) => {
      const group = new THREE.Group();
      group.rotation.set(cfg.tilt[0], cfg.tilt[1], cfg.tilt[2]);
      const line = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.radius, 0.012, 6, 200),
        new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.45 })
      );
      group.add(line);
      const sprites = cfg.items.map((item, k) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
        s.scale.set(2.5, 0.625, 1);
        s.userData = { a: (k / cfg.items.length) * TAU, text: item };
        group.add(s);
        return s;
      });
      world.add(group);
      return { cfg, sprites };
    });

    let needsFrame = true;
    function applyTheme() {
      const light = document.documentElement.dataset.theme === 'light';
      rings.forEach(({ cfg, sprites }) => sprites.forEach((s) => {
        if (s.material.map) s.material.map.dispose();
        s.material.map = labelTexture(s.userData.text, cfg.color, light);
        s.material.needsUpdate = true;
      }));
      glow.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      glow.material.opacity = light ? 0.5 : 1;
      glow.material.needsUpdate = true;
      needsFrame = true;
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Pull the camera back on narrow cards so the outer ring stays inside
    function resize() {
      const w = Math.max(1, card.clientWidth), h = Math.max(1, card.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = camera.aspect < 1.2 ? 8.8 / Math.max(0.6, camera.aspect / 1.2) : 8.8;
      camera.updateProjectionMatrix();
      needsFrame = true;
    }
    resize();
    new ResizeObserver(resize).observe(card);

    const pointer = { y: 0, dx: 0, down: false };
    let lastX = 0, startX = 0, pulse = 0;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      if (pointer.down) { pointer.dx += e.clientX - lastX; lastX = e.clientX; }
    }, { passive: true });
    card.addEventListener('pointerleave', () => { pointer.y = 0; });
    card.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pointer.down = true;
      lastX = startX = e.clientX;
    });
    window.addEventListener('pointerup', (e) => {
      if (!pointer.down) return;
      pointer.down = false;
      if (Math.abs(e.clientX - startX) < 6) pulse = 1;
    });
    window.addEventListener('pointercancel', () => { pointer.down = false; });

    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(card);

    let vel = 0, t = 0, last = performance.now();
    function place() {
      rings.forEach(({ cfg, sprites }) => sprites.forEach((s) => {
        s.position.set(Math.cos(s.userData.a) * cfg.radius, Math.sin(s.userData.a) * cfg.radius, 0);
      }));
    }
    place();

    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      if (REDUCED_MOTION) {
        if (needsFrame) { renderer.render(scene, camera); needsFrame = false; }
        return;
      }

      t += dt;
      rings.forEach(({ cfg, sprites }) => sprites.forEach((s) => { s.userData.a += cfg.speed * dt; }));
      place();

      vel = (vel + pointer.dx * 0.0008) * 0.93;
      pointer.dx = 0;
      world.rotation.y += dt * 0.12 + vel;
      world.rotation.x += (pointer.y * 0.35 - world.rotation.x) * Math.min(1, dt * 2);

      core.rotation.x += dt * 0.4;
      core.rotation.y += dt * 0.6;
      wire.rotation.y -= dt * 0.2;
      wire.rotation.z += dt * 0.1;
      pulse = Math.max(0, pulse - dt * 1.6);
      const s = 1 + Math.sin(pulse * Math.PI) * 0.35 + Math.sin(t * 2) * 0.03;
      core.scale.set(s, s, s);

      renderer.render(scene, camera);
    }

    card.classList.add('has-3d');
    requestAnimationFrame(frame);
  }
})();

/* --------------------------------------------------------------------------
   7e. Based in: dotted 3D globe that settles on Batangas, PH
   Land shapes come from land-mask.js, loaded only when the globe starts.
   -------------------------------------------------------------------------- */
const GLOBE_HOME = { lat: 13.76, lon: 121.06 }; // Batangas
const GLOBE_CITIES = [
  { lat: 1.35, lon: 103.82 },   // Singapore
  { lat: 35.68, lon: 139.69 },  // Tokyo
  { lat: -33.87, lon: 151.21 }, // Sydney
  { lat: 25.2, lon: 55.27 },    // Dubai
  { lat: 51.5, lon: -0.12 },    // London
  { lat: 37.77, lon: -122.42 }, // San Francisco
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

(function initGlobe() {
  const card = document.getElementById('based-in');
  const canvas = document.getElementById('globe3d');
  if (!card || !canvas || !HAS_WEBGL) return;

  Promise.all([loadThree(), window.LAND_MASK ? null : loadScript('./land-mask.js?v=1')])
    .then(([THREE]) => { if (window.LAND_MASK) start(THREE, window.LAND_MASK); })
    .catch(() => {});

  function start(THREE, maskInfo) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const raw = atob(maskInfo.data);
    const mask = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) mask[i] = raw.charCodeAt(i);
    const { res, width: MW, height: MH } = maskInfo;
    const isLand = (lat, lon) => {
      const r = Math.min(MH - 1, Math.max(0, Math.floor((90 - lat) / res)));
      const c = ((Math.floor((lon + 180) / res) % MW) + MW) % MW;
      const k = r * MW + c;
      return (mask[k >> 3] >> (k & 7)) & 1;
    };
    const inPH = (lat, lon) => lat > 4.5 && lat < 21.5 && lon > 116 && lon < 127;

    const R = 2;
    const toVec = (lat, lon, r) => {
      const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
      return new THREE.Vector3(-Math.sin(phi) * Math.cos(th) * r, Math.cos(phi) * r, Math.sin(phi) * Math.sin(th) * r);
    };

    // Land dots on a Fibonacci sphere; the Philippines gets its own denser grid
    const land = [], ph = [];
    const N = window.innerWidth < 760 ? 14000 : 22000, GA = Math.PI * (3 - Math.sqrt(5));
    for (let n = 0; n < N; n++) {
      const y = 1 - (n / (N - 1)) * 2;
      const lat = (Math.asin(y) * 180) / Math.PI, lon = (((n * GA * 180) / Math.PI) % 360) - 180;
      if (isLand(lat, lon) && !inPH(lat, lon)) land.push(lat, lon);
    }
    for (let la = 4.6; la < 21.4; la += 0.32) {
      for (let lo = 116.1; lo < 126.9; lo += 0.32) {
        if (isLand(la, lo)) ph.push(la + (Math.random() - 0.5) * 0.22, lo + (Math.random() - 0.5) * 0.22);
      }
    }
    const pointsGeo = (list, r) => {
      const arr = new Float32Array((list.length / 2) * 3);
      for (let i = 0; i < list.length; i += 2) {
        const v = toVec(list[i], list[i + 1], r);
        arr.set([v.x, v.y, v.z], (i / 2) * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      return g;
    };

    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = dotCanvas.height = 32;
    const dc = dotCanvas.getContext('2d');
    dc.beginPath(); dc.arc(16, 16, 14, 0, Math.PI * 2); dc.fillStyle = '#fff'; dc.fill();
    const dot = new THREE.CanvasTexture(dotCanvas);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const gc = glowCanvas.getContext('2d');
    const gg = gc.createRadialGradient(64, 64, 30, 64, 64, 64);
    gg.addColorStop(0, 'rgba(255,255,255,0.5)');
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    gc.fillStyle = gg; gc.fillRect(0, 0, 128, 128);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    const globe = new THREE.Group();
    scene.add(globe);

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), depthWrite: false, transparent: true }));
    halo.scale.set(R * 2.9, R * 2.9, 1);
    scene.add(halo);
    const occluder = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48), new THREE.MeshBasicMaterial());
    globe.add(occluder);

    const landMat = new THREE.PointsMaterial({ size: 0.05, map: dot, transparent: true, alphaTest: 0.4 });
    globe.add(new THREE.Points(pointsGeo(land, R), landMat));
    const phMat = new THREE.PointsMaterial({ size: 0.062, map: dot, transparent: true, alphaTest: 0.4 });
    globe.add(new THREE.Points(pointsGeo(ph, R * 1.002), phMat));

    // Home pin with pulsing rings lying flat on the surface
    const home = toVec(GLOBE_HOME.lat, GLOBE_HOME.lon, R * 1.01);
    const pinMat = new THREE.MeshBasicMaterial();
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), pinMat);
    pin.position.copy(home);
    globe.add(pin);
    const rings = [0, 0.5].map((offset) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 40), new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      m.position.copy(home);
      m.lookAt(home.clone().multiplyScalar(2));
      m.userData.offset = offset;
      globe.add(m);
      return m;
    });

    // Arcs to cities, drawn as travelling segments
    const arcMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.85 });
    const endMat = new THREE.MeshBasicMaterial();
    const arcs = GLOBE_CITIES.map((c, k) => {
      const a = toVec(GLOBE_HOME.lat, GLOBE_HOME.lon, R), b = toVec(c.lat, c.lon, R);
      const mid = a.clone().add(b).normalize().multiplyScalar(R + a.distanceTo(b) * 0.38);
      const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(80);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat);
      const end = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), endMat);
      end.position.copy(toVec(c.lat, c.lon, R * 1.005));
      line.userData = { offset: k / GLOBE_CITIES.length, count: pts.length, end };
      globe.add(line, end);
      return line;
    });

    function applyTheme() {
      const cs = getComputedStyle(document.documentElement);
      const v = (name) => cs.getPropertyValue(name).trim();
      const light = document.documentElement.dataset.theme === 'light';
      occluder.material.color.set(v('--card'));
      landMat.color.set(light ? '#8a8a96' : '#8d91a6');
      phMat.color.set(v('--accent'));
      pinMat.color.set(v('--accent'));
      rings.forEach(r => r.material.color.set(v('--accent')));
      arcMat.color.set(v('--accent-2'));
      endMat.color.set(v('--accent-2'));
      halo.material.color.set(v('--accent'));
      halo.material.opacity = light ? 0.35 : 0.5;
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Rotation that faces Batangas toward the camera
    const hv = toVec(GLOBE_HOME.lat, GLOBE_HOME.lon, 1);
    const homeY = Math.atan2(-hv.x, hv.z), homeX = ((GLOBE_HOME.lat * Math.PI) / 180) * 0.85;
    let rotY = REDUCED_MOTION ? homeY : homeY - 1.4, vel = 0, idle = 99;

    // Fit the globe between the label and the clock, nudged right on wide cards
    function resize() {
      const w = Math.max(1, card.clientWidth), h = Math.max(1, card.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      let dist = (R * 2.35) / 0.62 / 2 / Math.tan((camera.fov * Math.PI) / 360);
      if (camera.aspect < 1) dist /= camera.aspect;
      camera.position.set(0, 0, dist);
      const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
      globe.position.set(camera.aspect > 1.4 ? vh * camera.aspect * 0.18 : 0, vh * 0.04, 0);
      halo.position.copy(globe.position).add(new THREE.Vector3(0, 0, -R));
      camera.updateProjectionMatrix();
    }
    resize();
    new ResizeObserver(resize).observe(card);

    let down = false, lastX = 0;
    card.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      down = true; lastX = e.clientX; idle = 0;
    });
    card.addEventListener('pointermove', (e) => {
      if (!down) return;
      vel = (e.clientX - lastX) * 0.006;
      rotY += vel;
      lastX = e.clientX;
    }, { passive: true });
    window.addEventListener('pointerup', () => { down = false; });
    window.addEventListener('pointercancel', () => { down = false; });

    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(card);

    let t = 0, last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      if (!REDUCED_MOTION) t += dt;

      if (!down) {
        idle += dt;
        if (Math.abs(vel) > 0.0005) { rotY += vel; vel *= 0.93; }
        else if (idle > 1.5) {
          // Ease home the short way round, then sway gently
          const target = homeY + (REDUCED_MOTION ? 0 : Math.sin(t * 0.35) * 0.22);
          rotY += Math.atan2(Math.sin(target - rotY), Math.cos(target - rotY)) * Math.min(1, dt * 2);
        }
      }
      globe.rotation.set(homeX, rotY, 0);

      rings.forEach((r) => {
        const p = (t * 0.7 + r.userData.offset) % 1;
        r.scale.setScalar(1 + p * 3.2);
        r.material.opacity = (1 - p) * 0.9;
      });
      arcs.forEach((l) => {
        const { offset, count, end } = l.userData;
        if (REDUCED_MOTION) { l.geometry.setDrawRange(0, count); return; }
        const p = (t * 0.28 + offset) % 1;
        const head = Math.floor(Math.min(1, p * 1.6) * count), tail = Math.floor(Math.max(0, p * 1.6 - 0.45) * count);
        l.geometry.setDrawRange(tail, Math.max(0, head - tail));
        end.scale.setScalar(p > 0.6 && p < 0.9 ? 1.6 : 1);
      });

      renderer.render(scene, camera);
    }

    card.classList.add('has-3d');
    requestAnimationFrame(frame);
  }
})();

(function initClock() {
  const el = document.getElementById('ph-clock');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 1000);
})();

/* --------------------------------------------------------------------------
   8. Magnetic Buttons
   -------------------------------------------------------------------------- */
(function initMagnetic() {
  if (!FINE_POINTER || REDUCED_MOTION) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* --------------------------------------------------------------------------
   9. GitHub Contribution Graph (last 12 months)
   -------------------------------------------------------------------------- */
(async function initContributions() {
  const grid = document.getElementById('contrib-grid');
  const total = document.getElementById('contrib-total');
  if (!grid) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const days = data.contributions || [];
    if (!days.length) throw new Error('No contribution data');

    // Pad the first week so rows line up with weekdays (Sun = row 0)
    const offset = new Date(days[0].date).getDay();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push('<i style="visibility:hidden;--w:0"></i>');
    days.forEach((d, idx) => {
      const week = Math.floor((idx + offset) / 7);
      cells.push(`<i data-l="${d.level}" style="--w:${week}" title="${d.count} contribution${d.count === 1 ? '' : 's'} · ${d.date}"></i>`);
    });

    const render = () => { grid.innerHTML = cells.join(''); };

    // Animate in when the card scrolls into view
    new IntersectionObserver(([entry], obs) => {
      if (entry.isIntersecting) { render(); obs.disconnect(); }
    }, { threshold: 0.2 }).observe(grid);

    const sum = data.total ? Object.values(data.total).reduce((a, b) => a + b, 0) : days.reduce((a, d) => a + d.count, 0);
    if (total) total.innerHTML = `<strong style="color:var(--fg)">${sum.toLocaleString()}</strong> contributions in the last year`;
  } catch (err) {
    console.warn('Contribution graph unavailable:', err);
    grid.parentElement.innerHTML = `<a class="contrib__fallback link-arrow" href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener noreferrer">View my activity on GitHub ↗</a>`;
    if (total) total.textContent = 'Live activity from github.com/' + GITHUB_USER;
  }
})();

/* --------------------------------------------------------------------------
   10. Featured dashboard — animate charts & KPIs when visible
   -------------------------------------------------------------------------- */
(function initDashboard() {
  const dash = document.getElementById('dash');
  if (!dash) return;

  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    dash.classList.add('is-live');
    dash.querySelectorAll('[data-to]').forEach(el => countUp(el, parseInt(el.dataset.to, 10), 1800));
    obs.disconnect();
  }, { threshold: 0.35 }).observe(dash);
})();

/* --------------------------------------------------------------------------
   11. Timeline progress line
   -------------------------------------------------------------------------- */
(function initTimeline() {
  const timeline = document.getElementById('timeline');
  const fill = document.getElementById('timeline-fill');
  if (!timeline || !fill) return;

  if (REDUCED_MOTION) { fill.style.transform = 'scaleY(1)'; return; }

  let ticking = false;
  const update = () => {
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
    fill.style.transform = `scaleY(${p})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* --------------------------------------------------------------------------
   12a. PRIVATE / MANUAL SHOWCASE PROJECTS
   -------------------------------------------------------------------------- */
/*
   Keep `private: true` for projects that should require approval/access before
   viewing details. This keeps the flow intentional for clients and recruiters
   who want to request access directly.
*/
const PRIVATE_SHOWCASE_PROJECTS = [
  {
    name: 'esprint-portal',
    description: 'ES Print Media Operations Portal — a full-stack enterprise platform consolidating check monitoring, machine inventory, sales quotation workflows, and field service dispatch into one secure business operations hub.',
    language: 'TypeScript',
    topics: ['typescript', 'nextjs', 'enterprise-portal', 'rbac', 'aws', 'postgresql', 'tailwindcss', 'erp', 'operations-dashboard'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/abemelwin/esprint-portal',
    private: true,
    featured: true,
    updated_at: '2026-09-10'
  },
  {
    name: 'esprint-check-monitoring',
    description: 'Internal check monitoring system for ES Print Media Inc. — tracks post-dated checks, hold requests, returns, deposits, partial payments, and collections across multiple branches and subsidiaries.',
    language: 'TypeScript',
    topics: ['typescript', 'nextjs', 'internal-tool', 'tailwindcss', 'vercel', 'supabase', 'check-monitoring'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/abemelwin/esprint-check-monitoring',
    private: true,
    updated_at: '2026-08-28'
  },
  {
    name: 'spmt',
    description: 'Staff Performance System Management Tracker (SPMT) — A web-based HR management system for tracking employee performance, memorandums, training modules, announcements, reports, and staffing. Built with Next.js, Supabase, and Tailwind CSS.',
    language: 'TypeScript',
    topics: ['react', 'typescript', 'nextjs', 'tailwindcss', 'performance-management', 'hr-management', 'supabase'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/abemelwin/spmt',
    private: true,
    updated_at: '2026-08-28'
  },
  {
    name: 'sales-portal',
    description: 'Web-based sales workspace for ESP Print Media, Inc. for creating customer quotes, managing the machine catalog, calculating payments, accessing product references, and preparing closing documents.',
    language: 'TypeScript',
    topics: ['typescript', 'nextjs', 'supabase', 'sales-portal', 'tailwindcss', 'sales-tool'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/abemelwin/sales-portal',
    private: true,
    updated_at: '2026-08-28'
  },
  {
    name: 'Esprint-Service-Monitoring',
    description: 'Monitoring system for tracking service requests for ES Print Service',
    language: 'TypeScript',
    topics: ['typescript', 'nextjs', 'service-monitoring', 'internal-tool'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/abemelwin/Esprint-Service-Monitoring',
    private: true,
    updated_at: '2026-07-08'
  },
  {
    name: 'scoreboard-app',
    description: 'A modern desktop application for managing basketball scoreboards, games, and team statistics. Built with Electron, React, and TypeScript.',
    language: 'TypeScript',
    topics: ['typescript', 'electron', 'react', 'basketball', 'desktop-app'],
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/abemelwin/scoreboard-app',
    private: true,
    updated_at: '2026-07-17'
  }
];

/* --------------------------------------------------------------------------
   12b. Curated Fallback Projects (When GitHub offline or rate limited)
   -------------------------------------------------------------------------- */
const FALLBACK_PROJECTS = [
  {
    name: 'Print Media & Production Management ERP',
    description: 'Enterprise resource planning and production workflow system featuring job order tracking, automated invoicing, and role-based access control.',
    language: 'Vue.js',
    topics: ['vue', 'php', 'laravel', 'mysql', 'fullstack', 'rest-api'],
    stargazers_count: 5,
    forks_count: 2,
    html_url: 'https://github.com/abemelwin',
    private: false,
    updated_at: '2026-02-15'
  },
  {
    name: 'Vue Commerce & Order Management SPA',
    description: 'High-performance e-commerce single-page application with reactive cart state, dynamic catalog filtering, and secure payment checkout integration.',
    language: 'TypeScript',
    topics: ['vue', 'typescript', 'tailwind', 'pinia', 'frontend'],
    stargazers_count: 4,
    forks_count: 1,
    html_url: 'https://github.com/abemelwin',
    private: false,
    updated_at: '2026-01-20'
  },
  {
    name: 'Laravel RESTful Microservices API',
    description: 'Scalable backend API engine with JWT token authentication, rate limiting, automated queue processing, and comprehensive Swagger documentation.',
    language: 'PHP',
    topics: ['php', 'laravel', 'rest-api', 'backend', 'jwt', 'docker'],
    stargazers_count: 3,
    forks_count: 1,
    html_url: 'https://github.com/abemelwin',
    private: false,
    updated_at: '2025-12-10'
  },
  {
    name: 'Real-Time Inventory & Dispatch Tracker',
    description: 'Interactive dashboard for real-time inventory management, automated low-stock SMS notifications (Twilio), and multi-warehouse synchronization.',
    language: 'JavaScript',
    topics: ['nodejs', 'express', 'mongodb', 'twilio', 'fullstack'],
    stargazers_count: 3,
    forks_count: 0,
    html_url: 'https://github.com/abemelwin',
    private: false,
    updated_at: '2025-11-28'
  }
];

/* --------------------------------------------------------------------------
   13. Project Grid — GitHub fetch, filters, search, show more
   -------------------------------------------------------------------------- */
const LANG_COLORS = {
  typescript: '#3178c6',
  javascript: '#d4b830',
  vue: '#41b883',
  'vue.js': '#41b883',
  php: '#7a86b8',
  html: '#e34c26',
  css: '#663399',
  'c#': '#178600',
  python: '#3572a5',
  go: '#00add8'
};

const PAGE_SIZE = 9;

(async function initProjectsEngine() {
  const workSection = document.querySelector('#work[data-github-username]');
  if (!workSection) return;

  const username = workSection.dataset.githubUsername || GITHUB_USER;
  const grid = document.getElementById('github-projects');
  const loadingEl = document.getElementById('github-loading');
  const countEl = document.getElementById('project-count');
  const searchInput = document.getElementById('project-search-input');
  const filterBtns = [...document.querySelectorAll('.filter-btn')];
  const thumb = document.getElementById('filter-thumb');
  const moreBtn = document.getElementById('show-more');
  const statProjects = document.getElementById('stat-projects');

  let activeFilter = 'all';
  let activeSearchQuery = '';
  let expanded = false;

  const SKIP_REPOS = new Set([username.toLowerCase(), '.github', 'portfolio']);

  let repos = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        repos = data.filter(r => !SKIP_REPOS.has(r.name.toLowerCase()) && !r.fork);
      }
    }
  } catch (err) {
    console.warn('GitHub fetch failed, using curated portfolio projects:', err);
  }

  if (loadingEl) loadingEl.classList.add('github-loading--hidden');

  if (repos.length === 0) repos = FALLBACK_PROJECTS;

  // Palaging isama ang mga private/manual showcase projects (hindi galing sa
  // GitHub API dahil hindi talaga makikita ng public request ang private repos)
  const allProjects = [...PRIVATE_SHOWCASE_PROJECTS, ...repos];

  // Hero stat reflects the real total
  if (statProjects) {
    statProjects.dataset.target = String(allProjects.length);
    if (statProjects.dataset.counted) countUp(statProjects, allProjects.length);
  }

  // The featured project already has its own showcase card above the grid
  const gridProjects = allProjects.filter(p => !p.featured);

  function getCategory(repo) {
    const topics = (repo.topics || []).map(t => t.toLowerCase());
    const lang = (repo.language || '').toLowerCase();

    if (topics.some(t => ['android', 'ios', 'mobile', 'react-native', 'flutter', 'electron', 'desktop-app'].includes(t))) return 'mobile';
    if (topics.some(t => ['fullstack', 'full-stack', 'laravel', 'erp', 'supabase', 'hr-management', 'check-monitoring', 'sales-portal', 'internal-tool'].includes(t)) || (lang === 'php' && topics.includes('vue'))) return 'fullstack';
    if (['vue', 'vue.js', 'typescript', 'javascript', 'react', 'html', 'css'].includes(lang) && !topics.includes('backend')) return 'frontend';
    if (['php', 'python', 'go', 'node', 'express', 'c#'].includes(lang) || topics.some(t => ['api', 'backend', 'rest-api'].includes(t))) return 'backend';
    return 'fullstack';
  }

  allProjects.forEach(p => {
    p._category = getCategory(p);
    p._title = p.name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
    if (p._title.length <= 4) p._title = p._title.toUpperCase();
    p._mono = p._title.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    p._color = LANG_COLORS[(p.language || '').toLowerCase()] || '#7c9cff';
    p._year = p.updated_at ? new Date(p.updated_at).getFullYear() : '';
  });

  // Category counts on filter buttons
  filterBtns.forEach(btn => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? gridProjects.length : gridProjects.filter(p => p._category === f).length;
    btn.insertAdjacentHTML('beforeend', `<sup>${n}</sup>`);
  });

  const moveThumb = () => {
    const btn = filterBtns.find(b => b.classList.contains('active'));
    if (!thumb || !btn) return;
    thumb.style.width = `${btn.offsetWidth}px`;
    thumb.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop - 4}px)`;
  };
  moveThumb();
  window.addEventListener('resize', moveThumb, { passive: true });
  document.fonts?.ready.then(moveThumb);

  function matches(repo) {
    if (activeFilter !== 'all' && repo._category !== activeFilter) return false;
    const q = activeSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return [repo.name, repo.description, repo.language, (repo.topics || []).join(' ')]
      .some(v => (v || '').toLowerCase().includes(q));
  }

  function cardHtml(repo, i) {
    const isPrivate = Boolean(repo.private);
    const topics = (repo.topics || []).slice(0, 3);
    const extra = (repo.topics || []).length - topics.length;
    const tagsHtml = topics.map(t => `<li>${escapeHtml(t)}</li>`).join('') + (extra > 0 ? `<li>+${extra}</li>` : '');

    const action = isPrivate
      ? `<button type="button" class="project__action project__link request-access-btn" data-project="${escapeHtml(repo._title)}" aria-label="Request access to ${escapeHtml(repo._title)}">Request access <span aria-hidden="true">→</span></button>`
      : `<a class="project__action project__link" href="${escapeHtml(repo.html_url || `https://github.com/${username}`)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(repo._title)} on GitHub">GitHub <span aria-hidden="true">↗</span></a>`;

    return `
      <article class="card project" style="--i:${i};--lang:${repo._color}">
        <div class="project__top">
          <span class="project__icon">${escapeHtml(repo._mono)}</span>
          ${isPrivate ? '<span class="badge">🔒 Private</span>' : (repo._year ? `<span class="badge">${repo._year}</span>` : '')}
        </div>
        <h3 class="project__title">${escapeHtml(repo._title)}</h3>
        <p class="project__desc">${escapeHtml(repo.description || 'Production-grade web application built with clean, maintainable code.')}</p>
        ${tagsHtml ? `<ul class="project__tags">${tagsHtml}</ul>` : ''}
        <div class="project__foot">
          <span class="project__lang"><i></i>${escapeHtml(repo.language || 'Web')}</span>
          ${action}
        </div>
      </article>
    `;
  }

  // The 3D carousel shows every project, featured included, under the same filters
  let lastCarouselKey = null;
  function syncCarousel() {
    const key = `${activeFilter}|${activeSearchQuery.trim().toLowerCase()}`;
    if (key === lastCarouselKey) return;
    lastCarouselKey = key;
    document.dispatchEvent(new CustomEvent('projects:filtered', { detail: { projects: allProjects.filter(matches) } }));
  }

  function render() {
    syncCarousel();
    if (!grid) return;
    const filtered = gridProjects.filter(matches);
    const visible = expanded ? filtered : filtered.slice(0, PAGE_SIZE);

    grid.innerHTML = filtered.length
      ? visible.map(cardHtml).join('')
      : `<div class="projects-empty"><strong>No projects found</strong>Try another keyword or filter.</div>`;

    if (countEl) countEl.textContent = `Showing ${visible.length} of ${filtered.length}`;

    if (moreBtn) {
      const hidden = filtered.length - visible.length;
      moreBtn.hidden = hidden <= 0;
      moreBtn.textContent = `Show ${hidden} more`;
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeFilter = btn.dataset.filter || 'all';
      expanded = false;
      moveThumb();
      render();
    });
  });

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        activeSearchQuery = e.target.value;
        expanded = Boolean(activeSearchQuery.trim());
        render();
      }, 160);
    });

    // "/" focuses search, like GitHub
    window.addEventListener('keydown', (e) => {
      if (e.key !== '/' || e.target.closest('input, textarea')) return;
      e.preventDefault();
      searchInput.focus();
    });
  }

  if (moreBtn) moreBtn.addEventListener('click', () => { expanded = true; render(); });

  render();
})();

/* --------------------------------------------------------------------------
   13b. Project Carousel — every project on a spinning 3D ring
   -------------------------------------------------------------------------- */
(function initProjectCarousel() {
  const box = document.getElementById('carousel');
  const stage = document.getElementById('carousel-stage');
  const canvas = document.getElementById('carousel-canvas');
  const toggle = document.getElementById('view-toggle');
  if (!box || !stage || !canvas) return;

  const el = (id) => document.getElementById(id);
  const ui = {
    badge: el('ci-badge'), count: el('ci-count'), title: el('ci-title'), desc: el('ci-desc'),
    tags: el('ci-tags'), action: el('ci-action'), prev: el('ci-prev'), next: el('ci-next'),
  };
  const gridParts = [el('github-projects'), el('github-loading'), el('more-row')].filter(Boolean);
  const viewBtns = toggle ? [...toggle.querySelectorAll('[data-view]')] : [];

  let projects = null;
  let carousel = null;
  let view = 'grid';
  let loading = false;

  document.addEventListener('projects:filtered', (e) => {
    projects = e.detail.projects;
    if (carousel) carousel.setProjects(projects);
  });

  if (!HAS_WEBGL) return; // grid stays as the only view

  function setView(next) {
    view = next;
    viewBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    box.hidden = view !== '3d';
    gridParts.forEach(part => part.classList.toggle('is-view-hidden', view === '3d'));
    if (carousel) carousel.setActive(view === '3d');
    if (view === '3d' && !carousel && !loading) {
      loading = true;
      loadThree().then((THREE) => {
        const fonts = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
        return fonts.then(() => {
          carousel = createCarousel(THREE);
          if (!carousel) { setView('grid'); if (toggle) toggle.hidden = true; return; }
          carousel.setActive(view === '3d');
          if (projects) carousel.setProjects(projects);
        });
      }).catch(() => { setView('grid'); if (toggle) toggle.hidden = true; });
    }
  }

  if (toggle) {
    toggle.hidden = false;
    viewBtns.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  }
  setView('3d');

  function showInfo(p, i, n) {
    if (!p) {
      ui.badge.textContent = 'No match';
      ui.count.textContent = '';
      ui.title.textContent = 'No projects found';
      ui.desc.textContent = 'Try another keyword or filter.';
      ui.tags.innerHTML = '';
      ui.action.innerHTML = '';
      return;
    }
    ui.badge.textContent = p.private ? '🔒 Private' : (p._year ? String(p._year) : 'Public');
    ui.count.textContent = `${i + 1} / ${n}`;
    ui.title.textContent = p._title;
    ui.desc.textContent = p.description || 'Production-grade web application built with clean, maintainable code.';
    ui.tags.innerHTML = [p.language || 'Web', ...(p.topics || []).slice(0, 4)].map(t => `<li>${escapeHtml(t)}</li>`).join('');
    ui.action.innerHTML = p.private
      ? `<button type="button" class="btn btn--primary request-access-btn" data-project="${escapeHtml(p._title)}">Request access</button>`
      : `<a class="btn btn--primary" href="${escapeHtml(p.html_url || `https://github.com/${GITHUB_USER}`)}" target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>`;
  }

  function hexToRgba(hex, a) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
    if (!m) return `rgba(124,156,255,${a})`;
    return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function wrapLines(g, text, maxW, maxLines) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    let overflow = false;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (g.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
        if (lines.length === maxLines) { overflow = true; break; }
      } else line = test;
    }
    if (!overflow && line) lines.push(line);
    if (overflow) {
      let last = lines[maxLines - 1];
      while (last && g.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last.trimEnd()}…`;
    }
    return lines;
  }

  function createCarousel(THREE) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const TAU = Math.PI * 2, CARD_W = 2.8, CARD_H = 1.75;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 8, 20);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    const ring = new THREE.Group();
    ring.position.y = -0.4;
    scene.add(ring);
    const floor = new THREE.GridHelper(90, 90);
    floor.material.vertexColors = false;
    floor.material.transparent = true;
    floor.position.y = ring.position.y - CARD_H / 2 - 0.25;
    scene.add(floor);
    const cardGeo = new THREE.PlaneGeometry(CARD_W, CARD_H);

    let items = [], cards = [], step = 1, R = 4.6;
    let rot = 0, target = 0, vel = 0, front = -1, idle = 0;
    let active = false, visible = true, hovering = false, hovered = null, camY = 0.6, lookY = -0.5;
    let theme = readTheme();

    function readTheme() {
      const cs = getComputedStyle(document.documentElement);
      const v = (name) => cs.getPropertyValue(name).trim();
      return {
        light: document.documentElement.dataset.theme === 'light',
        card: v('--card') || '#0f0f12', card2: v('--card-2') || '#15151a',
        fg: v('--fg') || '#ededef', fg2: v('--fg-2') || '#a1a1aa', fg3: v('--fg-3') || '#6b6b74',
      };
    }

    function drawCard(p) {
      const W = 640, H = 400;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const g = c.getContext('2d');
      const accent = p._color || '#7c9cff';

      roundRect(g, 4, 4, W - 8, H - 8, 30);
      const bg = g.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, theme.card2);
      bg.addColorStop(1, theme.card);
      g.fillStyle = bg;
      g.fill();
      g.save();
      g.clip();
      const glow = g.createRadialGradient(W, 0, 0, W, 0, 380);
      glow.addColorStop(0, hexToRgba(accent, 0.22));
      glow.addColorStop(1, hexToRgba(accent, 0));
      g.fillStyle = glow;
      g.fillRect(0, 0, W, H);
      g.restore();
      g.lineWidth = 4;
      g.strokeStyle = accent;
      g.stroke();

      roundRect(g, 40, 36, 64, 64, 16);
      g.fillStyle = hexToRgba(accent, 0.18);
      g.fill();
      g.fillStyle = accent;
      g.font = '600 26px "Geist Mono", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(p._mono || '•', 72, 69);

      g.textAlign = 'right';
      g.font = '500 20px "Geist Mono", monospace';
      g.fillStyle = theme.fg3;
      g.fillText(p.featured ? '★ FEATURED' : (p.private ? 'PRIVATE' : String(p._year || '')), W - 40, 69);

      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = theme.fg;
      g.font = '600 40px Geist, system-ui, sans-serif';
      const title = wrapLines(g, p._title, W - 80, 2);
      title.forEach((l, i) => g.fillText(l, 40, 158 + i * 46));

      g.fillStyle = theme.fg2;
      g.font = '400 22px Geist, system-ui, sans-serif';
      const top = 158 + title.length * 46 + 4;
      wrapLines(g, p.description || 'Production-grade web application.', W - 80, title.length > 1 ? 2 : 3)
        .forEach((l, i) => g.fillText(l, 40, top + i * 31));

      g.beginPath();
      g.arc(48, H - 46, 7, 0, TAU);
      g.fillStyle = accent;
      g.fill();
      g.fillStyle = theme.fg2;
      g.font = '500 20px "Geist Mono", monospace';
      g.fillText(p.language || 'Web', 64, H - 39);

      let x = W - 40;
      g.font = '500 18px "Geist Mono", monospace';
      (p.topics || []).slice(0, 2).reverse().forEach(t => {
        const w = g.measureText(t).width + 26;
        if (x - w < 230) return;
        x -= w;
        roundRect(g, x, H - 66, w, 38, 19);
        g.fillStyle = theme.light ? 'rgba(17,17,20,0.06)' : 'rgba(255,255,255,0.07)';
        g.fill();
        g.fillStyle = theme.fg2;
        g.fillText(t, x + 13, H - 41);
        x -= 10;
      });

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = maxAniso;
      return tex;
    }

    function clearCards() {
      cards.forEach(m => {
        m.material.map.dispose();
        m.material.dispose();
        m.children.forEach(r => r.material.dispose());
        ring.remove(m);
      });
      cards = [];
    }

    function build() {
      clearCards();
      const n = items.length;
      step = n ? TAU / n : 1;
      R = Math.max(4.6, (n * (CARD_W + 0.35)) / TAU);
      items.forEach((p, i) => {
        const tex = drawCard(p), a = i * step;
        const m = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
        m.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
        m.rotation.y = a;
        m.userData = { i, s: 1 };
        const mirror = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
        mirror.scale.y = -1;
        mirror.position.y = -(CARD_H + 0.5);
        m.add(mirror);
        ring.add(m);
        cards.push(m);
      });
      scene.fog.color.set(theme.card);
      floor.material.color.set(theme.fg);
      floor.material.opacity = theme.light ? 0.12 : 0.08;
      floor.material.needsUpdate = true;
      layout();
    }

    function layout() {
      const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const dist = R + (camera.aspect < 1 ? 7.6 : 5.4);
      camY = 0.6 + Math.max(0, R - 4.6) * 0.2;
      camera.position.set(0, camY, dist);
      // Aim between the back of the ring and the bottom of the front card so both fit
      const y0 = camY - ring.position.y;
      const backAngle = Math.atan(y0 / (dist + R));
      const frontAngle = Math.atan((y0 + CARD_H / 2 + 0.3) / (dist - R));
      lookY = camY - Math.tan((backAngle + frontAngle) / 2) * dist;
      camera.lookAt(0, lookY, 0);
      camera.updateProjectionMatrix();
      scene.fog.near = dist - R + 1;
      scene.fog.far = dist + R * 0.9;
      renderer.render(scene, camera);
    }
    new ResizeObserver(layout).observe(stage);

    new MutationObserver(() => { theme = readTheme(); build(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const wrapAngle = (a) => ((a % TAU) + TAU + Math.PI) % TAU - Math.PI;
    function goTo(i) { target = rot + wrapAngle(-i * step - rot); idle = 0; vel = 0; }
    function go(dir) {
      if (!items.length) return;
      target = Math.round(target / step) * step - dir * step;
      idle = 0;
      vel = 0;
    }
    function openFront() {
      const btn = ui.action.firstElementChild;
      if (btn) btn.click();
    }

    // Pointer: drag spins with inertia, a tap focuses a card, tapping the front card opens it
    const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
    const pointer = { x: 0, y: 0, dx: 0, down: false };
    let lastX = 0, startX = 0, startY = 0;
    function toNdc(e) {
      const r = canvas.getBoundingClientRect();
      v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      return v2;
    }
    canvas.addEventListener('pointerenter', () => { hovering = true; });
    canvas.addEventListener('pointerleave', () => { hovering = false; pointer.x = 0; });
    canvas.addEventListener('pointermove', (e) => {
      const n = toNdc(e);
      pointer.x = n.x; pointer.y = n.y;
      if (pointer.down) { pointer.dx += e.clientX - lastX; lastX = e.clientX; }
    }, { passive: true });
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pointer.down = true;
      lastX = startX = e.clientX;
      startY = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!pointer.down) return;
      pointer.down = false;
      if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) >= 6) return;
      ray.setFromCamera(toNdc(e), camera);
      const hit = ray.intersectObjects(cards, false)[0];
      if (!hit) return;
      if (hit.object.userData.i === front) openFront();
      else goTo(hit.object.userData.i);
    });
    canvas.addEventListener('pointercancel', () => { pointer.down = false; });

    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); openFront(); }
    });
    ui.prev.addEventListener('click', () => go(-1));
    ui.next.addEventListener('click', () => go(1));

    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(stage);

    let last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!active || !visible || document.hidden || !cards.length) { pointer.dx = 0; return; }

      if (!REDUCED_MOTION && !pointer.down && !hovering) {
        idle += dt;
        if (idle > 4) go(1);
      }

      if (pointer.down) {
        const d = pointer.dx * 0.005;
        rot += d;
        vel = d;
        target = rot;
        idle = 0;
      } else if (Math.abs(vel) > 0.002) {
        rot += vel;
        vel *= 0.92;
        target = rot;
        if (Math.abs(vel) <= 0.002) target = Math.round(rot / step) * step;
      } else {
        vel = 0;
        rot += (target - rot) * Math.min(1, dt * (REDUCED_MOTION ? 20 : 5));
      }
      pointer.dx = 0;
      ring.rotation.y = rot;

      const n = cards.length;
      const f = ((Math.round(-rot / step) % n) + n) % n;
      if (f !== front) { front = f; showInfo(items[f], f, n); }

      if (hovering) {
        ray.setFromCamera(v2.set(pointer.x, pointer.y), camera);
        const hit = ray.intersectObjects(cards, false)[0];
        hovered = hit ? hit.object : null;
      } else hovered = null;
      canvas.style.cursor = hovered ? 'pointer' : '';

      cards.forEach(c => {
        const facing = (Math.cos(c.userData.i * step + rot) + 1) / 2;
        c.material.opacity = 0.25 + 0.75 * facing * facing;
        const s = c.userData.s + ((c === hovered ? 1.08 : 1) - c.userData.s) * Math.min(1, dt * 8);
        c.userData.s = s;
        c.scale.set(s, s, s);
      });

      camera.position.x += ((hovering ? pointer.x * 0.6 : 0) - camera.position.x) * Math.min(1, dt * 2);
      camera.lookAt(0, lookY, 0);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    return {
      setActive(on) { active = on; if (on) layout(); },
      setProjects(list) {
        items = list;
        rot = target = vel = 0;
        front = -1;
        build();
        if (!items.length) { showInfo(null); renderer.clear(); }
      },
    };
  }
})();

/* --------------------------------------------------------------------------
   14. Contact Form Handler
   -------------------------------------------------------------------------- */
function buildMailtoLink(name, email, subjectVal, message) {
  const body = `Hi Melwin,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  return `mailto:abemelwin01@gmail.com?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(body)}`;
}

async function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.contact__submit');

  const name = (form.querySelector('#c-name')?.value || '').trim();
  const email = (form.querySelector('#c-email')?.value || '').trim();
  const subjectVal = (form.querySelector('#c-subject')?.value || '').trim() || `Portfolio Inquiry from ${name || 'Visitor'}`;
  const message = (form.querySelector('#c-message')?.value || '').trim();

  if (!name || !email || !message) {
    showToast('Please fill in your name, email, and message.');
    return;
  }

  const submitText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>Sending…</span>';
  }

  const endpoint = (form.dataset.formEndpoint || '').trim();

  try {
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject: subjectVal,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      showToast('Message sent successfully!');
      form.reset();
      return;
    }

    showToast('Opening your email client…');
    const mailtoLink = buildMailtoLink(name, email, subjectVal, message);

    setTimeout(() => {
      window.location.href = mailtoLink;
      form.reset();
      if (btn) {
        btn.innerHTML = submitText;
        btn.disabled = false;
      }
    }, 400);
  } catch (error) {
    console.error('Contact form send failed:', error);
    showToast('Your email app will open so you can send it manually.');

    const fallbackLink = buildMailtoLink(name, email, subjectVal, message);
    setTimeout(() => {
      window.location.href = fallbackLink;
      form.reset();
      if (btn) {
        btn.innerHTML = submitText;
        btn.disabled = false;
      }
    }, 400);
  } finally {
    if (btn && btn.innerHTML.includes('Sending')) {
      btn.innerHTML = submitText;
      btn.disabled = false;
    }
  }
}

/* --------------------------------------------------------------------------
   15. Request Access Modal (For private repos)
   -------------------------------------------------------------------------- */
(function initRequestAccessModal() {
  const raModal = document.getElementById('request-access-modal');
  const raForm = document.getElementById('request-access-form');
  const raProjectInput = document.getElementById('request-project');
  const raStatus = document.getElementById('ra-status');
  const raTitle = document.getElementById('request-access-title');
  let lastFocused = null;

  function openModal(project) {
    if (!raModal) return;
    lastFocused = document.activeElement;
    if (raProjectInput) raProjectInput.value = project || '';
    if (raTitle) raTitle.textContent = project ? `Request access to ${project}` : 'Request access';
    if (raStatus) raStatus.textContent = '';
    raModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const nameInput = document.getElementById('ra-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 250);
  }

  function closeModal() {
    if (!raModal) return;
    raModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.request-access-btn');
    if (btn) {
      openModal(btn.dataset.project || '');
      return;
    }
    const closer = e.target.closest('[data-action="close"]');
    if (closer) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && raModal && raModal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  if (raForm) {
    raForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = raForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      const formData = new FormData(raForm);
      const project = formData.get('project');
      const message = `${formData.get('message')}\n\nRequested Project: ${project}`;
      formData.set('message', message);

      try {
        const res = await fetch('https://formsubmit.co/ajax/abemelwin01@gmail.com', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });
        if (res.ok) {
          if (raStatus) raStatus.textContent = '✓ Request sent — I will reply by email.';
          showToast('Access request submitted!');
          raForm.reset();
          setTimeout(() => closeModal(), 1800);
        } else {
          if (raStatus) raStatus.textContent = 'Failed to submit request. Please email directly.';
        }
      } catch (err) {
        console.warn('Form submission error:', err);
        if (raStatus) raStatus.textContent = 'Network error. Please try again or email directly.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send request';
        }
      }
    });
  }
})();

/* --------------------------------------------------------------------------
   16. Footer Year & Console Signature
   -------------------------------------------------------------------------- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

console.log(
  '%c Melwin Dave %c Hey, fellow dev 👋  Let\'s talk → abemelwin01@gmail.com',
  'background:linear-gradient(90deg,#7c9cff,#b18cff);color:#fff;font-weight:700;padding:4px 8px;border-radius:4px',
  'color:inherit;padding:4px'
);

/* --------------------------------------------------------------------------
   17. Helper Utilities
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
