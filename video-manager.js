/**
 * Video Manager Module
 * Wildboar Confirmed Video Gallery, Location-specific Filtering & Video Player
 */

class VideoManager {
  constructor(mapController) {
    this.mapCtrl = mapController;
    this.videos = [];
    this.activeFilter = 'all'; // legacy
    this.activeCategory = 'all'; // 'all', 'boar', 'badger', 'deer', 'install'
    this.activeDate = 'all'; // 'all' or 'YYYY-MM-DD'
    this.activeRegion = 'gongju'; // 'gongju' or 'gyeongsan'
    this.activeCameraId = null; // null or specific camera id (e.g. 'cam-dg-1')
    this.sortOrder = 'desc'; // 'desc' (최신순) or 'asc' (과거순)
  }

  init(videosData) {
    this.videos = videosData || [];
    this.bindSortButton();
    this.renderFilterTabs();
    this.renderVideoCards();
    this.bindModalEvents();
  }

  bindSortButton() {
    const btn = document.getElementById('btn-video-sort-order');
    if (!btn) return;
    btn.addEventListener('click', () => {
      this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
      this.updateSortButtonUI();
      this.renderVideoCards();
    });
    this.updateSortButtonUI();
  }

  updateSortButtonUI() {
    const label = document.getElementById('sort-order-label');
    const icon = document.getElementById('sort-order-icon');
    if (label) {
      label.textContent = this.sortOrder === 'desc' ? '최신순' : '과거순';
    }
    if (icon) {
      icon.className = this.sortOrder === 'desc' ? 'fa-solid fa-arrow-down-wide-short' : 'fa-solid fa-arrow-up-short-wide';
    }
  }

  setRegionFilter(regionKey) {
    this.activeRegion = (regionKey === 'gyeongsan' || regionKey === 'daegu') ? 'gyeongsan' : 'gongju';
    this.activeCameraId = null; // reset specific camera filter
    this.activeCategory = 'all';
    this.activeDate = 'all';
    this.activeFilter = 'all';
    this.renderFilterTabs();
    this.renderVideoCards();
  }

  setCameraFilter(cameraId) {
    this.activeCameraId = cameraId;
    this.activeCategory = 'all';
    this.activeDate = 'all';
    this.activeFilter = 'all';

    // Auto synchronize region with camera
    if (cameraId && (cameraId.includes('dg') || cameraId.includes('gs') || cameraId.includes('gyeongsan') || cameraId.includes('daegu'))) {
      this.activeRegion = 'gyeongsan';
    } else {
      this.activeRegion = 'gongju';
    }

    // Sync header dropdown if exists
    const regionSelector = document.getElementById('region-selector');
    if (regionSelector) {
      if (this.activeRegion === 'gyeongsan') {
        regionSelector.value = regionSelector.querySelector('option[value="gyeongsan"]') ? 'gyeongsan' : 'daegu';
      } else {
        regionSelector.value = 'gongju';
      }
    }

    this.renderFilterTabs();
    this.renderVideoCards();
  }

  resetLocationFilter() {
    this.activeCameraId = null;
    this.activeCategory = 'all';
    this.activeDate = 'all';
    this.activeFilter = 'all';
    this.renderFilterTabs();
    this.renderVideoCards();
  }

  getFilteredVideos() {
    let list = this.videos;

    // 1. If a specific camera is clicked, filter by that camera directly
    if (this.activeCameraId) {
      if (this.activeCameraId.includes('dg') || this.activeCameraId.includes('gs') || this.activeCameraId.includes('gyeongsan') || this.activeCameraId.includes('daegu')) {
        list = list.filter(v => v.camera_id === this.activeCameraId || v.region === '경산' || v.region === '대구');
      } else {
        list = list.filter(v => v.camera_id === this.activeCameraId);
      }
    } else {
      // 2. Otherwise filter by region
      if (this.activeRegion === 'gyeongsan' || this.activeRegion === 'daegu') {
        list = list.filter(v => v.region === '경산' || v.region === '대구' || (v.camera_id && (v.camera_id.includes('dg') || v.camera_id.includes('gs'))));
      } else {
        list = list.filter(v => v.region === '공주' || !v.region || (v.camera_id && v.camera_id.includes('gj')));
      }
    }

    // 3. Filter by Category
    if (this.activeCategory === 'boar') {
      list = list.filter(v => v.category === '멧돼지확정' || v.category === '멧돼지 선별영상');
    } else if (this.activeCategory === 'badger') {
      list = list.filter(v => (v.animal_type && v.animal_type.includes('오소리')) || (v.category && v.category.includes('오소리')));
    } else if (this.activeCategory === 'deer') {
      list = list.filter(v => (v.animal_type && v.animal_type.includes('고라니')) || (v.category && v.category.includes('고라니')));
    } else if (this.activeCategory === 'install') {
      list = list.filter(v => v.category && v.category.includes('설치'));
    }

    // 4. Filter by Date
    if (this.activeDate && this.activeDate !== 'all') {
      list = list.filter(v => (v.date || v.recorded_date) === this.activeDate);
    }

    // 5. Strictly sort by date and time
    const sortOrder = this.sortOrder || 'desc';
    return [...list].sort((a, b) => {
      const dtA = (a.date || a.recorded_date || '') + ' ' + (a.time || a.recorded_time || '00:00:00');
      const dtB = (b.date || b.recorded_date || '') + ' ' + (b.time || b.recorded_time || '00:00:00');
      return sortOrder === 'desc' ? dtB.localeCompare(dtA) : dtA.localeCompare(dtB);
    });
  }

  renderFilterTabs() {
    const container = document.getElementById('video-filter-tabs');
    if (!container) return;

    // Base list for current region/camera
    let baseList = this.videos;
    if (this.activeCameraId) {
      if (this.activeCameraId.includes('dg') || this.activeCameraId.includes('gs')) {
        baseList = baseList.filter(v => v.camera_id === this.activeCameraId || v.region === '경산' || v.region === '대구');
      } else {
        baseList = baseList.filter(v => v.camera_id === this.activeCameraId);
      }
    } else {
      if (this.activeRegion === 'gyeongsan' || this.activeRegion === 'daegu') {
        baseList = baseList.filter(v => v.region === '경산' || v.region === '대구' || (v.camera_id && (v.camera_id.includes('dg') || v.camera_id.includes('gs'))));
      } else {
        baseList = baseList.filter(v => v.region === '공주' || !v.region || (v.camera_id && v.camera_id.includes('gj')));
      }
    }

    const boarCount = baseList.filter(v => v.category === '멧돼지확정' || v.category === '멧돼지 선별영상').length;
    const badgerCount = baseList.filter(v => (v.animal_type && v.animal_type.includes('오소리')) || (v.category && v.category.includes('오소리'))).length;
    const deerCount = baseList.filter(v => (v.animal_type && v.animal_type.includes('고라니')) || (v.category && v.category.includes('고라니'))).length;
    const installCount = baseList.filter(v => v.category && v.category.includes('설치')).length;

    const dates = Array.from(new Set(baseList.map(v => (v.date || v.recorded_date)))).filter(Boolean).sort().reverse();

    let camBannerHtml = '';
    if (this.activeCameraId) {
      const camName = this.getCameraName(this.activeCameraId);
      camBannerHtml = `
        <div class="filter-active-cam-banner">
          <span class="active-cam-text"><i class="fa-solid fa-location-dot"></i> ${camName}</span>
          <button class="btn-clear-cam" id="btn-reset-cam-filter" title="지점 필터 해제"><i class="fa-solid fa-xmark"></i> 지점 해제</button>
        </div>
      `;
    }

    const categoriesHtml = `
      <div class="filter-category-row">
        <button class="tab-pill ${this.activeCategory === 'all' ? 'active' : ''}" data-category="all">전체 (${baseList.length})</button>
        ${boarCount > 0 ? `<button class="tab-pill ${this.activeCategory === 'boar' ? 'active' : ''}" data-category="boar">🐗 멧돼지 (${boarCount})</button>` : ''}
        ${badgerCount > 0 ? `<button class="tab-pill ${this.activeCategory === 'badger' ? 'active' : ''}" data-category="badger">🦡 오소리 (${badgerCount})</button>` : ''}
        ${deerCount > 0 ? `<button class="tab-pill ${this.activeCategory === 'deer' ? 'active' : ''}" data-category="deer">🦌 고라니 (${deerCount})</button>` : ''}
        ${installCount > 0 ? `<button class="tab-pill ${this.activeCategory === 'install' ? 'active' : ''}" data-category="install">🛠️ 점검 (${installCount})</button>` : ''}
      </div>
    `;

    const dateButtonsHtml = dates.map(d => {
      const isDateActive = this.activeDate === d;
      return `<button class="date-pill ${isDateActive ? 'active' : ''}" data-date="${d}">📅 ${d.slice(5)}</button>`;
    }).join('');

    const dateRowHtml = `
      <div class="filter-date-row">
        <span class="date-row-label" title="일자별 필터"><i class="fa-regular fa-calendar"></i></span>
        <button class="date-pill ${this.activeDate === 'all' ? 'active' : ''}" data-date="all">전체</button>
        <div class="date-pills-scroll">
          ${dateButtonsHtml}
        </div>
      </div>
    `;

    container.innerHTML = `
      ${camBannerHtml}
      ${categoriesHtml}
      ${dateRowHtml}
    `;

    // Bind camera reset
    const btnResetCam = container.querySelector('#btn-reset-cam-filter');
    if (btnResetCam) {
      btnResetCam.addEventListener('click', () => {
        this.resetLocationFilter();
      });
    }

    // Bind category clicks
    container.querySelectorAll('.tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.category;
        this.renderFilterTabs();
        this.renderVideoCards();
      });
    });

    // Bind date clicks
    container.querySelectorAll('.date-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedDate = btn.dataset.date;
        if (this.activeDate === selectedDate && selectedDate !== 'all') {
          this.activeDate = 'all'; // toggle off if clicked again
        } else {
          this.activeDate = selectedDate;
        }
        this.renderFilterTabs();
        this.renderVideoCards();
      });
    });
  }

  applyFilter(filterKey) {
    if (['all', 'boar', 'badger', 'deer', 'install'].includes(filterKey)) {
      this.activeCategory = filterKey;
    } else {
      this.activeDate = filterKey;
    }
    this.renderFilterTabs();
    this.renderVideoCards();
  }

  getCameraName(camId) {
    const names = {
      'cam-gj-san135': 'A지점 (문금리 산135)',
      'cam-gj-59-3': 'B지점 (문금리 59-3)',
      'cam-gj-142-5': 'C지점 (문금리 142-5)',
      'cam-dg-1': 'D지점 (남하리 산 127)'
    };
    return names[camId] || camId;
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
      const isNight = !!vid.is_night;
      const vDate = vid.date || vid.recorded_date || '';
      const vTime = vid.time || vid.recorded_time || '';
      
      let tagClass = isNight ? 'night' : 'day';
      let tagIcon = isNight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
      let tagText = isNight ? '야간 섭취 관찰' : '주간 섭취 관찰';
      let thumbIcon = isNight ? 'fa-moon' : 'fa-sun';
      let thumbColor = isNight ? '#f87171' : '#fbbf24';

      if (vid.animal_type && vid.animal_type.includes('오소리')) {
        tagClass = 'pass';
        tagIcon = '<i class="fa-solid fa-paw text-amber"></i>';
        tagText = '비대상 (오소리)';
        thumbIcon = 'fa-paw';
        thumbColor = '#f59e0b';
      } else if (isIgnored) {
        tagClass = 'pass';
        tagIcon = '<i class="fa-solid fa-paw"></i>';
        tagText = `비대상 (${vid.animal_type ? vid.animal_type.split(' ')[0] : '고라니'})`;
        thumbIcon = 'fa-paw';
        thumbColor = '#94a3b8';
      } else if (isInstall) {
        tagClass = 'install';
        tagIcon = '<i class="fa-solid fa-wrench"></i>';
        tagText = '현장 설치 점검';
        thumbIcon = 'fa-wrench';
        thumbColor = '#34d399';
      }

      card.innerHTML = `
        <div class="video-thumb-wrap" style="color: ${thumbColor};">
          <i class="fa-solid ${thumbIcon}"></i>
        </div>
        <div class="video-info">
          <div class="video-title">${vid.site_name}</div>
          <div class="video-sub">${vDate} ${vTime} · ${vid.animal_type ? vid.animal_type.split(' ')[0] : '영상'}</div>
          <span class="reaction-tag ${tagClass}">${tagIcon} ${tagText}</span>
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
    const player = document.getElementById('modal-video-player');
    if (!modal || !player) return;

    const vDate = vid.date || vid.recorded_date || '';
    const vTime = vid.time || vid.recorded_time || '';

    const isNight = !!vid.is_night;
    const isBadger = vid.animal_type && vid.animal_type.includes('오소리');
    const isDeer = vid.animal_type && vid.animal_type.includes('고라니');
    const animalLabel = isBadger ? '오소리(비대상)' : (isDeer ? '고라니(비대상)' : '멧돼지');

    // Populate metadata
    document.getElementById('modal-video-title').textContent = `${vid.site_name} ${animalLabel} 선별 영상`;
    document.getElementById('modal-meta-site').textContent = vid.site_name;
    document.getElementById('modal-meta-time').textContent = `${vDate} ${vTime} (${isNight ? '🌙 야간 적외선 모니터링' : '☀️ 주간 컬러 모니터링'})`;
    document.getElementById('modal-meta-animal').textContent = vid.animal_type || "야생 멧돼지 (Sus scrofa)";
    
    const reactionEl = document.getElementById('modal-meta-reaction');
    if (reactionEl) {
      reactionEl.textContent = vid.reaction || (isNight ? '🌙 야간 미끼 섭취 (적외선)' : '☀️ 주간 미끼 섭취 (주간 컬러)');
      reactionEl.style.color = isBadger ? '#f59e0b' : (isNight ? '#f87171' : '#fbbf24');
    }
    document.getElementById('modal-meta-file').textContent = vid.filename;

    // Set video source
    player.src = vid.video_url || `assets/videos/confirmed/${vid.filename}`;
    player.load();
    player.play().catch(() => {});

    // Bind 3D camera fly button
    const btnFly = document.getElementById('btn-fly-to-video-cam');
    if (btnFly && this.mapCtrl) {
      btnFly.onclick = () => {
        this.mapCtrl.flyToCamera(vid.camera_id);
        modal.classList.add('hidden');
      };
    }

    modal.classList.remove('hidden');
  }

  bindModalEvents() {
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('btn-close-video-modal');
    const player = document.getElementById('modal-video-player');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (player) player.pause();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          if (player) player.pause();
        }
      });
    }
  }
}

window.VideoManager = VideoManager;
