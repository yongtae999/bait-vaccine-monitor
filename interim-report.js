/**
 * Interim Report Module
 * Generates Comprehensive Experimental Site Summary Tables & Chronological Timelines
 * for National Wildlife Disease Control & Korea Wildlife Management Association
 */

class InterimReportManager {
  constructor() {
    this.reports = [];
    this.activeSiteTab = 'all'; // 'all', 'cam-gj-142-5', 'cam-gj-59-3', 'cam-gj-san135', 'cam-dg-1'
  }

  async init() {
    const t = Date.now();
    try {
      const res = await fetch(`data/interim_report_data.json?t=${t}`);
      this.reports = await res.json();
      this.bindEvents();
    } catch (err) {
      console.error("Error loading interim_report_data.json:", err);
    }
  }

  bindEvents() {
    // Header Open Button
    const btnOpen = document.getElementById('btn-open-interim-report');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openModal());
    }

    // Modal Close
    const modal = document.getElementById('interim-report-modal');
    const btnClose = document.getElementById('btn-close-interim-modal');
    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
          modal.classList.add('hidden');
        }
      });
    }

    // Print Button
    const btnPrint = document.getElementById('btn-print-interim-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Export CSV Button
    const btnCsv = document.getElementById('btn-export-interim-csv');
    if (btnCsv) {
      btnCsv.addEventListener('click', () => this.exportCurrentReportToCSV());
    }
  }

  openModal(siteId = 'all') {
    this.activeSiteTab = siteId;
    const modal = document.getElementById('interim-report-modal');
    if (!modal) return;

    this.renderTabs();
    this.renderReportContent();
    modal.classList.remove('hidden');
  }

  renderTabs() {
    const tabsContainer = document.getElementById('interim-site-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = `
      <button class="interim-tab-btn ${this.activeSiteTab === 'all' ? 'active' : ''}" data-site="all">
        📊 4대 실험지 전체 종합 집계표
      </button>
      ${this.reports.map(r => `
        <button class="interim-tab-btn ${this.activeSiteTab === r.site_id ? 'active' : ''}" data-site="${r.site_id}">
          📍 ${r.site_num} (${r.site_name.split('(')[1] ? r.site_name.split('(')[1].replace(')', '') : r.site_name})
        </button>
      `).join('')}
    `;

    tabsContainer.querySelectorAll('.interim-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.interim-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSiteTab = btn.dataset.site;
        this.renderReportContent();
      });
    });
  }

  renderReportContent() {
    const container = document.getElementById('interim-report-content-area');
    if (!container) return;

    if (this.activeSiteTab === 'all') {
      this.renderAllSitesSummary(container);
    } else {
      const site = this.reports.find(r => r.site_id === this.activeSiteTab);
      if (site) {
        this.renderSingleSiteReport(container, site);
      }
    }
  }

  renderAllSitesSummary(container) {
    let totalClips = this.reports.reduce((acc, r) => acc + r.total_scanned_clips, 0);
    let totalConfirmed = this.reports.reduce((acc, r) => acc + r.confirmed_boar_count, 0);
    let totalIgnored = this.reports.reduce((acc, r) => acc + r.ignored_animal_count, 0);

    container.innerHTML = `
      <!-- Overall Title Header -->
      <div class="report-sheet-header">
        <div class="header-left-group">
          <div class="sheet-badge">국립야생동물질병관리원 실증 용역 과제</div>
          <h2 class="sheet-title">야생 멧돼지 미끼백신 섭취 기호도 평가 4대 실험지 종합 집계표</h2>
          <div class="sheet-meta">
            <span><b>수행기관:</b> (사)야생생물관리협회 대전ㆍ세종ㆍ충남지부</span>
            <span><b>작성기준일:</b> 2026년 9월 2일 (중간보고회 발표용)</span>
          </div>
        </div>
        <div class="print-approval-box">
          <table class="approval-table">
            <tr>
              <th rowspan="2" class="appr-title">결<br>재</th>
              <th>담 당</th>
              <th>검 토</th>
              <th>결 재</th>
            </tr>
            <tr>
              <td class="appr-sign"></td>
              <td class="appr-sign"></td>
              <td class="appr-sign"></td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Overview Stats Summary Card -->
      <div class="interim-summary-card">
        <div class="summary-kpi-item">
          <span class="lbl">운영 실험지</span>
          <span class="val">4 <small>개소 (공주3 + 경산1)</small></span>
        </div>
        <div class="summary-kpi-item">
          <span class="lbl">누적 수집 영상</span>
          <span class="val">${totalClips.toLocaleString()} <small>건</small></span>
        </div>
        <div class="summary-kpi-item highlight">
          <span class="lbl">멧돼지 섭취 확정</span>
          <span class="val">${totalConfirmed} <small>건</small></span>
        </div>
        <div class="summary-kpi-item">
          <span class="lbl">비대상(고라니) 통과</span>
          <span class="val">${totalIgnored} <small>건</small></span>
        </div>
        <div class="summary-kpi-item">
          <span class="lbl">미끼 기호도 종합</span>
          <span class="val" style="color: #34d399; font-size: 0.9rem;">매우 우수 (전 지점 섭취 실증)</span>
        </div>
      </div>

      <!-- 4 Sites Comparison Matrix Table -->
      <div class="table-section-title">
        <i class="fa-solid fa-table-list"></i> 1. 4대 실험지별 기본 설치 제원 및 실증 실적 비교 집계표
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 55px;">구분</th>
            <th>실험지명 및 소재지</th>
            <th>정밀 GPS 좌표 (위도, 경도)</th>
            <th style="width: 95px;">설치일자</th>
            <th style="width: 85px;">수집 영상</th>
            <th style="width: 95px;">멧돼지 확정</th>
            <th style="width: 120px;">실증 평가</th>
          </tr>
        </thead>
        <tbody>
          ${this.reports.map((r, idx) => `
            <tr>
              <td class="text-center font-bold" style="color: #38bdf8;">${r.site_num}</td>
              <td><b>${r.site_name}</b><br><small style="color: #94a3b8;">${r.address}</small></td>
              <td style="font-family: monospace; font-size: 0.72rem;">${r.coordinates}</td>
              <td class="text-center">${r.install_date}</td>
              <td class="text-center font-bold">${r.total_scanned_clips}건</td>
              <td class="text-center font-bold" style="color: #f43f5e; font-size: 0.88rem;">🐗 ${r.confirmed_boar_count}건</td>
              <td class="text-center"><span class="badge-status success">${r.bait_palatability.split('(')[0]}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Integrated Chronological Master Timeline for all sites -->
      <div class="table-section-title" style="margin-top: 24px;">
        <i class="fa-solid fa-clock-rotate-left"></i> 2. 4대 실험지 통합 날짜별 작업일지 및 멧돼지 출현 증빙 집계표 (시간 순서)
      </div>
      ${this.renderMasterTimelineTable()}
    `;

    this.bindMediaClicks(container);
  }

  renderMasterTimelineTable() {
    let allEvents = [];
    this.reports.forEach(r => {
      r.timeline.forEach(t => {
        allEvents.push({
          ...t,
          site_num: r.site_num,
          site_name: r.site_name,
          site_id: r.site_id
        });
      });
    });

    allEvents.sort((a, b) => a.date.localeCompare(b.date));

    return `
      <table class="report-table timeline-table">
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th style="width: 90px;">날짜 / 시간</th>
            <th style="width: 75px;">실험지</th>
            <th style="width: 105px;">구분</th>
            <th>수행 업무 상세 (작업일지 참조)</th>
            <th style="width: 160px;">출현 동물 / 개체수 / 반응단계</th>
            <th style="width: 110px;">참여 / 촬영</th>
            <th style="width: 150px;">📷 현장 사진 & 캡처 영상</th>
          </tr>
        </thead>
        <tbody>
          ${allEvents.map((e, idx) => `
            <tr class="${e.category.includes('멧돼지') ? 'row-highlight' : ''}">
              <td class="text-center">${idx + 1}</td>
              <td class="text-center font-bold">${e.date}<br><small style="color: #94a3b8;">${e.time.split('~')[0].trim()}</small></td>
              <td class="text-center"><span class="site-tag">${e.site_num}</span></td>
              <td class="text-center"><span class="badge-cat ${e.category.includes('멧돼지') ? 'boar' : (e.category.includes('유인제') ? 'bait' : 'work')}">${e.category}</span></td>
              <td>
                <div class="event-desc" style="white-space: pre-line;">${e.work_content}</div>
              </td>
              <td>
                ${e.animal_appearance !== '-' ? `
                  <div style="font-weight: 700; color: ${e.category.includes('멧돼지') ? '#f43f5e' : '#fbbf24'}; font-size: 0.76rem;">
                    ${e.category.includes('멧돼지') ? '🐗 ' : '🦌 '}${e.animal_appearance}
                  </div>
                  <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 2px;">
                    <b>개체수:</b> ${e.boar_count}
                  </div>
                ` : '<div style="color: #94a3b8; text-align: center;">-</div>'}
                ${e.reaction_stage && e.reaction_stage !== '-' ? `
                  <div class="event-sub"><i class="fa-solid fa-paw text-rose"></i> <b>반응:</b> ${e.reaction_stage}</div>
                ` : ''}
              </td>
              <td class="text-center" style="font-size: 0.72rem; color: #cbd5e1;">${e.workers}</td>
              <td>
                ${this.renderEvidenceGallery(e.evidences)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderSingleSiteReport(container, site) {
    container.innerHTML = `
      <!-- Single Site Title Header -->
      <div class="report-sheet-header">
        <div class="header-left-group">
          <div class="sheet-badge">국립야생동물질병관리원 실증 모니터링 실험지 정밀 집계표</div>
          <h2 class="sheet-title">${site.site_name} 실증 집계 및 시간순 타임라인 보고서</h2>
          <div class="sheet-meta">
            <span><b>지번 소재지:</b> ${site.address}</span>
            <span><b>정밀 GPS 좌표:</b> ${site.coordinates}</span>
          </div>
        </div>
        <div class="print-approval-box">
          <table class="approval-table">
            <tr>
              <th rowspan="2" class="appr-title">결<br>재</th>
              <th>담 당</th>
              <th>검 토</th>
              <th>결 재</th>
            </tr>
            <tr>
              <td class="appr-sign"></td>
              <td class="appr-sign"></td>
              <td class="appr-sign"></td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Site Profile Table (6하원칙 기본제원) -->
      <div class="table-section-title">
        <i class="fa-solid fa-circle-info"></i> 1. 실험지 설치 제원 및 운영 환경
      </div>
      <table class="report-table" style="margin-bottom: 20px;">
        <tbody>
          <tr>
            <th style="width: 15%;">실 험 지 명</th>
            <td style="width: 35%;"><b>${site.site_name}</b> (${site.region})</td>
            <th style="width: 15%;">최초 설치일자</th>
            <td style="width: 35%;">${site.install_date} (정상 가동 중)</td>
          </tr>
          <tr>
            <th>지번 소재지</th>
            <td>${site.address}</td>
            <th>GPS 실측 좌표</th>
            <td style="font-family: monospace; font-size: 0.75rem;">${site.coordinates}</td>
          </tr>
          <tr>
            <th>무인 관측 장비</th>
            <td>${site.camera_spec}</td>
            <th>누적 수집 영상</th>
            <td><b>${site.total_scanned_clips}건</b> 수집 완료</td>
          </tr>
          <tr>
            <th>멧돼지 출현 확정</th>
            <td><b style="color: #f43f5e; font-size: 0.95rem;">🐗 총 ${site.confirmed_boar_count}건</b> (비대상 고라니 ${site.ignored_animal_count}건)</td>
            <th>실증 기호도 평가</th>
            <td><b style="color: #38bdf8;">${site.bait_palatability}</b></td>
          </tr>
          <tr>
            <th>실증 종합 소견</th>
            <td colspan="3">${site.summary_opinion}</td>
          </tr>
        </tbody>
      </table>

      <!-- Chronological Site Timeline Table -->
      <div class="table-section-title">
        <i class="fa-solid fa-list-check"></i> 2. ${site.site_num} 날짜별 작업일지 및 멧돼지 출현/반응 실증 집계표 (시간 순서)
      </div>
      <table class="report-table timeline-table">
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th style="width: 95px;">날짜</th>
            <th style="width: 85px;">시간</th>
            <th style="width: 110px;">구분</th>
            <th>수행 업무 상세 (작업일지 참조)</th>
            <th style="width: 165px;">출현 동물 / 개체수 / 반응단계</th>
            <th style="width: 110px;">참여 / 촬영</th>
            <th style="width: 170px;">📷 현장 사진 & 캡처 영상</th>
          </tr>
        </thead>
        <tbody>
          ${site.timeline.map((t, idx) => `
            <tr class="${t.category.includes('멧돼지') ? 'row-highlight' : ''}">
              <td class="text-center">${idx + 1}</td>
              <td class="text-center font-bold">${t.date}</td>
              <td class="text-center font-mono" style="font-size: 0.72rem;">${t.time}</td>
              <td class="text-center"><span class="badge-cat ${t.category.includes('멧돼지') ? 'boar' : (t.category.includes('유인제') ? 'bait' : 'work')}">${t.category}</span></td>
              <td>
                <div class="event-desc" style="white-space: pre-line;">${t.work_content}</div>
              </td>
              <td>
                ${t.animal_appearance !== '-' ? `
                  <div style="font-weight: 700; color: ${t.category.includes('멧돼지') ? '#f43f5e' : '#fbbf24'}; font-size: 0.76rem;">
                    ${t.category.includes('멧돼지') ? '🐗 ' : '🦌 '}${t.animal_appearance}
                  </div>
                  <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 2px;">
                    <b>개체수:</b> ${t.boar_count}
                  </div>
                ` : '<div style="color: #94a3b8; text-align: center;">-</div>'}
                ${t.reaction_stage && t.reaction_stage !== '-' ? `
                  <div class="event-sub"><i class="fa-solid fa-paw text-rose"></i> <b>반응:</b> ${t.reaction_stage}</div>
                ` : ''}
              </td>
              <td class="text-center" style="font-size: 0.72rem; color: #cbd5e1;">${t.workers}</td>
              <td>
                ${this.renderEvidenceGallery(t.evidences)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.bindMediaClicks(container);
  }

  renderEvidenceGallery(evidences) {
    if (!evidences || evidences.length === 0) {
      return '<div style="color: #94a3b8; text-align: center; font-size: 0.7rem;">-</div>';
    }

    return `
      <div class="evidence-grid-wrap">
        ${evidences.map((ev, i) => `
          <div class="table-media-preview" data-type="${ev.type}" data-thumb="${ev.thumb}" data-title="${ev.title || '현장 실증 증빙'}" title="${ev.title || '클릭하여 확대'}">
            <img src="${ev.thumb}" alt="증빙">
            <i class="fa-solid ${ev.type === 'video' ? 'fa-play' : 'fa-camera'} media-icon"></i>
          </div>
        `).join('')}
      </div>
    `;
  }

  bindMediaClicks(container) {
    container.querySelectorAll('.table-media-preview').forEach(el => {
      el.addEventListener('click', () => {
        const type = el.dataset.type;
        const thumb = el.dataset.thumb;
        const title = el.dataset.title;

        if (type === 'photo' && window.photoManager) {
          const photoObj = window.photoManager.photos.find(p => thumb.includes(p.filename));
          if (photoObj) {
            const idx = window.photoManager.photos.indexOf(photoObj);
            window.photoManager.openLightbox(idx);
          } else {
            this.showDirectMediaModal(thumb, title);
          }
        } else if (type === 'video' && window.videoManager) {
          const vidFilename = thumb.replace('assets/thumbnails/', '').replace('.jpg', '.mp4');
          const vidObj = window.videoManager.videos.find(v => v.filename.includes(vidFilename) || vidFilename.includes(v.filename.replace('.mp4', '')));
          if (vidObj) {
            window.videoManager.openVideoModal(vidObj);
          } else {
            this.showDirectMediaModal(thumb, title);
          }
        } else {
          this.showDirectMediaModal(thumb, title);
        }
      });
    });
  }

  showDirectMediaModal(imgSrc, title) {
    if (window.photoManager) {
      const lightbox = document.getElementById('photo-lightbox-modal');
      const imgEl = document.getElementById('lightbox-img');
      const titleEl = document.getElementById('lightbox-title');
      const descEl = document.getElementById('lightbox-desc');
      if (lightbox && imgEl) {
        imgEl.src = imgSrc;
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = "현장 실증 증빙 자료";
        lightbox.classList.remove('hidden');
      }
    }
  }

  exportCurrentReportToCSV() {
    this.exportCurrentReportToExcel();
  }

  exportCurrentReportToExcel() {
    const baseUrl = window.location.origin.includes('github.io') 
      ? 'https://yongtae999.github.io/bait-vaccine-monitor' 
      : window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

    let sheetHtml = '';
    const nowStr = new Date().toISOString().slice(0,10);

    if (this.activeSiteTab === 'all') {
      sheetHtml = `
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td colspan="6" style="border: none; font-size: 16pt; font-weight: bold; text-align: left; padding: 10px 0;">
              야생 멧돼지 미끼백신 섭취 기호도 평가 4대 실험지 종합 집계표
            </td>
            <td colspan="2" style="border: none; text-align: right;">
              <table style="border-collapse: collapse; display: inline-table; width: 220px; text-align: center; border: 1.5pt solid #000;">
                <tr>
                  <th rowspan="2" style="width: 25px; background: #e2e8f0; border: 1pt solid #000; font-size: 8pt;">결<br>재</th>
                  <th style="background: #f1f5f9; border: 1pt solid #000; font-size: 8pt; width: 65px;">담 당</th>
                  <th style="background: #f1f5f9; border: 1pt solid #000; font-size: 8pt; width: 65px;">검 토</th>
                  <th style="background: #f1f5f9; border: 1pt solid #000; font-size: 8pt; width: 65px;">결 재</th>
                </tr>
                <tr>
                  <td style="height: 38px; border: 1pt solid #000;"></td>
                  <td style="height: 38px; border: 1pt solid #000;"></td>
                  <td style="height: 38px; border: 1pt solid #000;"></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Summary Matrix Table -->
        <h3 style="font-size: 11pt; font-weight: bold; margin: 10px 0 5px 0;">1. 4대 실험지별 기본 설치 제원 및 실증 실적 비교 집계표</h3>
        <table border="1" style="border-collapse: collapse; width: 100%; margin-bottom: 25px; font-size: 9pt;">
          <thead>
            <tr style="background-color: #E2E8F0; font-weight: bold;">
              <th style="width: 50px; padding: 6px;">구분</th>
              <th style="padding: 6px;">실험지명 및 소재지</th>
              <th style="padding: 6px;">정밀 GPS 좌표 (위도, 경도)</th>
              <th style="width: 90px; padding: 6px;">설치일자</th>
              <th style="width: 80px; padding: 6px;">수집 영상</th>
              <th style="width: 90px; padding: 6px;">멧돼지 확정</th>
              <th style="width: 120px; padding: 6px;">실증 평가</th>
            </tr>
          </thead>
          <tbody>
            ${this.reports.map(r => `
              <tr>
                <td style="text-align: center; font-weight: bold; color: #0369a1; padding: 6px;">${r.site_num}</td>
                <td style="padding: 6px;"><b>${r.site_name}</b><br><small style="color: #64748b;">${r.address}</small></td>
                <td style="padding: 6px; font-family: monospace;">${r.coordinates}</td>
                <td style="text-align: center; padding: 6px;">${r.install_date}</td>
                <td style="text-align: center; font-weight: bold; padding: 6px;">${r.total_scanned_clips}건</td>
                <td style="text-align: center; font-weight: bold; color: #e11d48; padding: 6px;">🐗 ${r.confirmed_boar_count}건</td>
                <td style="text-align: center; padding: 6px;"><b>${r.bait_palatability.split('(')[0]}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Chronological Unified Timeline Table -->
        <h3 style="font-size: 11pt; font-weight: bold; margin: 15px 0 5px 0;">2. 4대 실험지 날짜별 작업일지 및 멧돼지 출현/반응 실증 집계표 (시간순 타임라인)</h3>
        <table border="1" style="border-collapse: collapse; width: 100%; font-size: 8.5pt;">
          <thead>
            <tr style="background-color: #E2E8F0; font-weight: bold;">
              <th style="width: 90px; padding: 6px;">실험지구분</th>
              <th style="width: 75px; padding: 6px;">일자</th>
              <th style="width: 70px; padding: 6px;">시간</th>
              <th style="width: 95px; padding: 6px;">구분</th>
              <th style="padding: 6px;">수행 업무 상세 (작업일지 사실 기록)</th>
              <th style="width: 110px; padding: 6px;">출현동물 / 개체수</th>
              <th style="width: 120px; padding: 6px;">미끼 반응 / 진행단계</th>
              <th style="width: 220px; padding: 6px;">현장 증빙 자료 (사진 및 캡처)</th>
            </tr>
          </thead>
          <tbody>
            ${this.buildAllTimelineRowsForExcel(baseUrl)}
          </tbody>
        </table>
      `;
    } else {
      const site = this.reports.find(r => r.site_id === this.activeSiteTab);
      if (!site) return;

      sheetHtml = `
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td colspan="5" style="border: none; font-size: 16pt; font-weight: bold; text-align: left; padding: 10px 0;">
              ${site.site_name} 실증 집계 및 시간순 타임라인 보고서
            </td>
            <td colspan="2" style="border: none; text-align: right;">
              <table style="border-collapse: collapse; display: inline-table; width: 220px; text-align: center; border: 1.5pt solid #000;">
                <tr>
                  <th rowspan="2" style="width: 25px; background: #e2e8f0; border: 1pt solid #000; font-size: 8pt;">결<br>재</th>
                  <th style="background: #f1f5f9; border: 1pt solid #000; font-size: 8pt; width: 65px;">담 당</th>
                  <th style="background: #f1f5f9; border: 1pt solid #000; font-size: 8pt; width: 65px;">검 토</th>
                  <th style="background: #f1f5f9; border: 1pt solid #000; font-size: 8pt; width: 65px;">결 재</th>
                </tr>
                <tr>
                  <td style="height: 38px; border: 1pt solid #000;"></td>
                  <td style="height: 38px; border: 1pt solid #000;"></td>
                  <td style="height: 38px; border: 1pt solid #000;"></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Profile Table -->
        <h3 style="font-size: 11pt; font-weight: bold; margin: 10px 0 5px 0;">1. 실험지 기본 설치 제원 및 실증 현황</h3>
        <table border="1" style="border-collapse: collapse; width: 100%; margin-bottom: 25px; font-size: 9pt;">
          <tr>
            <th style="width: 15%; background-color: #F1F5F9; padding: 6px;">실험지명</th>
            <td style="width: 35%; padding: 6px;"><b>${site.site_name}</b></td>
            <th style="width: 15%; background-color: #F1F5F9; padding: 6px;">설치일자</th>
            <td style="width: 35%; padding: 6px;">${site.install_date} (정상 가동 중)</td>
          </tr>
          <tr>
            <th style="background-color: #F1F5F9; padding: 6px;">지번 소재지</th>
            <td style="padding: 6px;">${site.address}</td>
            <th style="background-color: #F1F5F9; padding: 6px;">GPS 실측 좌표</th>
            <td style="padding: 6px; font-family: monospace;">${site.coordinates}</td>
          </tr>
          <tr>
            <th style="background-color: #F1F5F9; padding: 6px;">무인 관측 장비</th>
            <td style="padding: 6px;">${site.camera_spec}</td>
            <th style="background-color: #F1F5F9; padding: 6px;">누적 수집 영상</th>
            <td style="padding: 6px;"><b>${site.total_scanned_clips}건</b> 수집 완료</td>
          </tr>
          <tr>
            <th style="background-color: #F1F5F9; padding: 6px;">멧돼지 출현 확정</th>
            <td style="padding: 6px; color: #e11d48; font-weight: bold;">🐗 총 ${site.confirmed_boar_count}건</td>
            <th style="background-color: #F1F5F9; padding: 6px;">실증 기호도 평가</th>
            <td style="padding: 6px; font-weight: bold; color: #0284c7;">${site.bait_palatability}</td>
          </tr>
          <tr>
            <th style="background-color: #F1F5F9; padding: 6px;">실증 종합 소견</th>
            <td colspan="3" style="padding: 6px;">${site.summary_opinion}</td>
          </tr>
        </table>

        <!-- Timeline Table -->
        <h3 style="font-size: 11pt; font-weight: bold; margin: 15px 0 5px 0;">2. 날짜별 작업일지 및 멧돼지 출현/반응 실증 집계표 (시간순 타임라인)</h3>
        <table border="1" style="border-collapse: collapse; width: 100%; font-size: 8.5pt;">
          <thead>
            <tr style="background-color: #E2E8F0; font-weight: bold;">
              <th style="width: 75px; padding: 6px;">일자</th>
              <th style="width: 70px; padding: 6px;">시간</th>
              <th style="width: 100px; padding: 6px;">구분</th>
              <th style="padding: 6px;">수행 업무 상세 (작업일지 사실 기록)</th>
              <th style="width: 110px; padding: 6px;">출현동물 / 개체수</th>
              <th style="width: 130px; padding: 6px;">미끼 반응 / 진행단계</th>
              <th style="width: 250px; padding: 6px;">현장 증빙 자료 (사진 및 캡처)</th>
            </tr>
          </thead>
          <tbody>
            ${this.buildSiteTimelineRowsForExcel(site, baseUrl)}
          </tbody>
        </table>
      `;
    }

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>실험지집계표</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                  <x:Print>
                    <x:ValidPrinterInfo/>
                    <x:PaperSizeIndex>9</x:PaperSizeIndex>
                    <x:HorizontalResolution>600</x:HorizontalResolution>
                    <x:VerticalResolution>600</x:VerticalResolution>
                    <x:Orientation>Landscape</x:Orientation>
                  </x:Print>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: '맑은 고딕', 'Malgun Gothic', Dotum, sans-serif; font-size: 9pt; }
          table { border-collapse: collapse; }
          th { border: 1pt solid #475569; background-color: #f1f5f9; text-align: center; vertical-align: middle; }
          td { border: 0.5pt solid #64748b; vertical-align: middle; padding: 4px 6px; }
          .img-cell-box { display: inline-block; margin: 2px 4px; text-align: center; }
          .img-cell-box img { width: 85px; height: 60px; object-fit: cover; border: 1px solid #64748b; }
        </style>
      </head>
      <body>
        ${sheetHtml}
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    const filename = `야생멧돼지_미끼백신_실증집계표_${this.activeSiteTab}_${nowStr}.xls`;
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  buildAllTimelineRowsForExcel(baseUrl) {
    let allRows = [];
    this.reports.forEach(r => {
      r.timeline.forEach(t => {
        allRows.push({
          site_num: r.site_num,
          site_name: r.site_name,
          ...t
        });
      });
    });

    allRows.sort((a, b) => a.date.localeCompare(b.date));

    return allRows.map(row => {
      const isBoar = row.category.includes('멧돼지') || row.category.includes('대군락');
      const rowBg = isBoar ? 'background-color: #fff1f2;' : '';
      const evHtml = this.formatEvidencesForExcel(row.evidences, baseUrl);

      return `
        <tr style="${rowBg}">
          <td style="text-align: center; font-weight: bold; color: #0284c7; padding: 6px;">${row.site_num}</td>
          <td style="text-align: center; padding: 6px;"><b>${row.date}</b></td>
          <td style="text-align: center; color: #64748b; padding: 6px;">${row.time}</td>
          <td style="text-align: center; font-weight: bold; padding: 6px;">${row.category}</td>
          <td style="padding: 6px; line-height: 1.4;">${row.work_content.replace(/\n/g, '<br>')}</td>
          <td style="text-align: center; padding: 6px;">${row.animal_appearance}<br><b>${row.boar_count}</b></td>
          <td style="padding: 6px;">${row.reaction_stage}</td>
          <td style="padding: 6px; text-align: center;">${evHtml}</td>
        </tr>
      `;
    }).join('');
  }

  buildSiteTimelineRowsForExcel(site, baseUrl) {
    return site.timeline.map(row => {
      const isBoar = row.category.includes('멧돼지') || row.category.includes('대군락');
      const rowBg = isBoar ? 'background-color: #fff1f2;' : '';
      const evHtml = this.formatEvidencesForExcel(row.evidences, baseUrl);

      return `
        <tr style="${rowBg}">
          <td style="text-align: center; padding: 6px;"><b>${row.date}</b></td>
          <td style="text-align: center; color: #64748b; padding: 6px;">${row.time}</td>
          <td style="text-align: center; font-weight: bold; padding: 6px;">${row.category}</td>
          <td style="padding: 6px; line-height: 1.4;">${row.work_content.replace(/\n/g, '<br>')}</td>
          <td style="text-align: center; padding: 6px;">${row.animal_appearance}<br><b>${row.boar_count}</b></td>
          <td style="padding: 6px;">${row.reaction_stage}</td>
          <td style="padding: 6px; text-align: center;">${evHtml}</td>
        </tr>
      `;
    }).join('');
  }

  formatEvidencesForExcel(evidences, baseUrl) {
    if (!evidences || !evidences.length) {
      return '<span style="color: #94a3b8;">-</span>';
    }

    return evidences.map(ev => {
      const fullImgUrl = ev.thumb.startsWith('http') ? ev.thumb : `${baseUrl}/${ev.thumb}`;
      const typeLabel = ev.type === 'video' ? '🎬 영상캡처' : '📷 현장사진';
      return `
        <div class="img-cell-box" style="display: inline-block; margin: 3px; text-align: center;">
          <img src="${fullImgUrl}" width="85" height="60" alt="${ev.title || ''}" style="border: 1px solid #475569; display: block; margin: 0 auto;" />
          <span style="font-size: 7pt; color: #475569; display: block; max-width: 85px; overflow: hidden; white-space: nowrap;">${typeLabel}</span>
        </div>
      `;
    }).join('');
  }
}

window.interimReportManager = new InterimReportManager();
