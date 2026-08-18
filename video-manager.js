/**
 * Video Manager Module
 * Wildboar Confirmed Video Gallery, AI Metadata & High-Definition Video Player
 */

class VideoManager {
  constructor(mapController) {
    this.mapCtrl = mapController;
    this.videos = [];
    this.activeFilter = 'all'; // 'all', 'confirmed', 'ignored', or date '2026-08-05' etc.
  }

  init(videosData) {
    this.videos = videosData || [];
    this.renderFilterTabs();
    this.renderVideoCards();
    this.bindModalEvents();
  }

  renderFilterTabs() {
    const container = document.getElementById('video-filter-tabs');
    if (!container) return;

    // Distinct dates
    const dates = Array.from(new Set(this.videos.map(v => v.recorded_date))).sort().reverse();

    const boarCount = this.videos.filter(v => v.category !== '제외 (비대상 동물)').length;
    const deerCount = this.videos.filter(v => v.category.includes('제외')).length;

    container.innerHTML = `
      <button class="tab-pill active" data-filter="all">전체 (${this.videos.length})</button>
      <button class="tab-pill" data-filter="confirmed">🐗 멧돼지 선별영상 (${boarCount})</button>
      <button class="tab-pill" data-filter="ignored">🦌 고라니제외 (${deerCount})</button>
    `;

    dates.forEach(d => {
      const btn = document.createElement('button');
      btn.className = 'tab-pill';
      btn.dataset.filter = d;
      btn.textContent = d.replace('2026-', '');
      container.appendChild(btn);
    });

    container.querySelectorAll('.tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyFilter(btn.dataset.filter);
      });
    });
  }

  applyFilter(filterKey) {
    this.activeFilter = filterKey;
    this.renderVideoCards();
  }

  getFilteredVideos() {
    if (this.activeFilter === 'all') return this.videos;
    if (this.activeFilter === 'confirmed') return this.videos.filter(v => v.category !== '제외 (비대상 동물)');
    if (this.activeFilter === 'ignored') return this.videos.filter(v => v.category.includes('제외'));
    return this.videos.filter(v => v.recorded_date === this.activeFilter);
  }

  renderVideoCards() {
    const list = document.getElementById('video-cards-container');
    if (!list) return;

    list.innerHTML = '';
    const filtered = this.getFilteredVideos();

    if (filtered.length === 0) {
      list.innerHTML = '<div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 20px;">조건에 해당하는 영상이 없습니다.</div>';
      return;
    }

    filtered.forEach(vid => {
      const card = document.createElement('div');
      card.className = 'video-card-item';

      const isIgnored = vid.category.includes('제외');
      const isNight = vid.is_night;
      
      let tagClass = isNight ? 'eat' : 'approach';
      if (isIgnored) tagClass = 'pass';

      card.innerHTML = `
        <div class="video-thumb-wrap" style="${isNight ? 'color: var(--hud-cyan);' : 'color: var(--hud-amber);'}">
          <i class="fa-solid ${isIgnored ? 'fa-paw' : 'fa-play'}"></i>
        </div>
        <div class="video-info">
          <div class="video-title">${vid.site_name}</div>
          <div class="video-sub">${vid.recorded_date} ${vid.recorded_time} · ${vid.animal_type.split(' ')[0]}</div>
          <span class="reaction-tag ${tagClass}">${vid.reaction}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openVideoModal(vid);
      });

      list.appendChild(card);
    });
  }

  openVideoModal(vid) {
    const modal = document.getElementById('video-modal');
    if (!modal) return;

    const videoEl = document.getElementById('modal-video-player');
    const titleEl = document.getElementById('modal-video-title');
    const siteEl = document.getElementById('modal-meta-site');
    const timeEl = document.getElementById('modal-meta-time');
    const animalEl = document.getElementById('modal-meta-animal');
    const countEl = document.getElementById('modal-meta-count');
    const reactionEl = document.getElementById('modal-meta-reaction');
    const fileEl = document.getElementById('modal-meta-file');

    if (titleEl) titleEl.textContent = `${vid.site_name} - ${vid.category} 영상`;
    if (siteEl) siteEl.textContent = vid.site_name;
    if (timeEl) timeEl.textContent = `${vid.recorded_date} ${vid.recorded_time} (${vid.is_night ? '야간' : '주간'})`;
    if (animalEl) animalEl.textContent = vid.animal_type;
    if (reactionEl) reactionEl.textContent = vid.reaction;
    if (fileEl) fileEl.textContent = vid.filename;

    if (videoEl) {
      videoEl.src = vid.rel_path;
      videoEl.load();
      videoEl.play().catch(() => {});
    }

    // Fly to camera button
    const locateBtn = document.getElementById('btn-fly-to-video-cam');
    if (locateBtn && this.mapCtrl) {
      locateBtn.onclick = () => {
        modal.classList.add('hidden');
        if (videoEl) videoEl.pause();
        this.mapCtrl.flyToCamera(vid.camera_id);
      };
    }

    modal.classList.remove('hidden');
  }

  bindModalEvents() {
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('btn-close-video-modal');
    const videoEl = document.getElementById('modal-video-player');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (videoEl) videoEl.pause();
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          if (videoEl) videoEl.pause();
        }
      });
    }
  }
}

window.VideoManager = VideoManager;
