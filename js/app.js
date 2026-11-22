/**
 * MD. NAFIZUR RAHMAN — ACADEMIC & RESEARCH PORTFOLIO
 * Reference-Aligned Architecture: Two-Column Split Layout Engine
 * Features: Dark Gradient Profile Card, 26 Certificates with Viewer Modals,
 * Live Search, Auto-scrolling Tickers, Framed Banner & No-Code GitHub CMS
 */

'use strict';

window.portfolioData = null;
let currentPubFilter = 'all';
let currentPubSearch = '';
let currentGalleryFilter = 'all';
let currentSoftwareFilter = 'all';
let isTimelineExpanded = false;
let isCertificatesExpanded = false;
let isSoftwareExpanded = false;
let isPublicationsExpanded = false;
let isLeadershipExpanded = false;
let stagedFileUploads = [];

// Project Modals & Gallery State
let currentActiveProject = null;
let currentGalleryProject = null;
let currentGallerySlideIdx = 0;
let gallerySlideshowTimer = null;
window.projectModalTimer = null;
let currentAdminTab = 'pubs';
let currentEditingProject = null;
let currentEditingPubIndex = -1;
let currentEditingResearchIndex = 0;
let currentEditingCertIndex = 0;
let currentEditingGalleryIndex = -1;
let draggedPubIdx = null;

/**
 * Clean timer reset function to prevent stacked slideshow intervals
 */
function clearProjectTimer() {
  if (window.projectModalTimer) {
    clearInterval(window.projectModalTimer);
    window.projectModalTimer = null;
  }
  if (typeof gallerySlideshowTimer !== 'undefined' && gallerySlideshowTimer) {
    clearInterval(gallerySlideshowTimer);
    gallerySlideshowTimer = null;
  }
  if (window.projectCarouselTimer) {
    clearInterval(window.projectCarouselTimer);
    window.projectCarouselTimer = null;
  }
}
window.clearProjectTimer = clearProjectTimer;

/**
 * Global bulletproof modal closer for Verified Certificate & Details modals
 */
function closeAllModals() {
  if (typeof window.closeUniversalNav === 'function') {
    window.closeUniversalNav();
  }
  if (typeof window.closeHeaderNavPanel === 'function') {
    window.closeHeaderNavPanel();
  }
  if (typeof window.closeHeaderNavDrawer === 'function') {
    window.closeHeaderNavDrawer();
  }
  const modals = document.querySelectorAll('.lightbox-modal, #lightbox-modal, .project-modal-backdrop, #project-details-modal, .project-gallery-backdrop, #project-gallery-modal');
  modals.forEach(m => {
    if (m) {
      m.classList.remove('active', 'open', 'show');
      m.style.display = 'none';
    }
  });
  clearProjectTimer();
  if (typeof currentGalleryProject !== 'undefined') currentGalleryProject = null;
  document.body.style.overflow = '';
}

function closeCertificateModal() {
  closeAllModals();
}

window.closeAllModals = closeAllModals;
window.closeCertificateModal = closeCertificateModal;

/**
 * Robust URI encoder for folder and image file paths.
 * Encodes spaces (%20), apostrophes (%27), and ampersands (%26) safely.
 */
function formatImagePath(path) {
  if (!path) return '';
  const rawPath = typeof path === 'object' && path !== null ? (path.src || path.url || '') : path;
  if (!rawPath) return '';
  const clean = rawPath.split('/').map(seg => {
    try {
      return encodeURIComponent(decodeURIComponent(seg)).replace(/'/g, '%27');
    } catch (e) {
      return encodeURIComponent(seg).replace(/'/g, '%27');
    }
  }).join('/');
  if (clean.toLowerCase().includes('poultrymedix/logo.png')) {
    return clean + '?v=2';
  }
  return clean;
}

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
      if (typeof syncActiveNavTab === 'function') syncActiveNavTab();
      else if (typeof updateActiveNavTab === 'function') updateActiveNavTab();
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
    if (typeof syncActiveNavTab === 'function') syncActiveNavTab();
    else if (typeof updateActiveNavTab === 'function') updateActiveNavTab();
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
  renderAboutBio(d.about);
  renderEducation(d.educationTimeline);
  renderRecentUpdatesTicker(d.recentUpdates);
  renderTimelineAndKPIs(d.scientificResearch || d.researchAndProjectsTimeline, d.kpis);
  renderSoftwareProjects(d.softwareProjects);
  renderCapabilities(d.capabilities);
  renderPublications();
  renderTrainings(d.certificates || d.trainings);
  renderGalleryMarquee();
  renderLeadership(d.leadership);
  renderReferences(d.references);
  renderContact(d.profile);
  if (typeof syncActiveNavTab === 'function') syncActiveNavTab();
  else if (typeof updateActiveNavTab === 'function') updateActiveNavTab();
}

/* --------------------------------------------------------------------------
   Top Navbar & Hero Banner (Framed & Zero Cropping)
   -------------------------------------------------------------------------- */
function renderTopNavbar(p) {
  if (!p) return;
  const avatar = document.getElementById('nav-avatar');
  if (avatar) avatar.src = p.navAvatar || 'Image-2.png';
  const name = document.getElementById('nav-name');
  if (name) name.textContent = p.name;
}

function renderHeroBanner(p) {
  if (!p) return;
  const banner = document.getElementById('top-hero-banner-img');
  if (banner) banner.src = p.banner || 'Banner.png';
}

/* --------------------------------------------------------------------------
   Left Sticky Profile Card (Dark Teal / Navy Gradient Card)
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
    emailBtn.href = `mailto:${p.contact.emailPrimary}`;
    emailBtn.innerHTML = `<i class="fa-solid fa-envelope"></i> ${escapeHTML(p.contact.emailPrimary)}`;
    emailBtn.title = "Click to send email";
  }

  // Compact 3-Row Micro-Badges Grid (All Verified Links)
  const btnGrid = document.getElementById('sidebar-buttons-grid');
  if (btnGrid) {
    const s = p.social || {};
    const c = p.contact || {};
    btnGrid.innerHTML = `
      <a href="${escapeHTML(p.cvDriveUrl)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge badge-cv">
        <i class="fa-solid fa-file-pdf"></i> View CV
      </a>
      <a href="${escapeHTML(s.scholar)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-google-scholar"></i> Google Scholar
      </a>
      <a href="${escapeHTML(s.orcid)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-orcid"></i> ORCID
      </a>
      <a href="${escapeHTML(s.linkedin)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-linkedin"></i> LinkedIn
      </a>
      <a href="${escapeHTML(s.osf)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-solid fa-dna"></i> OSF
      </a>
      <a href="${escapeHTML(s.researchgate)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-researchgate"></i> ResearchGate
      </a>
      <a href="${escapeHTML(s.github)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-github"></i> GitHub
      </a>
      <a href="${escapeHTML(p.googleSitesUrl)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-solid fa-globe"></i> Google Sites
      </a>
      <a href="${escapeHTML(c.whatsapp)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-whatsapp"></i> WhatsApp
      </a>
      <a href="${escapeHTML(s.facebook)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-facebook"></i> Facebook
      </a>
      <a href="${escapeHTML(s.instagram)}" target="_blank" rel="noopener noreferrer" class="sidebar-micro-badge">
        <i class="fa-brands fa-instagram"></i> Instagram
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
   1. "Hi, This is Nafiz" (First Card on Right)
   -------------------------------------------------------------------------- */
function renderAboutBio(about) {
  if (!about) return;

  const lead = document.getElementById('bio-lead-text');
  if (lead) lead.textContent = about.lead || '';

  const paras = document.getElementById('bio-paragraphs-wrapper');
  if (paras && about.bioParagraphs) {
    paras.innerHTML = about.bioParagraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
  }
  renderKpiMetrics();
}

/* --------------------------------------------------------------------------
   2. Academic Credentials / Education Timeline
   -------------------------------------------------------------------------- */
function renderEducation(edu) {
  const container = document.getElementById('education-timeline-container');
  if (!container || !edu) return;

  container.innerHTML = edu.map(item => `
    <div class="edu-timeline-item">
      <div class="edu-timeline-dot"></div>
      <span class="edu-timeline-badge">${escapeHTML(item.badge)}</span>
      <h4 class="edu-timeline-degree">${escapeHTML(item.degree)}</h4>
      <div class="edu-timeline-institution">${escapeHTML(item.institution)}</div>
      <div class="edu-timeline-period">${escapeHTML(item.period)}</div>
      <p class="edu-timeline-details">${escapeHTML(item.details)}</p>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   5. Research Experience & Appointments + KPI Bar
   -------------------------------------------------------------------------- */
function renderTimelineAndKPIs(timeline, kpis) {
  const container = document.getElementById('research-timeline-container') || document.getElementById('experience-timeline-container');
  if (!container || !timeline) return;

  // Show top 3 initially, full list when expanded
  const displayList = isTimelineExpanded ? timeline : timeline.slice(0, 3);

  container.innerHTML = displayList.map(item => `
    <div class="timeline-entry">
      <div class="entry-header">
        <h4 class="entry-title">${escapeHTML(item.title)}</h4>
        <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
          ${(item.documents && item.documents.length > 0) ? `
            <button type="button" class="btn-evidence-trigger btn-docs-trigger" onclick="openDocsModal('${escapeHTML(item.id)}', 'research', event)" title="View Documents &amp; Briefs">
              <i class="fa-solid fa-file-lines"></i> Docs &amp; Briefs (${item.documents.length})
            </button>
          ` : ''}
          <button type="button" class="btn-evidence-trigger" onclick="openEvidenceModal('${escapeHTML(item.id)}', 'research', event)" title="View Evidence &amp; Findings">
            <i class="fa-solid fa-camera"></i> Evidence &amp; Findings${item.images && item.images.length > 0 ? ` (${item.images.length})` : ''}
          </button>
          <span class="entry-badge">${escapeHTML(item.badge || item.role)}</span>
        </div>
      </div>
      <div class="entry-meta">
        <span><i class="fa-solid fa-building-columns"></i> ${escapeHTML(item.institution || item.lab || '')}</span>
        <span><i class="fa-solid fa-calendar-days"></i> ${escapeHTML(item.period || '')}</span>
      </div>
      <p class="entry-desc">${escapeHTML(item.summary || item.description || '')}</p>
      <ul class="entry-tags">
        ${(item.tags || []).map(t => `<li class="entry-tag-pill">#${escapeHTML(t)}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  // Expand Toggle Button (Centered)
  const expandBtn = document.getElementById('timeline-expand-btn');
  if (expandBtn) {
    expandBtn.innerHTML = isTimelineExpanded
      ? '<i class="fa-solid fa-chevron-up"></i> Show Less'
      : `<i class="fa-solid fa-chevron-down"></i> See All Research &amp; Appointments (${timeline.length})`;
    expandBtn.onclick = () => {
      isTimelineExpanded = !isTimelineExpanded;
      renderTimelineAndKPIs(timeline, kpis);
    };
  }

  // 4-Column KPI Metrics Bar (Render to both #about and #research)
  renderKpiMetrics(kpis);
}

function getKpiTarget(k) {
  const lbl = (k.label || '').toLowerCase();
  if (lbl.includes('studies') || lbl.includes('manuscript') || lbl.includes('publication')) return '#publications';
  if (lbl.includes('project') || lbl.includes('platform') || lbl.includes('software')) return '#projects';
  if (lbl.includes('certif') || lbl.includes('training')) return '#training';
  if (lbl.includes('experience') || lbl.includes('research')) return '#research';
  if (k.target) {
    let t = k.target.replace('-sec', '');
    if (t === '#software') t = '#projects';
    return t;
  }
  return '#';
}

function renderKpiMetrics(kpis) {
  const targetKpis = kpis || window.portfolioData?.kpis;
  if (!targetKpis) return;

  const containers = [
    document.getElementById('about-kpi-metrics-container')
  ].filter(Boolean);

  if (containers.length === 0) return;

  const certCount = window.portfolioData?.certificates?.length || window.portfolioData?.trainings?.length || 27;

  const html = targetKpis.map(k => {
    let val = k.value;
    if (k.label && k.label.toLowerCase().includes('certif')) {
      val = `${certCount}+`;
    }
    const target = getKpiTarget(k);
    return `
      <a href="${escapeHTML(target)}" 
         class="kpi-metric-box" 
         role="button" 
         tabindex="0" 
         aria-label="${escapeHTML(val + ' ' + k.label)}" 
         onclick="handleKpiClick(event, '${escapeHTML(target)}')"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();handleKpiClick(event, '${escapeHTML(target)}');}">
        <div class="kpi-value">${escapeHTML(val)}</div>
        <div class="kpi-label">${escapeHTML(k.label)}</div>
        ${k.sublabel ? `<div class="kpi-sublabel">${escapeHTML(k.sublabel)}</div>` : ''}
      </a>
    `;
  }).join('');

  containers.forEach(c => { c.innerHTML = html; });
}

// Global smooth scroll handler for KPI metric boxes
window.handleKpiClick = function(event, targetSelector) {
  if (!targetSelector || targetSelector === '#') return;
  event.preventDefault();
  const rawId = targetSelector.replace(/^#/, '');
  let normId = rawId.replace('-sec', '');
  if (normId === 'software') normId = 'projects';

  if (typeof handleNavClick === 'function') {
    handleNavClick(normId);
  } else if (typeof syncActiveNavTab === 'function') {
    syncActiveNavTab(normId);
  }

  if (typeof scrollToSection === 'function') {
    scrollToSection('#' + normId);
  } else {
    const targetEl = document.getElementById(normId) || document.querySelector(targetSelector);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

/* --------------------------------------------------------------------------
   6. Scientific Projects & Digital Platforms
   -------------------------------------------------------------------------- */
function renderSoftwareProjects(projects) {
  const container = document.getElementById('software-cards-container');
  if (!container) return;

  const list = projects || window.portfolioData?.softwareProjects || window.portfolioData?.projects || [];
  let filtered = list;
  if (currentSoftwareFilter !== 'all') {
    filtered = list.filter(p => p.category === currentSoftwareFilter || p.categoryFilter === currentSoftwareFilter);
  }

  const expandWrap = document.getElementById('software-expand-wrap');
  const expandBtn = document.getElementById('software-expand-btn');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <i class="fa-solid fa-code" style="font-size: 1.75rem; margin-bottom: 0.5rem; display: block; color: #6366f1;"></i>
        No projects found matching the selected filter.
      </div>
    `;
    if (expandWrap) expandWrap.style.display = 'none';
    return;
  }

  // 4 items displayed by default in compact 2x2 grid
  const displayList = isSoftwareExpanded ? filtered : filtered.slice(0, 4);

  // Manage See All Projects / Show Less toggle button
  if (expandWrap && expandBtn) {
    if (filtered.length > 4) {
      expandWrap.style.display = 'block';
      expandBtn.innerHTML = isSoftwareExpanded
        ? '<i class="fa-solid fa-chevron-up"></i> Show Less'
        : `<i class="fa-solid fa-chevron-down"></i> See All Projects (${filtered.length})`;
      expandBtn.onclick = () => {
        isSoftwareExpanded = !isSoftwareExpanded;
        renderSoftwareProjects(window.portfolioData?.softwareProjects || window.portfolioData?.projects);
      };
    } else {
      expandWrap.style.display = 'none';
    }
  }

  container.innerHTML = displayList.map(item => {
    const hasImages = Array.isArray(item.images) && item.images.length > 0;
    // PoultryMedix and ZunSync cleanly use logo.png / ZS.png cover presentation
    const coverImage = item.coverImage || (hasImages ? item.images[0] : (item.image || ''));
    const photoCount = hasImages ? item.images.length : 0;
    const projectTitle = item.name || item.title || 'Project';
    const typeBadge = item.typeBadge || item.type || 'Platform';
    const briefSummary = item.brief || item.description || '';

    // Check if cover image is a logo (PoultryMedix logo.png, ZunSync ZS.png, etc.)
    const isLogoCover = coverImage && (
      coverImage.toLowerCase().includes('logo') || 
      coverImage.toLowerCase().includes('zs.png') || 
      item.id === 'proj-poultrymedix' || 
      item.id === 'proj-zunsync'
    );

    // Maximum 3–4 tech stack tags displayed per card
    const maxTags = 4;
    const allTags = item.techStack || [];
    const visibleTags = allTags.slice(0, maxTags);
    const remainingCount = allTags.length - maxTags;

    // Single External Link Icon (GitHub OR Live Link, no duplicate icons)
    let extIconBtn = '';
    if (item.liveUrl && !item.liveUrl.includes('github.com')) {
      extIconBtn = `
        <a href="${escapeHTML(item.liveUrl)}" target="_blank" rel="noopener noreferrer" class="software-ext-icon-btn" title="Live Website / Demo" onclick="event.stopPropagation()">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      `;
    } else if (item.repoUrl) {
      extIconBtn = `
        <a href="${escapeHTML(item.repoUrl)}" target="_blank" rel="noopener noreferrer" class="software-ext-icon-btn" title="GitHub Repository" onclick="event.stopPropagation()">
          <i class="fa-brands fa-github"></i>
        </a>
      `;
    } else if (item.liveUrl) {
      extIconBtn = `
        <a href="${escapeHTML(item.liveUrl)}" target="_blank" rel="noopener noreferrer" class="software-ext-icon-btn" title="Live Website" onclick="event.stopPropagation()">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      `;
    }

    // Direct Gallery Trigger for Thumbnail & Photos Badge
    const thumbAction = photoCount > 0
      ? `openProjectGalleryModal('${escapeHTML(item.id)}', event)`
      : `openProjectDetailsModal('${escapeHTML(item.id)}', event)`;

    return `
      <div class="software-card" onclick="openProjectDetailsModal('${escapeHTML(item.id)}', event)" tabindex="0" role="button" aria-label="View ${escapeHTML(projectTitle)} details">
        <!-- 16:9 Cover Thumbnail Frame (Click directly opens photo gallery) -->
        <div class="software-card-thumb-wrap" onclick="${thumbAction}" title="${photoCount > 0 ? 'Click to open photo gallery' : 'Click to view details'}">
          ${coverImage ? `
            <img src="${formatImagePath(coverImage)}" alt="${escapeHTML(projectTitle)} Cover" class="software-card-thumb-img ${isLogoCover ? 'is-logo-cover' : ''}" loading="lazy" ${isLogoCover ? 'style="object-fit: contain; padding: 14px; background: #ffffff;"' : ''}>
          ` : `
            <div class="software-card-thumb-placeholder">
              <i class="fa-brands fa-python"></i>
            </div>
          `}
          ${photoCount > 0 ? `
            <span class="software-photo-count-pill" onclick="${thumbAction}" title="Open photo gallery (${photoCount} photos)">
              <i class="fa-solid fa-camera"></i> ${photoCount} Photos
            </span>
          ` : ''}
        </div>

        <div class="software-card-body">
          <div class="software-card-top">
            <div class="software-card-header">
              <span class="software-type-badge">${escapeHTML(typeBadge)}</span>
              ${item.period ? `<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;"><i class="fa-solid fa-clock"></i> ${escapeHTML(item.period)}</span>` : ''}
            </div>
            <h4 class="software-card-title">${escapeHTML(projectTitle)}</h4>
            <!-- Clamped to 3 lines via CSS -->
            <p class="software-card-desc">${escapeHTML(briefSummary)}</p>
            
            <!-- Max 3-4 tech tags on card -->
            <div class="software-tech-pills">
              ${visibleTags.map(t => `<span class="tech-pill">${escapeHTML(t)}</span>`).join('')}
              ${remainingCount > 0 ? `<span class="tech-pill tech-pill-more">+${remainingCount} more</span>` : ''}
            </div>
          </div>

          <div class="software-card-footer">
            <div class="software-footer-btns-left">
              <button type="button" class="software-view-details-btn" onclick="openProjectDetailsModal('${escapeHTML(item.id)}', event)" title="View full details and complete tech stack">
                <i class="fa-solid fa-circle-info"></i> View Details
              </button>
              ${(item.documents && item.documents.length > 0) ? `
                <button type="button" class="software-docs-btn" onclick="openDocsModal('${escapeHTML(item.id)}', 'project', event)" title="View Documents, Briefs &amp; Presentation Slides">
                  <i class="fa-solid fa-file-lines"></i> Docs &amp; Briefs (${item.documents.length})
                </button>
              ` : ''}
              ${photoCount > 0 ? `
                <button type="button" class="software-gallery-btn" onclick="openProjectGalleryModal('${escapeHTML(item.id)}', event)" title="Open photo gallery slideshow">
                  <i class="fa-solid fa-images"></i> Gallery
                </button>
              ` : ''}
            </div>
            ${extIconBtn}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initSoftwareFilters() {
  const filterBtns = document.querySelectorAll('.software-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSoftwareFilter = btn.getAttribute('data-filter') || 'all';
      isSoftwareExpanded = false; // Reset to 4 cards when switching filter
      renderSoftwareProjects(window.portfolioData?.softwareProjects || window.portfolioData?.projects);
    });
  });
}

/* --------------------------------------------------------------------------
   Interactive Project Details Modal
   -------------------------------------------------------------------------- */
function openProjectDetailsModal(projectId, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  const list = window.portfolioData?.softwareProjects || window.portfolioData?.projects || [];
  const project = list.find(p => p.id === projectId);
  if (!project) return;

  currentActiveProject = project;

  const modal = document.getElementById('project-details-modal');
  const titleEl = document.getElementById('project-modal-title');
  const badgeEl = document.getElementById('project-modal-badge');
  const metaEl = document.getElementById('project-modal-meta');
  const descEl = document.getElementById('project-modal-desc');
  const featWrap = document.getElementById('project-modal-features-wrap');
  const featList = document.getElementById('project-modal-features-list');
  const techPills = document.getElementById('project-modal-tech-pills');
  const galleryWrap = document.getElementById('project-modal-gallery-action-wrap');
  const galleryCount = document.getElementById('project-modal-gallery-count');
  const galleryBtn = document.getElementById('project-modal-open-gallery-btn');
  const extLinkWrap = document.getElementById('project-modal-external-link-wrap');

  // Title & Badge
  if (titleEl) titleEl.textContent = project.name || project.title;
  if (badgeEl) badgeEl.textContent = project.typeBadge || project.type || 'Platform';

  // Meta row
  if (metaEl) {
    metaEl.innerHTML = `
      ${project.role ? `<span><i class="fa-solid fa-user-gear"></i> ${escapeHTML(project.role)}</span>` : ''}
      ${project.period ? `<span><i class="fa-solid fa-calendar-check"></i> ${escapeHTML(project.period)}</span>` : ''}
      ${project.stars ? `<span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> ${escapeHTML(project.stars)}</span>` : ''}
    `;
  }

  // Full Description
  if (descEl) descEl.textContent = project.description || project.brief || '';

  // Key Features & Highlights
  if (featList) {
    const features = project.features || project.highlights || [];
    if (features.length > 0) {
      if (featWrap) featWrap.style.display = 'block';
      featList.innerHTML = features.map(f => `
        <li><i class="fa-solid fa-circle-check"></i> <span>${escapeHTML(f)}</span></li>
      `).join('');
    } else {
      if (featWrap) featWrap.style.display = 'none';
    }
  }

  // Complete Tech Stack (all tags)
  if (techPills) {
    const tech = project.techStack || [];
    techPills.innerHTML = tech.map(t => `<span class="tech-pill">${escapeHTML(t)}</span>`).join('');
  }

  // Open Photo Gallery Button inside Details Modal
  const images = project.images || [];
  if (images.length > 0 && galleryWrap && galleryBtn) {
    galleryWrap.style.display = 'block';
    if (galleryCount) galleryCount.textContent = images.length;
    galleryBtn.onclick = (evt) => {
      closeProjectDetailsModal();
      openProjectGalleryModal(project.id, evt);
    };
  } else if (galleryWrap) {
    galleryWrap.style.display = 'none';
  }

  // Open Docs & Briefs Button inside Details Modal
  const docs = project.documents || [];
  const existingDocsWrap = document.getElementById('project-modal-docs-action-wrap');
  if (existingDocsWrap) existingDocsWrap.remove();
  if (docs.length > 0 && galleryWrap) {
    const docsBtnWrap = document.createElement('div');
    docsBtnWrap.id = 'project-modal-docs-action-wrap';
    docsBtnWrap.style.paddingTop = '0.5rem';
    docsBtnWrap.innerHTML = `
      <button type="button" class="project-modal-gallery-trigger-btn" style="background: rgba(14, 165, 233, 0.15); color: #0284c7; border-color: rgba(14, 165, 233, 0.35);">
        <i class="fa-solid fa-file-lines"></i> Open Docs, Briefs &amp; Slides (${docs.length})
      </button>
    `;
    docsBtnWrap.querySelector('button').onclick = (evt) => {
      closeProjectDetailsModal();
      openDocsModal(project.id, 'project', evt);
    };
    galleryWrap.parentNode.insertBefore(docsBtnWrap, galleryWrap.nextSibling);
  }

  // Single External Action Button in footer
  if (extLinkWrap) {
    if (project.liveUrl && !project.liveUrl.includes('github.com')) {
      extLinkWrap.innerHTML = `
        <a href="${escapeHTML(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-modal-action-btn live">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Website / Live Demo
        </a>
      `;
    } else if (project.repoUrl) {
      extLinkWrap.innerHTML = `
        <a href="${escapeHTML(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="project-modal-action-btn github">
          <i class="fa-brands fa-github"></i> Open GitHub Repository
        </a>
      `;
    } else if (project.liveUrl) {
      extLinkWrap.innerHTML = `
        <a href="${escapeHTML(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-modal-action-btn live">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Website
        </a>
      `;
    } else {
      extLinkWrap.innerHTML = '';
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeProjectDetailsModal() {
  clearProjectTimer();
  const modal = document.getElementById('project-details-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* --------------------------------------------------------------------------
   Dedicated Interactive Image Gallery / Lightbox Slideshow Modal
   -------------------------------------------------------------------------- */
function openProjectGalleryModal(projectId, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  const list = window.portfolioData?.softwareProjects || window.portfolioData?.projects || [];
  const project = list.find(p => p.id === projectId);
  if (!project) return;

  const images = project.images || [];
  if (images.length === 0) {
    openProjectDetailsModal(projectId, e);
    return;
  }

  currentGalleryProject = project;
  currentGallerySlideIdx = 0;

  const modal = document.getElementById('project-gallery-modal');
  const titleEl = document.getElementById('project-gallery-title');
  const thumbsContainer = document.getElementById('project-gallery-thumbs');
  const prevBtn = document.getElementById('project-gallery-prev');
  const nextBtn = document.getElementById('project-gallery-next');
  const counter = document.getElementById('project-gallery-counter');
  const zoomBtn = document.getElementById('project-gallery-zoom');
  const mainImg = document.getElementById('project-gallery-main-img');
  const emptyEl = document.getElementById('project-gallery-empty');
  const galleryWrap = document.getElementById('project-gallery-wrap');

  if (titleEl) titleEl.textContent = `${project.name || project.title} — Screenshots`;

  if (emptyEl) {
    emptyEl.style.display = 'none';
    emptyEl.innerHTML = '';
  }
  if (mainImg) mainImg.style.display = '';
  if (counter) counter.style.display = '';
  if (zoomBtn) zoomBtn.style.display = '';
  if (thumbsContainer) thumbsContainer.style.display = 'flex';
  if (prevBtn) prevBtn.style.display = images.length > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = images.length > 1 ? '' : 'none';

  // Render clickable thumbnail strip
  if (thumbsContainer) {
    thumbsContainer.innerHTML = images.map((img, i) => `
      <div class="project-gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="handleGalleryThumbClick(${i})">
        <img src="${formatImagePath(img)}" alt="thumb ${i + 1}" loading="lazy">
      </div>
    `).join('');
  }

  // Navigation Arrow Listeners
  if (prevBtn) {
    prevBtn.onclick = (evt) => {
      evt.stopPropagation();
      setGallerySlide(currentGallerySlideIdx - 1, true);
    };
  }
  if (nextBtn) {
    nextBtn.onclick = (evt) => {
      evt.stopPropagation();
      setGallerySlide(currentGallerySlideIdx + 1, true);
    };
  }

  // Set initial slide
  setGallerySlide(0);

  // Auto-advance slideshow with safe timer management at clean 3000ms (3 seconds)
  clearProjectTimer();
  if (images.length > 1) {
    startGallerySlideshow(images.length);

    // Pause cleanly on hover, resume on mouse leave
    if (galleryWrap) {
      galleryWrap.onmouseenter = () => clearProjectTimer();
      galleryWrap.onmouseleave = () => startGallerySlideshow(images.length);
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function handleGalleryThumbClick(i) {
  setGallerySlide(i, true);
}
window.handleGalleryThumbClick = handleGalleryThumbClick;

function startGallerySlideshow(total) {
  clearProjectTimer();
  window.projectModalTimer = gallerySlideshowTimer = setInterval(() => {
    setGallerySlide(currentGallerySlideIdx + 1);
  }, 3000);
}

function setGallerySlide(idx, fromUserAction = false) {
  if (!currentGalleryProject || !currentGalleryProject.images || currentGalleryProject.images.length === 0) return;
  const images = currentGalleryProject.images;
  currentGallerySlideIdx = (idx + images.length) % images.length;
  
  const mainImg = document.getElementById('project-gallery-main-img');
  const counter = document.getElementById('project-gallery-counter');
  const zoomBtn = document.getElementById('project-gallery-zoom');
  const thumbsContainer = document.getElementById('project-gallery-thumbs');
  const captionEl = document.getElementById('project-gallery-caption');

  const curImg = images[currentGallerySlideIdx];
  const encoded = formatImagePath(curImg);
  const captionText = (typeof curImg === 'object' && curImg !== null) ? (curImg.caption || '') : '';

  if (mainImg) {
    mainImg.src = encoded;
    mainImg.alt = captionText || `${currentGalleryProject.name || currentGalleryProject.title || 'Project'} image ${currentGallerySlideIdx + 1}`;
  }
  if (counter) {
    counter.textContent = `${currentGallerySlideIdx + 1} / ${images.length}`;
  }
  if (zoomBtn) {
    zoomBtn.href = encoded;
  }
  if (captionEl) {
    if (captionText) {
      captionEl.textContent = captionText;
      captionEl.style.display = 'block';
    } else {
      captionEl.textContent = '';
      captionEl.style.display = 'none';
    }
  }

  if (thumbsContainer) {
    const allThumbs = thumbsContainer.querySelectorAll('.project-gallery-thumb');
    allThumbs.forEach((th, i) => {
      if (i === currentGallerySlideIdx) {
        th.classList.add('active');
        th.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        th.classList.remove('active');
      }
    });
  }

  // Reset 3000ms slideshow timer cleanly when triggered by user interaction (arrow / thumb click)
  if (fromUserAction && images.length > 1) {
    startGallerySlideshow(images.length);
  }
}

function closeProjectGalleryModal() {
  clearProjectTimer();
  const modal = document.getElementById('project-gallery-modal');
  const captionEl = document.getElementById('project-gallery-caption');
  const emptyEl = document.getElementById('project-gallery-empty');
  const mainImg = document.getElementById('project-gallery-main-img');
  const counter = document.getElementById('project-gallery-counter');
  const zoomBtn = document.getElementById('project-gallery-zoom');
  const thumbsContainer = document.getElementById('project-gallery-thumbs');
  const prevBtn = document.getElementById('project-gallery-prev');
  const nextBtn = document.getElementById('project-gallery-next');

  if (captionEl) {
    captionEl.textContent = '';
    captionEl.style.display = 'none';
  }
  if (emptyEl) {
    emptyEl.style.display = 'none';
    emptyEl.innerHTML = '';
  }
  if (mainImg) mainImg.style.display = '';
  if (counter) counter.style.display = '';
  if (zoomBtn) zoomBtn.style.display = '';
  if (thumbsContainer) thumbsContainer.style.display = '';
  if (prevBtn) prevBtn.style.display = '';
  if (nextBtn) nextBtn.style.display = '';

  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentGalleryProject = null;
}

function openEvidenceModal(itemId, category, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  if (category === 'certificate') {
    return openPracticalModal(itemId, e);
  }

  let item = null;
  let categoryLabel = 'Evidence & Findings';

  if (category === 'research') {
    const list = window.portfolioData?.scientificResearch || window.portfolioData?.research || window.portfolioData?.researchAndProjectsTimeline || [];
    item = list.find(r => r.id === itemId);
    categoryLabel = 'Evidence & Findings';
  } else if (category === 'publication') {
    const list = window.portfolioData?.publications || [];
    item = list.find(p => p.id === itemId);
    categoryLabel = 'Evidence & Findings';
  }

  if (!item) return;

  const modal = document.getElementById('project-gallery-modal');
  const titleEl = document.getElementById('project-gallery-title');
  const thumbsContainer = document.getElementById('project-gallery-thumbs');
  const prevBtn = document.getElementById('project-gallery-prev');
  const nextBtn = document.getElementById('project-gallery-next');
  const counter = document.getElementById('project-gallery-counter');
  const zoomBtn = document.getElementById('project-gallery-zoom');
  const mainImg = document.getElementById('project-gallery-main-img');
  const emptyEl = document.getElementById('project-gallery-empty');
  const captionEl = document.getElementById('project-gallery-caption');
  const galleryWrap = document.getElementById('project-gallery-wrap');

  if (titleEl) {
    titleEl.textContent = `${item.title || ''} — ${categoryLabel}`;
  }

  const images = item.images || [];

  if (images.length === 0) {
    // Clean Empty Preview State
    if (counter) counter.style.display = 'none';
    if (zoomBtn) zoomBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (mainImg) mainImg.style.display = 'none';
    if (thumbsContainer) thumbsContainer.style.display = 'none';
    if (captionEl) captionEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.style.display = 'flex';
      emptyEl.innerHTML = `
        <div class="project-gallery-empty-icon" style="background: rgba(13, 148, 136, 0.15); color: #2dd4bf;">
          <i class="fa-solid fa-microscope"></i>
        </div>
        <h4 class="project-gallery-empty-title">Fieldwork, Lab Bench &amp; Microscopic Findings</h4>
        <p class="project-gallery-empty-desc">
          No images uploaded yet. Use the Admin CMS Drawer to attach photos &amp; captions for this study.
        </p>
      `;
    }
    clearProjectTimer();
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    return;
  }

  // Restore elements if previously hidden by empty state
  if (emptyEl) emptyEl.style.display = 'none';
  if (mainImg) mainImg.style.display = '';
  if (counter) counter.style.display = '';
  if (zoomBtn) zoomBtn.style.display = '';
  if (thumbsContainer) thumbsContainer.style.display = 'flex';
  if (prevBtn) prevBtn.style.display = images.length > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = images.length > 1 ? '' : 'none';

  currentGalleryProject = {
    ...item,
    name: `${item.title || 'Item'} — ${categoryLabel}`
  };
  currentGallerySlideIdx = 0;

  if (thumbsContainer) {
    thumbsContainer.innerHTML = images.map((img, i) => `
      <div class="project-gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="handleGalleryThumbClick(${i})">
        <img src="${formatImagePath(img)}" alt="thumb ${i + 1}" loading="lazy">
      </div>
    `).join('');
  }

  if (prevBtn) {
    prevBtn.onclick = (evt) => {
      evt.stopPropagation();
      setGallerySlide(currentGallerySlideIdx - 1, true);
    };
  }
  if (nextBtn) {
    nextBtn.onclick = (evt) => {
      evt.stopPropagation();
      setGallerySlide(currentGallerySlideIdx + 1, true);
    };
  }

  setGallerySlide(0);

  clearProjectTimer();
  if (images.length > 1) {
    startGallerySlideshow(images.length);
    if (galleryWrap) {
      galleryWrap.onmouseenter = () => clearProjectTimer();
      galleryWrap.onmouseleave = () => startGallerySlideshow(images.length);
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
window.openEvidenceModal = openEvidenceModal;

function openPracticalModal(itemId, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  const list = window.portfolioData?.certificates || window.portfolioData?.trainings || [];
  const item = list.find((c, idx) => c.id === itemId || String(idx) === String(itemId) || String(c.id) === String(itemId));
  if (!item) return;

  const modal = document.getElementById('project-gallery-modal');
  const titleEl = document.getElementById('project-gallery-title');
  const thumbsContainer = document.getElementById('project-gallery-thumbs');
  const prevBtn = document.getElementById('project-gallery-prev');
  const nextBtn = document.getElementById('project-gallery-next');
  const counter = document.getElementById('project-gallery-counter');
  const zoomBtn = document.getElementById('project-gallery-zoom');
  const mainImg = document.getElementById('project-gallery-main-img');
  const emptyEl = document.getElementById('project-gallery-empty');
  const captionEl = document.getElementById('project-gallery-caption');
  const galleryWrap = document.getElementById('project-gallery-wrap');

  if (titleEl) {
    titleEl.textContent = `${item.title || 'Training'} — Practical Work & Outputs`;
  }

  const practicalImages = item.practicalImages || [];

  if (practicalImages.length === 0) {
    // Clean Empty Preview State
    if (counter) counter.style.display = 'none';
    if (zoomBtn) zoomBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (mainImg) mainImg.style.display = 'none';
    if (thumbsContainer) thumbsContainer.style.display = 'none';
    if (captionEl) captionEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.style.display = 'flex';
      emptyEl.innerHTML = `
        <div class="project-gallery-empty-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
          <i class="fa-solid fa-laptop-code"></i>
        </div>
        <h4 class="project-gallery-empty-title">Practical Work &amp; Demo Showcase</h4>
        <p class="project-gallery-empty-desc">
          Upload outputs via Admin CMS
        </p>
      `;
    }
    clearProjectTimer();
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    return;
  }

  // Restore elements if previously hidden by empty state
  if (emptyEl) emptyEl.style.display = 'none';
  if (mainImg) mainImg.style.display = '';
  if (counter) counter.style.display = '';
  if (zoomBtn) zoomBtn.style.display = '';
  if (thumbsContainer) thumbsContainer.style.display = 'flex';
  if (prevBtn) prevBtn.style.display = practicalImages.length > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = practicalImages.length > 1 ? '' : 'none';

  currentGalleryProject = {
    ...item,
    name: `${item.title || 'Training'} — Practical Work & Outputs`,
    images: practicalImages
  };
  currentGallerySlideIdx = 0;

  if (thumbsContainer) {
    thumbsContainer.innerHTML = practicalImages.map((img, i) => `
      <div class="project-gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="handleGalleryThumbClick(${i})">
        <img src="${formatImagePath(img)}" alt="thumb ${i + 1}" loading="lazy">
      </div>
    `).join('');
  }

  if (prevBtn) {
    prevBtn.onclick = (evt) => {
      evt.stopPropagation();
      setGallerySlide(currentGallerySlideIdx - 1, true);
    };
  }
  if (nextBtn) {
    nextBtn.onclick = (evt) => {
      evt.stopPropagation();
      setGallerySlide(currentGallerySlideIdx + 1, true);
    };
  }

  setGallerySlide(0);

  clearProjectTimer();
  if (practicalImages.length > 1) {
    startGallerySlideshow(practicalImages.length);
    if (galleryWrap) {
      galleryWrap.onmouseenter = () => clearProjectTimer();
      galleryWrap.onmouseleave = () => startGallerySlideshow(practicalImages.length);
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
window.openPracticalModal = openPracticalModal;

/* --------------------------------------------------------------------------
   DOCUMENTS, BRIEFS & PRESENTATIONS SHARING SYSTEM MODAL
   -------------------------------------------------------------------------- */
let currentDocsItem = null;
let currentSelectedDocIndex = 0;

function convertToEmbedUrl(url, docType) {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. Google Drive file: drive.google.com/file/d/<ID>/... or drive.google.com/open?id=<ID> or drive.google.com/uc?id=<ID>
  // Strictly use https://drive.google.com/file/d/<ID>/preview (never convert Drive IDs into docs.google.com/.../preview)
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
  }

  // 2. Uploaded Office file (.pptx / .docx / .xlsx) opened via Google Docs editor (indicated by rtpof=true)
  // When an Office file is hosted on Google Drive, opening it yields a URL like docs.google.com/presentation/d/<ID>/edit?...rtpof=true.
  // Using docs.google.com/.../preview or /embed triggers Google's "We're sorry for the inconvenience" error on .pptx/.docx.
  // Converting to drive.google.com/file/d/<ID>/preview solves this error.
  if (trimmed.includes('rtpof=true')) {
    const docIdMatch = trimmed.match(/docs\.google\.com\/(?:presentation|document|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/);
    if (docIdMatch && docIdMatch[1]) {
      return `https://drive.google.com/file/d/${docIdMatch[1]}/preview`;
    }
  }

  // 3. Native Google Slides: docs.google.com/presentation/d/<ID>/...
  // Extract clean ID (stripping /edit, /view, query strings, and hash fragments)
  // Embed via https://docs.google.com/presentation/d/<ID>/embed?start=false&loop=false&delayms=3000
  const slidesMatch = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slidesMatch && slidesMatch[1]) {
    const cleanId = slidesMatch[1];
    return `https://docs.google.com/presentation/d/${cleanId}/embed?start=false&loop=false&delayms=3000`;
  }

  // 4. Native Google Docs: docs.google.com/document/d/<ID>/... -> /preview
  const docsMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch && docsMatch[1]) {
    const cleanId = docsMatch[1];
    return `https://docs.google.com/document/d/${cleanId}/preview`;
  }

  // 5. Native Google Sheets: docs.google.com/spreadsheets/d/<ID>/... -> /preview
  const sheetsMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetsMatch && sheetsMatch[1]) {
    const cleanId = sheetsMatch[1];
    return `https://docs.google.com/spreadsheets/d/${cleanId}/preview`;
  }

  // 6. Direct PDF URL
  if (trimmed.toLowerCase().endsWith('.pdf') || trimmed.includes('.pdf?')) {
    return trimmed;
  }

  return trimmed;
}
window.convertToEmbedUrl = convertToEmbedUrl;

function getDocBadgeInfo(doc) {
  const type = (doc.docType || '').toLowerCase();
  const url = (doc.url || '').toLowerCase();
  if (type === 'slides' || url.includes('presentation')) {
    return { label: 'Presentation Slides', icon: 'fa-solid fa-file-powerpoint', badgeClass: 'badge-slides' };
  }
  if (type === 'word' || url.includes('/document/') || url.endsWith('.doc') || url.endsWith('.docx')) {
    return { label: 'Word Document', icon: 'fa-solid fa-file-word', badgeClass: 'badge-word' };
  }
  if (type === 'pdf' || url.endsWith('.pdf') || url.includes('/file/d/')) {
    return { label: 'PDF Document', icon: 'fa-solid fa-file-pdf', badgeClass: 'badge-pdf' };
  }
  return { label: 'Google Drive Resource', icon: 'fa-brands fa-google-drive', badgeClass: 'badge-drive' };
}
window.getDocBadgeInfo = getDocBadgeInfo;

function openDocsModal(itemId, category, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  let item = null;
  if (category === 'project') {
    const list = window.portfolioData?.softwareProjects || window.portfolioData?.projects || [];
    item = list.find(p => p.id === itemId);
  } else if (category === 'research') {
    const list = window.portfolioData?.scientificResearch || window.portfolioData?.research || window.portfolioData?.researchAndProjectsTimeline || [];
    item = list.find(r => r.id === itemId);
  } else if (category === 'publication') {
    const list = window.portfolioData?.publications || [];
    item = list.find(p => p.id === itemId);
  } else if (category === 'certificate') {
    const list = window.portfolioData?.certificates || window.portfolioData?.trainings || [];
    item = typeof itemId === 'number' ? list[itemId] : list.find(c => c.id === itemId || String(c.id) === String(itemId));
    if (!item && !isNaN(parseInt(itemId))) item = list[parseInt(itemId)];
  }

  if (!item || !Array.isArray(item.documents) || item.documents.length === 0) {
    if (typeof showToast === 'function') showToast('No documents or briefs attached for this entry.', 'info');
    return;
  }

  currentDocsItem = item;
  currentSelectedDocIndex = 0;

  const modal = document.getElementById('docs-briefs-modal');
  const titleEl = document.getElementById('docs-modal-title');
  const countBadge = document.getElementById('docs-modal-count-badge');

  if (titleEl) {
    titleEl.textContent = `${item.title || item.name || 'Entry'} — Documents & Briefs`;
  }
  if (countBadge) {
    countBadge.textContent = `${item.documents.length} Attachment${item.documents.length !== 1 ? 's' : ''}`;
  }

  renderDocsModalTabs(item.documents);
  selectDocsModalItem(0);

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
window.openDocsModal = openDocsModal;

function closeDocsModal() {
  const modal = document.getElementById('docs-briefs-modal');
  const iframe = document.getElementById('docs-modal-iframe');
  if (iframe) iframe.src = 'about:blank';
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentDocsItem = null;
}
window.closeDocsModal = closeDocsModal;

function renderDocsModalTabs(docs) {
  const strip = document.getElementById('docs-modal-tabs-strip');
  if (!strip) return;
  if (!docs || docs.length <= 1) {
    strip.style.display = 'none';
    return;
  }
  strip.style.display = 'flex';
  strip.innerHTML = docs.map((d, idx) => {
    const info = getDocBadgeInfo(d);
    return `
      <button type="button" class="docs-modal-tab-btn ${idx === 0 ? 'active' : ''}" onclick="selectDocsModalItem(${idx})" title="${escapeHTML(d.title)}">
        <i class="${info.icon}"></i>
        <span>${escapeHTML(d.title || `Document #${idx + 1}`)}</span>
      </button>
    `;
  }).join('');
}
window.renderDocsModalTabs = renderDocsModalTabs;

function selectDocsModalItem(index) {
  if (!currentDocsItem || !currentDocsItem.documents || !currentDocsItem.documents[index]) return;
  currentSelectedDocIndex = index;
  const doc = currentDocsItem.documents[index];
  const badgeInfo = getDocBadgeInfo(doc);

  const tabBtns = document.querySelectorAll('.docs-modal-tab-btn');
  tabBtns.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  const titleEl = document.getElementById('docs-modal-selected-title');
  const badgeEl = document.getElementById('docs-modal-selected-badge');
  const driveBtn = document.getElementById('docs-modal-open-drive-btn');
  const iframe = document.getElementById('docs-modal-iframe');
  const fallback = document.getElementById('docs-modal-fallback');

  if (titleEl) titleEl.textContent = doc.title || 'Attached Document';
  if (badgeEl) {
    badgeEl.className = `docs-type-badge ${badgeInfo.badgeClass}`;
    badgeEl.innerHTML = `<i class="${badgeInfo.icon}"></i> ${escapeHTML(badgeInfo.label)}`;
  }
  if (driveBtn) {
    driveBtn.href = doc.url || '#';
  }

  const embedUrl = convertToEmbedUrl(doc.url, doc.docType);
  if (iframe) {
    iframe.src = embedUrl;
    iframe.style.display = 'block';
  }
  if (fallback) fallback.style.display = 'none';
}
window.selectDocsModalItem = selectDocsModalItem;

function initProjectModals() {
  // Details Modal close listeners
  const detailsModal = document.getElementById('project-details-modal');
  const detailsCloseBtn = document.getElementById('project-modal-close-btn');

  if (detailsCloseBtn) detailsCloseBtn.onclick = closeProjectDetailsModal;
  if (detailsModal) {
    detailsModal.onclick = (e) => {
      if (e.target === detailsModal) closeProjectDetailsModal();
    };
  }

  // Gallery Modal close listeners
  const galleryModal = document.getElementById('project-gallery-modal');
  const galleryCloseBtn = document.getElementById('project-gallery-close-btn');

  if (galleryCloseBtn) galleryCloseBtn.onclick = closeProjectGalleryModal;
  if (galleryModal) {
    galleryModal.onclick = (e) => {
      if (e.target === galleryModal) closeProjectGalleryModal();
    };
  }

  // Docs & Briefs Modal close listeners
  const docsModal = document.getElementById('docs-briefs-modal');
  const docsCloseBtn = document.getElementById('docs-modal-close-btn');

  if (docsCloseBtn) docsCloseBtn.onclick = closeDocsModal;
  if (docsModal) {
    docsModal.onclick = (e) => {
      if (e.target === docsModal) closeDocsModal();
    };
  }

  // Global Keyboard Navigation (Esc to close, Left/Right for gallery)
  document.addEventListener('keydown', (e) => {
    if (docsModal && docsModal.classList.contains('active')) {
      if (e.key === 'Escape') closeDocsModal();
    } else if (galleryModal && galleryModal.classList.contains('active')) {
      if (e.key === 'Escape') closeProjectGalleryModal();
      else if (e.key === 'ArrowLeft') setGallerySlide(currentGallerySlideIdx - 1, true);
      else if (e.key === 'ArrowRight') setGallerySlide(currentGallerySlideIdx + 1, true);
    } else if (detailsModal && detailsModal.classList.contains('active')) {
      if (e.key === 'Escape') closeProjectDetailsModal();
    }
  });
}

/* --------------------------------------------------------------------------
   4. Technical Capabilities (2-Column Split Cards)
   -------------------------------------------------------------------------- */
function renderCapabilities(caps) {
  if (!caps) return;

  // Clinical Left Card
  const clinContainer = document.getElementById('cap-clinical-skills');
  if (clinContainer && caps.clinical?.skills) {
    const clinicalSkills = caps.clinical.skills.filter(s => 
      !s.name?.toLowerCase().includes('biofilm') && 
      !s.desc?.toLowerCase().includes('biofilm')
    );
    clinContainer.innerHTML = clinicalSkills.map(s => `
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
   5. Publications & Manuscripts (Live Search + Filter Tabs)
   -------------------------------------------------------------------------- */
function getPubStatusClass(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s.includes('accepted') || s.includes('published')) return 'pub-status-accepted';
  if (s.includes('ready') || s.includes('prepared')) return 'pub-status-ready';
  if (s.includes('analysis')) return 'pub-status-analysis';
  if (s.includes('fieldwork') || s.includes('ongoing')) return 'pub-status-ongoing';
  if (s.includes('1st author')) return 'pub-status-1st-author';
  if (s.includes('co-author')) return 'pub-status-co-author';
  if (s.includes('conference') || s.includes('proceedings')) return 'pub-status-conf';
  return '';
}

function matchesPubFilter(p, filter) {
  if (!filter || filter === 'all') return true;
  const f = filter.toLowerCase();

  if (f === 'articles') {
    const s = (p.status || '').toLowerCase();
    const c = (p.category || '').toLowerCase();
    const cats = Array.isArray(p.categories) ? p.categories.join(' ').toLowerCase() : '';
    return s.includes('accepted') || s.includes('published') || c.includes('article') || cats.includes('articles') || p.filter === 'articles';
  }

  if (f === 'conference') {
    const s = (p.status || '').toLowerCase();
    const c = (p.category || '').toLowerCase();
    const cats = Array.isArray(p.categories) ? p.categories.join(' ').toLowerCase() : '';
    return s.includes('conference') || s.includes('proceedings') || c.includes('conference') || cats.includes('conference') || p.filter === 'conference';
  }

  if (f === 'osf') {
    const doi = (p.doi || p.doiUrl || '').toLowerCase();
    const c = (p.category || '').toLowerCase();
    const cats = Array.isArray(p.categories) ? p.categories.join(' ').toLowerCase() : '';
    return doi.includes('osf.io') || c.includes('osf') || cats.includes('osf') || (p.filter === 'osf');
  }

  if (f === 'ongoing') {
    const s = (p.status || '').toLowerCase();
    const c = (p.category || '').toLowerCase();
    const cats = Array.isArray(p.categories) ? p.categories.join(' ').toLowerCase() : '';
    return s.includes('ready') || s.includes('prepared') || s.includes('analysis') ||
           s.includes('fieldwork') || s.includes('ongoing') || s.includes('submitted') ||
           s.includes('under review') || c.includes('ongoing') || cats.includes('ongoing') || (p.filter === 'ongoing');
  }

  if (Array.isArray(p.categories) && p.categories.includes(filter)) return true;
  if (p.filter === filter) return true;
  if (Array.isArray(p.filter) && p.filter.includes(filter)) return true;
  return false;
}

function renderPublications() {
  const container = document.getElementById('publications-entries-container');
  if (!container || !window.portfolioData?.publications) return;

  let pubs = window.portfolioData.publications;

  // 1. Filter by category / filter pill
  if (currentPubFilter !== 'all') {
    pubs = pubs.filter(p => matchesPubFilter(p, currentPubFilter));
  }

  // 2. Real-time keyword search
  if (currentPubSearch.trim()) {
    const q = currentPubSearch.toLowerCase().trim();
    pubs = pubs.filter(p => 
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.authors && p.authors.toLowerCase().includes(q)) ||
      (p.venue && p.venue.toLowerCase().includes(q)) ||
      (p.conferenceTitle && p.conferenceTitle.toLowerCase().includes(q)) ||
      (p.conferenceTheme && p.conferenceTheme.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.doi && p.doi.toLowerCase().includes(q)) ||
      (p.doiUrl && p.doiUrl.toLowerCase().includes(q)) ||
      (p.osfUrl && p.osfUrl.toLowerCase().includes(q)) ||
      (p.abstract && p.abstract.toLowerCase().includes(q))
    );
  }

  const expandWrap = document.getElementById('publications-expand-wrap');
  const expandBtn = document.getElementById('publications-expand-btn');

  if (pubs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
        No matching publications found. Try adjusting your search query or filters.
      </div>
    `;
    if (expandWrap) expandWrap.style.display = 'none';
    return;
  }

  // Top 3 items visible initially, full list when expanded
  const displayList = isPublicationsExpanded ? pubs : pubs.slice(0, 3);

  // Manage See All Publications & Manuscripts / Show Less toggle button
  if (expandWrap && expandBtn) {
    if (pubs.length > 3) {
      expandWrap.style.display = 'block';
      expandBtn.innerHTML = isPublicationsExpanded
        ? '<i class="fa-solid fa-chevron-up"></i> Show Less'
        : '<i class="fa-solid fa-chevron-down"></i> See All Publications &amp; Manuscripts';
      expandBtn.onclick = () => {
        isPublicationsExpanded = !isPublicationsExpanded;
        renderPublications();
        if (!isPublicationsExpanded) {
          const sec = document.getElementById('publications-sec');
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    } else {
      expandWrap.style.display = 'none';
    }
  }

  container.innerHTML = displayList.map(p => {
    const doiLink = p.doiUrl || (p.doi ? (p.doi.startsWith('http') ? p.doi : `https://doi.org/${p.doi}`) : '');
    const isOsfDoi = doiLink && (doiLink.includes('osf.io') || (Array.isArray(p.categories) && p.categories.includes('osf')) || p.filter === 'osf');
    const osfLink = p.osfUrl || '';
    const scholarLink = p.scholarUrl || '';
    const orcidLink = p.orcidUrl || p.preprintUrl || '';

    return `
      <div class="pub-entry-card">
        <div class="pub-year-col">
          <div class="pub-year-badge">${escapeHTML(p.year)}</div>
          <span class="pub-status-label ${getPubStatusClass(p.status)}">${escapeHTML(p.status)}</span>
        </div>
        <div class="pub-content-col">
          <div class="pub-title-row">
            <h4 class="pub-paper-title">${escapeHTML(p.title)}</h4>
            <div class="pub-badges-group">
              ${(p.documents && p.documents.length > 0) ? `
                <button type="button" class="btn-evidence-trigger btn-docs-trigger" onclick="openDocsModal('${escapeHTML(p.id)}', 'publication', event)" title="View Documents &amp; Presentation Slides">
                  <i class="fa-solid fa-file-lines"></i> Docs &amp; Briefs (${p.documents.length})
                </button>
              ` : ''}
              ${p.images && p.images.length > 0 ? `
                <button type="button" class="btn-evidence-trigger" onclick="openEvidenceModal('${escapeHTML(p.id)}', 'publication', event)" title="View Evidence &amp; Findings">
                  <i class="fa-solid fa-camera"></i> Evidence &amp; Findings (${p.images.length})
                </button>
              ` : ''}
              ${doiLink ? `
                <a href="${escapeHTML(doiLink)}" target="_blank" rel="noopener noreferrer" class="badge-doi ${isOsfDoi ? 'badge-osf' : ''}">
                  <i class="fa-solid ${isOsfDoi ? 'fa-dna' : 'fa-fingerprint'}"></i> ${isOsfDoi ? 'OSF (DOI)' : 'DOI'}
                </a>
              ` : ''}
              ${(osfLink && !isOsfDoi) ? `
                <a href="${escapeHTML(osfLink)}" target="_blank" rel="noopener noreferrer" class="badge-doi badge-osf">
                  <i class="fa-solid fa-dna"></i> OSF
                </a>
              ` : ''}
              ${scholarLink ? `
                <a href="${escapeHTML(scholarLink)}" target="_blank" rel="noopener noreferrer" class="badge-doi badge-scholar">
                  <i class="fa-brands fa-google-scholar"></i> Scholar
                </a>
              ` : ''}
              ${orcidLink ? `
                <a href="${escapeHTML(orcidLink)}" target="_blank" rel="noopener noreferrer" class="badge-doi badge-orcid">
                  <i class="fa-brands fa-orcid"></i> ${p.orcidUrl ? 'ORCID' : 'Preprint'}
                </a>
              ` : ''}
            </div>
          </div>
          <div class="pub-authors-line">${escapeHTML(p.authors)}</div>
          <div class="pub-venue-line">${escapeHTML(p.venue)}</div>
          <p class="pub-abstract-text">${escapeHTML(p.abstract)}</p>
        </div>
      </div>
    `;
  }).join('');
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
      isPublicationsExpanded = false;
      renderPublications();
    });
  });
}

/* --------------------------------------------------------------------------
   6. Training & Certification (3-Column Grid with 26 Certificates & Modals)
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   6. Training & Certification (4-Column Grid with 8 Initial Prioritized Cards)
   -------------------------------------------------------------------------- */
function renderDistinctionBadge(type) {
  if (!type || type.toLowerCase() === 'none') return '';
  const t = type.toLowerCase();
  if (t === 'award') {
    return '<span class="distinction-badge distinction-award"><i class="fa-solid fa-trophy"></i> Award</span>';
  } else if (t === 'honor') {
    return '<span class="distinction-badge distinction-honor"><i class="fa-solid fa-medal"></i> Honor</span>';
  } else if (t === 'volunteer') {
    return '<span class="distinction-badge distinction-volunteer"><i class="fa-solid fa-handshake-angle"></i> Volunteer</span>';
  } else if (t === 'international training' || t === 'training') {
    return '<span class="distinction-badge distinction-training"><i class="fa-solid fa-globe"></i> International Training</span>';
  }
  return `<span class="distinction-badge">${escapeHTML(type)}</span>`;
}

function renderTrainings(certs) {
  const container = document.getElementById('trainings-grid-container');
  if (!container) return;

  const allCerts = certs || window.portfolioData?.certificates || window.portfolioData?.trainings || [];
  const displayList = isCertificatesExpanded ? allCerts : allCerts.slice(0, 6);

  container.innerHTML = displayList.map((t, index) => {
    const fullIndex = allCerts.indexOf(t) !== -1 ? allCerts.indexOf(t) : index;
    const issuer = t.issuer || t.organization || 'Issuing Authority';
    const desc = t.description || t.summary || '';
    const distinctionBadgeHtml = renderDistinctionBadge(t.distinctionBadge);

    return `
      <div class="training-card">
        <div>
          <div class="training-header">
            <div class="training-badges-group" style="display: inline-flex; align-items: center; gap: 5px; flex-wrap: wrap;">
              <span class="training-badge"><i class="fa-solid fa-award"></i> Certificate</span>
              ${distinctionBadgeHtml}
            </div>
            <span class="training-date">${escapeHTML(t.date || '')}</span>
          </div>
          <h4 class="training-title" title="${escapeHTML(t.title)}">${escapeHTML(t.title)}</h4>
          <div class="training-org" title="${escapeHTML(issuer)}">
            <i class="fa-solid fa-building-columns"></i> ${escapeHTML(issuer)}
          </div>
          ${t.shortHighlight ? `
            <div class="training-short-highlight" style="font-size: 11.5px; font-weight: 600; color: #0d9488; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(t.shortHighlight)}">
              ${escapeHTML(t.shortHighlight)}
            </div>
          ` : ''}
          <p class="training-summary">${escapeHTML(desc)}</p>
          ${t.credentialId ? `
            <div class="training-credential-badge" title="Credential ID: ${escapeHTML(t.credentialId)}">
              <i class="fa-solid fa-id-badge"></i> ID: ${escapeHTML(t.credentialId)}
            </div>
          ` : ''}
        </div>

        <div class="training-footer-actions" style="display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
          <button class="btn-training-more" onclick="openTrainingDetailModal(${fullIndex})">
            ...more
          </button>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            ${(t.documents && t.documents.length > 0) ? `
              <button type="button" class="btn-evidence-trigger btn-docs-trigger" onclick="openDocsModal('${escapeHTML(t.id || fullIndex)}', 'certificate', event)" title="View Course Reports &amp; Documents">
                <i class="fa-solid fa-file-lines"></i> Docs &amp; Briefs (${t.documents.length})
              </button>
            ` : ''}
            <button type="button" class="btn-evidence-trigger btn-evidence-cert" onclick="openPracticalModal('${escapeHTML(t.id || fullIndex)}', event)" title="View Practical Outputs">
              <i class="fa-solid fa-camera"></i> Practical${(t.practicalImages && t.practicalImages.length > 0) ? ` (${t.practicalImages.length})` : ''}
            </button>
            ${t.credentialUrl ? `
              <a href="${escapeHTML(t.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn-credentials" style="padding: 0.3rem 0.5rem; background: var(--accent-blue-light); color: var(--accent-blue); border-color: var(--accent-blue);" title="Verify Online">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            ` : ''}
            <button class="btn-credentials" onclick="openCredentialsLightbox(${fullIndex})">
              <i class="fa-solid fa-certificate"></i> Credentials
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Clean Centered Expand Button (3x2 Initial Grid -> 6 Cards)
  const expandBtn = document.getElementById('certificates-expand-btn');
  if (expandBtn) {
    if (allCerts.length <= 6) {
      expandBtn.style.display = 'none';
    } else {
      expandBtn.style.display = 'inline-flex';
      expandBtn.innerHTML = isCertificatesExpanded
        ? '<i class="fa-solid fa-chevron-up"></i> Show Less'
        : `<i class="fa-solid fa-chevron-down"></i> See All Certifications (${allCerts.length})`;
      expandBtn.onclick = () => {
        isCertificatesExpanded = !isCertificatesExpanded;
        renderTrainings(allCerts);
      };
    }
  }
}

function openTrainingDetailModal(index) {
  const allCerts = window.portfolioData?.certificates || window.portfolioData?.trainings || [];
  const t = allCerts[index];
  if (!t) return;

  const modal = document.getElementById('lightbox-modal');
  const title = document.getElementById('lightbox-title');
  const media = document.getElementById('lightbox-media-container');
  const caption = document.getElementById('lightbox-caption');

  const issuer = t.issuer || t.organization || 'Issuing Authority';
  const desc = t.description || t.fullDetails || t.summary || '';
  const distinctionBadgeHtml = renderDistinctionBadge(t.distinctionBadge);

  title.textContent = t.title;
  media.innerHTML = `
    <div style="padding: 2.25rem; text-align: left; width: 100%; color: #fff;">
      <div style="font-size: 0.85rem; color: #14b8a6; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span><i class="fa-solid fa-building-columns"></i> ${escapeHTML(issuer)} &bull; ${escapeHTML(t.date || '')}</span>
        ${distinctionBadgeHtml}
      </div>
      <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: #fff;">${escapeHTML(t.title)}</h3>
      ${t.shortHighlight ? `
        <div style="font-size: 0.82rem; font-weight: 600; color: #2dd4bf; margin-bottom: 0.85rem;">
          ${escapeHTML(t.shortHighlight)}
        </div>
      ` : ''}
      <p style="font-size: 0.98rem; line-height: 1.75; color: #cbd5e1; margin-bottom: 1.25rem;">${escapeHTML(desc)}</p>
      
      ${t.credentialId ? `
        <div style="font-family: var(--font-mono); font-size: 0.85rem; color: #38bdf8; margin-bottom: 1.25rem; background: rgba(56, 189, 248, 0.1); padding: 0.5rem 0.85rem; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.25); display: inline-block;">
          <i class="fa-solid fa-id-badge"></i> Credential ID: <strong>${escapeHTML(t.credentialId)}</strong>
        </div>
      ` : ''}

      <div style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
        ${(t.documents && t.documents.length > 0) ? `
          <button type="button" class="btn-evidence-trigger btn-docs-trigger" onclick="openDocsModal('${escapeHTML(t.id || index)}', 'certificate', event)" title="View Course Reports &amp; Documents" style="padding: 0.5rem 1rem;">
            <i class="fa-solid fa-file-lines"></i> Docs &amp; Briefs (${t.documents.length})
          </button>
        ` : ''}
        <button type="button" class="btn-evidence-trigger" onclick="openPracticalModal('${escapeHTML(t.id || index)}', event)" title="View Practical Outputs" style="padding: 0.5rem 1rem;">
          <i class="fa-solid fa-camera"></i> Practical${(t.practicalImages && t.practicalImages.length > 0) ? ` (${t.practicalImages.length})` : ''}
        </button>
        ${t.credentialUrl ? `
          <a href="${escapeHTML(t.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn-credentials" style="background: #0284c7; color: #fff; border: none; padding: 0.5rem 1rem;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Verify Online
          </a>
        ` : ''}
        <button class="btn-credentials" onclick="openCredentialsLightbox(${index})" style="padding: 0.5rem 1rem;">
          <i class="fa-solid fa-image"></i> Open Certificate Image
        </button>
      </div>
    </div>
  `;
  caption.textContent = `Issued by: ${issuer} (${t.date || ''})`;

  // Attach direct close listener to close button inside modal
  const closeBtn = document.getElementById('lightbox-close-btn') || modal.querySelector('.lightbox-close-btn');
  if (closeBtn) {
    closeBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeAllModals();
    };
  }

  modal.style.display = 'flex';
  modal.classList.add('active', 'open', 'show');
  document.body.style.overflow = 'hidden';
}

function openCredentialsLightbox(index) {
  const allCerts = window.portfolioData?.certificates || window.portfolioData?.trainings || [];
  const t = allCerts[index];
  if (!t) return;

  const modal = document.getElementById('lightbox-modal');
  const title = document.getElementById('lightbox-title');
  const media = document.getElementById('lightbox-media-container');
  const caption = document.getElementById('lightbox-caption');

  const file = t.image || t.certificateFile || 'Banner.png';
  const issuer = t.issuer || t.organization || 'Issuing Authority';

  title.textContent = `${t.title} — Verified Certificate`;
  media.innerHTML = `
    <img src="${escapeHTML(file)}" alt="${escapeHTML(t.title)} Certificate" style="max-height: 520px; width: auto; max-width: 100%; object-fit: contain;">
  `;
  caption.innerHTML = `
    <div><strong>${escapeHTML(t.title)}</strong> &bull; ${escapeHTML(issuer)} (${escapeHTML(t.date || '')})</div>
    ${t.credentialId ? `<div style="font-size: 0.78rem; font-family: var(--font-mono); color: #38bdf8; margin-top: 0.25rem;">Credential ID: ${escapeHTML(t.credentialId)}</div>` : ''}
    <div class="lightbox-actions-bar" style="margin-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
      <a href="${escapeHTML(file)}" target="_blank" download class="btn-credentials">
        <i class="fa-solid fa-download"></i> Download Certificate
      </a>
      ${t.credentialUrl ? `
        <a href="${escapeHTML(t.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn-credentials" style="background: #0284c7; color: #fff; border: none;">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Verify Online
        </a>
      ` : ''}
    </div>
  `;

  // Attach direct close listener to close button inside modal
  const certCloseBtn = document.getElementById('lightbox-close-btn') || modal.querySelector('.lightbox-close-btn');
  if (certCloseBtn) {
    certCloseBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeAllModals();
    };
  }

  modal.style.display = 'flex';
  modal.classList.add('active', 'open', 'show');
  document.body.style.overflow = 'hidden';
}

/* --------------------------------------------------------------------------
   7. Recent Updates (Auto-Scrolling Vertical Ticker) & Gallery Marquee
   -------------------------------------------------------------------------- */
function renderRecentUpdatesTicker(updates) {
  const container = document.getElementById('updates-ticker-list');
  if (!container || !updates) return;

  // Duplicate for seamless infinite loop
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

function renderGalleryMarquee() {
  const container = document.getElementById('gallery-marquee-track');
  if (!container || !window.portfolioData?.gallery) return;

  let items = window.portfolioData.gallery;
  if (currentGalleryFilter === 'all') {
    // 1. All Photos (displays all academic, field exposure, fieldwork, wildlife rescue, lab, clinical, data, and conference/networking photos; keeps Hobbies separated under its own tab)
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat !== 'hobbies' && f !== 'hobbies';
    });
  } else if (currentGalleryFilter === 'academic') {
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat.includes('academic') || f.includes('academic');
    });
  } else if (currentGalleryFilter === 'fieldwork') {
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat === 'fieldwork' || cat === 'field work' || f === 'fieldwork';
    });
  } else if (currentGalleryFilter === 'wildlife') {
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat.includes('wildlife') || f === 'wildlife';
    });
  } else if (currentGalleryFilter === 'lab') {
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat.includes('lab') || f === 'lab';
    });
  } else if (currentGalleryFilter === 'data') {
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat.includes('data') || cat.includes('architecture') || f === 'data' || f === 'software';
    });
  } else if (currentGalleryFilter === 'conferences') {
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat.includes('conference') || cat.includes('networking') || f === 'conferences' || f === 'awards';
    });
  } else if (currentGalleryFilter === 'hobbies') {
    items = items.filter(g => {
      const cat = (g.category || '').toLowerCase();
      const f = (g.categoryFilter || '').toLowerCase();
      return cat === 'hobbies' || f === 'hobbies';
    });
  } else {
    items = items.filter(g => g.categoryFilter === currentGalleryFilter || g.category === currentGalleryFilter);
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; color: var(--text-muted); text-align: center; width: 100%;">
        No photos found in this category.
      </div>
    `;
    return;
  }

  // Ensure filtered category views never render duplicate DOM clones
  const displayList = items;

  container.innerHTML = displayList.map(item => {
    const originalIdx = window.portfolioData.gallery.indexOf(item);
    return `
      <div class="gallery-photo-card" onclick="openGalleryItem(${originalIdx})" title="${escapeHTML(item.category || 'Gallery Photo')}">
        <img src="${formatImagePath(item.thumbnail || item.mediaUrl)}" alt="${escapeHTML(item.category || 'Gallery Photo')}" loading="lazy" decoding="async">
      </div>
    `;
  }).join('');
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

  if (title) {
    if (item.title && item.title.trim().length > 0) {
      title.textContent = item.title;
      title.style.display = 'block';
    } else {
      title.textContent = item.category || 'Gallery Photo';
      title.style.display = 'block';
    }
  }

  if (caption) {
    if (item.caption && item.caption.trim().length > 0) {
      caption.textContent = item.caption;
      caption.style.display = 'block';
    } else {
      caption.textContent = '';
      caption.style.display = 'none';
    }
  }

  if (item.type === 'document') {
    const drivePreview = (item.mediaUrl || '').replace('/view?usp=drive_link', '/preview').replace('/view', '/preview');
    media.innerHTML = `<iframe src="${escapeHTML(drivePreview)}" allow="autoplay"></iframe>`;
  } else if (item.type === 'video') {
    media.innerHTML = `<iframe src="${escapeHTML(item.mediaUrl)}" frameborder="0" allowfullscreen></iframe>`;
  } else {
    media.innerHTML = `<img src="${formatImagePath(item.mediaUrl)}" alt="${escapeHTML(item.title || item.category || 'Photo')}">`;
  }

  // Attach direct close listener to close button inside modal
  const closeBtn = document.getElementById('lightbox-close-btn') || modal.querySelector('.lightbox-close-btn');
  if (closeBtn) {
    closeBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeAllModals();
    };
  }

  modal.style.display = 'flex';
  modal.classList.add('active', 'open', 'show');
  document.body.style.overflow = 'hidden';
}

/* --------------------------------------------------------------------------
   8. Leadership, References & Contact
   -------------------------------------------------------------------------- */
function renderLeadership(leadership) {
  const container = document.getElementById('leadership-list-container');
  if (!container) return;
  const list = leadership || window.portfolioData?.leadership || [];
  if (!list || list.length === 0) return;

  // 4 items displayed by default in compact 2x2 grid
  const displayList = isLeadershipExpanded ? list : list.slice(0, 4);

  container.innerHTML = displayList.map(l => `
    <div class="leadership-card">
      <div class="lead-role">${escapeHTML(l.role)}</div>
      <div class="lead-org">${escapeHTML(l.organization)}</div>
      <div class="lead-period"><i class="fa-solid fa-calendar-days" style="margin-right: 5px; font-size: 0.75rem;"></i>${escapeHTML(l.period)}</div>
      <p class="lead-desc">${escapeHTML(l.details || l.description || '')}</p>
    </div>
  `).join('');

  // Manage See All Leadership & Activities / Show Less toggle button
  const expandWrap = document.getElementById('leadership-expand-wrap');
  const expandBtn = document.getElementById('leadership-expand-btn');
  if (expandWrap && expandBtn) {
    if (list.length > 4) {
      expandWrap.style.display = 'block';
      expandBtn.innerHTML = isLeadershipExpanded
        ? '<i class="fa-solid fa-chevron-up"></i> Show Less'
        : `<i class="fa-solid fa-chevron-down"></i> See All Leadership &amp; Activities (${list.length})`;
      expandBtn.onclick = () => {
        isLeadershipExpanded = !isLeadershipExpanded;
        renderLeadership(window.portfolioData?.leadership || leadership);
      };
    } else {
      expandWrap.style.display = 'none';
    }
  }
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

function renderContact(p) {
  const container = document.getElementById('contact-links-grid-container');
  if (!container || !p) return;

  const c = p.contact || {};
  const s = p.social || {};

  const links = [
    { name: 'View CV (Google Drive)', icon: 'fa-solid fa-file-pdf', url: p.cvDriveUrl },
    { name: 'Primary Email', icon: 'fa-solid fa-envelope', url: `mailto:${c.emailPrimary}` },
    { name: 'University Email', icon: 'fa-solid fa-graduation-cap', url: `mailto:${c.emailUniversity}` },
    { name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', url: c.whatsapp },
    { name: 'Google Scholar', icon: 'fa-brands fa-google-scholar', url: s.scholar },
    { name: 'ORCID', icon: 'fa-brands fa-orcid', url: s.orcid },
    { name: 'LinkedIn', icon: 'fa-brands fa-linkedin', url: s.linkedin },
    { name: 'OSF (DOI)', icon: 'fa-solid fa-dna', url: s.osf },
    { name: 'ResearchGate', icon: 'fa-brands fa-researchgate', url: s.researchgate },
    { name: 'GitHub', icon: 'fa-brands fa-github', url: s.github },
    { name: 'Google Sites', icon: 'fa-solid fa-globe', url: p.googleSitesUrl },
    { name: 'Facebook', icon: 'fa-brands fa-facebook', url: s.facebook },
    { name: 'Instagram', icon: 'fa-brands fa-instagram', url: s.instagram }
  ];

  container.innerHTML = links.filter(l => l.url).map(l => `
    <a href="${escapeHTML(l.url)}" target="_blank" rel="noopener noreferrer" class="contact-pill-link">
      <i class="${escapeHTML(l.icon)}"></i>
      <span>${escapeHTML(l.name)}</span>
    </a>
  `).join('');
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('contact-submit-btn') || form.querySelector('button[type="submit"]');
  const btnText = document.getElementById('contact-btn-text');
  const statusMsg = document.getElementById('contact-status-msg');
  const mailAppLink = document.getElementById('contact-mail-app-link');

  // Dynamically update mailto fallback href as user types
  function updateMailtoFallback() {
    if (!mailAppLink) return;
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';
    const subject = encodeURIComponent(name ? `Portfolio Inquiry from ${name}` : 'Portfolio Inquiry');
    const body = encodeURIComponent(message || 'Hello Nafiz,');
    mailAppLink.href = `mailto:mdnafizurrahman8024@gmail.com?subject=${subject}&body=${body}`;
  }

  ['contact-name', 'contact-email', 'contact-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateMailtoFallback);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';

    if (!name || !email || !message) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending...';
      else submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    }

    try {
      const res = await fetch("https://formsubmit.co/ajax/mdnafizurrahman8024@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: "Portfolio Inquiry from " + name
        })
      });

      const data = await res.json();
      if (res.ok) {
        form.reset();
        updateMailtoFallback();
        showToast('Thank you! Your message has been sent to mdnafizurrahman8024@gmail.com.', 'success');
        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.style.background = 'rgba(16, 185, 129, 0.15)';
          statusMsg.style.color = '#10b981';
          statusMsg.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          statusMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent to mdnafizurrahman8024@gmail.com.';
        }
      } else {
        throw new Error(data.message || 'Transmission failed');
      }
    } catch (err) {
      console.warn('FormSubmit network notice, fallback enabled:', err);
      showToast('Notice: Could not send directly. Please use "Send via Mail App".', 'error');
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(239, 68, 68, 0.15)';
        statusMsg.style.color = '#ef4444';
        statusMsg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Could not send automatically. Please click <strong>Send via Mail App</strong> to send directly.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
        else submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      }
    }
  });
}

/* ==========================================================================
   9. NO-CODE GITHUB AUTO-SYNC CMS (100% RUNTIME AUTH)
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
  if (authForm && typeof handleAdminAuthSubmit === 'function') authForm.onsubmit = handleAdminAuthSubmit;

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn && typeof handleAdminLogout === 'function') logoutBtn.onclick = handleAdminLogout;

  const publishBtn = document.getElementById('admin-publish-btn');
  if (publishBtn && typeof handlePublishToGitHub === 'function') publishBtn.onclick = handlePublishToGitHub;

  const fileInput = document.getElementById('admin-file-upload');
  if (fileInput && typeof handleFileUploadStaging === 'function') fileInput.onchange = handleFileUploadStaging;

  const addCertForm = document.getElementById('admin-add-cert-form');
  if (addCertForm && typeof handleAddCertificateSubmit === 'function') addCertForm.onsubmit = handleAddCertificateSubmit;

  if (typeof initAllAdminDropzones === 'function') {
    initAllAdminDropzones();
  }
}

function handleAdminAuthSubmit(e) {
  if (e) e.preventDefault();
  const pass = document.getElementById('admin-passcode')?.value;
  const token = document.getElementById('admin-token')?.value;
  if (!pass || !token) return showToast('Please enter both passcode and GitHub token.', 'error');
  localStorage.setItem('admin_passcode_hash', btoa(pass));
  localStorage.setItem('admin_gh_token', token);
  sessionStorage.setItem('admin_unlocked', 'true');
  showToast('Admin access unlocked!', 'success');
  checkAdminAuthState();
}

function handleAdminLogout() {
  localStorage.removeItem('admin_gh_token');
  localStorage.removeItem('admin_passcode_hash');
  sessionStorage.removeItem('admin_unlocked');
  showToast('Credentials cleared.', 'success');
  checkAdminAuthState();
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
    switchAdminTab(currentAdminTab || 'pubs');
  } else {
    authGate.style.display = 'flex';
    mainManager.style.display = 'none';
  }
}

/* --------------------------------------------------------------------------
   Admin Drawer Tab Navigation & Managers
   -------------------------------------------------------------------------- */
function switchAdminTab(tab) {
  currentAdminTab = tab;
  ['pubs', 'research', 'projects', 'certs', 'gallery', 'json'].forEach(t => {
    const btn = document.getElementById(`admin-nav-btn-${t}`);
    const pane = document.getElementById(`admin-pane-${t}`);
    if (btn) {
      if (t === tab) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    if (pane) {
      if (t === tab) pane.classList.add('active');
      else pane.classList.remove('active');
    }
  });

  if (tab === 'pubs') {
    populateAdminPubsManager();
  } else if (tab === 'research') {
    populateAdminResearchManager();
  } else if (tab === 'projects') {
    populateAdminProjectsManager();
  } else if (tab === 'certs') {
    populateAdminCertsManager();
  } else if (tab === 'gallery') {
    populateAdminGalleryManager();
  } else if (tab === 'json') {
    populateAdminForms();
  }
}
window.switchAdminTab = switchAdminTab;

/* --------------------------------------------------------------------------
   Publications Manager in Admin Drawer (Reordering + In-Place Editor)
   -------------------------------------------------------------------------- */
function populateAdminPubsManager() {
  const listEl = document.getElementById('admin-pubs-reorder-list');
  const select = document.getElementById('admin-pub-select');
  const form = document.getElementById('admin-pub-form');
  const presetSelect = document.getElementById('admin-pub-badge-preset');
  const customBadgeInput = document.getElementById('admin-pub-badge-custom');

  if (!window.portfolioData?.publications) return;
  const pubs = window.portfolioData.publications;

  // 1. Populate Reorder List
  if (listEl) {
    if (pubs.length === 0) {
      listEl.innerHTML = '<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">No publications found.</div>';
    } else {
      listEl.innerHTML = pubs.map((p, idx) => {
        const isFeatured = idx < 3;
        const posText = isFeatured ? `#${idx + 1} — Top 3 Featured` : `#${idx + 1}`;
        return `
          <div class="admin-reorder-item" draggable="true" data-index="${idx}">
            <span class="admin-pos-badge ${isFeatured ? 'is-featured' : ''}">${posText}</span>
            <span class="admin-reorder-title" title="${escapeHTML(p.title)}">${escapeHTML(p.title)}</span>
            <div class="admin-reorder-btns">
              ${idx > 0 ? `
                <button type="button" class="admin-reorder-btn" title="Move Up" onclick="movePubItem(${idx}, ${idx - 1})">
                  <i class="fa-solid fa-arrow-up"></i>
                </button>
              ` : ''}
              ${idx < pubs.length - 1 ? `
                <button type="button" class="admin-reorder-btn" title="Move Down" onclick="movePubItem(${idx}, ${idx + 1})">
                  <i class="fa-solid fa-arrow-down"></i>
                </button>
              ` : ''}
              <button type="button" class="admin-reorder-btn" title="Edit in form" onclick="selectPubInAdmin(${idx})">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" class="admin-reorder-btn" title="Delete publication" onclick="deletePubInAdmin(${idx})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Attach Drag & Drop Listeners
      const items = listEl.querySelectorAll('.admin-reorder-item');
      items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          draggedPubIdx = parseInt(item.getAttribute('data-index'));
          item.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
          item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('drag-over');
          const targetIdx = parseInt(item.getAttribute('data-index'));
          if (draggedPubIdx !== null && draggedPubIdx !== targetIdx) {
            movePubItem(draggedPubIdx, targetIdx);
          }
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          items.forEach(el => el.classList.remove('drag-over'));
        });
      });
    }
  }

  // 2. Populate Select Dropdown
  if (select) {
    select.innerHTML = `
      <option value="__new__">+ Add New Publication</option>
      ${pubs.map((p, idx) => `
        <option value="${idx}" ${currentEditingPubIndex === idx ? 'selected' : ''}>#${idx + 1}. ${escapeHTML(p.title.slice(0, 35))}${p.title.length > 35 ? '...' : ''}</option>
      `).join('')}
    `;

    select.onchange = () => {
      const val = select.value;
      if (val === '__new__') {
        currentEditingPubIndex = -1;
        loadPubIntoAdminForm('__new__');
      } else {
        const idx = parseInt(val);
        currentEditingPubIndex = idx;
        loadPubIntoAdminForm(idx);
      }
    };
  }

  // 3. Preset dropdown handler
  if (presetSelect && customBadgeInput) {
    presetSelect.onchange = () => {
      if (presetSelect.value === '__custom__') {
        customBadgeInput.style.display = 'block';
        customBadgeInput.focus();
      } else {
        customBadgeInput.style.display = 'none';
      }
    };
  }

  // 4. Form Submit Handler
  if (form) {
    form.onsubmit = handleSavePubSubmit;
  }

  // 5. Initial form load
  if (currentEditingPubIndex >= 0 && currentEditingPubIndex < pubs.length) {
    if (select) select.value = String(currentEditingPubIndex);
    loadPubIntoAdminForm(currentEditingPubIndex);
  } else if (pubs.length > 0 && currentEditingPubIndex !== -1) {
    currentEditingPubIndex = 0;
    if (select) select.value = '0';
    loadPubIntoAdminForm(0);
  } else if (currentEditingPubIndex === -1) {
    if (select) select.value = '__new__';
    loadPubIntoAdminForm('__new__');
  }
}

function selectPubInAdmin(idx) {
  currentEditingPubIndex = idx;
  const select = document.getElementById('admin-pub-select');
  if (select) select.value = String(idx);
  loadPubIntoAdminForm(idx);
  const form = document.getElementById('admin-pub-form');
  if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.selectPubInAdmin = selectPubInAdmin;

function movePubItem(fromIdx, toIdx) {
  const pubs = window.portfolioData?.publications;
  if (!pubs || fromIdx < 0 || fromIdx >= pubs.length || toIdx < 0 || toIdx >= pubs.length) return;

  const [moved] = pubs.splice(fromIdx, 1);
  pubs.splice(toIdx, 0, moved);

  if (currentEditingPubIndex === fromIdx) {
    currentEditingPubIndex = toIdx;
  } else if (fromIdx < currentEditingPubIndex && toIdx >= currentEditingPubIndex) {
    currentEditingPubIndex--;
  } else if (fromIdx > currentEditingPubIndex && toIdx <= currentEditingPubIndex) {
    currentEditingPubIndex++;
  }

  renderPublications();
  populateAdminPubsManager();
  populateAdminForms();
  showToast(`Moved publication to position #${toIdx + 1}!`, 'success');
}
window.movePubItem = movePubItem;

function deletePubInAdmin(idx) {
  const pubs = window.portfolioData?.publications;
  if (!pubs || idx < 0 || idx >= pubs.length) return;
  if (confirm(`Are you sure you want to delete publication #${idx + 1}: "${pubs[idx].title}"?`)) {
    const deletedTitle = pubs[idx].title;
    pubs.splice(idx, 1);
    if (currentEditingPubIndex === idx) {
      currentEditingPubIndex = -1;
    } else if (currentEditingPubIndex > idx) {
      currentEditingPubIndex--;
    }
    renderPublications();
    populateAdminPubsManager();
    populateAdminForms();
    showToast(`Deleted: "${deletedTitle}"`, 'info');
  }
}
window.deletePubInAdmin = deletePubInAdmin;

function loadPubIntoAdminForm(idxOrNew) {
  const pubs = window.portfolioData?.publications || [];
  const titleEl = document.getElementById('admin-pub-title');
  const authorsEl = document.getElementById('admin-pub-authors');
  const yearEl = document.getElementById('admin-pub-year');
  const venueEl = document.getElementById('admin-pub-venue');
  const presetEl = document.getElementById('admin-pub-badge-preset');
  const customBadgeEl = document.getElementById('admin-pub-badge-custom');
  const catEl = document.getElementById('admin-pub-category');
  const absEl = document.getElementById('admin-pub-abstract');
  const doiEl = document.getElementById('admin-pub-doi');
  const osfEl = document.getElementById('admin-pub-osf');
  const scholarEl = document.getElementById('admin-pub-scholar');
  const orcidEl = document.getElementById('admin-pub-orcid');

  if (idxOrNew === '__new__' || idxOrNew < 0 || idxOrNew >= pubs.length) {
    currentEditingPubIndex = -1;
    if (titleEl) titleEl.value = '';
    if (authorsEl) authorsEl.value = 'Md. Nafizur Rahman (Co-author) et al.';
    if (yearEl) yearEl.value = '2026';
    if (venueEl) venueEl.value = '';
    if (presetEl) presetEl.value = 'ACCEPTED';
    if (customBadgeEl) {
      customBadgeEl.value = '';
      customBadgeEl.style.display = 'none';
    }
    if (catEl) catEl.value = 'Research Articles (Published/Accepted)';
    if (absEl) absEl.value = '';
    if (doiEl) doiEl.value = '';
    if (osfEl) osfEl.value = '';
    if (scholarEl) scholarEl.value = 'https://scholar.google.com/citations?user=bImpEzMAAAAJ&hl=en';
    if (orcidEl) orcidEl.value = '';
    renderAdminItemImagesGrid('pubs', []);
    if (typeof renderAdminDocsList === 'function') renderAdminDocsList('pubs');
    return;
  }

  const p = pubs[idxOrNew];
  if (!p) return;

  currentEditingPubIndex = idxOrNew;

  if (titleEl) titleEl.value = p.title || '';
  if (authorsEl) authorsEl.value = p.authors || '';
  if (yearEl) yearEl.value = p.year || '';
  if (venueEl) venueEl.value = p.venue || '';

  const standardPresets = [
    'ACCEPTED',
    'PUBLISHED',
    'SUBMITTED / UNDER REVIEW',
    'MANUSCRIPT READY',
    'DATA ANALYSIS',
    'ONGOING FIELDWORK',
    'CONFERENCE PAPER (1ST AUTHOR)',
    'CONFERENCE PAPER (CO-AUTHOR)'
  ];

  const currentStatusUpper = (p.status || '').toUpperCase().trim();
  const matchPreset = standardPresets.find(preset => preset === currentStatusUpper);

  if (matchPreset && presetEl) {
    presetEl.value = matchPreset;
    if (customBadgeEl) {
      customBadgeEl.value = '';
      customBadgeEl.style.display = 'none';
    }
  } else if (presetEl) {
    presetEl.value = '__custom__';
    if (customBadgeEl) {
      customBadgeEl.value = p.status || '';
      customBadgeEl.style.display = 'block';
    }
  }

  if (catEl) {
    if (p.category) {
      let matched = false;
      for (let i = 0; i < catEl.options.length; i++) {
        if (catEl.options[i].value.toLowerCase() === p.category.toLowerCase()) {
          catEl.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) catEl.value = p.category;
    } else {
      catEl.selectedIndex = 0;
    }
  }

  if (absEl) absEl.value = p.abstract || '';
  if (doiEl) doiEl.value = p.doiUrl || p.doi || '';
  if (osfEl) osfEl.value = p.osfUrl || '';
  if (scholarEl) scholarEl.value = p.scholarUrl || '';
  if (orcidEl) orcidEl.value = p.orcidUrl || p.preprintUrl || '';

  renderAdminItemImagesGrid('pubs', p.images || []);
  if (typeof renderAdminDocsList === 'function') renderAdminDocsList('pubs');
}

function handleSavePubSubmit(e) {
  e.preventDefault();
  const pubs = window.portfolioData?.publications;
  if (!pubs) return;

  const title = document.getElementById('admin-pub-title')?.value.trim();
  const authors = document.getElementById('admin-pub-authors')?.value.trim();
  const year = document.getElementById('admin-pub-year')?.value.trim();
  const venue = document.getElementById('admin-pub-venue')?.value.trim();
  const preset = document.getElementById('admin-pub-badge-preset')?.value;
  const custom = document.getElementById('admin-pub-badge-custom')?.value.trim();
  const category = document.getElementById('admin-pub-category')?.value;
  const abstract = document.getElementById('admin-pub-abstract')?.value.trim();
  const doi = document.getElementById('admin-pub-doi')?.value.trim();
  const osf = document.getElementById('admin-pub-osf')?.value.trim();
  const scholar = document.getElementById('admin-pub-scholar')?.value.trim();
  const orcid = document.getElementById('admin-pub-orcid')?.value.trim();

  if (!title || !authors || !year || !venue || !abstract) {
    return showToast('Please fill all required publication fields (*).', 'error');
  }

  const status = (preset === '__custom__') ? (custom || 'MANUSCRIPT READY') : preset;

  // Determine categories & filter mapping
  let categories = ['ongoing'];
  let filter = 'ongoing';

  if (category.includes('Articles')) {
    categories = ['articles'];
    filter = 'articles';
  } else if (category.includes('Conference')) {
    categories = ['conference'];
    filter = 'conference';
  } else if (category.includes('OSF')) {
    categories = ['osf', 'ongoing'];
    filter = 'osf';
  } else {
    categories = ['ongoing'];
    filter = 'ongoing';
  }

  const existingPub = (currentEditingPubIndex >= 0 && currentEditingPubIndex < pubs.length) ? pubs[currentEditingPubIndex] : null;

  const updatedPub = {
    id: existingPub?.id || ('pub-' + (pubs.length + 1)),
    title,
    authors,
    year,
    venue,
    status,
    category,
    categories,
    filter,
    abstract,
    doi: doi ? (doi.replace(/^https?:\/\/doi\.org\//i, '')) : (existingPub?.doi || ''),
    doiUrl: doi || '',
    osfUrl: osf || '',
    scholarUrl: scholar || '',
    orcidUrl: orcid || '',
    images: existingPub?.images || []
  };

  if (existingPub && currentEditingPubIndex >= 0 && currentEditingPubIndex < pubs.length) {
    // STRICT IN-PLACE REPLACEMENT: preserve exact array index
    pubs[currentEditingPubIndex] = updatedPub;
    showToast(`Publication #${currentEditingPubIndex + 1} updated in-place! Click "Save & Publish" to push to GitHub.`, 'success');
  } else {
    pubs.push(updatedPub);
    currentEditingPubIndex = pubs.length - 1;
    showToast(`New publication #${pubs.length} added! Click "Save & Publish" to push to GitHub.`, 'success');
  }

  renderPublications();
  populateAdminPubsManager();
  populateAdminForms();
}

function populateAdminProjectsManager() {
  const select = document.getElementById('admin-proj-select');
  if (!select) return;

  const projects = window.portfolioData?.softwareProjects || window.portfolioData?.projects || [];
  
  select.innerHTML = `
    <option value="__new__">+ Add New Project</option>
    ${projects.map(p => `
      <option value="${escapeHTML(p.id)}">${escapeHTML(p.name || p.title)} (${p.images?.length || 0} images)</option>
    `).join('')}
  `;

  select.onchange = () => {
    loadProjectIntoAdminForm(select.value);
  };

  // If newly opening, load the selected or first project
  if (projects.length > 0 && (select.value === '__new__' || !currentEditingProject)) {
    select.value = projects[0].id;
    loadProjectIntoAdminForm(projects[0].id);
  } else {
    loadProjectIntoAdminForm(select.value);
  }

  // Multi-image upload handler
  const imgInput = document.getElementById('admin-proj-images-input');
  if (imgInput) {
    imgInput.onchange = handleProjectMultiImageUpload;
  }

  // Form submit handler
  const projForm = document.getElementById('admin-project-form');
  if (projForm) {
    projForm.onsubmit = handleSaveProjectSubmit;
  }
}

function loadProjectIntoAdminForm(projId) {
  const projects = window.portfolioData?.softwareProjects || window.portfolioData?.projects || [];
  
  if (projId === '__new__') {
    currentEditingProject = {
      id: 'proj-' + Date.now(),
      name: '',
      title: '',
      category: 'mobile',
      categoryLabel: 'Mobile & AI Apps',
      typeBadge: '',
      role: 'Lead Architect & Developer',
      period: '2026 – Present',
      stars: 'Active Platform',
      brief: '',
      description: '',
      features: [],
      techStack: [],
      repoUrl: '',
      liveUrl: '',
      folder: '',
      images: []
    };
  } else {
    const found = projects.find(p => p.id === projId);
    currentEditingProject = found ? JSON.parse(JSON.stringify(found)) : null;
  }

  if (!currentEditingProject) return;

  const titleEl = document.getElementById('admin-proj-title');
  const catEl = document.getElementById('admin-proj-category');
  const badgeEl = document.getElementById('admin-proj-badge');
  const folderEl = document.getElementById('admin-proj-folder');
  const briefEl = document.getElementById('admin-proj-brief');
  const descEl = document.getElementById('admin-proj-desc');
  const featEl = document.getElementById('admin-proj-features');
  const techEl = document.getElementById('admin-proj-tech');
  const repoEl = document.getElementById('admin-proj-repo');
  const liveEl = document.getElementById('admin-proj-live');

  if (titleEl) titleEl.value = currentEditingProject.name || currentEditingProject.title || '';
  if (catEl) catEl.value = currentEditingProject.category || 'mobile';
  if (badgeEl) badgeEl.value = currentEditingProject.typeBadge || currentEditingProject.type || '';
  if (folderEl) folderEl.value = currentEditingProject.folder || '';
  if (briefEl) briefEl.value = currentEditingProject.brief || currentEditingProject.description || '';
  if (descEl) descEl.value = currentEditingProject.description || currentEditingProject.brief || '';
  if (featEl) featEl.value = (currentEditingProject.features || currentEditingProject.highlights || []).join('\n');
  if (techEl) techEl.value = (currentEditingProject.techStack || []).join(', ');
  if (repoEl) repoEl.value = currentEditingProject.repoUrl || '';
  if (liveEl) liveEl.value = currentEditingProject.liveUrl || '';

  renderAdminProjectImagesGrid();
  if (typeof renderAdminDocsList === 'function') renderAdminDocsList('projects');
}

function renderAdminProjectImagesGrid() {
  const grid = document.getElementById('admin-proj-img-grid');
  const countEl = document.getElementById('admin-proj-img-count');
  if (!grid || !currentEditingProject) return;

  const imgs = currentEditingProject.images || [];
  if (countEl) countEl.textContent = `${imgs.length} image${imgs.length !== 1 ? 's' : ''}`;

  if (imgs.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem; text-align: center;">No images attached yet. Select multiple images below to upload.</div>';
    return;
  }

  grid.innerHTML = imgs.map((img, idx) => `
    <div class="admin-img-preview-card ${idx === 0 ? 'is-cover' : ''}">
      <img src="${formatImagePath(img)}" alt="preview ${idx}">
      ${idx === 0 ? `<span class="admin-img-cover-badge">COVER</span>` : ''}
      <div class="admin-img-actions">
        ${idx > 0 ? `
          <button type="button" class="admin-img-action-btn" title="Set as Cover Image (#1)" onclick="setAdminProjectCover(${idx})">
            <i class="fa-solid fa-star"></i>
          </button>
        ` : ''}
        <button type="button" class="admin-img-action-btn" title="Remove image" onclick="removeAdminProjectImage(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function setAdminProjectCover(idx) {
  if (!currentEditingProject || !currentEditingProject.images) return;
  const imgs = currentEditingProject.images;
  const target = imgs.splice(idx, 1)[0];
  imgs.unshift(target);
  renderAdminProjectImagesGrid();
  showToast('Image set as primary cover (#1)!', 'success');
}
window.setAdminProjectCover = setAdminProjectCover;

function removeAdminProjectImage(idx) {
  if (!currentEditingProject || !currentEditingProject.images) return;
  currentEditingProject.images.splice(idx, 1);
  renderAdminProjectImagesGrid();
  showToast('Image removed from project.', 'info');
}
window.removeAdminProjectImage = removeAdminProjectImage;

function handleProjectMultiImageUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const folder = document.getElementById('admin-proj-folder')?.value.trim() || currentEditingProject.folder || currentEditingProject.name || 'Projects';
  let processed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function(evt) {
      const base64 = evt.target.result.split(',')[1];
      const relPath = `Github image/${folder}/${file.name}`;

      stagedFileUploads.push({
        path: relPath,
        content: base64,
        name: file.name
      });

      if (!currentEditingProject.images) currentEditingProject.images = [];
      if (!currentEditingProject.images.includes(relPath)) {
        currentEditingProject.images.push(relPath);
      }

      processed++;
      if (processed === files.length) {
        renderAdminProjectImagesGrid();
        showToast(`${files.length} images staged for ${folder}! Click "Save & Publish" to push to GitHub.`, 'success');
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleSaveProjectSubmit(e) {
  e.preventDefault();
  if (!currentEditingProject) return;

  const title = document.getElementById('admin-proj-title').value.trim();
  const cat = document.getElementById('admin-proj-category').value;
  const badge = document.getElementById('admin-proj-badge').value.trim();
  const folder = document.getElementById('admin-proj-folder').value.trim();
  const brief = document.getElementById('admin-proj-brief').value.trim();
  const desc = document.getElementById('admin-proj-desc').value.trim();
  const featRaw = document.getElementById('admin-proj-features').value;
  const techRaw = document.getElementById('admin-proj-tech').value;
  const repo = document.getElementById('admin-proj-repo').value.trim();
  const live = document.getElementById('admin-proj-live').value.trim();

  if (!title || !brief) {
    return showToast('Title and Card Brief are required.', 'error');
  }

  currentEditingProject.name = title;
  currentEditingProject.title = title;
  currentEditingProject.category = cat;
  currentEditingProject.typeBadge = badge;
  currentEditingProject.folder = folder;
  currentEditingProject.brief = brief;
  currentEditingProject.description = desc || brief;
  currentEditingProject.features = featRaw.split('\n').map(s => s.trim()).filter(Boolean);
  currentEditingProject.techStack = techRaw.split(',').map(s => s.trim()).filter(Boolean);
  currentEditingProject.repoUrl = repo;
  currentEditingProject.liveUrl = live;

  let projects = window.portfolioData?.softwareProjects || window.portfolioData?.projects || [];
  const existingIdx = projects.findIndex(p => p.id === currentEditingProject.id);

  if (existingIdx >= 0) {
    projects[existingIdx] = currentEditingProject;
  } else {
    projects.push(currentEditingProject);
  }

  window.portfolioData.softwareProjects = projects;
  window.portfolioData.projects = projects;

  renderSoftwareProjects(projects);
  populateAdminForms();
  populateAdminProjectsManager();
  showToast(`Project "${title}" staged! Click "Save & Publish" to commit to GitHub.`, 'success');
}

function populateAdminForms() {
  if (!window.portfolioData) return;
  const raw = document.getElementById('admin-raw-json');
  if (raw) raw.value = JSON.stringify(window.portfolioData, null, 2);
}

function handleAddCertificateSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('admin-cert-title').value.trim();
  const issuer = document.getElementById('admin-cert-issuer').value.trim();
  const date = document.getElementById('admin-cert-date').value.trim();
  const desc = document.getElementById('admin-cert-desc').value.trim();
  const credId = document.getElementById('admin-cert-id').value.trim();
  const credUrl = document.getElementById('admin-cert-url').value.trim();
  const badgeSelect = document.getElementById('admin-cert-badge');
  const distinctionBadge = badgeSelect ? badgeSelect.value : 'None';
  const highlightInput = document.getElementById('admin-cert-highlight');
  const shortHighlight = highlightInput ? highlightInput.value.trim() : '';
  const fileInput = document.getElementById('admin-cert-file');

  if (!title || !issuer || !date || !desc) {
    return showToast('Please fill all required certificate fields.', 'error');
  }

  const file = fileInput.files && fileInput.files[0];
  if (!file) {
    return showToast('Please select a certificate image file.', 'error');
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result.split(',')[1];
    const path = 'Certificate/' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    stagedFileUploads.push({ path, content: base64, name: file.name });

    const newCert = {
      id: 'cert-' + Date.now(),
      title,
      description: desc,
      date,
      issuer,
      credentialId: credId,
      credentialUrl: credUrl,
      image: path,
      distinctionBadge: distinctionBadge !== 'None' ? distinctionBadge : undefined,
      shortHighlight: shortHighlight || undefined,
      images: [],
      practicalImages: []
    };

    if (!window.portfolioData.certificates) window.portfolioData.certificates = [];
    window.portfolioData.certificates.unshift(newCert);
    window.portfolioData.trainings = window.portfolioData.certificates;

    renderTrainings(window.portfolioData.certificates);
    populateAdminForms();
    e.target.reset();
    showToast(`Certificate "${title}" staged! Click "Save & Publish" to push to GitHub.`, 'success');
  };
  reader.readAsDataURL(file);
}

function handleFileUploadStaging(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result.split(',')[1];
    const isDoc = file.name.endsWith('.pdf') || file.type === 'application/pdf';
    const folder = isDoc ? 'assets/docs/' : 'Certificate/';
    const path = folder + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    stagedFileUploads.push({ path, content: base64, name: file.name });

    const newCert = {
      id: 'cert-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      description: `Uploaded credential document: ${file.name}`,
      date: new Date().getFullYear().toString(),
      issuer: "Verified Credential",
      credentialId: "",
      credentialUrl: "",
      image: path,
      images: [],
      practicalImages: []
    };

    if (!window.portfolioData.certificates) window.portfolioData.certificates = [];
    window.portfolioData.certificates.unshift(newCert);
    window.portfolioData.trainings = window.portfolioData.certificates;

    renderTrainings(window.portfolioData.certificates);
    populateAdminForms();
    showToast(`File staged: ${file.name}. Click "Save & Publish" to commit.`, 'success');
  };
  reader.readAsDataURL(file);
}

/* --------------------------------------------------------------------------
   Research & Appointments Manager in Admin Drawer
   -------------------------------------------------------------------------- */
function populateAdminResearchManager() {
  const select = document.getElementById('admin-research-select');
  const form = document.getElementById('admin-research-form');
  const list = window.portfolioData?.scientificResearch || window.portfolioData?.research || [];

  if (select) {
    select.innerHTML = list.map((r, idx) => `
      <option value="${idx}" ${currentEditingResearchIndex === idx ? 'selected' : ''}>#${idx + 1}. ${escapeHTML((r.title || '').slice(0, 40))}${(r.title || '').length > 40 ? '...' : ''}</option>
    `).join('');

    select.onchange = () => {
      currentEditingResearchIndex = parseInt(select.value) || 0;
      loadResearchIntoAdminForm(currentEditingResearchIndex);
    };
  }

  if (form) {
    form.onsubmit = handleSaveResearchSubmit;
  }

  loadResearchIntoAdminForm(currentEditingResearchIndex);
}

function loadResearchIntoAdminForm(idx) {
  const list = window.portfolioData?.scientificResearch || window.portfolioData?.research || [];
  const r = list[idx];
  if (!r) return;

  const titleEl = document.getElementById('admin-research-title');
  const roleEl = document.getElementById('admin-research-role');
  const periodEl = document.getElementById('admin-research-period');
  const instEl = document.getElementById('admin-research-inst');
  const descEl = document.getElementById('admin-research-desc');

  if (titleEl) titleEl.value = r.title || '';
  if (roleEl) roleEl.value = r.badge || r.role || '';
  if (periodEl) periodEl.value = r.period || '';
  if (instEl) instEl.value = r.institution || r.lab || '';
  if (descEl) descEl.value = r.summary || r.description || '';

  renderAdminItemImagesGrid('research', r.images || []);
  if (typeof renderAdminDocsList === 'function') renderAdminDocsList('research');
}

function handleSaveResearchSubmit(e) {
  e.preventDefault();
  const list = window.portfolioData?.scientificResearch || window.portfolioData?.research;
  if (!list) return;

  const r = list[currentEditingResearchIndex];
  if (!r) return;

  const title = document.getElementById('admin-research-title')?.value.trim();
  const role = document.getElementById('admin-research-role')?.value.trim();
  const period = document.getElementById('admin-research-period')?.value.trim();
  const inst = document.getElementById('admin-research-inst')?.value.trim();
  const desc = document.getElementById('admin-research-desc')?.value.trim();

  if (!title || !role) {
    return showToast('Title and Role/Badge are required.', 'error');
  }

  r.title = title;
  r.badge = role;
  r.role = role;
  r.period = period;
  r.institution = inst;
  r.lab = inst;
  r.summary = desc;
  r.description = desc;

  window.portfolioData.scientificResearch = list;
  window.portfolioData.research = list;

  renderTimelineAndKPIs(list, window.portfolioData.kpis);
  populateAdminForms();
  showToast(`Research "${title}" updated! Click "Save & Publish" to push to GitHub.`, 'success');
}

/* --------------------------------------------------------------------------
   Certificates Manager (Practical Outputs) in Admin Drawer
   -------------------------------------------------------------------------- */
function populateAdminCertsManager() {
  const select = document.getElementById('admin-cert-select');
  const list = window.portfolioData?.certificates || window.portfolioData?.trainings || [];

  if (select) {
    select.innerHTML = list.map((c, idx) => `
      <option value="${idx}" ${currentEditingCertIndex === idx ? 'selected' : ''}>#${idx + 1}. ${escapeHTML((c.title || '').slice(0, 40))}${(c.title || '').length > 40 ? '...' : ''}</option>
    `).join('');

    select.onchange = () => {
      currentEditingCertIndex = parseInt(select.value) || 0;
      loadCertIntoAdminManager(currentEditingCertIndex);
    };
  }

  loadCertIntoAdminManager(currentEditingCertIndex);
}

function loadCertIntoAdminManager(idx) {
  const list = window.portfolioData?.certificates || window.portfolioData?.trainings || [];
  const c = list[idx];
  if (!c) return;

  renderAdminItemImagesGrid('certs', c.practicalImages || []);
  if (typeof renderAdminDocsList === 'function') renderAdminDocsList('certs');
}

/* --------------------------------------------------------------------------
   Unified Images & Captions Manager (Research, Publications, Certificates)
   -------------------------------------------------------------------------- */
function getAdminCurrentItem(category) {
  if (category === 'pubs') {
    const pubs = window.portfolioData?.publications;
    if (!pubs) return null;
    return (currentEditingPubIndex >= 0 && currentEditingPubIndex < pubs.length) ? pubs[currentEditingPubIndex] : null;
  } else if (category === 'research') {
    const list = window.portfolioData?.scientificResearch || window.portfolioData?.research;
    if (!list) return null;
    return (currentEditingResearchIndex >= 0 && currentEditingResearchIndex < list.length) ? list[currentEditingResearchIndex] : null;
  } else if (category === 'certs') {
    const list = window.portfolioData?.certificates || window.portfolioData?.trainings;
    if (!list) return null;
    return (currentEditingCertIndex >= 0 && currentEditingCertIndex < list.length) ? list[currentEditingCertIndex] : null;
  } else if (category === 'projects') {
    return currentEditingProject;
  }
  return null;
}

function renderAdminItemImagesGrid(category, images) {
  const grid = document.getElementById(`admin-${category}-img-grid`) || (category === 'certs' ? document.getElementById('admin-cert-img-grid') : null);
  const countEl = document.getElementById(`admin-${category}-img-count`) || (category === 'certs' ? document.getElementById('admin-cert-img-count') : null);
  if (!grid) return;

  const list = images || [];
  if (countEl) countEl.textContent = `${list.length} image${list.length !== 1 ? 's' : ''}`;

  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem; text-align: center;">No images attached yet. Select images below to upload.</div>';
    return;
  }

  grid.innerHTML = list.map((img, idx) => {
    const src = typeof img === 'object' && img !== null ? (img.src || img.url || '') : img;
    const caption = typeof img === 'object' && img !== null ? (img.caption || '') : '';
    return `
      <div class="admin-img-preview-card" style="display: flex; flex-direction: column; gap: 4px;">
        <div style="position: relative; width: 100%; aspect-ratio: 16/10; border-radius: 4px; overflow: hidden; background: #000;">
          <img src="${formatImagePath(src)}" alt="preview ${idx}" style="width: 100%; height: 100%; object-fit: cover;">
          <div class="admin-img-actions">
            <button type="button" class="admin-img-action-btn" title="Remove image" onclick="removeAdminItemImage('${category}', ${idx})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <input type="text" class="admin-img-caption-input" placeholder="Caption / Findings..." value="${escapeHTML(caption)}" oninput="updateAdminItemImageCaption('${category}', ${idx}, this.value)">
      </div>
    `;
  }).join('');
}
window.renderAdminItemImagesGrid = renderAdminItemImagesGrid;

function updateAdminItemImageCaption(category, idx, val) {
  const item = getAdminCurrentItem(category);
  if (!item) return;
  const list = category === 'certs' ? item.practicalImages : item.images;
  if (!list || !list[idx]) return;
  if (typeof list[idx] === 'string') {
    list[idx] = { src: list[idx], caption: val };
  } else {
    list[idx].caption = val;
  }
  populateAdminForms();
}
window.updateAdminItemImageCaption = updateAdminItemImageCaption;

function removeAdminItemImage(category, idx) {
  const item = getAdminCurrentItem(category);
  if (!item) return;
  const list = category === 'certs' ? item.practicalImages : item.images;
  if (!list || !list[idx]) return;
  list.splice(idx, 1);
  if (category === 'research') {
    window.portfolioData.scientificResearch = window.portfolioData.scientificResearch || window.portfolioData.research;
    window.portfolioData.research = window.portfolioData.scientificResearch;
    renderTimelineAndKPIs(window.portfolioData.scientificResearch, window.portfolioData.kpis);
  } else if (category === 'pubs') {
    renderPublications();
  } else if (category === 'certs') {
    window.portfolioData.certificates = window.portfolioData.certificates || window.portfolioData.trainings;
    window.portfolioData.trainings = window.portfolioData.certificates;
    renderTrainings(window.portfolioData.certificates);
  }
  renderAdminItemImagesGrid(category, list);
  populateAdminForms();
  showToast('Image removed.', 'info');
}
window.removeAdminItemImage = removeAdminItemImage;

function handleAdminMultiImageUpload(event, category) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const item = getAdminCurrentItem(category);
  if (!item) {
    return showToast('Please select an item first before uploading images.', 'error');
  }

  let folder = 'Research';
  if (category === 'pubs') folder = 'Publications';
  else if (category === 'certs') folder = 'Training-Outputs';

  let processed = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function(evt) {
      const base64 = evt.target.result.split(',')[1];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const relPath = `Github image/${folder}/${safeName}`;

      stagedFileUploads.push({
        path: relPath,
        content: base64,
        name: file.name
      });

      const caption = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      if (category === 'certs') {
        if (!item.practicalImages) item.practicalImages = [];
        item.practicalImages.push({
          src: relPath,
          caption: caption
        });
      } else {
        if (!item.images) item.images = [];
        item.images.push({
          src: relPath,
          caption: caption
        });
      }

      processed++;
      if (processed === files.length) {
        if (category === 'research') {
          window.portfolioData.scientificResearch = window.portfolioData.scientificResearch || window.portfolioData.research;
          window.portfolioData.research = window.portfolioData.scientificResearch;
          renderTimelineAndKPIs(window.portfolioData.scientificResearch, window.portfolioData.kpis);
        } else if (category === 'pubs') {
          renderPublications();
        } else if (category === 'certs') {
          window.portfolioData.certificates = window.portfolioData.certificates || window.portfolioData.trainings;
          window.portfolioData.trainings = window.portfolioData.certificates;
          renderTrainings(window.portfolioData.certificates);
        }
        const updatedList = category === 'certs' ? item.practicalImages : item.images;
        renderAdminItemImagesGrid(category, updatedList);
        populateAdminForms();
        showToast(`${files.length} image(s) staged! Click "Save & Publish" to push to GitHub.`, 'success');
      }
    };
    reader.readAsDataURL(file);
  }
}
window.handleAdminMultiImageUpload = handleAdminMultiImageUpload;

/* --------------------------------------------------------------------------
   CLIENT-SIDE IMAGE COMPRESSION (CANVAS) & DIRECT PDF READER
   -------------------------------------------------------------------------- */
function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.84) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ base64: e.target.result.split(',')[1], name: file.name, wasCompressed: false });
      reader.onerror = () => resolve({ base64: '', name: file.name, wasCompressed: false });
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const targetType = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(targetType, isPng ? undefined : quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, name: file.name, wasCompressed: true });
      };
      img.onerror = () => {
        const raw = e.target.result.split(',')[1];
        resolve({ base64: raw, name: file.name, wasCompressed: false });
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve({ base64: '', name: file.name, wasCompressed: false });
    reader.readAsDataURL(file);
  });
}
window.compressImageFile = compressImageFile;

function readPdfFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      resolve({ base64, name: file.name });
    };
    reader.onerror = () => resolve({ base64: '', name: file.name });
    reader.readAsDataURL(file);
  });
}
window.readPdfFile = readPdfFile;

/* --------------------------------------------------------------------------
   DRAG-AND-DROP FILE UPLOADER & STAGING (IMAGES & DIRECT PDFS)
   -------------------------------------------------------------------------- */
async function handleAdminDropzoneFiles(files, category) {
  if (!files || files.length === 0) return;

  const item = getAdminCurrentItem(category);
  if (!item) {
    return showToast('Please select an entry first before uploading files.', 'error');
  }

  let folder = 'Research';
  let docsSubfolder = 'Research';
  if (category === 'pubs') { folder = 'Publications'; docsSubfolder = 'Publications'; }
  else if (category === 'certs') { folder = 'Training-Outputs'; docsSubfolder = 'Certificates'; }
  else if (category === 'projects') {
    folder = document.getElementById('admin-proj-folder')?.value.trim() || item.folder || item.name || 'Projects';
    docsSubfolder = 'Projects';
  }

  let imageCount = 0;
  let pdfCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (isPdf) {
      const defaultTitle = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');
      const userTitle = prompt(`Enter a descriptive Title for this PDF:\n"${file.name}"`, defaultTitle);
      const title = (userTitle || defaultTitle).trim();

      const pdfData = await readPdfFile(file);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const relPath = `Documents/${docsSubfolder}/${safeName}`;

      stagedFileUploads.push({
        path: relPath,
        content: pdfData.base64,
        name: file.name
      });

      if (!Array.isArray(item.documents)) item.documents = [];
      item.documents.push({
        title: title,
        docType: 'pdf',
        url: relPath
      });
      pdfCount++;
    } else {
      // Image: Auto-compress via Canvas if > 1600px
      const imgData = await compressImageFile(file, 1600, 1600, 0.84);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const relPath = `Github image/${folder}/${safeName}`;

      stagedFileUploads.push({
        path: relPath,
        content: imgData.base64,
        name: file.name
      });

      const caption = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      if (category === 'certs') {
        if (!item.practicalImages) item.practicalImages = [];
        item.practicalImages.push({ src: relPath, caption: caption });
      } else if (category === 'projects') {
        if (!item.images) item.images = [];
        if (!item.images.includes(relPath)) item.images.push(relPath);
      } else {
        if (!item.images) item.images = [];
        item.images.push({ src: relPath, caption: caption });
      }
      imageCount++;
    }
  }

  // Update UI & Grids
  syncCategoryToUI(category);
  if (category === 'projects') {
    renderAdminProjectImagesGrid();
  } else {
    const updatedImages = category === 'certs' ? item.practicalImages : item.images;
    renderAdminItemImagesGrid(category, updatedImages);
  }
  renderAdminDocsList(category);
  populateAdminForms();

  let msg = [];
  if (imageCount > 0) msg.push(`${imageCount} optimized image(s)`);
  if (pdfCount > 0) msg.push(`${pdfCount} PDF document(s)`);
  showToast(`${msg.join(' & ')} staged! Click "Save & Publish" to push to GitHub.`, 'success');
}
window.handleAdminDropzoneFiles = handleAdminDropzoneFiles;

async function handleAdminGalleryDrop(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  const urlInput = document.getElementById('admin-gallery-url');

  const imgData = await compressImageFile(file, 1600, 1600, 0.84);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const relPath = `Github image/Gallery/${safeName}`;

  stagedFileUploads.push({
    path: relPath,
    content: imgData.base64,
    name: file.name
  });

  if (urlInput) urlInput.value = relPath;
  showToast(`Photo "${file.name}" optimized & staged into ${relPath}!`, 'success');
}
window.handleAdminGalleryDrop = handleAdminGalleryDrop;

/* --------------------------------------------------------------------------
   DOCUMENTS & GOOGLE DRIVE LINK BUILDER (ADMIN CONTENT MANAGER)
   -------------------------------------------------------------------------- */
function renderAdminDocsList(category) {
  const item = getAdminCurrentItem(category);
  const container = document.getElementById(`admin-${category}-docs-list`);
  const countEl = document.getElementById(`admin-${category}-docs-count`);
  if (!container) return;

  const docs = (item && Array.isArray(item.documents)) ? item.documents : [];
  if (countEl) countEl.textContent = `${docs.length} attached`;

  if (docs.length === 0) {
    container.innerHTML = '<div style="font-size: 0.75rem; color: var(--text-muted); padding: 0.4rem; text-align: center;">No documents attached yet.</div>';
    return;
  }

  container.innerHTML = docs.map((doc, idx) => {
    const badgeInfo = getDocBadgeInfo(doc);
    return `
      <div class="admin-doc-item-row">
        <div class="admin-doc-item-left">
          <span class="docs-type-badge ${badgeInfo.badgeClass}" style="font-size: 0.65rem; padding: 0.15rem 0.4rem;">
            <i class="${badgeInfo.icon}"></i>
          </span>
          <div style="min-width: 0;">
            <div class="admin-doc-item-title" title="${escapeHTML(doc.title || '')}">${escapeHTML(doc.title || 'Untitled Document')}</div>
            <div class="admin-doc-item-url" title="${escapeHTML(doc.url || '')}">${escapeHTML(doc.url || '')}</div>
          </div>
        </div>
        <div class="admin-doc-item-actions">
          ${idx > 0 ? `
            <button type="button" class="admin-doc-action-btn" title="Move Up" onclick="moveAdminDocLink('${category}', ${idx}, -1)">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
          ` : ''}
          ${idx < docs.length - 1 ? `
            <button type="button" class="admin-doc-action-btn" title="Move Down" onclick="moveAdminDocLink('${category}', ${idx}, 1)">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          ` : ''}
          <a href="${escapeHTML(doc.url || '#')}" target="_blank" rel="noopener noreferrer" class="admin-doc-action-btn" title="Preview / Open URL">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <button type="button" class="admin-doc-action-btn delete" title="Remove Document" onclick="removeAdminDocLink('${category}', ${idx})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}
window.renderAdminDocsList = renderAdminDocsList;

function addAdminDocLink(category) {
  const item = getAdminCurrentItem(category);
  if (!item) {
    return showToast('Please select or create an entry first.', 'error');
  }

  const titleInput = document.getElementById(`admin-${category}-doc-title`);
  const typeSelect = document.getElementById(`admin-${category}-doc-type`);
  const urlInput = document.getElementById(`admin-${category}-doc-url`);

  const title = (titleInput?.value || '').trim();
  const docType = typeSelect?.value || 'drive';
  const url = (urlInput?.value || '').trim();

  if (!title) {
    return showToast('Please enter a clear descriptive title for this document.', 'error');
  }
  if (!url) {
    return showToast('Please enter a valid Google Drive or document URL.', 'error');
  }

  if (!Array.isArray(item.documents)) {
    item.documents = [];
  }

  item.documents.push({
    title: title,
    docType: docType,
    url: url
  });

  if (titleInput) titleInput.value = '';
  if (urlInput) urlInput.value = '';

  renderAdminDocsList(category);
  syncCategoryToUI(category);
  populateAdminForms();
  showToast(`Added "${title}"! Click "Save & Publish" to push to GitHub.`, 'success');
}
window.addAdminDocLink = addAdminDocLink;

function removeAdminDocLink(category, idx) {
  const item = getAdminCurrentItem(category);
  if (!item || !Array.isArray(item.documents) || !item.documents[idx]) return;

  const doc = item.documents[idx];
  if (confirm(`Remove document "${doc.title}"?`)) {
    item.documents.splice(idx, 1);
    renderAdminDocsList(category);
    syncCategoryToUI(category);
    populateAdminForms();
    showToast('Document removed.', 'info');
  }
}
window.removeAdminDocLink = removeAdminDocLink;

function moveAdminDocLink(category, idx, direction) {
  const item = getAdminCurrentItem(category);
  if (!item || !Array.isArray(item.documents)) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= item.documents.length) return;

  const temp = item.documents[idx];
  item.documents[idx] = item.documents[targetIdx];
  item.documents[targetIdx] = temp;

  renderAdminDocsList(category);
  syncCategoryToUI(category);
  populateAdminForms();
}
window.moveAdminDocLink = moveAdminDocLink;

function syncCategoryToUI(category) {
  if (category === 'pubs') {
    renderPublications();
  } else if (category === 'research') {
    window.portfolioData.scientificResearch = window.portfolioData.scientificResearch || window.portfolioData.research;
    window.portfolioData.research = window.portfolioData.scientificResearch;
    renderTimelineAndKPIs(window.portfolioData.scientificResearch, window.portfolioData.kpis);
  } else if (category === 'projects') {
    renderSoftwareProjects(window.portfolioData?.softwareProjects || window.portfolioData?.projects);
  } else if (category === 'certs') {
    window.portfolioData.certificates = window.portfolioData.certificates || window.portfolioData.trainings;
    window.portfolioData.trainings = window.portfolioData.certificates;
    renderTrainings(window.portfolioData.certificates);
  }
}
window.syncCategoryToUI = syncCategoryToUI;

function initAdminDropzone(dropzoneEl, category) {
  if (!dropzoneEl) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('drag-over');
    }, false);
  });

  dropzoneEl.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleAdminDropzoneFiles(files, category);
    }
  }, false);
}
window.initAdminDropzone = initAdminDropzone;

function initAllAdminDropzones() {
  const dropzones = [
    { id: 'admin-pubs-dropzone', cat: 'pubs' },
    { id: 'admin-research-dropzone', cat: 'research' },
    { id: 'admin-proj-dropzone', cat: 'projects' },
    { id: 'admin-certs-dropzone', cat: 'certs' }
  ];

  dropzones.forEach(({ id, cat }) => {
    const el = document.getElementById(id);
    if (el) initAdminDropzone(el, cat);
  });

  const galDrop = document.getElementById('admin-gallery-dropzone');
  if (galDrop) {
    ['dragenter', 'dragover'].forEach(name => {
      galDrop.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        galDrop.classList.add('drag-over');
      }, false);
    });
    ['dragleave', 'drop'].forEach(name => {
      galDrop.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        galDrop.classList.remove('drag-over');
      }, false);
    });
    galDrop.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleAdminGalleryDrop(dt.files);
      }
    }, false);
  }
}
window.initAllAdminDropzones = initAllAdminDropzones;

/* --------------------------------------------------------------------------
   Media Gallery & Event Manager in Admin Drawer
   -------------------------------------------------------------------------- */
function populateAdminGalleryManager() {
  const select = document.getElementById('admin-gallery-select');
  const form = document.getElementById('admin-gallery-form');
  const delBtn = document.getElementById('admin-gallery-del-btn');
  const list = window.portfolioData?.gallery || [];

  if (select) {
    select.innerHTML = `
      <option value="__new__">+ Add New Gallery Photo</option>
      ${list.map((g, idx) => `
        <option value="${idx}" ${currentEditingGalleryIndex === idx ? 'selected' : ''}>#${idx + 1}. [${escapeHTML(g.category || 'General')}] ${escapeHTML((g.title || '').slice(0, 35))}${(g.title || '').length > 35 ? '...' : ''}</option>
      `).join('')}
    `;

    select.onchange = () => {
      const val = select.value;
      if (val === '__new__') {
        currentEditingGalleryIndex = -1;
        loadGalleryIntoAdminForm('__new__');
      } else {
        const idx = parseInt(val);
        currentEditingGalleryIndex = idx;
        loadGalleryIntoAdminForm(idx);
      }
    };
  }

  if (form) {
    form.onsubmit = handleSaveGallerySubmit;
  }

  if (delBtn) {
    delBtn.onclick = deleteGalleryInAdmin;
  }

  if (currentEditingGalleryIndex >= 0 && currentEditingGalleryIndex < list.length) {
    if (select) select.value = String(currentEditingGalleryIndex);
    loadGalleryIntoAdminForm(currentEditingGalleryIndex);
  } else if (list.length > 0 && currentEditingGalleryIndex !== -1) {
    currentEditingGalleryIndex = 0;
    if (select) select.value = '0';
    loadGalleryIntoAdminForm(0);
  } else {
    if (select) select.value = '__new__';
    loadGalleryIntoAdminForm('__new__');
  }
}

function loadGalleryIntoAdminForm(idxOrNew) {
  const list = window.portfolioData?.gallery || [];
  const titleEl = document.getElementById('admin-gallery-title');
  const catEl = document.getElementById('admin-gallery-category');
  const dateEl = document.getElementById('admin-gallery-date');
  const capEl = document.getElementById('admin-gallery-caption');
  const urlEl = document.getElementById('admin-gallery-url');
  const delBtn = document.getElementById('admin-gallery-del-btn');

  if (idxOrNew === '__new__' || idxOrNew < 0 || idxOrNew >= list.length) {
    currentEditingGalleryIndex = -1;
    if (titleEl) titleEl.value = '';
    if (catEl) catEl.value = 'Wildlife & Animal Rescue';
    if (dateEl) dateEl.value = '2026';
    if (capEl) capEl.value = '';
    if (urlEl) urlEl.value = '';
    if (delBtn) delBtn.style.display = 'none';
    return;
  }

  const g = list[idxOrNew];
  if (!g) return;

  currentEditingGalleryIndex = idxOrNew;
  if (titleEl) titleEl.value = g.title || '';
  if (catEl) {
    const cat = g.category || '';
    if (cat.includes('Academic')) catEl.value = 'Academic Field & Clinical Exposure';
    else if (cat === 'Fieldwork' || cat === 'Field work') catEl.value = 'Fieldwork';
    else if (cat.includes('Wildlife')) catEl.value = 'Wildlife & Animal Rescue';
    else if (cat.includes('Clinical') || cat.includes('Lab')) catEl.value = 'Lab & Clinical';
    else if (cat.includes('Data') || cat.includes('Architecture') || cat.includes('Software')) catEl.value = 'Data & Architecture';
    else if (cat.includes('Conference') || cat.includes('Award') || cat.includes('Networking')) catEl.value = 'Conferences & Networking';
    else if (cat.includes('Hobbies') || cat.includes('Hobby')) catEl.value = 'Hobbies';
    else catEl.value = cat;
  }
  if (dateEl) dateEl.value = g.eventDate || g.date || g.badge || '';
  if (capEl) capEl.value = g.caption || '';
  if (urlEl) urlEl.value = g.mediaUrl || g.thumbnail || '';
  if (delBtn) delBtn.style.display = 'inline-flex';
}

function handleSaveGallerySubmit(e) {
  e.preventDefault();
  const list = window.portfolioData?.gallery;
  if (!list) return;

  const title = document.getElementById('admin-gallery-title')?.value.trim();
  const category = document.getElementById('admin-gallery-category')?.value;
  const date = document.getElementById('admin-gallery-date')?.value.trim();
  const caption = document.getElementById('admin-gallery-caption')?.value.trim();
  let url = document.getElementById('admin-gallery-url')?.value.trim();
  const fileInput = document.getElementById('admin-gallery-file');

  if (!title || !caption) {
    return showToast('Title and Caption are required.', 'error');
  }

  let categoryFilter = 'wildlife';
  if (category === 'Academic Field & Clinical Exposure') categoryFilter = 'academic';
  else if (category === 'Fieldwork') categoryFilter = 'fieldwork';
  else if (category === 'Wildlife & Animal Rescue') categoryFilter = 'wildlife';
  else if (category === 'Lab & Clinical') categoryFilter = 'lab';
  else if (category === 'Data & Architecture') categoryFilter = 'data';
  else if (category === 'Conferences & Networking') categoryFilter = 'conferences';
  else if (category === 'Hobbies') categoryFilter = 'hobbies';

  const proceedSave = (finalUrl) => {
    const existing = (currentEditingGalleryIndex >= 0 && currentEditingGalleryIndex < list.length) ? list[currentEditingGalleryIndex] : null;

    const updatedItem = {
      id: existing?.id || ('gal-' + Date.now()),
      title,
      category,
      categoryFilter,
      type: existing?.type || 'image',
      mediaUrl: finalUrl || existing?.mediaUrl || 'Banner.png',
      thumbnail: finalUrl || existing?.thumbnail || 'Banner.png',
      caption,
      badge: date || category,
      eventDate: date || undefined
    };

    if (existing && currentEditingGalleryIndex >= 0 && currentEditingGalleryIndex < list.length) {
      list[currentEditingGalleryIndex] = updatedItem;
      showToast(`Gallery photo #${currentEditingGalleryIndex + 1} updated! Click "Save & Publish" to push to GitHub.`, 'success');
    } else {
      list.push(updatedItem);
      currentEditingGalleryIndex = list.length - 1;
      showToast(`New gallery photo #${list.length} added! Click "Save & Publish" to push to GitHub.`, 'success');
    }

    renderGalleryMarquee();
    populateAdminForms();
    populateAdminGalleryManager();
  };

  const file = fileInput?.files && fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const base64 = evt.target.result.split(',')[1];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const relPath = `Github image/Gallery/${safeName}`;

      stagedFileUploads.push({
        path: relPath,
        content: base64,
        name: file.name
      });

      proceedSave(relPath);
    };
    reader.readAsDataURL(file);
  } else {
    if (!url && currentEditingGalleryIndex === -1) {
      return showToast('Please enter an image path or choose a file to upload.', 'error');
    }
    proceedSave(url);
  }
}

function deleteGalleryInAdmin() {
  const list = window.portfolioData?.gallery;
  if (!list || currentEditingGalleryIndex < 0 || currentEditingGalleryIndex >= list.length) return;

  const item = list[currentEditingGalleryIndex];
  if (confirm(`Are you sure you want to delete gallery photo: "${item.title}"?`)) {
    list.splice(currentEditingGalleryIndex, 1);
    currentEditingGalleryIndex = -1;
    renderGalleryMarquee();
    populateAdminForms();
    populateAdminGalleryManager();
    showToast('Gallery item removed.', 'info');
  }
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

    for (const f of stagedFileUploads) {
      status.textContent = `Uploading ${f.name}...`;
      await uploadFileToGitHub(owner, repo, f.path, f.content, `upload: add ${f.name} via admin cms`, token);
    }
    stagedFileUploads = [];

    status.textContent = 'Fetching JSON SHA...';
    const jsonPath = 'data/portfolio-data.json';
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}?ref=${branch}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const curSha = getRes.ok ? (await getRes.json()).sha : null;

    status.textContent = 'Publishing portfolio-data.json...';
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(window.portfolioData, null, 2))));
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'content(cms): update academic portfolio data and certificates',
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
   10. UTILITIES & DOM LISTENERS
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

window.closeAllModals = closeAllModals;
window.closeCertificateModal = closeCertificateModal;
window.openProjectDetailsModal = openProjectDetailsModal;
window.closeProjectDetailsModal = closeProjectDetailsModal;
window.openProjectGalleryModal = openProjectGalleryModal;
window.closeProjectGalleryModal = closeProjectGalleryModal;
window.setGallerySlide = setGallerySlide;

// Backward-compatibility aliases
window.openProjectModal = openProjectDetailsModal;
window.closeProjectModal = closeProjectDetailsModal;
window.setCarouselSlide = setGallerySlide;

/* --------------------------------------------------------------------------
   Where to Find Me — Interactive Google Map Switcher & Coordinates Copy
   -------------------------------------------------------------------------- */
function switchMapMode(mode) {
  const iframe = document.getElementById('google-map-iframe');
  const btnSat = document.getElementById('map-btn-satellite');
  const btnStd = document.getElementById('map-btn-standard');
  if (!iframe) return;
  if (mode === 'standard') {
    iframe.src = 'https://maps.google.com/maps?q=24.374042779653543,88.64418181747487&t=m&z=17&ie=UTF8&iwloc=A&output=embed';
    if (btnStd) btnStd.classList.add('active');
    if (btnSat) btnSat.classList.remove('active');
  } else {
    iframe.src = 'https://maps.google.com/maps?q=24.374042779653543,88.64418181747487&t=h&z=17&ie=UTF8&iwloc=A&output=embed';
    if (btnSat) btnSat.classList.add('active');
    if (btnStd) btnStd.classList.remove('active');
  }
}
window.switchMapMode = switchMapMode;

function copyMapCoordinates(btn) {
  const coords = '24.374042779653543, 88.64418181747487';
  const textEl = document.getElementById('coord-text') || (btn ? btn.querySelector('span') : null);
  const showCopied = () => {
    if (textEl) textEl.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981; margin-right: 2px;"></i> Copied!';
    if (btn) btn.classList.add('copied');
    setTimeout(() => {
      if (textEl) textEl.innerHTML = '24.374043&deg; N, 88.644182&deg; E';
      if (btn) btn.classList.remove('copied');
    }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(coords).then(showCopied).catch(() => {
      fallbackCopy(coords);
      showCopied();
    });
  } else {
    fallbackCopy(coords);
    showCopied();
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
  }
}
window.copyMapCoordinates = copyMapCoordinates;

/* --------------------------------------------------------------------------
   Section Smooth Scroll Helper (84px Sticky Offset)
   -------------------------------------------------------------------------- */
function scrollToSection(href) {
  if (!href || !href.startsWith('#')) return false;
  const rawId = href.substring(1);
  if (!rawId) return false;
  if (rawId === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (history.pushState) history.pushState(null, null, '#home');
    return true;
  }
  const target = document.getElementById(rawId) ||
                 document.getElementById(rawId + '-sec') ||
                 (rawId === 'location' ? document.getElementById('location') : null) ||
                 (rawId === 'projects' ? document.getElementById('software-sec') : null) ||
                 (rawId === 'software' ? document.getElementById('software-sec') : null) ||
                 (rawId === 'training' ? document.getElementById('training-sec') : null) ||
                 (rawId.endsWith('-sec') ? document.getElementById(rawId.replace('-sec', '')) : null);
  if (target) {
    const nav = document.getElementById('navbar');
    const navHeight = nav ? nav.getBoundingClientRect().height : 68;
    const offset = navHeight + 16; // 84px
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top + window.pageYOffset - offset;
    window.scrollTo({
      top: targetTop > 0 ? targetTop : 0,
      behavior: 'smooth'
    });
    if (history.pushState) {
      history.pushState(null, null, href);
    } else {
      location.hash = href;
    }
    return true;
  }
  return false;
}
window.scrollToSection = scrollToSection;

/* --------------------------------------------------------------------------
   Universal Navigation Drawer (#universal-nav-drawer)
   Direct Child of <body> — Works across Phone, Tablet, Laptop, and Desktop Web
   -------------------------------------------------------------------------- */
function openUniversalNav() {
  const drawer = document.getElementById('universal-nav-drawer') || document.getElementById('header-nav-panel');
  const toggleBtn = document.getElementById('header-nav-toggle') || document.getElementById('mobile-menu-btn');
  const icon = document.getElementById('header-nav-icon') || (toggleBtn ? toggleBtn.querySelector('i') : null);
  const header = document.getElementById('navbar') || document.querySelector('header');

  if (!drawer) return;

  // Dynamically position right below the sticky header when opened
  if (header) {
    const bottom = header.getBoundingClientRect().bottom;
    drawer.style.top = (bottom > 0 ? (bottom + 6) : 74) + 'px';
  } else {
    drawer.style.top = '74px';
  }

  drawer.style.display = 'block';
  drawer.classList.add('open', 'active');
  drawer.setAttribute('aria-hidden', 'false');
  if (toggleBtn) {
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }
  if (icon) {
    icon.className = 'fa-solid fa-xmark';
  }
}

function closeUniversalNav() {
  const drawer = document.getElementById('universal-nav-drawer') || document.getElementById('header-nav-panel');
  const toggleBtn = document.getElementById('header-nav-toggle') || document.getElementById('mobile-menu-btn');
  const icon = document.getElementById('header-nav-icon') || (toggleBtn ? toggleBtn.querySelector('i') : null);

  if (!drawer) return;

  drawer.classList.remove('open', 'active');
  drawer.style.display = 'none';
  drawer.setAttribute('aria-hidden', 'true');
  if (toggleBtn) {
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  if (icon) {
    icon.className = 'fa-solid fa-bars';
  }
}

function toggleUniversalNav(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const drawer = document.getElementById('universal-nav-drawer') || document.getElementById('header-nav-panel');
  if (!drawer) return;
  const isOpen = drawer.classList.contains('open') || drawer.style.display === 'block';
  if (isOpen) {
    closeUniversalNav();
  } else {
    openUniversalNav();
  }
}

window.toggleUniversalNav = toggleUniversalNav;
window.openUniversalNav = openUniversalNav;
window.closeUniversalNav = closeUniversalNav;
// Backward-compatibility aliases
window.toggleHeaderNavPanel = toggleUniversalNav;
window.openHeaderNavPanel = openUniversalNav;
window.closeHeaderNavPanel = closeUniversalNav;
window.openHeaderNavDrawer = openUniversalNav;
window.closeHeaderNavDrawer = closeUniversalNav;

function initUniversalNav() {
  const drawer = document.getElementById('universal-nav-drawer') || document.getElementById('header-nav-panel');
  const toggleBtn = document.getElementById('header-nav-toggle') || document.getElementById('mobile-menu-btn');
  const header = document.getElementById('navbar') || document.querySelector('header');
  const moreBtn = document.getElementById('more-dropdown-btn') || document.querySelector('.nav-dropdown > a');
  const moreDropdown = document.getElementById('nav-dropdown-more') || document.querySelector('.nav-dropdown');

  // Bind 3-bar button
  if (toggleBtn) {
    toggleBtn.onclick = (e) => toggleUniversalNav(e);
  }

  // Bind drawer click isolation & link clicks
  if (drawer) {
    drawer.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.replace(/^#/, '');
          handleNavClick(targetId);
          closeUniversalNav();
          scrollToSection(href);
        } else {
          closeUniversalNav();
        }
      });
    });
  }

  // Desktop More dropdown toggle
  if (moreBtn && moreDropdown) {
    moreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      moreDropdown.classList.toggle('active');
    });
  }

  // Desktop top bar & dropdown navigation links
  document.querySelectorAll('#nav-menu a.nav-pill:not(#more-dropdown-btn), .nav-dropdown-item').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.replace(/^#/, '');
        handleNavClick(targetId);
        if (moreDropdown) moreDropdown.classList.remove('active');
        scrollToSection(href);
      }
    });
  });

  // Nav brand avatar / title link
  document.querySelectorAll('.nav-brand').forEach(brand => {
    brand.addEventListener('click', (e) => {
      const href = brand.getAttribute('href');
      if (href === '#home' || href === '#') {
        e.preventDefault();
        handleNavClick('about');
        closeUniversalNav();
        if (moreDropdown) moreDropdown.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (history.pushState) history.pushState(null, null, '#home');
      }
    });
  });

  // Outside click listener
  document.addEventListener('click', (e) => {
    if (drawer && (drawer.classList.contains('open') || drawer.style.display === 'block')) {
      if (!drawer.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        closeUniversalNav();
      }
    }
    if (moreDropdown && moreDropdown.classList.contains('active')) {
      if (!moreDropdown.contains(e.target)) {
        moreDropdown.classList.remove('active');
      }
    }
  });

  // Escape key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeUniversalNav();
      if (moreDropdown) moreDropdown.classList.remove('active');
    }
  });

  // Dynamic reposition on resize and scroll
  function updateDrawerPosition() {
    if (drawer && (drawer.classList.contains('open') || drawer.style.display === 'block') && header) {
      const bottom = header.getBoundingClientRect().bottom;
      drawer.style.top = (bottom > 0 ? (bottom + 6) : 74) + 'px';
    }
  }
  window.addEventListener('resize', updateDrawerPosition);
  window.addEventListener('scroll', updateDrawerPosition, { passive: true });
}

/* --------------------------------------------------------------------------
   Bulletproof Active Tab Highlighting & Viewport Scroll-Spy System
   -------------------------------------------------------------------------- */
const topBarSectionIds = [
  'about', 'education', 'updates', 'research',
  'projects', 'skills', 'publications', 'training'
];
const moreSectionIds = [
  'leadership', 'gallery', 'references', 'location', 'contact'
];
const allSectionIds = [...topBarSectionIds, ...moreSectionIds];

let isManualClick = false;
let manualClickTimer = null;
let activeSectionId = 'about';

function syncActiveNavTab(forcedId) {
  if (forcedId) {
    let clean = forcedId.startsWith('#') ? forcedId.substring(1) : forcedId;
    if (clean === 'home' || !clean) clean = 'about';
    if (clean === 'software') clean = 'projects';
    if (clean.endsWith('-sec')) clean = clean.replace('-sec', '');
    if (allSectionIds.includes(clean)) {
      activeSectionId = clean;
    }
  } else if (!isManualClick) {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollBottom = window.innerHeight + scrollY;
    const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    // 1. Very top of page (banner & intro)
    if (scrollY < 150) {
      activeSectionId = 'about';
    }
    // 2. Near bottom of page -> activate Contact
    else if (scrollBottom >= docHeight - 60) {
      activeSectionId = 'contact';
    }
    // 3. Viewport scroll-spy probe
    else {
      const header = document.querySelector('header');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 72;
      const triggerY = headerBottom + 120;

      let matched = 'about';
      for (const id of allSectionIds) {
        const sec = document.getElementById(id);
        if (!sec) continue;
        const rect = sec.getBoundingClientRect();
        if (rect.top <= triggerY) {
          matched = id;
        }
      }
      activeSectionId = matched;
    }
  }

  const isDark = document.body.classList.contains('dark') || document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
  const activeBg = isDark ? 'rgba(45, 212, 191, 0.18)' : 'rgba(13, 148, 136, 0.16)';
  const activeColor = isDark ? '#2dd4bf' : '#0f766e';
  const activeRing = isDark ? 'inset 0 0 0 1.5px rgba(45, 212, 191, 0.42)' : 'inset 0 0 0 1.5px rgba(13, 148, 136, 0.42)';

  // 1. Highlight More ▾ button ONLY if active section belongs to More ▾
  const isMoreActive = moreSectionIds.includes(activeSectionId);
  const moreBtn = document.querySelector('#more-dropdown-btn');
  if (moreBtn) {
    moreBtn.classList.toggle('active', isMoreActive);
    moreBtn.classList.toggle('nav-tab-active', isMoreActive);
    if (isMoreActive) {
      moreBtn.style.setProperty('background', activeBg, 'important');
      moreBtn.style.setProperty('color', activeColor, 'important');
      moreBtn.style.setProperty('font-weight', '700', 'important');
      moreBtn.style.setProperty('border-radius', '999px', 'important');
      moreBtn.style.setProperty('box-shadow', activeRing, 'important');
      const icon = moreBtn.querySelector('i');
      if (icon) icon.style.setProperty('color', activeColor, 'important');
    } else {
      moreBtn.style.removeProperty('background');
      moreBtn.style.removeProperty('color');
      moreBtn.style.removeProperty('font-weight');
      moreBtn.style.removeProperty('border-radius');
      moreBtn.style.removeProperty('box-shadow');
      const icon = moreBtn.querySelector('i');
      if (icon) icon.style.removeProperty('color');
    }
  }

  // 2. Highlight matching links across top bar, dropdown menu, and universal 3-bar drawer
  const allNavLinks = document.querySelectorAll('#nav-menu a[href^="#"], .nav-dropdown-item[href^="#"], #universal-nav-drawer a[href^="#"]');
  allNavLinks.forEach(link => {
    if (link.id === 'more-dropdown-btn') return;
    const href = link.getAttribute('href');
    const isMatch = href === `#${activeSectionId}`;
    link.classList.toggle('active', isMatch);
    link.classList.toggle('nav-tab-active', isMatch);

    if (isMatch) {
      link.style.setProperty('background', activeBg, 'important');
      link.style.setProperty('color', activeColor, 'important');
      link.style.setProperty('font-weight', '700', 'important');
      link.style.setProperty('border-radius', '999px', 'important');
      link.style.setProperty('box-shadow', activeRing, 'important');
      const icon = link.querySelector('i');
      if (icon) icon.style.setProperty('color', activeColor, 'important');
    } else {
      link.style.removeProperty('background');
      link.style.removeProperty('color');
      link.style.removeProperty('font-weight');
      link.style.removeProperty('border-radius');
      link.style.removeProperty('box-shadow');
      const icon = link.querySelector('i');
      if (icon) icon.style.removeProperty('color');
    }
  });

  return activeSectionId;
}

function handleNavClick(targetId) {
  isManualClick = true;
  clearTimeout(manualClickTimer);
  syncActiveNavTab(targetId);

  // Keep target tab locked during smooth-scrolling animation (approx 850ms)
  manualClickTimer = setTimeout(() => {
    isManualClick = false;
    syncActiveNavTab();
  }, 950);
}

function initScrollSpy() {
  function onScroll() {
    if (isManualClick) return;
    syncActiveNavTab();
  }

  // Attach on window and document capture phase
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });

  // Modern scrollend event unlocks manual click when scrolling finishes
  window.addEventListener('scrollend', () => {
    isManualClick = false;
    syncActiveNavTab();
  }, { passive: true });

  // User input gestures immediately unlock manual click
  window.addEventListener('wheel', () => {
    if (isManualClick) {
      isManualClick = false;
      syncActiveNavTab();
    }
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    if (isManualClick) {
      isManualClick = false;
      syncActiveNavTab();
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    window.requestAnimationFrame(() => syncActiveNavTab());
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    if (location.hash) {
      syncActiveNavTab(location.hash);
    }
  });

  // Initial active tab determination on load
  if (location.hash && location.hash.length > 1) {
    syncActiveNavTab(location.hash);
  } else {
    syncActiveNavTab();
  }
}

window.syncActiveNavTab = syncActiveNavTab;
window.handleNavClick = handleNavClick;
window.setActiveNav = syncActiveNavTab;
window.updateActiveNavTab = syncActiveNavTab;
window.initScrollSpy = initScrollSpy;
window.initUniversalNav = initUniversalNav;
window.initHeaderNavPanel = initUniversalNav;
window.initHeaderNavDrawer = initUniversalNav;

document.addEventListener('DOMContentLoaded', () => {
  try { initTheme(); } catch (e) { console.error('initTheme error:', e); }
  try { loadData(); } catch (e) { console.error('loadData error:', e); }
  try { initSoftwareFilters(); } catch (e) { console.error('initSoftwareFilters error:', e); }
  try { initProjectModals(); } catch (e) { console.error('initProjectModals error:', e); }
  try { initPubSearchAndFilters(); } catch (e) { console.error('initPubSearchAndFilters error:', e); }
  try { initGalleryFilters(); } catch (e) { console.error('initGalleryFilters error:', e); }
  try { initContactForm(); } catch (e) { console.error('initContactForm error:', e); }
  try { initAdminPortal(); } catch (e) { console.error('initAdminPortal error:', e); }
  try { initUniversalNav(); } catch (e) { console.error('initUniversalNav error:', e); }
  try { initScrollSpy(); } catch (e) { console.error('initScrollSpy error:', e); }
  try { syncActiveNavTab(); } catch (e) { console.error('syncActiveNavTab error:', e); }

  // Direct click listeners to every modal close button via querySelectorAll
  document.querySelectorAll('#lightbox-close-btn, #lightbox-modal .modal-close, #lightbox-modal .lightbox-close-btn, #lightbox-modal [data-close-modal="true"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
    });
  });

  // Direct element listener as safety fallback
  const lbClose = document.getElementById('lightbox-close-btn');
  if (lbClose) {
    lbClose.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
    };
  }

  // Direct backdrop click listener on #lightbox-modal
  const lbModal = document.getElementById('lightbox-modal');
  if (lbModal) {
    lbModal.addEventListener('click', (e) => {
      if (e.target === lbModal) {
        e.preventDefault();
        closeAllModals();
      }
    });
  }

  // Reliable delegated click listener on document for closing modals
  document.addEventListener('click', (e) => {
    // 1. Check for clicks on close button
    const closeBtn = e.target.closest('#lightbox-close-btn, #lightbox-modal .modal-close, #lightbox-modal .lightbox-close-btn, #lightbox-modal [data-close-modal], #close-cert-modal');
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
      return;
    }

    // 2. Check for click outside modal content on the dark backdrop
    if (lbModal && (lbModal.classList.contains('active') || lbModal.classList.contains('open') || lbModal.classList.contains('show') || lbModal.style.display === 'flex')) {
      if (e.target === lbModal) {
        e.preventDefault();
        closeAllModals();
      }
    }
  });

  // Escape key listener closing all open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (typeof window.closeUniversalNav === 'function') {
        window.closeUniversalNav();
      }
      if (typeof window.closeHeaderNavPanel === 'function') {
        window.closeHeaderNavPanel();
      }
      if (typeof window.closeHeaderNavDrawer === 'function') {
        window.closeHeaderNavDrawer();
      }
      closeAllModals();
      closeProjectDetailsModal();
      closeProjectGalleryModal();
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
