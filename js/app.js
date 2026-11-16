/**
 * MD. NAFIZUR RAHMAN — ACADEMIC & RESEARCH PORTFOLIO
 * Core JavaScript Engine: Dynamic Rendering, Themes, Lightbox & No-Code GitHub Sync CMS
 */

'use strict';

// Global Data Store
window.portfolioData = null;
let currentSoftwareFilter = 'all';
let currentGalleryFilter = 'all';
let currentResearchFilter = 'all';
let stagedFileUploads = []; // Files to be committed to GitHub on publish

/* ==========================================================================
   1. THEME CONTROLLER (DEFAULT: DARK MODE)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  toggleBtn.innerHTML = theme === 'dark' 
    ? '<i class="fa-solid fa-sun"></i>' 
    : '<i class="fa-solid fa-moon"></i>';
  toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
}

/* ==========================================================================
   2. DATA LOADER & RENDERING ENGINE
   ========================================================================== */
async function loadPortfolioData() {
  try {
    const response = await fetch('data/portfolio-data.json?v=' + Date.now());
    if (!response.ok) throw new Error('Failed to load portfolio-data.json');
    window.portfolioData = await response.json();
    renderAllSections();
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    showToast('Failed to load portfolio data. Check console.', 'error');
  }
}

function renderAllSections() {
  if (!window.portfolioData) return;
  const data = window.portfolioData;

  renderHero(data.profile);
  renderAnnouncements(data.announcements);
  renderAbout(data.about, data.educationTimeline);
  renderSkills(data.skills);
  renderResearch(data.researchProjects);
  renderPublications(data.publicationsAndConferences);
  renderSoftware(data.softwareProjects);
  renderGallery(data.gallery);
  renderAwardsAndLeadership(data.awardsAndLeadership);
  renderContact(data.profile);
}

/* --------------------------------------------------------------------------
   Render Hero & Banner
   -------------------------------------------------------------------------- */
function renderHero(profile) {
  if (!profile) return;
  
  // Banner Image
  const bannerImg = document.getElementById('hero-banner-img');
  if (bannerImg) {
    bannerImg.src = profile.banner || 'Banner.png';
  }

  // Avatar Image
  const avatarImg = document.getElementById('hero-avatar-img');
  if (avatarImg) {
    avatarImg.src = profile.avatar || 'assets/images/profile-nafiz.png';
  }

  // Salutation & Details
  const greetingEl = document.getElementById('hero-greeting');
  if (greetingEl) greetingEl.textContent = profile.salutation || "Hi there, I'm Md. Nafizur Rahman! 👋";

  const designationEl = document.getElementById('hero-designation');
  if (designationEl) designationEl.textContent = profile.designation;

  const affiliationEl = document.getElementById('hero-affiliation');
  if (affiliationEl) {
    affiliationEl.innerHTML = `<i class="fa-solid fa-building-columns"></i> ${profile.institution}`;
  }

  const mottoEl = document.getElementById('hero-motto');
  if (mottoEl) {
    mottoEl.innerHTML = `<i class="fa-solid fa-quote-left"></i> ${profile.motto || 'Knowledge. Investigation. Practice. Impact.'}`;
  }

  // Hero CTAs
  const cvBtn = document.getElementById('hero-cv-btn');
  if (cvBtn) {
    cvBtn.href = profile.cvDriveUrl;
  }
  
  const navCvBtn = document.getElementById('nav-quick-cv');
  if (navCvBtn) {
    navCvBtn.href = profile.cvDriveUrl;
  }
}

/* --------------------------------------------------------------------------
   Render Announcements Banner
   -------------------------------------------------------------------------- */
function renderAnnouncements(announcements) {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  if (!announcements || announcements.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = announcements.map(ann => `
    <div class="announcement-item">
      <span class="announcement-badge">${escapeHTML(ann.badge || 'News')}</span>
      <span class="announcement-text">${escapeHTML(ann.text)}</span>
      ${ann.link ? `
        <a href="${escapeHTML(ann.link)}" target="_blank" rel="noopener noreferrer" class="announcement-link">
          Explore <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      ` : ''}
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Render About & Timeline
   -------------------------------------------------------------------------- */
function renderAbout(about, timeline) {
  if (!about) return;

  const leadEl = document.getElementById('bio-lead');
  if (leadEl) leadEl.textContent = about.lead || '';

  const paragraphsEl = document.getElementById('bio-paragraphs');
  if (paragraphsEl && about.bioParagraphs) {
    paragraphsEl.innerHTML = about.bioParagraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
  }

  // Focus Pillars
  const pillarsContainer = document.getElementById('focus-pillars-container');
  if (pillarsContainer && about.highlights) {
    pillarsContainer.innerHTML = about.highlights.map(h => `
      <div class="pillar-card">
        <div class="pillar-icon"><i class="${escapeHTML(h.icon || 'fa-solid fa-star')}"></i></div>
        <h4 class="pillar-title">${escapeHTML(h.title)}</h4>
        <p class="pillar-desc">${escapeHTML(h.description)}</p>
      </div>
    `).join('');
  }

  // Timeline
  const timelineContainer = document.getElementById('timeline-container');
  if (timelineContainer && timeline) {
    timelineContainer.innerHTML = timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <span class="timeline-badge">${escapeHTML(item.badge || 'Academic')}</span>
        <h4 class="timeline-degree">${escapeHTML(item.degree)}</h4>
        <div class="timeline-institution">${escapeHTML(item.institution)}</div>
        <div class="timeline-period">${escapeHTML(item.period)}</div>
        <p class="timeline-details">${escapeHTML(item.details)}</p>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   Render Skills Grid
   -------------------------------------------------------------------------- */
function renderSkills(skills) {
  if (!skills) return;

  const renderPillList = (items) => (items || []).map(s => `<li class="skill-pill">${escapeHTML(s)}</li>`).join('');

  const elResearch = document.getElementById('skills-research-list');
  if (elResearch) elResearch.innerHTML = renderPillList(skills.research);

  const elLab = document.getElementById('skills-lab-list');
  if (elLab) elLab.innerHTML = renderPillList(skills.laboratory);

  const elBio = document.getElementById('skills-bio-list');
  if (elBio) elBio.innerHTML = renderPillList(skills.bioinformatics);

  const elSoftware = document.getElementById('skills-software-list');
  if (elSoftware) elSoftware.innerHTML = renderPillList(skills.software);
}

/* --------------------------------------------------------------------------
   Render Research Projects
   -------------------------------------------------------------------------- */
function renderResearch(projects) {
  const container = document.getElementById('research-projects-container');
  if (!container || !projects) return;

  container.innerHTML = projects.map(proj => `
    <div class="glass-card research-card">
      <div class="research-header-bar">
        <span class="research-category-tag">${escapeHTML(proj.category || 'Research')}</span>
        <span class="research-status-badge"><i class="fa-solid fa-circle-check"></i> ${escapeHTML(proj.status || 'Active')}</span>
      </div>
      <h3 class="research-title">${escapeHTML(proj.title)}</h3>
      <div class="research-meta">
        <span class="research-meta-item"><i class="fa-solid fa-user-tag"></i> ${escapeHTML(proj.role || 'Investigator')}</span>
        <span class="research-meta-item"><i class="fa-solid fa-calendar-days"></i> ${escapeHTML(proj.period || '2024–Present')}</span>
      </div>
      <p class="research-summary">${escapeHTML(proj.summary)}</p>
      
      ${proj.keyArtefacts && proj.keyArtefacts.length ? `
        <div class="research-artefacts-box">
          <div class="artefacts-title"><i class="fa-solid fa-flask"></i> Key Artefacts & Findings</div>
          <ul class="artefacts-list">
            ${proj.keyArtefacts.map(a => `<li>${escapeHTML(a)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <ul class="research-tags-list">
        ${(proj.tags || []).map(t => `<li class="research-tag">#${escapeHTML(t)}</li>`).join('')}
      </ul>

      <div class="research-actions">
        ${proj.doiUrl ? `
          <a href="${escapeHTML(proj.doiUrl)}" target="_blank" rel="noopener noreferrer" class="btn-doi">
            <i class="fa-solid fa-fingerprint"></i> DOI: ${escapeHTML(proj.doi)}
          </a>
        ` : ''}
        ${proj.scholarUrl ? `
          <a href="${escapeHTML(proj.scholarUrl)}" target="_blank" rel="noopener noreferrer" class="btn-outline">
            <i class="fa-brands fa-google-scholar"></i> Google Scholar
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Render Publications, Conferences & Participations
   -------------------------------------------------------------------------- */
function renderPublications(pubsData) {
  if (!pubsData) return;

  // Journal Articles
  const journalContainer = document.getElementById('journal-articles-list');
  if (journalContainer && pubsData.journalArticles) {
    journalContainer.innerHTML = pubsData.journalArticles.map(art => `
      <div class="pub-item">
        <span class="pub-badge">${escapeHTML(art.badge || art.status || 'Published')}</span>
        <h4 class="pub-title">${escapeHTML(art.title)}</h4>
        <div class="pub-authors">${escapeHTML(art.authors)}</div>
        <div class="pub-venue">${escapeHTML(art.journal)} (${escapeHTML(art.year)})</div>
        ${art.link ? `
          <a href="${escapeHTML(art.link)}" target="_blank" rel="noopener noreferrer" class="pub-link">
            View Publication <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        ` : ''}
      </div>
    `).join('');
  }

  // Conference Papers
  const confContainer = document.getElementById('conference-papers-list');
  if (confContainer && pubsData.conferencePapers) {
    confContainer.innerHTML = pubsData.conferencePapers.map(conf => `
      <div class="pub-item">
        <span class="pub-badge">${escapeHTML(conf.badge || 'Conference Paper')}</span>
        <h4 class="pub-title">${escapeHTML(conf.title)}</h4>
        <div class="pub-authors">${escapeHTML(conf.authors)}</div>
        <div class="pub-venue">${escapeHTML(conf.conference)} • ${escapeHTML(conf.location)}</div>
        ${conf.link ? `
          <a href="${escapeHTML(conf.link)}" target="_blank" rel="noopener noreferrer" class="pub-link">
            Conference Details <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        ` : ''}
      </div>
    `).join('');
  }

  // Participations & Workshops
  const partContainer = document.getElementById('participations-list');
  if (partContainer && pubsData.participations) {
    partContainer.innerHTML = pubsData.participations.map(p => `
      <div class="pub-item">
        <span class="pub-badge">${escapeHTML(p.badge || 'Certificate')}</span>
        <h4 class="pub-title">${escapeHTML(p.title)}</h4>
        <div class="pub-authors">${escapeHTML(p.issuer)}</div>
        <div class="pub-venue">${escapeHTML(p.date)}</div>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   Render Software & Digital Platforms
   -------------------------------------------------------------------------- */
function renderSoftware(projects) {
  const container = document.getElementById('software-grid-container');
  if (!container || !projects) return;

  const filtered = currentSoftwareFilter === 'all'
    ? projects
    : projects.filter(p => p.categoryFilter === currentSoftwareFilter);

  container.innerHTML = filtered.map(item => `
    <div class="glass-card software-card ${item.featured ? 'featured' : ''}">
      <div class="software-logo-box">
        ${item.logo ? `
          <img src="${escapeHTML(item.logo)}" alt="${escapeHTML(item.title)} logo">
        ` : `
          <i class="fa-solid fa-code-branch software-logo-placeholder"></i>
        `}
      </div>
      <span class="software-category">${escapeHTML(item.category)}</span>
      <h3 class="software-title">${escapeHTML(item.title)}</h3>
      <div class="software-tagline">${escapeHTML(item.tagline)}</div>
      <p class="software-desc">${escapeHTML(item.description)}</p>

      <ul class="tech-stack-list">
        ${(item.techStack || []).map(t => `<li class="tech-badge">${escapeHTML(t)}</li>`).join('')}
      </ul>

      <div class="software-actions">
        ${item.githubUrl ? `
          <a href="${escapeHTML(item.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn-repo">
            <i class="fa-brands fa-github"></i> Repository
          </a>
        ` : `<span></span>`}
        ${item.stats ? `<span class="software-metric-pill">${escapeHTML(item.stats)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Render Fieldwork, Wildlife & Credentials Gallery
   -------------------------------------------------------------------------- */
function renderGallery(galleryItems) {
  const container = document.getElementById('gallery-grid-container');
  if (!container || !galleryItems) return;

  const filtered = currentGalleryFilter === 'all'
    ? galleryItems
    : galleryItems.filter(g => g.categoryFilter === currentGalleryFilter);

  container.innerHTML = filtered.map((item, index) => `
    <div class="gallery-card" onclick="openLightbox(${index})">
      <div class="gallery-media-wrapper">
        <img src="${escapeHTML(item.thumbnail || item.mediaUrl)}" alt="${escapeHTML(item.title)}" class="gallery-media-img">
        <span class="gallery-type-badge">
          <i class="${item.type === 'document' ? 'fa-solid fa-file-pdf' : item.type === 'video' ? 'fa-solid fa-play' : 'fa-solid fa-image'}"></i>
          ${escapeHTML(item.badge || item.type)}
        </span>
        <div class="gallery-overlay-btn">
          <i class="fa-solid fa-expand"></i> Preview
        </div>
      </div>
      <div class="gallery-content">
        <div class="gallery-header-meta">
          <span class="gallery-category-tag">${escapeHTML(item.category)}</span>
          <span class="gallery-date">${escapeHTML(item.date || '')}</span>
        </div>
        <h4 class="gallery-title">${escapeHTML(item.title)}</h4>
        <p class="gallery-caption">${escapeHTML(item.caption || '')}</p>
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Render Awards & Leadership
   -------------------------------------------------------------------------- */
function renderAwardsAndLeadership(data) {
  if (!data) return;

  const awardsContainer = document.getElementById('awards-list');
  if (awardsContainer && data.awards) {
    awardsContainer.innerHTML = data.awards.map(a => `
      <div class="pub-item">
        <span class="pub-badge">Award</span>
        <h4 class="pub-title">${escapeHTML(a.title)}</h4>
        <div class="pub-authors">${escapeHTML(a.organization)} (${escapeHTML(a.date)})</div>
        <div class="pub-venue">${escapeHTML(a.description || '')}</div>
      </div>
    `).join('');
  }

  const leadershipContainer = document.getElementById('leadership-list');
  if (leadershipContainer && data.leadership) {
    leadershipContainer.innerHTML = data.leadership.map(l => `
      <div class="pub-item">
        <span class="pub-badge">${escapeHTML(l.role)}</span>
        <h4 class="pub-title">${escapeHTML(l.organization)}</h4>
        <div class="pub-authors">${escapeHTML(l.period)}</div>
        <div class="pub-venue">${escapeHTML(l.details || '')}</div>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   Render Connect With Me Section (Verified Clickable Hyperlinks)
   -------------------------------------------------------------------------- */
function renderContact(profile) {
  const container = document.getElementById('contact-grid-container');
  if (!container || !profile) return;

  const c = profile.contact || {};
  const s = profile.social || {};

  const contacts = [
    {
      label: 'Direct CV Access',
      value: 'Google Drive Online View',
      link: profile.cvDriveUrl,
      icon: 'fa-solid fa-file-pdf',
      hint: 'Instant high-res preview'
    },
    {
      label: 'Primary Email',
      value: c.emailPrimary,
      link: `mailto:${c.emailPrimary}`,
      icon: 'fa-solid fa-envelope',
      hint: 'Click to compose email'
    },
    {
      label: 'University Email',
      value: c.emailUniversity,
      link: `mailto:${c.emailUniversity}`,
      icon: 'fa-solid fa-graduation-cap',
      hint: 'Academic correspondence'
    },
    {
      label: 'Cell / WhatsApp',
      value: c.phone,
      link: c.whatsapp,
      icon: 'fa-brands fa-whatsapp',
      hint: 'Direct chat & voice'
    },
    {
      label: 'Google Scholar',
      value: 'Md. Nafizur Rahman',
      link: s.scholar,
      icon: 'fa-brands fa-google-scholar',
      hint: 'Citations & publication index'
    },
    {
      label: 'ORCID Identifier',
      value: '0009-0008-3918-187X',
      link: s.orcid,
      icon: 'fa-brands fa-orcid',
      hint: 'Verified researcher profile'
    },
    {
      label: 'ResearchGate',
      value: 'Md. Rahman',
      link: s.researchgate,
      icon: 'fa-brands fa-researchgate',
      hint: 'Preprints & network'
    },
    {
      label: 'Open Science Framework',
      value: 'Rabies Nanovaccines Protocol',
      link: s.osf,
      icon: 'fa-solid fa-dna',
      hint: 'DOI: 10.17605/OSF.IO/9AQS3'
    },
    {
      label: 'GitHub Profile',
      value: 'mdnafizurrahman8024',
      link: s.github,
      icon: 'fa-brands fa-github',
      hint: 'Software & bioinformatics repos'
    },
    {
      label: 'LinkedIn',
      value: 'md-nafizur-rahman-ru',
      link: s.linkedin,
      icon: 'fa-brands fa-linkedin',
      hint: 'Professional network'
    },
    {
      label: 'Facebook',
      value: 'mdnafizurrahman8024',
      link: s.facebook,
      icon: 'fa-brands fa-facebook',
      hint: 'Public profile'
    },
    {
      label: 'Instagram',
      value: '@nafizun_8024',
      link: s.instagram,
      icon: 'fa-brands fa-instagram',
      hint: 'Fieldwork & photography'
    },
    {
      label: 'Google Sites',
      value: 'Original Academic Portfolio',
      link: profile.googleSitesUrl,
      icon: 'fa-solid fa-globe',
      hint: 'Previous web presence'
    }
  ];

  container.innerHTML = contacts.map(item => `
    <a href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer" class="glass-card contact-card">
      <div class="contact-icon-box">
        <i class="${escapeHTML(item.icon)}"></i>
      </div>
      <span class="contact-label">${escapeHTML(item.label)}</span>
      <span class="contact-value">${escapeHTML(item.value)}</span>
      <span class="contact-hint">
        ${escapeHTML(item.hint)} <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </span>
    </a>
  `).join('');
}

/* ==========================================================================
   3. LIGHTBOX PREVIEW MODAL (PHOTOS, VIDEOS, PDFS)
   ========================================================================== */
function openLightbox(index) {
  if (!window.portfolioData || !window.portfolioData.gallery) return;
  const filtered = currentGalleryFilter === 'all'
    ? window.portfolioData.gallery
    : window.portfolioData.gallery.filter(g => g.categoryFilter === currentGalleryFilter);
  
  const item = filtered[index];
  if (!item) return;

  const modal = document.getElementById('lightbox-modal');
  const titleEl = document.getElementById('lightbox-title');
  const mediaContainer = document.getElementById('lightbox-media-container');
  const captionEl = document.getElementById('lightbox-caption');
  const actionsEl = document.getElementById('lightbox-actions');

  titleEl.textContent = item.title;
  captionEl.textContent = item.caption || '';

  // Render media based on type
  if (item.type === 'image') {
    mediaContainer.innerHTML = `<img src="${escapeHTML(item.mediaUrl)}" alt="${escapeHTML(item.title)}">`;
    actionsEl.innerHTML = `
      <a href="${escapeHTML(item.mediaUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary">
        <i class="fa-solid fa-download"></i> View Full Image
      </a>
    `;
  } else if (item.type === 'document') {
    // If Google Drive link, provide preview iframe or download button
    const drivePreviewUrl = item.mediaUrl.replace('/view?usp=drive_link', '/preview').replace('/view', '/preview');
    mediaContainer.innerHTML = `
      <iframe src="${escapeHTML(drivePreviewUrl)}" allow="autoplay"></iframe>
    `;
    actionsEl.innerHTML = `
      <a href="${escapeHTML(item.mediaUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary">
        <i class="fa-solid fa-file-pdf"></i> Open / Download PDF
      </a>
    `;
  } else if (item.type === 'video') {
    mediaContainer.innerHTML = `
      <iframe src="${escapeHTML(item.mediaUrl)}" frameborder="0" allowfullscreen></iframe>
    `;
    actionsEl.innerHTML = '';
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    document.getElementById('lightbox-media-container').innerHTML = '';
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   4. FILTER TABS CONTROLLERS
   ========================================================================== */
function initFilters() {
  // Software Tabs
  const softBtns = document.querySelectorAll('.software-filter-btn');
  softBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      softBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSoftwareFilter = btn.getAttribute('data-filter') || 'all';
      if (window.portfolioData) renderSoftware(window.portfolioData.softwareProjects);
    });
  });

  // Gallery Tabs
  const galBtns = document.querySelectorAll('.gallery-filter-btn');
  galBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGalleryFilter = btn.getAttribute('data-filter') || 'all';
      if (window.portfolioData) renderGallery(window.portfolioData.gallery);
    });
  });
}

/* ==========================================================================
   5. ADMIN CONTENT MANAGER (100% CLIENT-SIDE RUNTIME AUTH & GITHUB AUTO-SYNC)
   ========================================================================== */

/**
 * Web Crypto SHA-256 Hasher for Passcode
 */
async function hashPasscode(passcode) {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function initAdminPortal() {
  const lockBtn = document.getElementById('admin-lock-btn');
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('admin-drawer-overlay');
  const closeBtn = document.getElementById('admin-close-btn');

  if (lockBtn) {
    lockBtn.addEventListener('click', openAdminDrawer);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAdminDrawer);
  }
  if (overlay) {
    overlay.addEventListener('click', closeAdminDrawer);
  }

  // Admin Auth Gate Form Handlers
  const authForm = document.getElementById('admin-auth-form');
  if (authForm) {
    authForm.addEventListener('submit', handleAdminAuthSubmit);
  }

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleAdminLogout);
  }

  // Tab switching inside admin drawer
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      adminTabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetPane = document.getElementById(btn.getAttribute('data-tab'));
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Save & Publish Button
  const publishBtn = document.getElementById('admin-publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', handlePublishToGitHub);
  }

  // File Upload Handlers (Images & Docs)
  const fileInput = document.getElementById('admin-file-upload');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUploadStaging);
  }
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
  const authBox = document.getElementById('admin-auth-gate');
  const mainManager = document.getElementById('admin-main-manager');
  const passcodeHint = document.getElementById('admin-passcode-hint');

  if (!storedHash) {
    // First time setup
    if (passcodeHint) passcodeHint.textContent = 'Setup Mode: Enter a new personal passcode to secure your portal.';
  } else {
    if (passcodeHint) passcodeHint.textContent = 'Enter your admin passcode and GitHub token to unlock.';
  }

  if (storedHash && storedToken && sessionStorage.getItem('admin_session_unlocked') === 'true') {
    authBox.style.display = 'none';
    mainManager.style.display = 'flex';
    populateAdminForms();
  } else {
    authBox.style.display = 'flex';
    mainManager.style.display = 'none';
  }
}

async function handleAdminAuthSubmit(e) {
  e.preventDefault();
  const passcodeInput = document.getElementById('admin-passcode-input').value.trim();
  const tokenInput = document.getElementById('admin-token-input').value.trim();
  const storedHash = localStorage.getItem('admin_passcode_hash');

  if (!passcodeInput) {
    showToast('Please enter an admin passcode.', 'error');
    return;
  }

  const enteredHash = await hashPasscode(passcodeInput);

  if (!storedHash) {
    // Setup new passcode
    localStorage.setItem('admin_passcode_hash', enteredHash);
    showToast('Admin Passcode configured successfully!', 'success');
  } else if (enteredHash !== storedHash) {
    showToast('Incorrect passcode. Authentication failed.', 'error');
    return;
  }

  // Save PAT to localStorage strictly (never committed to code)
  if (tokenInput) {
    localStorage.setItem('admin_gh_token', tokenInput);
  } else if (!localStorage.getItem('admin_gh_token')) {
    showToast('Please enter your GitHub Personal Access Token.', 'error');
    return;
  }

  sessionStorage.setItem('admin_session_unlocked', 'true');
  showToast('Admin Portal Unlocked!', 'success');
  checkAdminAuthState();
}

function handleAdminLogout() {
  localStorage.removeItem('admin_gh_token');
  localStorage.removeItem('admin_passcode_hash');
  sessionStorage.removeItem('admin_session_unlocked');
  document.getElementById('admin-passcode-input').value = '';
  document.getElementById('admin-token-input').value = '';
  showToast('Logged out and credentials cleared from browser storage.', 'success');
  checkAdminAuthState();
}

/* --------------------------------------------------------------------------
   Populate Admin Forms with Current JSON Data
   -------------------------------------------------------------------------- */
function populateAdminForms() {
  if (!window.portfolioData) return;
  const p = window.portfolioData.profile || {};
  const a = window.portfolioData.about || {};

  // Profile Form
  setValue('admin-field-name', p.name);
  setValue('admin-field-salutation', p.salutation);
  setValue('admin-field-designation', p.designation);
  setValue('admin-field-institution', p.institution);
  setValue('admin-field-motto', p.motto);
  setValue('admin-field-cv-url', p.cvDriveUrl);
  setValue('admin-field-email-primary', p.contact?.emailPrimary);
  setValue('admin-field-email-uni', p.contact?.emailUniversity);
  setValue('admin-field-phone', p.contact?.phone);
  setValue('admin-field-scholar', p.social?.scholar);
  setValue('admin-field-orcid', p.social?.orcid);
  setValue('admin-field-github', p.social?.github);

  // Bio Form
  setValue('admin-field-bio-lead', a.lead);
  setValue('admin-field-bio-paragraphs', (a.bioParagraphs || []).join('\n\n'));

  // Raw JSON Editor
  const rawJsonEl = document.getElementById('admin-raw-json');
  if (rawJsonEl) {
    rawJsonEl.value = JSON.stringify(window.portfolioData, null, 2);
  }

  renderAdminResearchList();
  renderAdminSoftwareList();
  renderAdminGalleryList();
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function renderAdminResearchList() {
  const list = document.getElementById('admin-research-list');
  if (!list || !window.portfolioData?.researchProjects) return;

  list.innerHTML = window.portfolioData.researchProjects.map((p, idx) => `
    <div class="admin-item-row">
      <div class="admin-item-info">
        <div class="admin-item-title">${escapeHTML(p.title)}</div>
        <div class="admin-item-sub">${escapeHTML(p.category)} • ${escapeHTML(p.status)}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-icon danger" onclick="deleteAdminItem('researchProjects', ${idx})" title="Delete Project">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function renderAdminSoftwareList() {
  const list = document.getElementById('admin-software-list');
  if (!list || !window.portfolioData?.softwareProjects) return;

  list.innerHTML = window.portfolioData.softwareProjects.map((s, idx) => `
    <div class="admin-item-row">
      <div class="admin-item-info">
        <div class="admin-item-title">${escapeHTML(s.title)}</div>
        <div class="admin-item-sub">${escapeHTML(s.category)}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-icon danger" onclick="deleteAdminItem('softwareProjects', ${idx})" title="Delete Platform">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function renderAdminGalleryList() {
  const list = document.getElementById('admin-gallery-list');
  if (!list || !window.portfolioData?.gallery) return;

  list.innerHTML = window.portfolioData.gallery.map((g, idx) => `
    <div class="admin-item-row">
      <div class="admin-item-info">
        <div class="admin-item-title">${escapeHTML(g.title)}</div>
        <div class="admin-item-sub">${escapeHTML(g.category)} • ${escapeHTML(g.type)}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-icon danger" onclick="deleteAdminItem('gallery', ${idx})" title="Delete Item">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.deleteAdminItem = function(collection, index) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  window.portfolioData[collection].splice(index, 1);
  if (collection === 'researchProjects') renderAdminResearchList();
  if (collection === 'softwareProjects') renderAdminSoftwareList();
  if (collection === 'gallery') renderAdminGalleryList();
  showToast('Item deleted locally. Click "Save & Publish" to sync to GitHub.', 'success');
};

/* --------------------------------------------------------------------------
   File Upload Staging (Direct Image / PDF uploads)
   -------------------------------------------------------------------------- */
function handleFileUploadStaging(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64Content = evt.target.result.split(',')[1];
    const isDoc = file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx');
    const folder = isDoc ? 'assets/docs/' : 'assets/images/';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = folder + sanitizedName;

    stagedFileUploads.push({
      path: fullPath,
      content: base64Content,
      name: file.name
    });

    // Auto-create gallery item
    const newGalleryItem = {
      id: 'gal-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      category: isDoc ? "Documents & Reports" : "Certificates & Awards",
      categoryFilter: isDoc ? "documents" : "certificates",
      type: isDoc ? "document" : "image",
      mediaUrl: fullPath,
      thumbnail: isDoc ? "Banner.png" : fullPath,
      caption: `Uploaded via Admin Content Manager: ${file.name}`,
      date: new Date().getFullYear().toString(),
      badge: isDoc ? "Uploaded PDF" : "Uploaded Image"
    };

    window.portfolioData.gallery.unshift(newGalleryItem);
    renderAdminGalleryList();
    showToast(`File staged: ${file.name}. Click "Save & Publish" to push to GitHub.`, 'success');
  };

  reader.readAsDataURL(file);
}

/* --------------------------------------------------------------------------
   Save & Publish to GitHub via Contents API
   -------------------------------------------------------------------------- */
async function handlePublishToGitHub() {
  const token = localStorage.getItem('admin_gh_token');
  if (!token) {
    showToast('Missing GitHub Personal Access Token. Please enter it in the auth screen.', 'error');
    return;
  }

  const publishBtn = document.getElementById('admin-publish-btn');
  const statusEl = document.getElementById('admin-publish-status');
  publishBtn.disabled = true;
  statusEl.textContent = 'Collecting updates...';

  try {
    // 1. Synchronize form inputs into window.portfolioData
    syncFormInputsToData();

    // 2. Commit any staged file uploads to GitHub first
    const owner = 'mdnafizurrahman8024';
    const repo = 'mdnafizurrahman8024.github.io';
    const branch = 'main';

    for (const file of stagedFileUploads) {
      statusEl.textContent = `Uploading ${file.name}...`;
      await uploadFileToGitHub(owner, repo, file.path, file.content, `upload: add ${file.name} via admin cms`, token);
    }
    stagedFileUploads = []; // Clear staged files

    // 3. Fetch current SHA of data/portfolio-data.json
    statusEl.textContent = 'Verifying GitHub repository state...';
    const jsonPath = 'data/portfolio-data.json';
    const fileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}?ref=${branch}`;
    
    let sha = null;
    const getRes = await fetch(fileInfoUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
      }
    });

    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // 4. PUT updated data/portfolio-data.json
    statusEl.textContent = 'Committing content updates to main...';
    const updatedJsonString = JSON.stringify(window.portfolioData, null, 2);
    const encodedJson = btoa(unescape(encodeURIComponent(updatedJsonString)));

    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'content(cms): update portfolio data via admin content manager',
        content: encodedJson,
        sha: sha,
        branch: branch
      })
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || 'GitHub commit failed');
    }

    statusEl.textContent = 'Published to GitHub Pages successfully! 🎉';
    showToast('Changes committed directly to main! GitHub Pages will update in 1-2 minutes.', 'success');
    renderAllSections();
  } catch (error) {
    console.error('Publish error:', error);
    statusEl.textContent = 'Error publishing changes.';
    showToast('Publish failed: ' + error.message, 'error');
  } finally {
    publishBtn.disabled = false;
  }
}

async function uploadFileToGitHub(owner, repo, path, base64Content, commitMessage, token) {
  // Check if file already exists to get SHA
  let sha = null;
  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      sha: sha
    })
  });

  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(`Failed to upload ${path}: ${err.message}`);
  }
}

function syncFormInputsToData() {
  // Check if user edited via Raw JSON tab
  const activeTab = document.querySelector('.admin-tab-btn.active');
  if (activeTab && activeTab.getAttribute('data-tab') === 'admin-tab-json') {
    const rawVal = document.getElementById('admin-raw-json').value;
    try {
      window.portfolioData = JSON.parse(rawVal);
      return;
    } catch (e) {
      throw new Error('Invalid JSON format in Raw Editor. Please fix syntax errors.');
    }
  }

  // Otherwise sync from individual form fields
  const p = window.portfolioData.profile;
  p.name = getValue('admin-field-name', p.name);
  p.salutation = getValue('admin-field-salutation', p.salutation);
  p.designation = getValue('admin-field-designation', p.designation);
  p.institution = getValue('admin-field-institution', p.institution);
  p.motto = getValue('admin-field-motto', p.motto);
  p.cvDriveUrl = getValue('admin-field-cv-url', p.cvDriveUrl);
  
  if (!p.contact) p.contact = {};
  p.contact.emailPrimary = getValue('admin-field-email-primary', p.contact.emailPrimary);
  p.contact.emailUniversity = getValue('admin-field-email-uni', p.contact.emailUniversity);
  p.contact.phone = getValue('admin-field-phone', p.contact.phone);

  if (!p.social) p.social = {};
  p.social.scholar = getValue('admin-field-scholar', p.social.scholar);
  p.social.orcid = getValue('admin-field-orcid', p.social.orcid);
  p.social.github = getValue('admin-field-github', p.social.github);

  const a = window.portfolioData.about;
  a.lead = getValue('admin-field-bio-lead', a.lead);
  const rawParas = getValue('admin-field-bio-paragraphs', '');
  if (rawParas) {
    a.bioParagraphs = rawParas.split('\n\n').map(s => s.trim()).filter(Boolean);
  }
}

function getValue(id, defaultVal) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : defaultVal;
}

/* ==========================================================================
   6. UI UTILITIES & TOASTS
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}"></i>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   7. INITIALIZATION ON DOM READY
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadPortfolioData();
  initFilters();
  initAdminPortal();

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Lightbox close listeners
  const closeLbBtn = document.getElementById('lightbox-close-btn');
  if (closeLbBtn) closeLbBtn.addEventListener('click', closeLightbox);

  const lbModal = document.getElementById('lightbox-modal');
  if (lbModal) {
    lbModal.addEventListener('click', (e) => {
      if (e.target === lbModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeAdminDrawer();
    }
  });

  // Navbar scroll background effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });
});
