/**
 * Activity Report Module
 * National Institute of Wildlife Disease Control (NIWDC) Official Activity Log System
 */

class ActivityReportManager {
  constructor() {
    this.logs = [];
  }

  init(logsData) {
    this.logs = logsData || [];
    this.renderActivityList();
    this.bindModalEvents();
  }

  renderActivityList() {
    const list = document.getElementById('activity-logs-container');
    if (!list) return;

    list.innerHTML = '';

    this.logs.forEach(log => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.style.cursor = 'pointer';

      item.innerHTML = `
        <div style="flex: 1;">
          <div class="act-title">${log.title}</div>
          <div class="act-date">
            📅 ${log.work_date} · 참여 ${log.workers_count}명
            ${log.photo_count ? `<span style="margin-left: 6px; color: #38bdf8; font-weight: 700;"><i class="fa-solid fa-camera"></i> 사진 ${log.photo_count}장</span>` : ''}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
          <span class="reaction-tag eat">보고 완료</span>
          ${log.photo_count ? `
            <button class="btn-action secondary icon-only" style="padding: 2px 6px; font-size: 0.65rem;" title="해당 일자 현장 사진 갤러리 열기" onclick="event.stopPropagation(); window.photoManager && window.photoManager.openGalleryModal('${log.work_date}');">
              <i class="fa-solid fa-images text-cyan"></i>
            </button>
          ` : ''}
        </div>
      `;

      item.addEventListener('click', () => {
        this.openReportModal(log);
      });

      list.appendChild(item);
    });
  }

  openReportModal(log) {
    const modal = document.getElementById('report-modal');
    if (!modal) return;

    document.getElementById('form-project-name').value = log.project_name || "미끼백신사업";
    document.getElementById('form-agency').value = log.agency || "국립야생동물질병관리원";
    document.getElementById('form-date').value = log.work_date || "2026-07-01";
    document.getElementById('form-location').value = log.location || "충남 공주시 유구읍 문금길 340-3";
    document.getElementById('form-weather').value = log.weather || "흐림";
    document.getElementById('form-hours').value = log.work_hours || "14:00 ~ 17:00";
    document.getElementById('form-workers-cnt').value = `총 ${log.workers_count}명`;
    document.getElementById('form-equipment').value = log.equipment || "그물망, 지지대 등";
    document.getElementById('form-chemicals').value = log.chemicals || "해당 없음";

    let contentText = Array.isArray(log.work_content) ? log.work_content.join('\n\n') : (log.work_content || "");
    if (log.notes && log.notes !== '-') {
      contentText += `\n\n[특이사항 및 향후계획]\n${log.notes}`;
    }
    document.getElementById('form-content').value = contentText;

    modal.classList.remove('hidden');
  }

  openNewReportModal() {
    const modal = document.getElementById('report-modal');
    if (!modal) return;

    document.getElementById('form-project-name').value = "미끼백신사업";
    document.getElementById('form-agency').value = "국립야생동물질병관리원";
    document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('form-location').value = "충남 공주시 유구읍 문금길 340-3";
    document.getElementById('form-weather').value = "맑음";
    document.getElementById('form-hours').value = "14:00 ~ 17:00";
    document.getElementById('form-workers-cnt').value = "총 1명";
    document.getElementById('form-equipment').value = "제초 도구, 점검 장비";
    document.getElementById('form-chemicals').value = "해당 없음";
    document.getElementById('form-content').value = "① 실험지 주변 풀 제거작업\n\n② IP카메라 설치 지역 미끼틀 살포 및 상태 점검";

    modal.classList.remove('hidden');
  }

  bindModalEvents() {
    const modal = document.getElementById('report-modal');
    const closeBtn = document.getElementById('btn-close-report-modal');
    const printBtn = document.getElementById('btn-print-report');
    const openNewBtn = document.getElementById('btn-open-new-report');

    if (openNewBtn) {
      openNewBtn.addEventListener('click', () => this.openNewReportModal());
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const form = document.getElementById('activity-log-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("✅ 국립야생동물질병관리원 활동일지가 정상적으로 등록 및 저장되었습니다.");
        modal.classList.add('hidden');
      });
    }
  }
}

window.ActivityReportManager = ActivityReportManager;
