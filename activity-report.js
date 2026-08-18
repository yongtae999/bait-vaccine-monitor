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

      item.innerHTML = `
        <div>
          <div class="act-title">${log.title}</div>
          <div class="act-date">${log.work_date} · 참여 ${log.workers_count}명</div>
        </div>
        <span class="reaction-tag eat">보고 완료</span>
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

    document.getElementById('form-project-name').value = log.project_name || "야생 멧돼지 미끼백신 섭취 기호도 평가 실증 모니터링";
    document.getElementById('form-agency').value = log.agency || "국립야생동물질병관리원";
    document.getElementById('form-date').value = log.work_date || "2026-07-01";
    document.getElementById('form-location').value = log.location || "충남 공주시 유구읍 문금길 340-3 일원";
    document.getElementById('form-weather').value = log.weather || "흐림 (26℃)";
    document.getElementById('form-hours').value = log.work_hours || "14:00 ~ 17:00 (3시간)";
    document.getElementById('form-workers-cnt').value = `${log.workers_count}명`;
    document.getElementById('form-equipment').value = log.equipment || "IP동작감지 트레일카메라, 미끼틀";
    document.getElementById('form-chemicals').value = log.chemicals || "해당 없음 (미끼틀 살포)";

    const contentText = Array.isArray(log.work_content) ? log.work_content.join('\n\n') : log.work_content;
    document.getElementById('form-content').value = contentText || "";

    modal.classList.remove('hidden');
  }

  openNewReportModal() {
    const modal = document.getElementById('report-modal');
    if (!modal) return;

    document.getElementById('form-project-name').value = "야생 멧돼지 미끼백신 섭취 기호도 평가 실증 모니터링";
    document.getElementById('form-agency').value = "국립야생동물질병관리원";
    document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('form-location').value = "충남 공주시 유구읍 문금리 59-3 일원";
    document.getElementById('form-weather').value = "맑음";
    document.getElementById('form-hours').value = "10:00 ~ 16:00 (6시간)";
    document.getElementById('form-workers-cnt').value = "4명";
    document.getElementById('form-equipment').value = "IP카메라, 예비 배터리, 추가 미끼백신";
    document.getElementById('form-chemicals').value = "미끼백신 보충분";
    document.getElementById('form-content').value = "① IP카메라 배터리 교체 및 SD카드 영상 수거\n\n② 멧돼지 미끼백신 추가 살포 및 기호도 모니터링\n\n③ 주변 훼손지 정리 및 센서 감지 점검";

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
