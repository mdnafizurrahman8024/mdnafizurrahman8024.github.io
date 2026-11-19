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
let stagedFileUploads = [];

// Project Modals & Gallery State
let currentActiveProject = null;
let currentGalleryProject = null;
let currentGallerySlideIdx = 0;
let gallerySlideshowTimer = null;
let currentAdminTab = 'pubs';
let currentEditingProject = null;
let currentEditingPubIndex = -1;
let draggedPubIdx = null;

/**
 * Robust URI encoder for folder and image file paths.
 * Encodes spaces (%20), apostrophes (%27), and ampersands (%26) safely.
 */
function formatImagePath(path) {
  if (!path) return '';
  const clean = path.split('/').map(seg => encodeURIComponent(seg).replace(/'/g, '%27')).join('/');
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
}

/* --------------------------------------------------------------------------
   Top Navbar & Hero Banner (Framed & Zero Cropping)
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
        <span class="entry-badge">${escapeHTML(item.badge || item.role)}</span>
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

  // 4-Column KPI Metrics Bar
  const kpiContainer = document.getElementById('kpi-metrics-container');
  if (kpiContainer && kpis) {
    const certCount = window.portfolioData?.certificates?.length || window.portfolioData?.trainings?.length || 26;
    kpiContainer.innerHTML = kpis.map(k => {
      let val = k.value;
      if (k.label && k.label.toLowerCase().includes('certif')) {
        val = `${certCount}+`;
      }
      return `
        <a href="${escapeHTML(k.target || '#')}" class="kpi-metric-box" onclick="handleKpiClick(event, '${escapeHTML(k.target || '')}')">
          <div class="kpi-value">${escapeHTML(val)}</div>
          <div class="kpi-label">${escapeHTML(k.label)}</div>
          ${k.sublabel ? `<div class="kpi-sublabel">${escapeHTML(k.sublabel)}</div>` : ''}
        </a>
      `;
    }).join('');
  }
}

// Global smooth scroll handler for KPI metric boxes
window.handleKpiClick = function(event, targetSelector) {
  if (!targetSelector || targetSelector === '#') return;
  event.preventDefault();
  const targetEl = document.querySelector(targetSelector);
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.history && window.history.pushState) {
      window.history.pushState(null, null, targetSelector);
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
  clearInterval(gallerySlideshowTimer);
  if (window.projectCarouselTimer) clearInterval(window.projectCarouselTimer);
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
  const galleryWrap = document.getElementById('project-gallery-wrap');
  const track = document.getElementById('project-carousel-track');

  if (titleEl) titleEl.textContent = `${project.name || project.title} — Screenshots`;

  // Render slides in sliding track
  if (track) {
    track.innerHTML = images.map((img, i) => `
      <div class="project-carousel-slide">
        <img src="${formatImagePath(img)}" alt="${escapeHTML(project.name || 'Project')} screenshot ${i + 1}" class="project-gallery-slide-img" loading="lazy">
      </div>
    `).join('');
    track.style.transform = 'translateX(0%)';
  }

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

  // Auto-advance slideshow with smooth horizontal slide transition every 4.5 seconds (4500ms)
  clearInterval(gallerySlideshowTimer);
  if (window.projectCarouselTimer) clearInterval(window.projectCarouselTimer);
  if (images.length > 1) {
    startGallerySlideshow(images.length);

    // Pause smoothly on hover, resume on mouse leave
    if (galleryWrap) {
      galleryWrap.onmouseenter = () => {
        clearInterval(gallerySlideshowTimer);
        if (window.projectCarouselTimer) clearInterval(window.projectCarouselTimer);
      };
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
  clearInterval(gallerySlideshowTimer);
  if (window.projectCarouselTimer) clearInterval(window.projectCarouselTimer);
  window.projectCarouselTimer = gallerySlideshowTimer = setInterval(() => {
    setGallerySlide(currentGallerySlideIdx + 1);
  }, 4500);
}

function setGallerySlide(idx, fromUserAction = false) {
  if (!currentGalleryProject || !currentGalleryProject.images || currentGalleryProject.images.length === 0) return;
  const images = currentGalleryProject.images;
  currentGallerySlideIdx = (idx + images.length) % images.length;
  
  const track = document.getElementById('project-carousel-track');
  const counter = document.getElementById('project-gallery-counter');
  const zoomBtn = document.getElementById('project-gallery-zoom');
  const thumbsContainer = document.getElementById('project-gallery-thumbs');

  const curImg = images[currentGallerySlideIdx];
  const encoded = formatImagePath(curImg);

  if (track) {
    track.style.transform = `translateX(-${currentGallerySlideIdx * 100}%)`;
  }
  if (counter) {
    counter.textContent = `${currentGallerySlideIdx + 1} / ${images.length}`;
  }
  if (zoomBtn) {
    zoomBtn.href = encoded;
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

  // Smoothly reset slideshow timer when triggered by user interaction (arrow / thumb click)
  if (fromUserAction && images.length > 1) {
    startGallerySlideshow(images.length);
  }
}

function closeProjectGalleryModal() {
  clearInterval(gallerySlideshowTimer);
  if (window.projectCarouselTimer) clearInterval(window.projectCarouselTimer);
  const modal = document.getElementById('project-gallery-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentGalleryProject = null;
}

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

  // Global Keyboard Navigation (Esc to close, Left/Right for gallery)
  document.addEventListener('keydown', (e) => {
    if (galleryModal && galleryModal.classList.contains('active')) {
      if (e.key === 'Escape') closeProjectGalleryModal();
      else if (e.key === 'ArrowLeft') setGallerySlide(currentGallerySlideIdx - 1);
      else if (e.key === 'ArrowRight') setGallerySlide(currentGallerySlideIdx + 1);
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
function renderTrainings(certs) {
  const container = document.getElementById('trainings-grid-container');
  if (!container) return;

  const allCerts = certs || window.portfolioData?.certificates || window.portfolioData?.trainings || [];
  const displayList = isCertificatesExpanded ? allCerts : allCerts.slice(0, 8);

  container.innerHTML = displayList.map((t, index) => {
    const fullIndex = allCerts.indexOf(t) !== -1 ? allCerts.indexOf(t) : index;
    const issuer = t.issuer || t.organization || 'Issuing Authority';
    const desc = t.description || t.summary || '';

    return `
      <div class="training-card">
        <div>
          <div class="training-header">
            <span class="training-badge"><i class="fa-solid fa-award"></i> Certificate</span>
            <span class="training-date">${escapeHTML(t.date || '')}</span>
          </div>
          <h4 class="training-title" title="${escapeHTML(t.title)}">${escapeHTML(t.title)}</h4>
          <div class="training-org" title="${escapeHTML(issuer)}">
            <i class="fa-solid fa-building-columns"></i> ${escapeHTML(issuer)}
          </div>
          <p class="training-summary">${escapeHTML(desc)}</p>
          ${t.credentialId ? `
            <div class="training-credential-badge" title="Credential ID: ${escapeHTML(t.credentialId)}">
              <i class="fa-solid fa-id-badge"></i> ID: ${escapeHTML(t.credentialId)}
            </div>
          ` : ''}
        </div>

        <div class="training-footer-actions">
          <button class="btn-training-more" onclick="openTrainingDetailModal(${fullIndex})">
            ...more
          </button>
          <div style="display: flex; gap: 0.35rem; align-items: center;">
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

  // Clean Centered Expand Button (No hardcoded numbers!)
  const expandBtn = document.getElementById('certificates-expand-btn');
  if (expandBtn) {
    if (allCerts.length <= 8) {
      expandBtn.style.display = 'none';
    } else {
      expandBtn.style.display = 'inline-flex';
      expandBtn.innerHTML = isCertificatesExpanded
        ? '<i class="fa-solid fa-chevron-up"></i> Show Less'
        : '<i class="fa-solid fa-chevron-down"></i> See All Certificates';
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

  title.textContent = t.title;
  media.innerHTML = `
    <div style="padding: 2.25rem; text-align: left; width: 100%; color: #fff;">
      <div style="font-size: 0.85rem; color: #14b8a6; font-weight: 700; margin-bottom: 0.5rem;">
        <i class="fa-solid fa-building-columns"></i> ${escapeHTML(issuer)} &bull; ${escapeHTML(t.date || '')}
      </div>
      <h3 style="font-size: 1.35rem; margin-bottom: 1rem; color: #fff;">${escapeHTML(t.title)}</h3>
      <p style="font-size: 0.98rem; line-height: 1.75; color: #cbd5e1; margin-bottom: 1.25rem;">${escapeHTML(desc)}</p>
      
      ${t.credentialId ? `
        <div style="font-family: var(--font-mono); font-size: 0.85rem; color: #38bdf8; margin-bottom: 1.25rem; background: rgba(56, 189, 248, 0.1); padding: 0.5rem 0.85rem; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.25); display: inline-block;">
          <i class="fa-solid fa-id-badge"></i> Credential ID: <strong>${escapeHTML(t.credentialId)}</strong>
        </div>
      ` : ''}

      <div style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
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
  if (currentGalleryFilter !== 'all') {
    items = items.filter(g => g.categoryFilter === currentGalleryFilter);
  }

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

  modal.style.display = 'flex';
  modal.classList.add('active', 'open', 'show');
  document.body.style.overflow = 'hidden';
}

/* --------------------------------------------------------------------------
   8. Leadership, References & Contact
   -------------------------------------------------------------------------- */
function renderLeadership(leadership) {
  const container = document.getElementById('leadership-list-container');
  if (!container || !leadership) return;

  container.innerHTML = leadership.map(l => `
    <div class="leadership-card">
      <div class="lead-role">${escapeHTML(l.role)}</div>
      <div class="lead-org">${escapeHTML(l.organization)}</div>
      <div class="lead-period"><i class="fa-solid fa-calendar-days" style="margin-right: 5px; font-size: 0.75rem;"></i>${escapeHTML(l.period)}</div>
      <p class="lead-desc">${escapeHTML(l.details || l.description || '')}</p>
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
  if (authForm) authForm.onsubmit = handleAdminAuthSubmit;

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.onclick = handleAdminLogout;

  const publishBtn = document.getElementById('admin-publish-btn');
  if (publishBtn) publishBtn.onclick = handlePublishToGitHub;

  const fileInput = document.getElementById('admin-file-upload');
  if (fileInput) fileInput.onchange = handleFileUploadStaging;

  const addCertForm = document.getElementById('admin-add-cert-form');
  if (addCertForm) addCertForm.onsubmit = handleAddCertificateSubmit;
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
  ['pubs', 'projects', 'certs', 'json'].forEach(t => {
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
  } else if (tab === 'projects') {
    populateAdminProjectsManager();
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
    orcidUrl: orcid || ''
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
      image: path
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
      image: path
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

window.openProjectDetailsModal = openProjectDetailsModal;
window.closeProjectDetailsModal = closeProjectDetailsModal;
window.openProjectGalleryModal = openProjectGalleryModal;
window.closeProjectGalleryModal = closeProjectGalleryModal;
window.setGallerySlide = setGallerySlide;

// Backward-compatibility aliases
window.openProjectModal = openProjectDetailsModal;
window.closeProjectModal = closeProjectDetailsModal;
window.setCarouselSlide = setGallerySlide;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadData();
  initSoftwareFilters();
  initProjectModals();
  initPubSearchAndFilters();
  initGalleryFilters();
  initContactForm();
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

function closeCertificateModal() {
  const lbModal = document.getElementById('lightbox-modal');
  if (lbModal) {
    lbModal.classList.remove('active', 'open', 'show');
    lbModal.style.display = 'none';
    document.body.style.overflow = '';
  }
}
window.closeCertificateModal = closeCertificateModal;

// Reliable delegated click listener on document for closing Certificate viewer modal
document.addEventListener('click', (e) => {
  // 1. Check for clicks on close button (.modal-close, #close-cert-modal, #lightbox-close-btn, [data-close-modal])
  const closeBtn = e.target.closest('.modal-close, #close-cert-modal, #lightbox-close-btn, [data-close-modal]');
  if (closeBtn) {
    const parentLightbox = closeBtn.closest('.lightbox-modal') || document.getElementById('lightbox-modal');
    if (parentLightbox) {
      e.preventDefault();
      e.stopPropagation();
      closeCertificateModal();
      return;
    }
  }

  // 2. Check for click outside modal content on the dark backdrop
  const lbModal = document.getElementById('lightbox-modal');
  if (lbModal && (lbModal.classList.contains('active') || lbModal.style.display === 'flex')) {
    if (e.target === lbModal) {
      e.preventDefault();
      closeCertificateModal();
    }
  }
});

  // Direct element listener as safety fallback
  const lbClose = document.getElementById('lightbox-close-btn');
  if (lbClose) {
    lbClose.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeCertificateModal();
    };
  }

  // Escape key listener closing all open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCertificateModal();
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
