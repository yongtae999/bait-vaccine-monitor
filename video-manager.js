/**
 * Video Manager Module
 * Wildboar Confirmed Video Gallery, Location-specific Filtering & Video Player
 */

class VideoManager {
  constructor(mapController) {
    this.mapCtrl = mapController;
    this.videos = [];
    this.activeFilter = 'all'; // 'all', 'boar', 'install', 'ignored', or date
    this.activeRegion = 'gongju'; // 'gongju' or 'gyeongsan'
    this.activeCameraId = null; // null or specific camera id (e.g. 'cam-dg-1')
  }

  init(videosData) {
    this.videos = videosData || [];
    this.renderFilterTabs();
    this.renderVideoCards();
    this.bindModalEvents();
  }

  setRegionFilter(regionKey) {
    this.activeRegion = (regionKey === 'gyeongsan' || regionKey === 'daegu') ? 'gyeongsan' : 'gongju';
    this.activeCameraId = null; // reset specific camera filter
    this.activeFilter = 'all'; // reset date/type filter
    this.renderFilterTabs();
    this.renderVideoCards();
  }

  setCameraFilter(cameraId) {
    this.activeCameraId = cameraId;
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
      return list.filter(v => (v.date || v.recorded_date) === this.activeFilter);
    }
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

    const dates = Array.from(new Set(baseList.map(v => (v.date || v.recorded_date)))).filter(Boolean).sort().reverse();
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
      btn.textContent = `📅 ${d.slice(5)}`;
      container.appendChild(btn);
    });

    // Bind pill click events
    container.querySelectorAll('.tab-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.id === 'btn-reset-cam-filter') {
          this.resetLocationFilter();
          return;
        }
        container.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.applyFilter(btn.dataset.filter);
      });
    });
  }

  getCameraName(camId) {
    const names = {
      'cam-gj-142-5': '공주 1호기 (142-5)',
      'cam-gj-59-3': '공주 2호기 (59-3)',
      'cam-gj-san135': '공주 3호기 (산135)',
      'cam-dg-1': '경산 4호기 (남하리)'
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
      const isNight = !!vid.is_night;
      const vDate = vid.date || vid.recorded_date || '';
      const vTime = vid.time || vid.recorded_time || '';
      
      let tagClass = isNight ? 'night' : 'day';
      let tagIcon = isNight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
      let tagText = isNight ? '야간 섭취 관찰' : '주간 섭취 관찰';
      let thumbIcon = isNight ? 'fa-moon' : 'fa-sun';
      let thumbColor = isNight ? '#f87171' : '#fbbf24';

      if (isIgnored) {
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

    // Populate metadata
    document.getElementById('modal-video-title').textContent = `${vid.site_name} 멧돼지 선별 영상`;
    document.getElementById('modal-meta-site').textContent = vid.site_name;
    document.getElementById('modal-meta-time').textContent = `${vDate} ${vTime} (${isNight ? '🌙 야간 적외선 모니터링' : '☀️ 주간 컬러 모니터링'})`;
    document.getElementById('modal-meta-animal').textContent = vid.animal_type || "야생 멧돼지 (Sus scrofa)";
    
    const reactionEl = document.getElementById('modal-meta-reaction');
    if (reactionEl) {
      reactionEl.textContent = isNight ? '🌙 야간 미끼 섭취 (적외선)' : '☀️ 주간 미끼 섭취 (주간 컬러)';
      reactionEl.style.color = isNight ? '#f87171' : '#fbbf24';
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
