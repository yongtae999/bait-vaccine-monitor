/**
 * Photo Gallery Manager Module
 * Manages 61 Field Inspection Photos across 8 dates with Interactive Lightbox & Filter Tabs
 */

class PhotoGalleryManager {
  constructor() {
    this.photos = [];
    this.activeDateFilter = 'all';
    this.currentPhotoIndex = 0;
  }

  async init() {
    const t = Date.now();
    try {
      const res = await fetch(`data/photos.json?t=${t}`);
      this.photos = await res.json();
      this.bindEvents();
    } catch (err) {
      console.error("Error loading photos.json:", err);
    }
  }

  bindEvents() {
    // Header Photo Gallery Button
    const btnOpenGallery = document.getElementById('btn-open-photo-gallery');
    if (btnOpenGallery) {
      btnOpenGallery.addEventListener('click', () => this.openGalleryModal('all'));
    }

    // Modal Close
    const btnClose = document.getElementById('btn-close-photo-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeGalleryModal());
    }

    const modal = document.getElementById('photo-gallery-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
          this.closeGalleryModal();
        }
      });
    }

    // Lightbox Modal Controls
    const btnCloseLightbox = document.getElementById('btn-close-lightbox');
    if (btnCloseLightbox) {
      btnCloseLightbox.addEventListener('click', () => this.closeLightbox());
    }

    const btnPrev = document.getElementById('btn-lightbox-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.showPrevPhoto());
    }

    const btnNext = document.getElementById('btn-lightbox-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => this.showNextPhoto());
    }
  }

  openGalleryModal(dateFilter = 'all') {
    this.activeDateFilter = dateFilter;
    const modal = document.getElementById('photo-gallery-modal');
    if (!modal) return;

    this.renderDateTabs();
    this.renderPhotoGrid();
    modal.classList.remove('hidden');
  }

  closeGalleryModal() {
    const modal = document.getElementById('photo-gallery-modal');
    if (modal) modal.classList.add('hidden');
  }

  renderDateTabs() {
    const tabsContainer = document.getElementById('photo-date-tabs');
    if (!tabsContainer) return;

    // Group dates with counts
    const dateCounts = {};
    this.photos.forEach(p => {
      dateCounts[p.date] = (dateCounts[p.date] || 0) + 1;
    });

    const dates = Object.keys(dateCounts).sort().reverse();

    tabsContainer.innerHTML = `
      <button class="photo-tab-btn ${this.activeDateFilter === 'all' ? 'active' : ''}" data-date="all">
        전체 보기 (${this.photos.length}장)
      </button>
      ${dates.map(d => `
        <button class="photo-tab-btn ${this.activeDateFilter === d ? 'active' : ''}" data-date="${d}">
          📅 ${d.slice(5)} (${dateCounts[d]}장)
        </button>
      `).join('')}
    `;

    tabsContainer.querySelectorAll('.photo-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.photo-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeDateFilter = btn.dataset.date;
        this.renderPhotoGrid();
      });
    });
  }

  renderPhotoGrid() {
    const gridContainer = document.getElementById('photo-grid-container');
    if (!gridContainer) return;

    const filtered = this.activeDateFilter === 'all' 
      ? this.photos 
      : this.photos.filter(p => p.date === this.activeDateFilter);

    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div style="color: #94a3b8; padding: 40px; text-align: center; grid-column: 1/-1;">해당 일자의 사진이 없습니다.</div>`;
      return;
    }

    gridContainer.innerHTML = filtered.map((p, idx) => `
      <div class="photo-card" data-index="${this.photos.indexOf(p)}">
        <div class="photo-thumb-wrap">
          <img src="assets/photos/${p.filename}" alt="${p.title}" loading="lazy">
          <span class="photo-date-badge">📅 ${p.date}</span>
        </div>
        <div class="photo-info">
          <div class="photo-card-title">${p.title}</div>
          <div class="photo-card-meta">📍 ${p.location}</div>
        </div>
      </div>
    `).join('');

    gridContainer.querySelectorAll('.photo-card').forEach(card => {
      card.addEventListener('click', () => {
        const photoIdx = parseInt(card.dataset.index, 10);
        this.openLightbox(photoIdx);
      });
    });
  }

  openLightbox(index) {
    this.currentPhotoIndex = index;
    const photo = this.photos[this.currentPhotoIndex];
    if (!photo) return;

    const lightbox = document.getElementById('photo-lightbox-modal');
    if (!lightbox) return;

    const imgEl = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    const metaEl = document.getElementById('lightbox-meta');
    const descEl = document.getElementById('lightbox-desc');
    const countEl = document.getElementById('lightbox-counter');

    if (imgEl) imgEl.src = `assets/photos/${photo.filename}`;
    if (titleEl) titleEl.textContent = photo.title;
    if (metaEl) metaEl.textContent = `📅 촬영일자: ${photo.date}  |  📍 위치: ${photo.location}`;
    if (descEl) descEl.textContent = photo.desc;
    if (countEl) countEl.textContent = `${this.currentPhotoIndex + 1} / ${this.photos.length}`;

    lightbox.classList.remove('hidden');
  }

  closeLightbox() {
    const lightbox = document.getElementById('photo-lightbox-modal');
    if (lightbox) lightbox.classList.add('hidden');
  }

  showPrevPhoto() {
    if (this.currentPhotoIndex > 0) {
      this.openLightbox(this.currentPhotoIndex - 1);
    } else {
      this.openLightbox(this.photos.length - 1);
    }
  }

  showNextPhoto() {
    if (this.currentPhotoIndex < this.photos.length - 1) {
      this.openLightbox(this.currentPhotoIndex + 1);
    } else {
      this.openLightbox(0);
    }
  }
}

window.photoManager = new PhotoGalleryManager();
