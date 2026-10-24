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

  gridProjects.forEach(p => {
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

  function render() {
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
