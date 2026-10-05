/* ==========================================================================
   MELWIN DAVE D. ABE — PORTFOLIO JAVASCRIPT ENGINE
   Interactive Cyber-Glassmorphism, Dynamic Terminal, Project Filtering & UI
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. Toast Notification System
   -------------------------------------------------------------------------- */
function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

/* --------------------------------------------------------------------------
   2. Copy Email to Clipboard Helper
   -------------------------------------------------------------------------- */
(function initCopyEmail() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-email-btn, #quick-copy-email');
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
      showToast(`Copied ${email} to clipboard! 📋`);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      showToast(`Email: ${email}`);
    }
  });
})();

/* --------------------------------------------------------------------------
   3. Scroll Progress Bar & Nav Blur on Scroll
   -------------------------------------------------------------------------- */
(function initScrollEffects() {
  const bar = document.getElementById('scroll-progress-bar');
  const navRow = document.querySelector('.nav-row');
  const backToTopBtn = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;

    // Progress Bar
    if (bar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    }

    // Nav Sticky Glass Styling
    if (navRow) {
      navRow.classList.toggle('scrolled', scrollTop > 30);
    }

    // Back to Top Button
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollTop > 500);
    }
  }, { passive: true });
})();

/* --------------------------------------------------------------------------
   4. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
(function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn = document.getElementById('mobile-nav-close');
  const overlay = document.getElementById('mobile-nav-overlay');
  const links = document.querySelectorAll('.mobile-nav__link');

  if (!mobileNav || !toggleBtn) return;

  function openNav() {
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (overlay) overlay.addEventListener('click', closeNav);

  links.forEach(link => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeNav();
    }
  });
})();

/* --------------------------------------------------------------------------
   5. Interactive Typewriter Role Cycler
   -------------------------------------------------------------------------- */
(function initTypewriter() {
  const el = document.querySelector('.hero-typewriter');
  if (!el) return;

  const roles = [
    'Full-Stack Developer',
    'Vue.js & Frontend Specialist',
    'PHP / Laravel Engineer',
    'TypeScript & Web Craftsman',
    'Scalable System Builder'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPING_SPEED = 65;
  const DELETE_SPEED = 35;
  const PAUSE_END = 2000;
  const PAUSE_START = 350;

  function tick() {
    const current = roles[roleIndex];
    if (isDeleting) {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    } else {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    }
  }

  setTimeout(tick, 500);
})();

/* --------------------------------------------------------------------------
   6. Interactive Particle Constellation Canvas
   -------------------------------------------------------------------------- */
(function initParticles() {
  const canvas = document.querySelector('.hero-portal__particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PARTICLE_COUNT = 48;
  const CONNECTION_DIST = 110;
  const SPEED = 0.35;
  let W, H, particles;
  let mouse = { x: -1000, y: -1000 };

  function resize() {
    const portal = canvas.parentElement;
    if (!portal) return;
    W = canvas.width = portal.offsetWidth;
    H = canvas.height = portal.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.6 + 0.8,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }

    // Constellation lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Draw particle dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.75)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    init();
    draw();
    window.addEventListener('resize', () => {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
    }, { passive: true });
  }
})();

/* --------------------------------------------------------------------------
   7. Mouse Spotlight Dynamic Glow on Glass Cards
   -------------------------------------------------------------------------- */
(function initSpotlightTracker() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll(
      '.bento-card--spotlight, .timeline-card, .about__bio-card, .about__highlights-card, .contact__details, .contact__form-wrapper, .work__box'
    );

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  }, { passive: true });
})();

/* --------------------------------------------------------------------------
   8. 3D Tilt Parallax on Cyber Portrait & Hero Elements
   -------------------------------------------------------------------------- */
(function init3DTilt() {
  const portrait = document.getElementById('cyber-portrait');
  if (!portrait || typeof gsap === 'undefined') return;

  const xTo = gsap.quickTo(portrait, 'rotateY', { duration: 0.5, ease: 'power2.out' });
  const yTo = gsap.quickTo(portrait, 'rotateX', { duration: 0.5, ease: 'power2.out' });

  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 16;
    const y = (e.clientY / innerHeight - 0.5) * -16;
    xTo(x);
    yTo(y);
  }, { passive: true });
})();

/* --------------------------------------------------------------------------
   9. Interactive Developer Mini Terminal Widget
   -------------------------------------------------------------------------- */
(function initInteractiveTerminal() {
  const output = document.getElementById('hero-terminal-output');
  if (!output) return;

  const commands = {
    whoami: 'Melwin Dave D. Abe — Full-Stack Web Developer with expertise in Vue.js, PHP Laravel & modern cloud systems.',
    skills: '⚡ Frontend: Vue.js 3, TypeScript, React, Tailwind CSS | 🐘 Backend: PHP, Laravel, Node.js, Express | 🗄️ DB: MySQL, PostgreSQL, MongoDB',
    experience: '💼 Web Developer @ ES Print Media Inc. (Present 2026) | 🚀 Freelance Full-Stack Developer (2023 - Present)',
    contact: '📧 abemelwin01@gmail.com | 🌐 github.com/abemelwin | 📍 Philippines',
    clear: '__CLEAR__',
    help: 'Available commands: whoami, skills, experience, contact, clear'
  };

  function executeCmd(cmdName) {
    const trimmed = cmdName.toLowerCase().trim();
    if (trimmed === 'clear') {
      output.innerHTML = `
        <p class="hero-terminal__line"><span class="t-prompt">$</span> <span class="t-cmd">clear</span></p>
        <p class="hero-terminal__res">&gt; Terminal reset. Ready for commands.</p>
      `;
      return;
    }

    const response = commands[trimmed] || `Command not found: "${escapeHtml(trimmed)}". Try: skills, experience, contact`;

    const line = document.createElement('div');
    line.style.marginTop = '0.8rem';
    line.innerHTML = `
      <p class="hero-terminal__line"><span class="t-prompt">$</span> <span class="t-cmd">${escapeHtml(trimmed)}</span></p>
      <p class="hero-terminal__res">&gt; ${escapeHtml(response)}</p>
    `;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.t-btn');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (cmd) executeCmd(cmd);
  });
})();

/* --------------------------------------------------------------------------
   10a. PRIVATE / MANUAL SHOWCASE PROJECTS
   -------------------------------------------------------------------------- */
/*
   Keep `private: true` for projects that should require approval/access before
   viewing details. This keeps the flow intentional for clients and recruiters
   who want to request access directly.
*/
const PRIVATE_SHOWCASE_PROJECTS = [
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
   10b. Curated Fallback Projects (When GitHub offline or rate limited)
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
   11. GitHub Projects Auto-Fetch & Dynamic Filter Engine
   -------------------------------------------------------------------------- */
let allProjectsData = [];

(async function initProjectsEngine() {
  const workSection = document.querySelector('.work[data-github-username]');
  if (!workSection) return;

  const username = workSection.dataset.githubUsername || 'abemelwin';
  const container = document.getElementById('github-projects');
  const loadingEl = document.getElementById('github-loading');
  const countEl = document.getElementById('project-count');
  const searchInput = document.getElementById('project-search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let activeFilter = 'all';
  let activeSearchQuery = '';

  const SKIP_REPOS = new Set([
    username.toLowerCase(),
    '.github',
    'portfolio'
  ]);

  // Fetch repos from GitHub
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
        repos = data.filter(r => !SKIP_REPOS.has(r.name.toLowerCase()));
      }
    }
  } catch (err) {
    console.warn('GitHub fetch failed, using curated portfolio projects:', err);
  }

  // Hide skeleton
  if (loadingEl) loadingEl.classList.add('github-loading--hidden');

  // Fallback if no public repos or API limit reached
  if (repos.length === 0) {
    repos = FALLBACK_PROJECTS;
  }

  // Palaging isama ang mga private/manual showcase projects (hindi galing sa
  // GitHub API dahil hindi talaga makikita ng public request ang private repos)
  repos = [...PRIVATE_SHOWCASE_PROJECTS, ...repos];

  allProjectsData = repos;

  // Determine category helper
  function getCategory(repo) {
    const topics = (repo.topics || []).map(t => t.toLowerCase());
    const lang = (repo.language || '').toLowerCase();

    if (topics.some(t => ['android', 'ios', 'mobile', 'react-native', 'flutter'].includes(t))) return 'mobile';
    if (topics.some(t => ['fullstack', 'full-stack', 'laravel', 'erp', 'supabase', 'hr-management', 'check-monitoring', 'sales-portal', 'internal-tool'].includes(t)) || (lang === 'php' && topics.includes('vue'))) return 'fullstack';
    if (['vue', 'typescript', 'javascript', 'react', 'html', 'css'].includes(lang) && !topics.includes('backend')) return 'frontend';
    if (['php', 'python', 'go', 'node', 'express'].includes(lang) || topics.some(t => ['api', 'backend', 'rest-api'].includes(t))) return 'backend';
    return 'fullstack';
  }

  // Render cards
  function renderProjects() {
    if (!container) return;
    container.innerHTML = '';

    const filtered = allProjectsData.filter(repo => {
      const cat = getCategory(repo);
      const matchesFilter = (activeFilter === 'all') || (cat === activeFilter);

      const name = (repo.name || '').toLowerCase();
      const desc = (repo.description || '').toLowerCase();
      const lang = (repo.language || '').toLowerCase();
      const topics = (repo.topics || []).join(' ').toLowerCase();

      const q = activeSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || name.includes(q) || desc.includes(q) || lang.includes(q) || topics.includes(q);

      return matchesFilter && matchesSearch;
    });

    if (countEl) {
      countEl.textContent = `${filtered.length} project${filtered.length !== 1 ? 's' : ''} shown.`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 4rem; background: var(--bg-glass-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <p style="font-size: 1.8rem; color: #ffffff; margin-bottom: 0.8rem;">No projects matched your criteria.</p>
          <p style="color: var(--text-muted);">Try clearing the search query or selecting a different filter category.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((repo, index) => {
      const isReverse = index % 2 !== 0;
      const isPrivate = Boolean(repo.private);

      const card = document.createElement('div');
      card.className = `work__box${isReverse ? ' work__box--reverse' : ''} fade-in visible`;
      card.dataset.repo = repo.name;

      const formattedName = repo.name
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      const tagLabel = isPrivate ? 'Private System' : (repo.language || 'Full-Stack Project');

      const topicsHtml = (repo.topics && repo.topics.length > 0)
        ? repo.topics.map(t => `<li>${escapeHtml(t)}</li>`).join('')
        : (repo.language ? `<li>${escapeHtml(repo.language)}</li>` : '<li>Web Application</li>');

      const stars = repo.stargazers_count > 0
        ? `<span class="github-projects__meta-item">
             <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
             ${repo.stargazers_count}
           </span>` : '';

      const forks = repo.forks_count > 0
        ? `<span class="github-projects__meta-item">
             <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
               <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/>
             </svg>
             ${repo.forks_count}
           </span>` : '';

      const updatedDate = repo.updated_at
        ? new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        : 'Recent';

      const description = repo.description || 'Production-grade software application engineered with clean code and high performance standards.';

      const linksHtml = isPrivate
        ? `<button type="button" class="btn btn--outline request-access-btn" data-project="${escapeHtml(formattedName)}">Request Access</button>`
        : `<a href="${escapeHtml(repo.html_url || 'https://github.com/abemelwin')}" target="_blank" rel="noopener noreferrer" class="link__text">
             <span>View on GitHub</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
           </a>`;

      card.innerHTML = `
        <div class="work__text">
          <span class="work__tag">${escapeHtml(tagLabel)}</span>
          <h3>${escapeHtml(formattedName)}</h3>
          <p class="work__desc">${escapeHtml(description)}</p>
          <ul class="work__list">
            ${topicsHtml}
          </ul>
          <div class="github-projects__meta">
            ${stars}
            ${forks}
            <span class="github-projects__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${updatedDate}
            </span>
          </div>
          <div class="work__links">
            ${linksHtml}
          </div>
        </div>
        <div class="work__image-box">
          <div class="mockup-browser">
            <div class="mockup-browser__bar">
              <span class="mockup-browser__dot mockup-browser__dot--red"></span>
              <span class="mockup-browser__dot mockup-browser__dot--yellow"></span>
              <span class="mockup-browser__dot mockup-browser__dot--green"></span>
              <div class="mockup-browser__url">https://github.com/abemelwin/${escapeHtml(repo.name || 'project')}</div>
            </div>
            <div class="mockup-browser__screen">
              <div class="mockup-github-card">
                <div class="mockup-github-card__icon">${isPrivate ? '🔒' : '⚡'}</div>
                <div class="mockup-github-card__name">${escapeHtml(formattedName)}</div>
                <div class="mockup-github-card__desc">${escapeHtml(description)}</div>
                <div class="mockup-github-card__stats">
                  <span>${escapeHtml(repo.language || 'Full-Stack')}</span>
                  <span>★ ${repo.stargazers_count || 0}</span>
                  <span>⑂ ${repo.forks_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // Re-inject preview terminal overlays into rendered cards
    injectCodePreviews();
  }

  // Filter Buttons event listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      renderProjects();
    });
  });

  // Search input listener with debounce
  if (searchInput) {
    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        activeSearchQuery = e.target.value;
        renderProjects();
      }, 180);
    });
  }

  // Initial render
  renderProjects();
})();

/* --------------------------------------------------------------------------
   12. Animated Code Preview Terminal Overlay in Mockups
   -------------------------------------------------------------------------- */
const CODE_SNIPPETS = {
  JavaScript: [
    { prompt: '$', command: 'npm run dev' },
    { comment: '// Starting Vite development server...' },
    { code: '<span class="mockup-preview__keyword">const</span> <span class="mockup-preview__variable">app</span> <span class="mockup-preview__operator">=</span> <span class="mockup-preview__function">createApp</span>(App)' },
    { code: '<span class="mockup-preview__variable">app</span>.<span class="mockup-preview__function">use</span>(<span class="mockup-preview__variable">router</span>).<span class="mockup-preview__function">mount</span>(<span class="mockup-preview__string">\'#app\'</span>)' },
    { comment: '// ✓ Ready in 240ms. Network: http://localhost:5173/' }
  ],
  TypeScript: [
    { prompt: '$', command: 'npx tsc --watch' },
    { comment: '// Typechecking production build...' },
    { code: '<span class="mockup-preview__keyword">export interface</span> <span class="mockup-preview__function">UserSession</span> {' },
    { code: '  <span class="mockup-preview__variable">id</span>: <span class="mockup-preview__string">string</span>; <span class="mockup-preview__variable">role</span>: <span class="mockup-preview__string">\'admin\' | \'developer\'</span>;' },
    { code: '}' },
    { comment: '// ✓ Found 0 errors. Watching for changes.' }
  ],
  Vue: [
    { prompt: '$', command: 'npm run serve' },
    { comment: '// Hot Module Replacement initialized' },
    { code: '&lt;<span class="mockup-preview__keyword">template</span>&gt;' },
    { code: '  &lt;<span class="mockup-preview__function">DashboardView</span> :<span class="mockup-preview__variable">data</span>=<span class="mockup-preview__string">"analytics"</span> /&gt;' },
    { code: '&lt;/<span class="mockup-preview__keyword">template</span>&gt;' }
  ],
  PHP: [
    { prompt: '$', command: 'php artisan serve' },
    { comment: '// Laravel backend server active' },
    { code: '<span class="mockup-preview__keyword">class</span> <span class="mockup-preview__function">OrderController</span> <span class="mockup-preview__keyword">extends</span> <span class="mockup-preview__variable">Controller</span> {' },
    { code: '  <span class="mockup-preview__keyword">public function</span> <span class="mockup-preview__function">index</span>() { <span class="mockup-preview__keyword">return</span> <span class="mockup-preview__function">response</span>()-&gt;<span class="mockup-preview__function">json</span>(<span class="mockup-preview__variable">$orders</span>); }' },
    { code: '}' }
  ],
  default: [
    { prompt: '$', command: 'git status && npm run build' },
    { comment: '// Optimizing static assets...' },
    { code: '<span class="mockup-preview__keyword">import</span> { <span class="mockup-preview__variable">createRouter</span> } <span class="mockup-preview__keyword">from</span> <span class="mockup-preview__string">\'vue-router\'</span>' },
    { code: '<span class="mockup-preview__keyword">export const</span> <span class="mockup-preview__variable">app</span> <span class="mockup-preview__operator">=</span> <span class="mockup-preview__function">initApp</span>()' },
    { comment: '// ✓ Build succeeded in 1.4s' }
  ]
};

function injectCodePreviews() {
  const cards = document.querySelectorAll('.work__box');
  cards.forEach(card => {
    if (card.dataset.previewInjected) return;
    card.dataset.previewInjected = 'true';

    const screen = card.querySelector('.mockup-browser__screen');
    if (!screen) return;

    let language = 'default';
    const tagEl = card.querySelector('.work__tag');
    if (tagEl) {
      const text = tagEl.textContent.trim().toLowerCase();
      if (text.includes('vue')) language = 'Vue';
      else if (text.includes('php') || text.includes('laravel')) language = 'PHP';
      else if (text.includes('typescript')) language = 'TypeScript';
      else if (text.includes('javascript')) language = 'JavaScript';
    }

    const snippet = CODE_SNIPPETS[language] || CODE_SNIPPETS.default;

    let lines = '';
    snippet.forEach(item => {
      if (item.prompt) {
        lines += `<div class="mockup-preview__line"><span class="mockup-preview__prompt">${item.prompt}</span> <span class="mockup-preview__command">${item.command}</span></div>`;
      } else if (item.comment) {
        lines += `<div class="mockup-preview__line"><span class="mockup-preview__comment">${item.comment}</span></div>`;
      } else if (item.code) {
        lines += `<div class="mockup-preview__line">${item.code}</div>`;
      }
    });

    lines += `<div class="mockup-preview__line"><span class="mockup-preview__cursor"></span></div>`;

    const previewEl = document.createElement('div');
    previewEl.className = 'mockup-preview';
    previewEl.innerHTML = `
      <div class="mockup-preview__play-indicator">
        <span class="mockup-preview__play-dot"></span>
        <span>LIVE DEV</span>
      </div>
      <div class="mockup-preview__terminal">
        ${lines}
      </div>
      <div class="mockup-preview__activity">
        <div class="mockup-preview__activity-bar">
          <div class="mockup-preview__activity-fill"></div>
        </div>
        <span class="mockup-preview__activity-label">compiling...</span>
      </div>
    `;

    screen.appendChild(previewEl);
  });
}

/* --------------------------------------------------------------------------
   13. IntersectionObserver for Active Nav & Fade In Animations
   -------------------------------------------------------------------------- */
(function initScrollObservers() {
  // 1. Fade-in Observer
  const fadeElements = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // 2. Active Nav Link Observer
  const sections = ['work', 'skills', 'experience', 'about', 'contact'];
  const links = {};
  sections.forEach(id => {
    links[id] = document.querySelector(`.nav__link[href="#${id}"]`);
  });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (links[id]) {
        links[id].classList.toggle('nav__link--active', entry.isIntersecting);
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) navObserver.observe(el);
  });
})();

/* --------------------------------------------------------------------------
   14. Animated Stat Counters
   -------------------------------------------------------------------------- */
(function initStatCounters() {
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 1400;
    const step = target / (duration / 16);
    let current = 0;

    const tick = () => {
      current += step;
      if (current >= target) {
        el.textContent = `${target}+`;
      } else {
        el.textContent = `${Math.floor(current)}+`;
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.hero-stat-num[data-target]').forEach(animateCounter);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) observer.observe(statsEl);
})();

/* --------------------------------------------------------------------------
   15. Contact Form Handler (Mailto Direct Open)
   -------------------------------------------------------------------------- */
function handleMailtoForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.contact__submit');

  const name = form.querySelector('#c-name').value;
  const email = form.querySelector('#c-email').value;
  const subjectVal = (form.querySelector('#c-subject') && form.querySelector('#c-subject').value) || `Portfolio Inquiry from ${name}`;
  const message = form.querySelector('#c-message').value;

  const body = `Hi Melwin,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const mailtoLink = `mailto:abemelwin01@gmail.com?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(body)}`;

  if (btn) {
    btn.textContent = 'Opening Mail Client…';
    btn.disabled = true;
  }

  showToast('Opening your email client... ✉️');

  setTimeout(() => {
    window.location.href = mailtoLink;
    if (btn) {
      btn.innerHTML = `<span>Send Message</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
      btn.disabled = false;
    }
    form.reset();
  }, 400);
}

/* --------------------------------------------------------------------------
   16. Request Access Modal (For private repos)
   -------------------------------------------------------------------------- */
(function initRequestAccessModal() {
  const raModal = document.getElementById('request-access-modal');
  const raForm = document.getElementById('request-access-form');
  const raProjectInput = document.getElementById('request-project');
  const raStatus = document.getElementById('ra-status');

  function openModal(project) {
    if (!raModal) return;
    if (raProjectInput) raProjectInput.value = project || '';
    if (raStatus) raStatus.textContent = '';
    raModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const nameInput = document.getElementById('ra-name');
    if (nameInput) nameInput.focus();
  }

  function closeModal() {
    if (!raModal) return;
    raModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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
          if (raStatus) raStatus.textContent = '✓ Request sent successfully! I will reply by email.';
          showToast('Access request submitted! 🚀');
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
          submitBtn.textContent = 'Send Request';
        }
      }
    });
  }
})();

/* --------------------------------------------------------------------------
   17. Keyboard Accessibility Tab Detection & Footer Year
   -------------------------------------------------------------------------- */
window.addEventListener('keydown', function handleFirstTab(e) {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
});

const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* --------------------------------------------------------------------------
   18. Helper Utilities
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}