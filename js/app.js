/**
 * MD. NAFIZUR RAHMAN — ACADEMIC & RESEARCH PORTFOLIO
 * Next-Gen Two-Column Split Architecture Engine
 * Features: Auto-scrolling ticker, Live search, Marquee carousel, Lightbox & No-Code GitHub CMS
 */

'use strict';

window.portfolioData = null;
let currentPubFilter = 'all';
let currentPubSearch = '';
let currentGalleryFilter = 'all';
let isTimelineExpanded = false;
let stagedFileUploads = [];

/* ==========================================================================
   1. THEME MANAGER (DARK / LIGHT)
   ========================================================================== */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const nxt = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nxt);
      localStorage.setItem('theme', nxt);
      updateThemeIcon(nxt);
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.innerHTML = theme === 'dark' 
    ? '<i class="fa-solid fa-sun"></i>' 
    : '<i class="fa-solid fa-moon"></i>';
}

/* ==========================================================================
   2. DATA LOADER & MAIN RENDERER
   ========================================================================== */
async function loadData() {
  try {
    const res = await fetch('data/portfolio-data.json?v=' + Date.now());
    if (!res.ok) throw new Error('Could not fetch portfolio-data.json');
    window.portfolioData = await res.json();
    renderAll();
  } catch (err) {
    console.error('Data load error:', err);
    showToast('Failed to load portfolio data.', 'error');
  }
}

function renderAll() {
  if (!window.portfolioData) return;
  const d = window.portfolioData;

  renderTopNavbar(d.profile);
  renderHeroBanner(d.profile);
  renderStickySidebar(d.profile);
  renderRecentUpdatesTicker(d.recentUpdates);
  renderAboutBio(d.about);
  renderTimelineAndKPIs(d.researchAndProjectsTimeline, d.kpis);
  renderCapabilities(d.capabilities);
  renderPublications();
  renderTrainings(d.trainings);
  renderGalleryMarquee();
  renderLeadership(d.leadership);
  renderReferences(d.references);
  renderContact(d.profile);
}

/* --------------------------------------------------------------------------
   Top Navbar & Hero Banner
   -------------------------------------------------------------------------- */
function renderTopNavbar(p) {
  if (!p) return;
  const avatar = document.getElementById('nav-avatar');
  if (avatar) avatar.src = p.avatar || 'ZUN.png';
  const name = document.getElementById('nav-name');
  if (name) name.textContent = p.name;
}

function renderHeroBanner(p) {
  if (!p) return;
  const banner = document.getElementById('top-hero-banner-img');
  if (banner) banner.src = p.banner || 'Banner.png';
}

/* --------------------------------------------------------------------------
   Left Sticky Profile Card
   -------------------------------------------------------------------------- */
function renderStickySidebar(p) {
  if (!p) return;

  const avatar = document.getElementById('sidebar-avatar');
  if (avatar) avatar.src = p.avatar || 'ZUN.png';

  const pillsContainer = document.getElementById('sidebar-status-pills');
  if (pillsContainer && p.statusPills) {
    pillsContainer.innerHTML = p.statusPills.map(pill => `
      <span class="status-pill">${escapeHTML(pill)}</span>
    `).join('');
  }

  const name = document.getElementById('sidebar-name');
  if (name) name.textContent = p.name;

  const role = document.getElementById('sidebar-role');
  if (role) {
    role.innerHTML = `<strong>${escapeHTML(p.designation)}</strong><br>${escapeHTML(p.institution)}`;
  }

  const emailBtn = document.getElementById('sidebar-email-box');
  if (emailBtn && p.contact?.emailPrimary) {
    emailBtn.innerHTML = `<i class="fa-solid fa-envelope"></i> ${escapeHTML(p.contact.emailPrimary)}`;
    emailBtn.onclick = () => {
      navigator.clipboard.writeText(p.contact.emailPrimary);
      showToast('Email address copied to clipboard!', 'success');
    };
  }

  // 2-Column Grid of Clickable Profile Buttons
  const btnGrid = document.getElementById('sidebar-buttons-grid');
  if (btnGrid) {
    const s = p.social || {};
    btnGrid.innerHTML = `
      <a href="${escapeHTML(p.cvDriveUrl)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn btn-cv-featured">
        <i class="fa-solid fa-file-pdf"></i> View CV (Google Drive)
      </a>
      <a href="${escapeHTML(s.scholar)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-brands fa-google-scholar"></i> Google Scholar
      </a>
      <a href="${escapeHTML(s.orcid)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-brands fa-orcid"></i> ORCID
      </a>
      <a href="${escapeHTML(s.linkedin)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-brands fa-linkedin"></i> LinkedIn
      </a>
      <a href="${escapeHTML(s.osf)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-solid fa-dna"></i> OSF (DOI)
      </a>
      <a href="${escapeHTML(s.researchgate)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-brands fa-researchgate"></i> ResearchGate
      </a>
      <a href="${escapeHTML(s.github)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-brands fa-github"></i> GitHub
      </a>
      <a href="${escapeHTML(p.contact?.whatsapp)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-brands fa-whatsapp"></i> WhatsApp
      </a>
      <a href="${escapeHTML(p.googleSitesUrl)}" target="_blank" rel="noopener noreferrer" class="sidebar-btn">
        <i class="fa-solid fa-globe"></i> Google Sites
      </a>
    `;
  }

  // Floating Quick-Access CV Button
  const floatCv = document.getElementById('floating-cv-btn');
  if (floatCv) {
    floatCv.href = p.cvDriveUrl;
  }
}

/* --------------------------------------------------------------------------
   A. Continuous Vertical Auto-Scrolling Ticker ("Recent Updates")
   -------------------------------------------------------------------------- */
function renderRecentUpdatesTicker(updates) {
  const container = document.getElementById('updates-ticker-list');
  if (!container || !updates) return;

  // Duplicate items to ensure a seamless infinite vertical scroll loop
  const duplicated = [...updates, ...updates];

  container.innerHTML = duplicated.map(u => `
    <li class="ticker-item">
      <div class="ticker-meta">
        <span class="ticker-date">${escapeHTML(u.date)}</span>
        <span class="ticker-badge">${escapeHTML(u.badge)}</span>
      </div>
      <div class="ticker-title">${escapeHTML(u.title)}</div>
      <p class="ticker-desc">${escapeHTML(u.text)}</p>
    </li>
  `).join('');
}

/* --------------------------------------------------------------------------
   B. About & Verbatim Google Sites Bio
   -------------------------------------------------------------------------- */
function renderAboutBio(about) {
  if (!about) return;
  const lead = document.getElementById('bio-lead-text');
  if (lead) lead.textContent = about.lead || '';

  const paras = document.getElementById('bio-paragraphs-wrapper');
  if (paras && about.bioParagraphs) {
    paras.innerHTML = about.bioParagraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
  }
}

/* --------------------------------------------------------------------------
   C. Timeline & 4-Column KPI Metrics Bar
   -------------------------------------------------------------------------- */
function renderTimelineAndKPIs(timeline, kpis) {
  const container = document.getElementById('experience-timeline-container');
  if (!container || !timeline) return;

  const displayList = isTimelineExpanded ? timeline : timeline.slice(0, 4);

  container.innerHTML = displayList.map(item => `
    <div class="timeline-entry">
      <div class="entry-header">
        <h4 class="entry-title">${escapeHTML(item.title)}</h4>
        <span class="entry-badge">${escapeHTML(item.badge)}</span>
      </div>
      <div class="entry-meta">
        <span><i class="fa-solid fa-building-columns"></i> ${escapeHTML(item.institution)}</span>
        <span><i class="fa-solid fa-calendar-days"></i> ${escapeHTML(item.period)}</span>
      </div>
      <p class="entry-desc">${escapeHTML(item.summary)}</p>
      <ul class="entry-tags">
        ${(item.tags || []).map(t => `<li class="entry-tag-pill">#${escapeHTML(t)}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  // Expand Toggle Button
  const expandBtn = document.getElementById('timeline-expand-btn');
  if (expandBtn) {
    expandBtn.innerHTML = isTimelineExpanded
      ? '<i class="fa-solid fa-chevron-up"></i> Show Less'
      : `<i class="fa-solid fa-chevron-down"></i> See All Experience & Projects (${timeline.length})`;
    expandBtn.onclick = () => {
      isTimelineExpanded = !isTimelineExpanded;
      renderTimelineAndKPIs(timeline, kpis);
    };
  }

  // 4-Column KPI Metrics Bar
  const kpiContainer = document.getElementById('kpi-metrics-container');
  if (kpiContainer && kpis) {
    kpiContainer.innerHTML = kpis.map(k => `
      <div class="kpi-metric-box">
        <div class="kpi-value">${escapeHTML(k.value)}</div>
        <div class="kpi-label">${escapeHTML(k.label)}</div>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   D. Technical Capabilities (2-Column Split Cards)
   -------------------------------------------------------------------------- */
function renderCapabilities(caps) {
  if (!caps) return;

  // Clinical Left Card
  const clinContainer = document.getElementById('cap-clinical-skills');
  if (clinContainer && caps.clinical?.skills) {
    clinContainer.innerHTML = caps.clinical.skills.map(s => `
      <div class="cap-skill-item">
        <div class="cap-skill-name"><i class="fa-solid fa-circle-check" style="color: var(--accent-blue); margin-right: 0.35rem;"></i> ${escapeHTML(s.name)}</div>
        <p class="cap-skill-desc">${escapeHTML(s.desc)}</p>
      </div>
    `).join('');
  }

  // Computational Right Card
  const compContainer = document.getElementById('cap-computational-skills');
  if (compContainer && caps.computational?.skills) {
    compContainer.innerHTML = caps.computational.skills.map(s => `
      <div class="cap-skill-item">
        <div class="cap-skill-name"><i class="fa-solid fa-circle-check" style="color: var(--primary); margin-right: 0.35rem;"></i> ${escapeHTML(s.name)}</div>
        <p class="cap-skill-desc">${escapeHTML(s.desc)}</p>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   E. Publications & Manuscripts with Live Search + Filter Tabs
   -------------------------------------------------------------------------- */
function renderPublications() {
  const container = document.getElementById('publications-entries-container');
  if (!container || !window.portfolioData?.publications) return;

  let pubs = window.portfolioData.publications;

  // 1. Filter by status pill
  if (currentPubFilter !== 'all') {
    pubs = pubs.filter(p => p.filter === currentPubFilter);
  }

  // 2. Real-time keyword search
  if (currentPubSearch.trim()) {
    const q = currentPubSearch.toLowerCase().trim();
    pubs = pubs.filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.authors && p.authors.toLowerCase().includes(q)) ||
      (p.venue && p.venue.toLowerCase().includes(q)) ||
      (p.doi && p.doi.toLowerCase().includes(q)) ||
      (p.abstract && p.abstract.toLowerCase().includes(q))
    );
  }

  if (pubs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
        No matching publications found. Try adjusting your search query or filters.
      </div>
    `;
    return;
  }

  container.innerHTML = pubs.map(p => `
    <div class="pub-entry-card">
      <div class="pub-year-col">
        <div class="pub-year-badge">${escapeHTML(p.year)}</div>
        <span class="pub-status-label">${escapeHTML(p.status)}</span>
      </div>
      <div class="pub-content-col">
        <div class="pub-title-row">
          <h4 class="pub-paper-title">${escapeHTML(p.title)}</h4>
          <div class="pub-badges-group">
            ${p.doiUrl ? `
              <a href="${escapeHTML(p.doiUrl)}" target="_blank" rel="noopener noreferrer" class="badge-doi">
                <i class="fa-solid fa-fingerprint"></i> DOI
              </a>
            ` : ''}
            ${p.scholarUrl ? `
              <a href="${escapeHTML(p.scholarUrl)}" target="_blank" rel="noopener noreferrer" class="badge-doi" style="background: var(--primary-light); color: var(--primary); border-color: var(--primary);">
                <i class="fa-brands fa-google-scholar"></i> Scholar
              </a>
            ` : ''}
          </div>
        </div>
        <div class="pub-authors-line">${escapeHTML(p.authors)}</div>
        <div class="pub-venue-line">${escapeHTML(p.venue)}</div>
        <p class="pub-abstract-text">${escapeHTML(p.abstract)}</p>
      </div>
    </div>
  `).join('');
}

function initPubSearchAndFilters() {
  const searchInput = document.getElementById('pub-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentPubSearch = e.target.value;
      renderPublications();
    });
  }

  const filterBtns = document.querySelectorAll('.pub-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPubFilter = btn.getAttribute('data-filter') || 'all';
      renderPublications();
    });
  });
}

/* --------------------------------------------------------------------------
   F. Training & Certification (3-Column Grid + Modals)
   -------------------------------------------------------------------------- */
function renderTrainings(trainings) {
  const container = document.getElementById('trainings-grid-container');
  if (!container || !trainings) return;

  container.innerHTML = trainings.map((t, index) => `
    <div class="training-card">
      <div class="training-header">
        <span class="training-badge">${escapeHTML(t.badge || 'Certificate')}</span>
        <span class="training-date">${escapeHTML(t.date)}</span>
      </div>
      <h4 class="training-title">${escapeHTML(t.title)}</h4>
      <div class="training-org"><i class="fa-solid fa-award"></i> ${escapeHTML(t.organization)}</div>
      <p class="training-summary">${escapeHTML(t.summary)}</p>
      <div class="training-footer-actions">
        <button class="btn-training-more" onclick="openTrainingDetailModal(${index})">
          ...more
        </button>
        <button class="btn-credentials" onclick="openCredentialsLightbox(${index})">
          <i class="fa-solid fa-certificate"></i> Credentials
        </button>
      </div>
    </div>
  `).join('');
}

function openTrainingDetailModal(index) {
  const t = window.portfolioData?.trainings[index];
  if (!t) return;

  const modal = document.getElementById('lightbox-modal');
  const title = document.getElementById('lightbox-title');
  const media = document.getElementById('lightbox-media-container');
  const caption = document.getElementById('lightbox-caption');

  title.textContent = t.title;
  media.innerHTML = `
    <div style="padding: 2.5rem; text-align: left; width: 100%; color: #fff;">
      <div style="font-size: 0.85rem; color: #14b8a6; font-weight: 700; margin-bottom: 0.5rem;">
        <i class="fa-solid fa-building-columns"></i> ${escapeHTML(t.issuer || t.organization)} • ${escapeHTML(t.date)}
      </div>
      <h3 style="font-size: 1.35rem; margin-bottom: 1rem; color: #fff;">${escapeHTML(t.title)}</h3>
      <p style="font-size: 0.98rem; line-height: 1.7; color: #cbd5e1;">${escapeHTML(t.fullDetails || t.summary)}</p>
    </div>
  `;
  caption.textContent = `Issued by: ${t.organization} (${t.date})`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openCredentialsLightbox(index) {
  const t = window.portfolioData?.trainings[index];
  if (!t) return;

  const modal = document.getElementById('lightbox-modal');
  const title = document.getElementById('lightbox-title');
  const media = document.getElementById('lightbox-media-container');
  const caption = document.getElementById('lightbox-caption');

  title.textContent = `${t.title} — Verified Credential`;
  media.innerHTML = `<img src="${escapeHTML(t.credentialUrl || 'Banner.png')}" alt="${escapeHTML(t.title)} Credential">`;
  caption.textContent = `Official verification for ${t.title} (${t.organization}).`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* --------------------------------------------------------------------------
   G. Auto-Moving Fieldwork & Gallery Carousel (Moving Images)
   -------------------------------------------------------------------------- */
function renderGalleryMarquee() {
  const container = document.getElementById('gallery-marquee-track');
  if (!container || !window.portfolioData?.gallery) return;

  let items = window.portfolioData.gallery;
  if (currentGalleryFilter !== 'all') {
    items = items.filter(g => g.categoryFilter === currentGalleryFilter);
  }

  // Duplicate for seamless infinite marquee loop
  const duplicated = [...items, ...items];

  container.innerHTML = duplicated.map((item, idx) => `
    <div class="gallery-photo-card" onclick="openGalleryItem(${idx % items.length})">
      <div class="gallery-photo-img-wrapper">
        <img src="${escapeHTML(item.thumbnail || item.mediaUrl)}" alt="${escapeHTML(item.title)}" class="gallery-photo-img">
        <span class="gallery-photo-badge">${escapeHTML(item.badge || item.category)}</span>
      </div>
      <div class="gallery-photo-info">
        <h4 class="gallery-photo-title">${escapeHTML(item.title)}</h4>
        <p class="gallery-photo-caption">${escapeHTML(item.caption)}</p>
      </div>
    </div>
  `).join('');
}

function initGalleryFilters() {
  const pills = document.querySelectorAll('.gallery-filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentGalleryFilter = pill.getAttribute('data-filter') || 'all';
      renderGalleryMarquee();
    });
  });
}

function openGalleryItem(index) {
  const item = window.portfolioData?.gallery[index];
  if (!item) return;

  const modal = document.getElementById('lightbox-modal');
  const title = document.getElementById('lightbox-title');
  const media = document.getElementById('lightbox-media-container');
  const caption = document.getElementById('lightbox-caption');

  title.textContent = item.title;
  caption.textContent = item.caption;

  if (item.type === 'document') {
    const drivePreview = item.mediaUrl.replace('/view?usp=drive_link', '/preview').replace('/view', '/preview');
    media.innerHTML = `<iframe src="${escapeHTML(drivePreview)}" allow="autoplay"></iframe>`;
  } else if (item.type === 'video') {
    media.innerHTML = `<iframe src="${escapeHTML(item.mediaUrl)}" frameborder="0" allowfullscreen></iframe>`;
  } else {
    media.innerHTML = `<img src="${escapeHTML(item.mediaUrl)}" alt="${escapeHTML(item.title)}">`;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* --------------------------------------------------------------------------
   H. Leadership & References
   -------------------------------------------------------------------------- */
function renderLeadership(leadership) {
  const container = document.getElementById('leadership-list-container');
  if (!container || !leadership) return;

  container.innerHTML = leadership.map(l => `
    <div class="leadership-card">
      <div class="lead-role">${escapeHTML(l.role)}</div>
      <div class="lead-org">${escapeHTML(l.organization)}</div>
      <div class="lead-period">${escapeHTML(l.period)}</div>
      <p class="lead-desc">${escapeHTML(l.details)}</p>
    </div>
  `).join('');
}

function renderReferences(refs) {
  const container = document.getElementById('references-grid-container');
  if (!container || !refs) return;

  container.innerHTML = refs.map(r => `
    <div class="reference-card">
      <div class="ref-name">${escapeHTML(r.name)}</div>
      <div class="ref-desig">${escapeHTML(r.designation)}</div>
      <div class="ref-inst">${escapeHTML(r.institution)}</div>
      <div class="ref-email"><i class="fa-solid fa-envelope"></i> ${escapeHTML(r.email)}</div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   I. Contact Links & Badges
   -------------------------------------------------------------------------- */
function renderContact(p) {
  const container = document.getElementById('contact-links-grid-container');
  if (!container || !p) return;

  const c = p.contact || {};
  const s = p.social || {};

  const links = [
    { name: 'Google Drive CV', icon: 'fa-solid fa-file-pdf', url: p.cvDriveUrl },
    { name: 'Primary Email', icon: 'fa-solid fa-envelope', url: `mailto:${c.emailPrimary}` },
    { name: 'University Email', icon: 'fa-solid fa-graduation-cap', url: `mailto:${c.emailUniversity}` },
    { name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', url: c.whatsapp },
    { name: 'Google Scholar', icon: 'fa-brands fa-google-scholar', url: s.scholar },
    { name: 'ORCID Profile', icon: 'fa-brands fa-orcid', url: s.orcid },
    { name: 'ResearchGate', icon: 'fa-brands fa-researchgate', url: s.researchgate },
    { name: 'OSF Rabies Protocol', icon: 'fa-solid fa-dna', url: s.osf },
    { name: 'GitHub Repositories', icon: 'fa-brands fa-github', url: s.github },
    { name: 'LinkedIn Profile', icon: 'fa-brands fa-linkedin', url: s.linkedin },
    { name: 'Facebook', icon: 'fa-brands fa-facebook', url: s.facebook },
    { name: 'Instagram', icon: 'fa-brands fa-instagram', url: s.instagram }
  ];

  container.innerHTML = links.map(l => `
    <a href="${escapeHTML(l.url)}" target="_blank" rel="noopener noreferrer" class="contact-pill-link">
      <i class="${escapeHTML(l.icon)}"></i>
      <span>${escapeHTML(l.name)}</span>
    </a>
  `).join('');
}

/* ==========================================================================
   3. NO-CODE GITHUB AUTO-SYNC CMS (100% RUNTIME BROWSER AUTH)
   ========================================================================== */
async function hashPasscode(passcode) {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function initAdminPortal() {
  const lockBtn = document.getElementById('admin-lock-btn');
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('admin-drawer-overlay');
  const closeBtn = document.getElementById('admin-close-btn');

  if (lockBtn) lockBtn.onclick = openAdminDrawer;
  if (closeBtn) closeBtn.onclick = closeAdminDrawer;
  if (overlay) overlay.onclick = closeAdminDrawer;

  const authForm = document.getElementById('admin-auth-form');
  if (authForm) authForm.onsubmit = handleAdminAuthSubmit;

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.onclick = handleAdminLogout;

  const publishBtn = document.getElementById('admin-publish-btn');
  if (publishBtn) publishBtn.onclick = handlePublishToGitHub;

  const fileInput = document.getElementById('admin-file-upload');
  if (fileInput) fileInput.onchange = handleFileUploadStaging;
}

function openAdminDrawer() {
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('admin-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    checkAdminAuthState();
  }
}

function closeAdminDrawer() {
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('admin-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function checkAdminAuthState() {
  const storedHash = localStorage.getItem('admin_passcode_hash');
  const storedToken = localStorage.getItem('admin_gh_token');
  const authGate = document.getElementById('admin-auth-gate');
  const mainManager = document.getElementById('admin-main-manager');

  if (storedHash && storedToken && sessionStorage.getItem('admin_unlocked') === 'true') {
    authGate.style.display = 'none';
    mainManager.style.display = 'flex';
    populateAdminForms();
  } else {
    authGate.style.display = 'flex';
    mainManager.style.display = 'none';
  }
}

async function handleAdminAuthSubmit(e) {
  e.preventDefault();
  const pass = document.getElementById('admin-passcode-input').value.trim();
  const token = document.getElementById('admin-token-input').value.trim();
  const storedHash = localStorage.getItem('admin_passcode_hash');

  if (!pass) return showToast('Please enter passcode.', 'error');
  const hashed = await hashPasscode(pass);

  if (!storedHash) {
    localStorage.setItem('admin_passcode_hash', hashed);
    showToast('Admin Passcode configured!', 'success');
  } else if (hashed !== storedHash) {
    return showToast('Incorrect passcode.', 'error');
  }

  if (token) {
    localStorage.setItem('admin_gh_token', token);
  } else if (!localStorage.getItem('admin_gh_token')) {
    return showToast('Please provide your GitHub Fine-Grained PAT.', 'error');
  }

  sessionStorage.setItem('admin_unlocked', 'true');
  showToast('Admin Manager Unlocked!', 'success');
  checkAdminAuthState();
}

function handleAdminLogout() {
  localStorage.removeItem('admin_gh_token');
  localStorage.removeItem('admin_passcode_hash');
  sessionStorage.removeItem('admin_unlocked');
  showToast('Credentials cleared.', 'success');
  checkAdminAuthState();
}

function populateAdminForms() {
  if (!window.portfolioData) return;
  const raw = document.getElementById('admin-raw-json');
  if (raw) raw.value = JSON.stringify(window.portfolioData, null, 2);
}

function handleFileUploadStaging(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result.split(',')[1];
    const isDoc = file.name.endsWith('.pdf') || file.type === 'application/pdf';
    const folder = isDoc ? 'assets/docs/' : 'assets/images/';
    const path = folder + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    stagedFileUploads.push({ path, content: base64, name: file.name });

    // Append to gallery
    window.portfolioData.gallery.unshift({
      id: 'gal-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      category: isDoc ? "Documents & Reports" : "Fieldwork & Snake Rescue",
      categoryFilter: isDoc ? "documents" : "fieldwork",
      type: isDoc ? "document" : "image",
      mediaUrl: path,
      thumbnail: isDoc ? "Banner.png" : path,
      caption: `Uploaded file: ${file.name}`,
      badge: isDoc ? "PDF Document" : "Fieldwork Media"
    });

    renderGalleryMarquee();
    populateAdminForms();
    showToast(`File staged: ${file.name}. Click "Save & Publish" to commit.`, 'success');
  };
  reader.readAsDataURL(file);
}

async function handlePublishToGitHub() {
  const token = localStorage.getItem('admin_gh_token');
  if (!token) return showToast('Missing GitHub PAT.', 'error');

  const btn = document.getElementById('admin-publish-btn');
  const status = document.getElementById('admin-publish-status');
  btn.disabled = true;
  status.textContent = 'Syncing...';

  try {
    const rawVal = document.getElementById('admin-raw-json').value;
    window.portfolioData = JSON.parse(rawVal);

    const owner = 'mdnafizurrahman8024';
    const repo = 'mdnafizurrahman8024.github.io';
    const branch = 'main';

    // Commit staged files
    for (const f of stagedFileUploads) {
      status.textContent = `Uploading ${f.name}...`;
      await uploadFileToGitHub(owner, repo, f.path, f.content, `upload: add ${f.name} via admin cms`, token);
    }
    stagedFileUploads = [];

    // Get SHA
    status.textContent = 'Fetching JSON SHA...';
    const jsonPath = 'data/portfolio-data.json';
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}?ref=${branch}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const curSha = getRes.ok ? (await getRes.json()).sha : null;

    // Commit JSON
    status.textContent = 'Publishing portfolio-data.json...';
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(window.portfolioData, null, 2))));
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'content(cms): update academic portfolio data',
        content: encoded,
        sha: curSha,
        branch
      })
    });

    if (!putRes.ok) throw new Error((await putRes.json()).message);

    status.textContent = 'Published successfully! 🎉';
    showToast('Live site updated on GitHub Pages!', 'success');
    renderAll();
  } catch (err) {
    status.textContent = 'Publish failed.';
    showToast('Publish error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function uploadFileToGitHub(owner, repo, path, base64, msg, token) {
  let sha = null;
  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (getRes.ok) sha = (await getRes.json()).sha;

  const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: msg, content: base64, sha })
  });

  if (!putRes.ok) throw new Error(`Upload error on ${path}`);
}

/* ==========================================================================
   4. UTILITIES & DOM EVENT LISTENERS
   ========================================================================== */
function showToast(msg, type = 'success') {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}"></i> <span>${escapeHTML(msg)}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3500);
}

function escapeHTML(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadData();
  initPubSearchAndFilters();
  initGalleryFilters();
  initAdminPortal();

  // Mobile menu
  const mBtn = document.getElementById('mobile-menu-btn');
  const mMenu = document.getElementById('nav-menu');
  if (mBtn && mMenu) {
    mBtn.onclick = () => mMenu.classList.toggle('active');
    document.querySelectorAll('.nav-pill').forEach(l => {
      l.addEventListener('click', () => mMenu.classList.remove('active'));
    });
  }

  // Lightbox close
  const lbClose = document.getElementById('lightbox-close-btn');
  const lbModal = document.getElementById('lightbox-modal');
  if (lbClose) {
    lbClose.onclick = () => {
      lbModal.classList.remove('active');
      document.body.style.overflow = '';
    };
  }
  if (lbModal) {
    lbModal.onclick = (e) => {
      if (e.target === lbModal) {
        lbModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lbModal) lbModal.classList.remove('active');
      closeAdminDrawer();
      document.body.style.overflow = '';
    }
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
      if (window.scrollY > 30) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  });
});
