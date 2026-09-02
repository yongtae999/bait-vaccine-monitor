/**
 * Main Application Orchestrator
 * ASF Wild Boar Oral Bait Vaccine Monitoring Platform
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 Initializing Bait Vaccine Wild Boar Monitoring Platform...");

  let camerasData = [];
  let videosData = [];
  let photosData = [];
  let activityLogsData = [];

  // Fetch initial data with cache-busting timestamp
  try {
    const t = Date.now();
    const [camsRes, vidsRes, photosRes, logsRes] = await Promise.all([
      fetch(`data/cameras.json?t=${t}`).then(r => r.json()),
      fetch(`data/wildboar_videos.json?t=${t}`).then(r => r.json()),
      fetch(`data/photos.json?t=${t}`).then(r => r.json()),
      fetch(`data/activity_logs.json?t=${t}`).then(r => r.json())
    ]);

    camerasData = camsRes;
    videosData = vidsRes;
    photosData = photosRes;
    activityLogsData = logsRes;
  } catch (err) {
    console.warn("Falling back to embedded data:", err);
  }

  // 1. Initialize Map Controller
  const mapCtrl = new MapController('map-viewport');
  mapCtrl.init(camerasData);

  // 2. Initialize Video Manager
  const videoMgr = new VideoManager(mapCtrl);
  videoMgr.init(videosData);

  // 3. Initialize Analytics Manager
  const analyticsMgr = new AnalyticsManager();
  analyticsMgr.init(videosData, camerasData);

  // 4. Initialize Activity Report Manager
  const reportMgr = new ActivityReportManager();
  reportMgr.init(activityLogsData);

  // 5. Initialize Photo Gallery Manager
  if (window.photoManager) {
    window.photoManager.init();
  }

  // 6. Initialize Interim Evaluation Report Manager (4 Sites Tables)
  if (window.interimReportManager) {
    window.interimReportManager.init();
  }

  // Connect Map camera selection with Video filtering
  mapCtrl.onCameraSelect = (camId) => {
    videoMgr.setCameraFilter(camId);
  };

  // 6. Dynamic KPI Rollup & Dynamic Date Range Calculation
  const totalClips = camerasData.reduce((acc, c) => acc + (c.total_clips || 0), 0);
  const confirmedBoar = videosData.filter(v => v.category === '멧돼지확정').length;

  const kpiScanned = document.getElementById('kpi-scanned-clips');
  if (kpiScanned) kpiScanned.textContent = totalClips.toLocaleString();

  const kpiConfirmed = document.getElementById('kpi-confirmed-boar');
  if (kpiConfirmed) kpiConfirmed.textContent = confirmedBoar.toString();

  const kpiPhotos = document.getElementById('kpi-photos-count');
  if (kpiPhotos) kpiPhotos.textContent = photosData.length.toString();

  // Calculate Dynamic Data Range (Min Date ~ Max Date from all datasets)
  const allDates = [];
  videosData.forEach(v => {
    const d = v.date || v.recorded_date;
    if (d && d.match(/^\d{4}-\d{2}-\d{2}$/)) allDates.push(d);
  });
  photosData.forEach(p => {
    if (p.date && p.date.match(/^\d{4}-\d{2}-\d{2}$/)) allDates.push(p.date);
  });
  activityLogsData.forEach(l => {
    if (l.work_date && l.work_date.match(/^\d{4}-\d{2}-\d{2}$/)) allDates.push(l.work_date);
  });

  if (allDates.length > 0) {
    allDates.sort();
    const minDate = allDates[0];
    const maxDate = allDates[allDates.length - 1];
    const rangeTextEl = document.getElementById('data-range-text');
    if (rangeTextEl) {
      const minStr = minDate.replace(/-/g, '.');
      const maxStr = maxDate.replace(/-/g, '.');
      rangeTextEl.textContent = `${minStr} ~ ${maxStr} 데이터 반영`;
    }
  }

  // 7. Populate Left Sidebar Camera Cards
  const camGrid = document.getElementById('camera-cards-container');
  if (camGrid && camerasData.length) {
    camGrid.innerHTML = '';
    camerasData.forEach((cam, idx) => {
      const isStandby = cam.status === 'standby';
      const card = document.createElement('div');
      card.className = `cam-card ${idx === 0 ? 'active' : ''}`;
      card.dataset.id = cam.id;

      card.innerHTML = `
        <div class="cam-card-header">
          <span class="cam-name">${cam.name}</span>
          <span class="cam-badge" style="${isStandby ? 'background: rgba(148, 163, 184, 0.2); color: #94a3b8;' : ''}">
            ${isStandby ? '설치 준비 중' : '설치 운영'}
          </span>
        </div>
        <div class="cam-meta">
          📍 ${cam.address}<br>
          🌿 ${cam.desc}
        </div>
        <div class="cam-stats-row">
          ${cam.id === 'cam-dg-1' ? '<span style="color: #94a3b8;">미끼: <b>제외 (단독 모니터링)</b></span>' : '<span>미끼: <b>미끼틀+유인제배합</b></span>'}
          <span style="color: ${isStandby ? '#94a3b8' : '#f43f5e'}; font-weight: bold;">
            🐗 멧돼지 ${cam.wildboar_confirmed}건
          </span>
        </div>
      `;

      card.addEventListener('click', () => {
        mapCtrl.flyToCamera(cam.id);
        videoMgr.setCameraFilter(cam.id);
      });

      camGrid.appendChild(card);
    });
  }

  // 8. Region Switcher (Gongju vs Daegu/Gyeongsan)
  const regionSelector = document.getElementById('region-selector');
  if (regionSelector) {
    regionSelector.addEventListener('change', (e) => {
      const regionVal = e.target.value;
      mapCtrl.flyToRegion(regionVal);
      videoMgr.setRegionFilter(regionVal);
    });
  }

  // 9. Fullscreen Toggle
  const fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // 10. Video Sync Guide Modal
  const syncBtn = document.getElementById('btn-open-sync-guide');
  const syncModal = document.getElementById('sync-modal');
  const syncCloseBtn = document.getElementById('btn-close-sync-modal');
  const syncCloseFooter = document.getElementById('btn-close-sync-modal-footer');

  if (syncBtn && syncModal) {
    syncBtn.addEventListener('click', () => syncModal.classList.remove('hidden'));
    if (syncCloseBtn) syncCloseBtn.addEventListener('click', () => syncModal.classList.add('hidden'));
    if (syncCloseFooter) syncCloseFooter.addEventListener('click', () => syncModal.classList.add('hidden'));
    syncModal.addEventListener('click', (e) => {
      if (e.target === syncModal) syncModal.classList.add('hidden');
    });
  }

  console.log(`✅ Platform Ready: 4 IP Cameras, ${totalClips} Analyzed Clips, ${confirmedBoar} Confirmed Boar Videos & ${photosData.length} Photos Synchronized!`);
});
