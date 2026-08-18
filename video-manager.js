/**
 * Video Manager Module
 * Wildboar Confirmed Video Gallery, Location-specific Filtering & Video Player
 */

class VideoManager {
  constructor(mapController) {
    this.mapCtrl = mapController;
    this.videos = [];
    this.activeFilter = 'all'; // 'all', 'boar', 'install', 'ignored', or date
    this.activeRegion = 'gongju'; // 'gongju' or 'daegu'
    this.activeCameraId = null; // null or specific camera id (e.g. 'cam-dg-1')
  }

  init(videosData) {
    this.videos = videosData || [];
    this.renderFilterTabs();
    this.renderVideoCards();
    this.bindModalEvents();
  }

  setRegionFilter(regionKey) {
    this.activeRegion = (regionKey === 'daegu') ? 'daegu' : 'gongju';
    this.activeCameraId = null; // reset specific camera filter
    this.activeFilter = 'all'; // reset date/type filter
    this.renderFilterTabs();
    this.renderVideoCards();
  }

  setCameraFilter(cameraId) {
    this.activeCameraId = cameraId;
    this.activeFilter = 'all';

    // Auto synchronize region with camera
    if (cameraId && (cameraId.includes('dg') || cameraId.includes('daegu'))) {
      this.activeRegion = 'daegu';
    } else {
      this.activeRegion = 'gongju';
    }

    // Sync header dropdown if exists
    const regionSelector = document.getElementById('region-selector');
    if (regionSelector && regionSelector.value !== this.activeRegion) {
      regionSelector.value = this.activeRegion;
    }

    this.renderFilterTabs();
    this.renderVideoCards();
  }

  resetLocationFilter() {
    this.activeCameraId = null;
    this.activeFilter = 'all';
    this.renderFilterTabs();
    this.renderVideoCards();
  }

  getFilteredVideos() {
    let list = this.videos;

    // 1. If a specific camera is clicked, filter by that camera directly
    if (this.activeCameraId) {
      if (this.activeCameraId.includes('dg') || this.activeCameraId.includes('daegu')) {
        list = list.filter(v => v.camera_id === this.activeCameraId || v.region === '대구');
      } else {
        list = list.filter(v => v.camera_id === this.activeCameraId);
      }
    } else {
      // 2. Otherwise filter by region
      if (this.activeRegion === 'daegu') {
        list = list.filter(v => v.region === '대구' || (v.camera_id && v.camera_id.includes('dg')));
      } else {
        list = list.filter(v => v.region === '공주' || !v.region || (v.camera_id && v.camera_id.includes('gj')));
      }
    }

    // 3. Filter by Category or Date Tab
    if (this.activeFilter === 'all') {
      return list;
    } else if (this.activeFilter === 'boar') {
      return list.filter(v => v.category === '멧돼지확정' || v.category === '멧돼지 선별영상');
    } else if (this.activeFilter === 'install') {
      return list.filter(v => v.category && v.category.includes('설치'));
    } else if (this.activeFilter === 'ignored') {
      return list.filter(v => v.category && v.category.includes('제외'));
    } else {
      return list.filter(v => v.recorded_date === this.activeFilter);
    }
  }

  renderFilterTabs() {
    const container = document.getElementById('video-filter-tabs');
    if (!container) return;

    // Base list for current region/camera
    let baseList = this.videos;
    if (this.activeCameraId) {
      if (this.activeCameraId.includes('dg')) {
        baseList = baseList.filter(v => v.camera_id === this.activeCameraId || v.region === '대구');
      } else {
        baseList = baseList.filter(v => v.camera_id === this.activeCameraId);
      }
    } else {
      if (this.activeRegion === 'daegu') {
        baseList = baseList.filter(v => v.region === '대구' || (v.camera_id && v.camera_id.includes('dg')));
      } else {
        baseList = baseList.filter(v => v.region === '공주' || !v.region || (v.camera_id && v.camera_id.includes('gj')));
      }
    }

    const dates = Array.from(new Set(baseList.map(v => v.recorded_date))).sort().reverse();
    const boarCount = baseList.filter(v => v.category === '멧돼지확정' || v.category === '멧돼지 선별영상').length;
    const installCount = baseList.filter(v => v.category && v.category.includes('설치')).length;
    const deerCount = baseList.filter(v => v.category && v.category.includes('제외')).length;

    let filterChipsHtml = '';
    if (this.activeCameraId) {
      const camName = this.getCameraName(this.activeCameraId);
      filterChipsHtml = `
        <button class="tab-pill active" id="btn-reset-cam-filter" style="background: #0284c7; color: #fff; border-color: #38bdf8;" title="클릭 시 해당 권역 전체 영상 보기">
          📍 ${camName} <i class="fa-solid fa-xmark" style="margin-left: 4px;"></i>
        </button>
      `;
    }

    container.innerHTML = `
      ${filterChipsHtml}
      <button class="tab-pill ${this.activeFilter === 'all' && !this.activeCameraId ? 'active' : ''}" data-filter="all">전체 (${baseList.length})</button>
      ${boarCount > 0 ? `<button class="tab-pill ${this.activeFilter === 'boar' ? 'active' : ''}" data-filter="boar">🐗 멧돼지 (${boarCount})</button>` : ''}
      ${installCount > 0 ? `<button class="tab-pill ${this.activeFilter === 'install' ? 'active' : ''}" data-filter="install">🛠️ 설치점검 (${installCount})</button>` : ''}
      ${deerCount > 0 ? `<button class="tab-pill ${this.activeFilter === 'ignored' ? 'active' : ''}" data-filter="ignored">🦌 고라니 (${deerCount})</button>` : ''}
    `;

    dates.forEach(d => {
      const btn = document.createElement('button');
      btn.className = `tab-pill ${this.activeFilter === d ? 'active' : ''}`;
      btn.dataset.filter = d;
      btn.textContent = d.replace('2026-', '');
      container.appendChild(btn);
    });

    // Reset specific cam filter listener
    const resetBtn = document.getElementById('btn-reset-cam-filter');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetLocationFilter();
      });
    }

    container.querySelectorAll('.tab-pill[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyFilter(btn.dataset.filter);
      });
    });
  }

  getCameraName(camId) {
    const names = {
      'cam-gj-59-3': '공주 2호기 (59-3)',
      'cam-gj-san135': '공주 3호기 (산135)',
      'cam-gj-142-5': '공주 1호기 (142-5)',
      'cam-dg-1': '대구 4호기 (달성 비슬산)'
    };
    return names[camId] || camId;
  }

  applyFilter(filterKey) {
    this.activeFilter = filterKey;
    this.renderVideoCards();
  }

  renderVideoCards() {
    const list = document.getElementById('video-cards-container');
    const badge = document.getElementById('video-count-badge');
    if (!list) return;

    list.innerHTML = '';
    const filtered = this.getFilteredVideos();

    if (badge) {
      badge.textContent = `${filtered.length}건 표출`;
    }

    if (filtered.length === 0) {
      list.innerHTML = '<div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 24px;">선택한 지점/조건에 해당하는 영상이 없습니다.</div>';
      return;
    }

    filtered.forEach(vid => {
      const card = document.createElement('div');
      card.className = 'video-card-item';

      const isIgnored = vid.category && vid.category.includes('제외');
      const isInstall = vid.category && vid.category.includes('설치');
      const isNight = vid.is_night;
      
      let tagClass = isNight ? 'eat' : 'approach';
      let iconClass = 'fa-play';
      if (isIgnored) {
        tagClass = 'pass';
        iconClass = 'fa-paw';
      } else if (isInstall) {
        tagClass = 'approach';
        iconClass = 'fa-wrench';
      }

      card.innerHTML = `
        <div class="video-thumb-wrap" style="${isInstall ? 'color: var(--accent-emerald);' : (isNight ? 'color: var(--hud-cyan);' : 'color: var(--hud-amber);')}">
          <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="video-info">
          <div class="video-title">${vid.site_name}</div>
          <div class="video-sub">${vid.recorded_date} ${vid.recorded_time} · ${vid.animal_type ? vid.animal_type.split(' ')[0] : '영상'}</div>
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
      videoEl.play().catch((err) => {
        console.warn('Auto-play prevented or codec issue:', err);
      });
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
