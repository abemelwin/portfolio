/* -----------------------------------------
  Focus outline only for keyboard users
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing');
  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
};

window.addEventListener('keydown', handleFirstTab);

/* -----------------------------------------
  Back to top button
 ---------------------------------------- */

const backToTopButton = document.querySelector('.back-to-top');
let isBackToTopRendered = false;

const alterStyles = (visible) => {
  backToTopButton.style.visibility = visible ? 'visible' : 'hidden';
  backToTopButton.style.opacity    = visible ? 1 : 0;
  backToTopButton.style.transform  = visible ? 'scale(1)' : 'scale(0)';
};

window.addEventListener('scroll', () => {
  const visible = window.scrollY > 700;
  if (visible !== isBackToTopRendered) {
    isBackToTopRendered = visible;
    alterStyles(visible);
  }
});

/* -----------------------------------------
  Contact form handler (Mailto)
 ---------------------------------------- */

function handleMailtoForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('.contact__submit');

  const name = form.querySelector('#c-name').value;
  const email = form.querySelector('#c-email').value;
  const message = form.querySelector('#c-message').value;

  const subject = `Portfolio Contact from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

  const mailtoLink = `mailto:abemelwin01@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  btn.textContent = 'Opening Email…';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = mailtoLink;
    btn.textContent = 'Send Message';
    btn.disabled = false;
    form.reset();
  }, 500);
}

/* -----------------------------------------
  Scroll fade-in animation
 ---------------------------------------- */

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly for a cascade effect
      const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
      let delay = 0;
      siblings.forEach((el, idx) => {
        if (el === entry.target) delay = idx * 120;
      });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* -----------------------------------------
  Animated stat counters
 ---------------------------------------- */

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const step = target / (duration / 16);
  let current = 0;

  const tick = () => {
    current += step;
    if (current >= target) {
      el.textContent = target;
    } else {
      el.textContent = Math.floor(current);
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.about__stat-num[data-target]').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const aboutContent = document.querySelector('.about__content');
if (aboutContent) statsObserver.observe(aboutContent);

/* -----------------------------------------
  Footer year
 ---------------------------------------- */

const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* -----------------------------------------
  Apply locked-project badges to hardcoded
  projects that have data-locked="true"
 ---------------------------------------- */

(function applyLockedBadges() {
  document.querySelectorAll('.work__box[data-locked="true"]').forEach(box => {
    // Replace the GitHub link with a locked badge
    const linksEl = box.querySelector('.work__links');
    if (!linksEl) return;

    // Remove existing github anchor(s) from work__links
    linksEl.querySelectorAll('a[href*="github.com"]').forEach(a => a.remove());
    // Also remove orphaned separators
    linksEl.querySelectorAll('.work__links-separator').forEach(s => s.remove());

    // Insert locked badge
    const badge = document.createElement('span');
    badge.className = 'work__locked-badge';
    badge.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      Private — Not available for download
    `;
    linksEl.appendChild(badge);
  });
})();

/* -----------------------------------------
  Auto-fetch GitHub repos and render new
  ones that aren't already on the page
 ---------------------------------------- */

(async function loadGitHubProjects() {
  const workSection = document.querySelector('.work[data-github-username]');
  if (!workSection) return;

  const username = workSection.dataset.githubUsername;
  const container = document.getElementById('github-projects');
  if (!container) return;

  // Collect repo slugs already hardcoded on the page (case-insensitive)
  const existingSlugs = new Set(
    [...document.querySelectorAll('.work__box[data-repo]')]
      .map(el => el.dataset.repo.toLowerCase())
  );

  // Repos to always skip (config repos, etc.)
  const SKIP_REPOS = new Set([
    username.toLowerCase(),        // profile readme repo
    '.github',
  ]);

  let repos = [];
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    repos = await res.json();
  } catch (err) {
    console.warn('GitHub projects fetch failed:', err);
    return;
  }

  // Filter: public, not already shown, not in skip list (allow forks now)
  const newRepos = repos.filter(r =>
    !r.private &&
    !existingSlugs.has(r.name.toLowerCase()) &&
    !SKIP_REPOS.has(r.name.toLowerCase()) &&
    r.description && r.description.length > 10  // Only show repos with descriptions
  );

  if (newRepos.length === 0) return;

  // Add a divider heading
  const heading = document.createElement('h3');
  heading.className = 'github-projects__heading';
  heading.textContent = 'More on GitHub';
  container.appendChild(heading);

  // Build a card for each new repo
  newRepos.forEach((repo, index) => {
    const isReverse = index % 2 !== 0;
    const langs = repo.language ? `<li>${repo.language}</li>` : '';

    const card = document.createElement('div');
    card.className = `work__box${isReverse ? ' work__box--reverse' : ''} fade-in`;
    card.dataset.repo = repo.name;

    const stars = repo.stargazers_count > 0
      ? `<span class="github-projects__meta-item">
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
             fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
           ${repo.stargazers_count}
         </span>`
      : '';

    const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short'
    });

    card.innerHTML = `
      <div class="work__text">
        <span class="work__tag">GitHub</span>
        <h3>${escapeHtml(repo.name.replace(/-/g, ' ').replace(/_/g, ' '))}</h3>
        <p class="work__desc">${escapeHtml(repo.description || 'No description provided.')}</p>
        <ul class="work__list">
          ${langs}
        </ul>
        <div class="github-projects__meta">
          ${stars}
          <span class="github-projects__meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Updated ${updatedDate}
          </span>
        </div>
        <div class="work__links">
          <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="link__text">
            View on GitHub <span>&rarr;</span>
          </a>
          ${repo.homepage
            ? `<span class="work__links-separator">|</span>
               <a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer" class="link__text">
                 Live Demo <span>&rarr;</span>
               </a>`
            : ''
          }
        </div>
      </div>
      <div class="work__image-box">
        <div class="mockup-browser">
          <div class="mockup-browser__bar">
            <span class="mockup-browser__dot mockup-browser__dot--red"></span>
            <span class="mockup-browser__dot mockup-browser__dot--yellow"></span>
            <span class="mockup-browser__dot mockup-browser__dot--green"></span>
            <div class="mockup-browser__url">github.com/${encodeURIComponent(username)}</div>
          </div>
          <div class="mockup-browser__screen mockup-github-screen">
            <div class="mockup-github-card">
              <div class="mockup-github-card__name">${escapeHtml(repo.name)}</div>
              <div class="mockup-github-card__desc">${escapeHtml(repo.description || '')}</div>
              <div class="mockup-github-card__stats">
                ${repo.language ? `<span class="mockup-github-card__lang">${escapeHtml(repo.language)}</span>` : ''}
                <span>★ ${repo.stargazers_count}</span>
                <span>⑂ ${repo.forks_count}</span>
              </div>
              <div class="mockup-github-card__bar"></div>
              <div class="mockup-github-card__bar mockup-github-card__bar--short"></div>
              <div class="mockup-github-card__bar mockup-github-card__bar--med"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Wire up fade-in observer for dynamically added cards
    fadeObserver.observe(card);
  });
})();

/* -----------------------------------------
  HTML escape helper
 ---------------------------------------- */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
