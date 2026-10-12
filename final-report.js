/**
 * Final Report Module (2026 Year-End Final Report & 4x4 Bait Test Matrix)
 * Professional Reporting & PPT-Ready Charts / Quantified Tables
 */

class FinalReportManager {
  constructor() {
    this.data = null;
    this.activeSection = 'all';
    this.charts = {
      positioning: null,
      decay: null,
      radar: null
    };
  }

  async init() {
    try {
      const res = await fetch('data/final_report_data.json?v=' + Date.now());
      if (res.ok) {
        this.data = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load final_report_data.json:', e);
    }

    this.bindEvents();
  }

  bindEvents() {
    const btnOpen = document.getElementById('btn-open-final-report');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openModal());
    }

    const modal = document.getElementById('final-report-modal');
    const btnClose = document.getElementById('btn-close-final-modal');
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

    const btnPrint = document.getElementById('btn-print-final-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => this.print());
    }

    const btnExcel = document.getElementById('btn-export-final-report-excel');
    if (btnExcel) {
      btnExcel.addEventListener('click', () => this.exportToExcel());
    }

    // Section Tabs
    const tabContainer = document.getElementById('final-report-tabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.final-tab-btn');
        if (!btn) return;
        tabContainer.querySelectorAll('.final-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSection = btn.dataset.section;
        this.render();
      });
    }
  }

  print() {
    // 1. Clean previous print state
    document.body.classList.remove('print-activity-active', 'print-interim-active');
    document.body.classList.add('print-final-active');

    const isBriefing = (this.activeSection === 'briefing');
    if (isBriefing) {
      document.body.classList.add('print-briefing-mode');
    } else {
      document.body.classList.remove('print-briefing-mode');
    }

    // 2. Set dynamic @page styling
    let styleEl = document.getElementById('dynamic-print-page-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-page-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = isBriefing
      ? '@page { size: A4 portrait; margin: 6mm 8mm 6mm 8mm; }'
      : '@page { size: A4 portrait; margin: 8mm 10mm 8mm 10mm; }';

    // 3. Register cleanup callback on afterprint
    const cleanup = () => {
      document.body.classList.remove('print-final-active', 'print-briefing-mode');
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    // 4. Trigger browser print dialog
    setTimeout(() => {
      window.print();
    }, 50);
  }

  openModal() {
    const modal = document.getElementById('final-report-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    this.render();
  }

  render() {
    const container = document.getElementById('final-report-content-area');
    if (!container || !this.data) return;

    // Destroy existing charts before re-rendering
    this.destroyCharts();

    let totalScanned = 858;
    let totalConfirmed = 69;
    if (window.camerasData && Array.isArray(window.camerasData)) {
      totalScanned = window.camerasData.reduce((acc, c) => acc + (c.total_clips || 0), 0);
    }
    if (window.wildboarVideosData && Array.isArray(window.wildboarVideosData)) {
      totalConfirmed = window.wildboarVideosData.filter(v => v.category === '멧돼지확정').length;
    }

    let html = '';

    if (this.activeSection === 'briefing') {
      html = this.renderBriefingSheet(totalScanned, totalConfirmed);
    } else {
      html = `
        <!-- Overall Title Header -->
        <div class="report-sheet-header">
          <div class="header-left-group">
            <div class="sheet-badge">${this.data.meta.agency}</div>
            <h2 class="sheet-title">${this.data.meta.project_title}</h2>
            <div class="sheet-subtitle" style="font-size: 0.95rem; color: #94a3b8; margin-top: 4px;">
              ${this.data.meta.sub_title}
            </div>
            <div class="sheet-meta" style="margin-top: 8px;">
              <span><b>수행기관:</b> ${this.data.meta.organization}</span>
              <span><b>1단계 실증:</b> ${this.data.meta.period_phase1}</span>
              <span><b>2단계 실증:</b> ${this.data.meta.period_phase2}</span>
              <span><b>종료 일정:</b> ${this.data.meta.target_completion}</span>
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
                <td class="appr-sign">권용태</td>
                <td class="appr-sign"></td>
                <td class="appr-sign"></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Quick KPI Stat Highlights -->
        <div class="interim-summary-card" style="margin-bottom: 24px;">
          <div class="summary-kpi-item">
            <span class="lbl">현장 실증 거점</span>
            <span class="val">4 <small>개소 (공주3 + 경산1)</small></span>
          </div>
          <div class="summary-kpi-item">
            <span class="lbl">1단계 누적 수집</span>
            <span class="val">${totalScanned.toLocaleString()} <small>건 (초단위 녹화)</small></span>
          </div>
          <div class="summary-kpi-item highlight">
            <span class="lbl">멧돼지 선별 확정</span>
            <span class="val">${totalConfirmed.toLocaleString()} <small>건 (행동 분석 완료)</small></span>
          </div>
          <div class="summary-kpi-item">
            <span class="lbl">2단계 교차 실증</span>
            <span class="val" style="color: #a78bfa;">4×4 <small>Matrix (10.15~11.15)</small></span>
          </div>
        </div>
      `;

      if (this.activeSection === 'all' || this.activeSection === 'summary') {
        html += this.renderSection1();
      }

      if (this.activeSection === 'all' || this.activeSection === 'cross-matrix') {
        html += this.renderSection2();
      }

      if (this.activeSection === 'all' || this.activeSection === 'charts') {
        html += this.renderSection3();
      }
    }

    container.innerHTML = html;

    // Attach click event to briefing print button if rendered
    const briefingPrintBtn = document.getElementById('btn-print-briefing-sheet');
    if (briefingPrintBtn) {
      briefingPrintBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.print();
      });
    }

    // After DOM update, initialize charts if Section 3 is visible
    if (this.activeSection === 'all' || this.activeSection === 'charts') {
      setTimeout(() => this.initCharts(), 50);
    }
  }

  renderBriefingSheet(totalScanned, totalConfirmed) {
    return `
      <!-- Briefing Screen Action Bar (Hidden in Print) -->
      <div class="briefing-action-bar">
        <div class="briefing-action-title">
          <i class="fa-solid fa-file-invoice text-cyan" style="font-size: 1.15rem;"></i>
          <span><b>A4 1장 규격 요약 보고서</b> (국립야생동물질병관리원 제출 및 현장 보고용)</span>
        </div>
        <button id="btn-print-briefing-sheet" class="btn-briefing-print">
          <i class="fa-solid fa-print"></i> 1장 요약 보고서 인쇄 / A4 미리보기
        </button>
      </div>

      <div class="briefing-sheet-wrap">
        <!-- Briefing Header with Approval Box -->
        <div class="report-sheet-header briefing-header">
          <div class="header-left-group">
            <div class="sheet-badge">국립야생동물질병관리원 실증 사업 원페이지 요약 브리핑</div>
            <h2 class="sheet-title" style="margin-top: 4px;">
              2026년 야생 멧돼지 미끼백신 향후 실험 일정 및 실증 계획 (1장 요약 보고서)
            </h2>
            <div class="sheet-subtitle">
              10/11 유인제 살포 완료 • 10/15 미끼 4종 제작 • 4대 실험지 전면 교차 실증(4×4 Matrix) 로드맵
            </div>
            <div class="sheet-meta">
              <span><b>보고일자:</b> 2026년 10월 12일</span>
              <span><b>보고자:</b> 야생생물관리협회 사무국장 권용태</span>
              <span><b>실증거점:</b> 공주 3개 사이트(산135, 59-3, 142-5) 및 경산 1개소</span>
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
                <td class="appr-sign">권용태</td>
                <td class="appr-sign"></td>
                <td class="appr-sign"></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="interim-summary-card briefing-kpi-card" style="margin-bottom: 10px; padding: 6px 12px;">
          <div class="summary-kpi-item">
            <span class="lbl">현장 실증 거점</span>
            <span class="val">4 <small>개소 (공주3 + 경산1)</small></span>
          </div>
          <div class="summary-kpi-item">
            <span class="lbl">1단계 영상 감시</span>
            <span class="val">${totalScanned.toLocaleString()} <small>건 (초단위 분석)</small></span>
          </div>
          <div class="summary-kpi-item highlight">
            <span class="lbl">멧돼지 출현 확정</span>
            <span class="val">${totalConfirmed.toLocaleString()} <small>건 (행동 분석 완료)</small></span>
          </div>
          <div class="summary-kpi-item">
            <span class="lbl">차세대 실증 제형</span>
            <span class="val" style="color: #a78bfa;">4 <small>종 (대조2 + 신규2)</small></span>
          </div>
        </div>

        <!-- 1. 1단계 실증 성과 및 한계 -->
        <div class="table-section-title">
          <i class="fa-solid fa-triangle-exclamation text-amber"></i> 1. 1단계 기초 실증 성과 결산 및 기술 한계점 정밀 진단
        </div>
        <div class="briefing-grid-3">
          <div class="final-bait-card" style="border-left: 3px solid #f43f5e;">
            <div style="font-weight: 700; color: #fca5a5; font-size: 0.82rem; margin-bottom: 2px;">
              ⚠️ 기존 동물사료 미끼틀
            </div>
            <p style="font-size: 0.74rem; color: #cbd5e1; margin: 0; line-height: 1.35;">
              <b>완식율 18.5% (유인 42.1%)</b><br>
              틀 주변 냄새 탐색 등 호기심성 접근은 관찰되나, 실제 섭취 반응이 현저히 떨어져 백신 전달률 확보 불가
            </p>
          </div>
          <div class="final-bait-card" style="border-left: 3px solid #f59e0b;">
            <div style="font-weight: 700; color: #fcd34d; font-size: 0.82rem; margin-bottom: 2px;">
              ⚠️ 유인제배합 고형사료
            </div>
            <p style="font-size: 0.74rem; color: #cbd5e1; margin: 0; line-height: 1.35;">
              <b>완식율 82.3% (유인 91.4%)</b><br>
              선호도는 극상이나 강우·습기 노출 시 <b>3~5일 내 물리적 붕괴(죽 형태 변형, 유실율 84.8%)</b>로 지속성 결여
            </p>
          </div>
          <div class="final-bait-card" style="border-left: 3px solid #10b981;">
            <div style="font-weight: 700; color: #6ee7b7; font-size: 0.82rem; margin-bottom: 2px;">
              ✅ 비대상 동물 안전성 입증
            </div>
            <p style="font-size: 0.74rem; color: #cbd5e1; margin: 0; line-height: 1.35;">
              <b>비대상 배제율 95% 이상 (누적 27건)</b><br>
              고라니 19건, 오소리 10건 출현 시 미끼 무관심 및 단순 통과만 확인되어 표적 외 안전성 입증 완료
            </p>
          </div>
        </div>

        <!-- 2. 향후 핵심 실험 일정 로드맵 -->
        <div class="table-section-title">
          <i class="fa-solid fa-calendar-check text-cyan"></i> 2. 향후 핵심 실험 일정 로드맵 (2026.10.11 ~ 11.15)
        </div>
        <table class="report-table briefing-roadmap-table">
          <thead>
            <tr>
              <th style="width: 14%;">단계</th>
              <th style="width: 15%;">일정 / 기간</th>
              <th style="width: 45%;">주요 업무 및 실험 실행 내용</th>
              <th style="width: 26%;">주요 성과 / 세부 지표</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center font-bold" style="color: #38bdf8;">Step 1 (완료)</td>
              <td class="text-center font-bold">10.11 (일)<br><small style="color: #94a3b8;">08:30~09:30</small></td>
              <td>
                <b>공주 3개 사이트 멧돼지 유인제 일제 살포 (총 6통)</b><br>
                • 공주 A(산135), B(59-3), C(142-5) 각 2통씩 총 6통 집중 살포 완료<br>
                • 가을철 이동 길목 유인선 구축 및 무인 센서 카메라 감도/화각 최적화
              </td>
              <td>
                • 작업자: 권용태(사무국장)<br>
                • 10/11 심야~10/12 고라니 3건 통과 시 미끼 무관심(안전성 재입증)
              </td>
            </tr>
            <tr>
              <td class="text-center font-bold" style="color: #fbbf24;">Step 2 (진행중)</td>
              <td class="text-center font-bold">10.11 ~ 10.15<br><small style="color: #94a3b8;">5일간</small></td>
              <td>
                <b>테스트용 차세대 미끼 4종(Type A, B, C, D) 최종 제작 완료</b><br>
                • <b>Type A</b>: 옥수수사료로 만든 밀렵형 (기존 고형사료 대조군)<br>
                • <b>Type B</b>: 옥수수모양 젤리 (시판 기성품 효소 첨가형 대조군)<br>
                • <b>Type C</b>: 밤모양 투명 젤리 (신규 개발: 천연 밤 외형 모방, 20일 이상 지속)<br>
                • <b>Type D</b>: 과일향 사각형 젤리 (신규 개발: 고농도 과일 유인향, 25일 이상 지속)
              </td>
              <td>
                • 10/15까지 현장 투입용 테스트 미끼 전량 제작 및 패키징 완료
              </td>
            </tr>
            <tr>
              <td class="text-center font-bold" style="color: #a78bfa;">Step 3 (실행)</td>
              <td class="text-center font-bold">10.15 ~ 11.15<br><small style="color: #94a3b8;">약 1개월간</small></td>
              <td>
                <b>4대 실험지 전면 교차 실증 (4×4 Latin Square Matrix)</b><br>
                • 공주 3곳(A·B·C) 및 경산 1곳(D) 전역에 4종 미끼 동시 비교 배치<br>
                • 사이트 편향(Site Bias)을 원천 차단하는 위치 교차 실증 수행<br>
                • 무인 카메라 24시간 초단위 감시 + 3일 주기 잔여 중량/형태/경도 정밀 실측
              </td>
              <td>
                • 4개 사이트 동시 검증<br>
                • 섭취 기호도, 환경 내구성, 비대상 배제율 정량 데이터 확보
              </td>
            </tr>
            <tr>
              <td class="text-center font-bold" style="color: #34d399;">Step 4 (종료)</td>
              <td class="text-center font-bold">11월 중순<br><small style="color: #94a3b8;">사업 종료</small></td>
              <td>
                <b>2026년도 사업 종료 및 최종보고서 제출 / 보고회 PPT 발표</b><br>
                • 100점 만점 정량 평가(KPI) 집계 및 최적 제형 1종 최종 도출<br>
                • 최종 실증 수치화 표/그래프 PPT 탑재 및 최종 완료 보고서 납품
              </td>
              <td>
                • 2026년 실증 용역 과제 완료<br>
                • 차기 사업 연계 기술 근거 확립
              </td>
            </tr>
            <tr style="background: rgba(148, 163, 184, 0.05);">
              <td class="text-center font-bold" style="color: #94a3b8;">Step 5 (차기연계)</td>
              <td class="text-center font-bold">2027년 여름<br><small style="color: #94a3b8;">차기 사업</small></td>
              <td>
                <b>시제품화 및 특허 출원 추진 (내년도 본사업 연계)</b><br>
                • 11월 사업 종료 후 겨울철 휴지기 거쳐 2027년 여름 사업 재개 시 추진<br>
                • 선정된 최적 미끼 제형 기반 시제품 제작 및 기술 특허 출원
              </td>
              <td>
                • 내년 사업 계획서 연계 반영<br>
                • 올해 최종보고서에는 로드맵으로 수록
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 3. 차세대 미끼 4종 비교 및 4x4 실험지 배치 계획 -->
        <div class="table-section-title">
          <i class="fa-solid fa-flask-vial text-purple"></i> 3. 차세대 미끼 4종 스펙 및 4대 실험지 전면 배치 계획
        </div>
        <div class="briefing-grid-4">
          <div class="final-bait-card" style="border-top: 3px solid #f43f5e;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span class="category-tag existing" style="font-size: 0.65rem; padding: 1px 4px;">기존 대조군 1</span>
              <span style="font-size: 0.68rem; color: #f43f5e; font-weight: 700;">지속 3~5일</span>
            </div>
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.82rem;">Type A: 옥수수사료 밀렵형</div>
            <p style="font-size: 0.72rem; color: #94a3b8; margin: 2px 0 0 0; line-height: 1.3;">
              옥수수 배합사료 고형 압축<br>
              • 기호도 우수, 우천 시 붕괴<br>
              • 강우 저항성: 15.2% (취약)
            </p>
          </div>
          <div class="final-bait-card" style="border-top: 3px solid #fbbf24;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span class="category-tag existing" style="font-size: 0.65rem; padding: 1px 4px;">기존 대조군 2</span>
              <span style="font-size: 0.68rem; color: #fbbf24; font-weight: 700;">지속 10~14일</span>
            </div>
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.82rem;">Type B: 옥수수모양 젤리 (기성품)</div>
            <p style="font-size: 0.72rem; color: #94a3b8; margin: 2px 0 0 0; line-height: 1.3;">
              시판 사출 젤리 (효소 배합)<br>
              • 탄성 양호, 장기 노출 시 수분증발<br>
              • 강우 저항성: 58.0% (보통)
            </p>
          </div>
          <div class="final-bait-card" style="border-top: 3px solid #38bdf8;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span class="category-tag new" style="font-size: 0.65rem; padding: 1px 4px;">신규 개발 1</span>
              <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 700;">지속 20일 이상</span>
            </div>
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.82rem;">Type C: 밤모양 투명 젤리</div>
            <p style="font-size: 0.72rem; color: #94a3b8; margin: 2px 0 0 0; line-height: 1.3;">
              천연 밤 외형 + 고탄성 겔 매트릭스<br>
              • 최고 선호 자연 먹이원 모방<br>
              • 강우 저항성: 80.0% 이상 (우수)
            </p>
          </div>
          <div class="final-bait-card" style="border-top: 3px solid #a78bfa;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span class="category-tag new" style="font-size: 0.65rem; padding: 1px 4px;">신규 개발 2</span>
              <span style="font-size: 0.68rem; color: #a78bfa; font-weight: 700;">지속 25일 이상</span>
            </div>
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.82rem;">Type D: 과일향 사각형 젤리</div>
            <p style="font-size: 0.72rem; color: #94a3b8; margin: 2px 0 0 0; line-height: 1.3;">
              고농도 과일향 + 사각 큐브 젤리<br>
              • 원거리 후각 유인 극대화, 최장 보존<br>
              • 강우 저항성: 85.0% 이상 (최상)
            </p>
          </div>
        </div>

        <!-- 4. 최종보고서 평가 집계 기준 (KPI 100점) -->
        <div class="table-section-title">
          <i class="fa-solid fa-award text-emerald"></i> 4. 최종보고서 수치화 평가 기준 (100점 만점 KPI 배점 체계)
        </div>
        <table class="report-table briefing-kpi-table">
          <thead>
            <tr>
              <th style="width: 18%;">평가 영역</th>
              <th style="width: 12%;">배점</th>
              <th style="width: 32%;">핵심 실측 지표</th>
              <th style="width: 20%;">목표 기준치</th>
              <th style="width: 18%;">배점 구간 기준</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-bold">1. 섭취 기호도</td>
              <td class="text-center font-bold" style="color: #38bdf8;">40점</td>
              <td>• 최초 반응 시간 • 완식 비율(%) • 동시 섭취수</td>
              <td class="text-center font-bold" style="color: #34d399;">완식율 85% 이상</td>
              <td class="text-center">90%↑: 40점 / 80%↑: 35점</td>
            </tr>
            <tr>
              <td class="font-bold">2. 환경 내구성</td>
              <td class="text-center font-bold" style="color: #38bdf8;">30점</td>
              <td>• 강우 후 형태 유지율(%) • 변패 발생일 • 유효 지속일</td>
              <td class="text-center font-bold" style="color: #34d399;">강우 형태 70% 유지, 20일+</td>
              <td class="text-center">25일↑: 30점 / 20일↑: 25점</td>
            </tr>
            <tr>
              <td class="font-bold">3. 비대상 배제</td>
              <td class="text-center font-bold" style="color: #38bdf8;">15점</td>
              <td>• 고라니·오소리 섭취 건수 • 단순 통과율(%)</td>
              <td class="text-center font-bold" style="color: #34d399;">비대상 섭취 0건 (배제 95%↑)</td>
              <td class="text-center">섭취 0건: 15점 / 1건: 10점</td>
            </tr>
            <tr>
              <td class="font-bold">4. 현장 실용성</td>
              <td class="text-center font-bold" style="color: #38bdf8;">15점</td>
              <td>• 산림 운반/살포 편의성 • 투하 시 파손 저항도</td>
              <td class="text-center font-bold" style="color: #34d399;">살포 파손율 2% 미만</td>
              <td class="text-center">우수: 15점 / 보통: 10점</td>
            </tr>
            <tr style="background: rgba(56, 189, 248, 0.1); font-weight: 800;">
              <td class="text-center" style="color: #f8fafc;">합 계</td>
              <td class="text-center" style="color: #38bdf8; font-size: 0.95rem;">100점</td>
              <td colspan="3" style="color: #38bdf8;">
                ★ 100점 만점 정량 평가 1위 제형 1종을 차기 연도(2027년) 시제품 제작 및 특허 출원 우선 대상으로 최종 선정
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderSection1() {
    const s1 = this.data.phase1_summary;
    return `
      <!-- Section 1 -->
      <div class="table-section-title" style="margin-top: 10px;">
        <i class="fa-solid fa-triangle-exclamation text-amber"></i> 1. ${s1.title}
      </div>

      <div class="final-narrative-box">
        <p><b>🔍 현장 정밀 진단 총평:</b> ${s1.description}</p>
      </div>

      <h4 style="font-size: 0.95rem; color: #e2e8f0; margin: 16px 0 8px 0; font-weight: 700;">
        [표 1] 1단계 기존 미끼 제형별 현장 한계 및 실증 평가 비교표 (PPT 슬라이드용)
      </h4>
      <div class="table-responsive" style="margin-bottom: 24px;">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 14%;">제형 구분</th>
              <th style="width: 11%;">적용 지점</th>
              <th style="width: 10%;">유인 반응률</th>
              <th style="width: 10%;">실제 완식률</th>
              <th style="width: 11%;">야외 잔존일수</th>
              <th style="width: 11%;">강우 후 유지율</th>
              <th style="width: 10%;">비대상 배제율</th>
              <th style="width: 23%;">현장 핵심 한계점 및 개선 방향</th>
            </tr>
          </thead>
          <tbody>
            ${s1.comparison_table.map(r => `
              <tr>
                <td style="font-weight: 700; color: #f8fafc;">${r.bait_type}</td>
                <td class="text-center">${r.sites}</td>
                <td class="text-center font-bold" style="color: ${r.attract_rate.startsWith('9') ? '#34d399' : '#f87171'};">${r.attract_rate}</td>
                <td class="text-center font-bold" style="color: ${r.consumption_rate.startsWith('8') ? '#34d399' : '#f87171'};">${r.consumption_rate}</td>
                <td class="text-center">${r.durability}</td>
                <td class="text-center" style="color: ${parseFloat(r.rain_resistance) < 30 ? '#f43f5e' : '#cbd5e1'}; font-weight: 700;">${r.rain_resistance}</td>
                <td class="text-center" style="color: #38bdf8;">${r.non_target_exclusion}</td>
                <td>
                  <div style="color: #fca5a5; font-size: 0.76rem; font-weight: 600;">⚠ ${r.core_limitation}</div>
                  <div style="color: #93c5fd; font-size: 0.74rem; margin-top: 3px;">➔ ${r.improvement_point}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderSection2() {
    const s2 = this.data.phase2_cross_matrix;
    return `
      <!-- Section 2 -->
      <div class="table-section-title" style="margin-top: 25px;">
        <i class="fa-solid fa-flask-vial text-cyan"></i> 2. ${s2.title}
      </div>

      <div class="final-narrative-box">
        <p><b>🔬 과학적 교차 검증 설계 원칙:</b> ${s2.rationale}</p>
      </div>

      <!-- 4 Candidate Bait Types Cards -->
      <h4 style="font-size: 0.95rem; color: #e2e8f0; margin: 16px 0 10px 0; font-weight: 700;">
        💡 10월 15일 투입 4대 후보 제형 기본 설계안
      </h4>
      <div class="final-baits-grid">
        ${s2.candidate_baits.map((b, idx) => `
          <div class="final-bait-card ${b.is_new ? 'is-new-bait' : 'is-existing-bait'}" style="${b.is_new ? 'border-color: rgba(56, 189, 248, 0.35); background: rgba(14, 30, 55, 0.85);' : 'border-color: rgba(255, 255, 255, 0.08);'}">
            <div class="bait-card-header">
              <span class="badge-type" style="${b.is_new ? 'background: rgba(56, 189, 248, 0.25); border-color: #38bdf8; color: #38bdf8;' : ''}">${b.type}</span>
              <span class="badge-status" style="${b.is_new ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: #34d399;' : 'background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border-color: #64748b;'}">
                ${b.is_new ? '✨ ' + b.category_tag : '🔄 ' + b.category_tag}
              </span>
            </div>
            <h5 class="bait-title" style="color: ${b.is_new ? '#38bdf8' : '#f8fafc'}; font-size: 0.92rem;">${b.name}</h5>
            <div class="bait-concept">${b.concept}</div>
            <div class="bait-specs">
              <div class="spec-row"><span>상세 형태:</span> <b>${b.spec}</b></div>
              <div class="spec-row"><span>목표 잔존:</span> <b style="color: #38bdf8;">${b.target_days}</b></div>
              <div class="spec-row"><span>강우 저항:</span> <b style="color: #34d399;">${b.target_rain_resistance}</b></div>
              <div class="spec-row"><span>구분/상태:</span> <b style="color: ${b.is_new ? '#a78bfa' : '#94a3b8'};">${b.status}</b></div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 4x4 Matrix Table -->
      <h4 style="font-size: 0.95rem; color: #e2e8f0; margin: 20px 0 8px 0; font-weight: 700;">
        [표 2] 4대 실험지 × 4대 후보 제형 전면 동시 교차 투입(4×4 Matrix) 실증 배치표
      </h4>
      <div class="table-responsive" style="margin-bottom: 24px;">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 14%;">실험지</th>
              <th style="width: 12%;">권역</th>
              <th style="width: 20%;">지번 소재지</th>
              <th style="width: 28%;">투입 미끼 제형 (구획별 동시 배치)</th>
              <th style="width: 26%;">실증 모니터링 및 실측 방식</th>
            </tr>
          </thead>
          <tbody>
            ${s2.sites_matrix.map(m => `
              <tr>
                <td style="font-weight: 700; color: #38bdf8;">${m.site_code}</td>
                <td class="text-center">${m.region}</td>
                <td>${m.address}</td>
                <td><b style="color: #a78bfa;">${m.installed_baits}</b></td>
                <td style="font-size: 0.74rem; color: #cbd5e1;">${m.monitoring_method}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderSection3() {
    return `
      <!-- Section 3 -->
      <div class="table-section-title" style="margin-top: 25px;">
        <i class="fa-solid fa-chart-pie text-emerald"></i> 3. 최종보고서 PPT용 수치화 종합 평가표 & 시각화 차트
      </div>

      <!-- KPI Scoring Table -->
      <h4 style="font-size: 0.95rem; color: #e2e8f0; margin: 16px 0 8px 0; font-weight: 700;">
        [표 3] 현장 1개월 실증 평가 지표 및 100점 만점 배점 기준표 (보고서 PPT 핵심 슬라이드)
      </h4>
      <div class="table-responsive" style="margin-bottom: 24px;">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 18%;">평가 영역</th>
              <th style="width: 10%;">배점</th>
              <th style="width: 32%;">측정 정량 지표</th>
              <th style="width: 20%;">목표 달성 기준</th>
              <th style="width: 20%;">세부 배점 기준</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.evaluation_kpi.map(k => `
              <tr>
                <td style="font-weight: 700; color: #f8fafc;">${k.domain}</td>
                <td class="text-center"><b style="color: #38bdf8; font-size: 0.95rem;">${k.weight}</b></td>
                <td style="white-space: pre-line; font-size: 0.75rem; color: #e2e8f0;">${k.indicators}</td>
                <td style="color: #34d399; font-weight: 600; font-size: 0.75rem;">${k.target}</td>
                <td style="font-size: 0.73rem; color: #cbd5e1;">${k.score_standard}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Interactive Charts Grid (Ready for PPT Capture) -->
      <h4 style="font-size: 0.95rem; color: #e2e8f0; margin: 24px 0 10px 0; font-weight: 700;">
        📊 최종보고서 PPT 탑재용 3대 시각화 그래프
        <span style="font-size: 0.75rem; font-weight: normal; color: #94a3b8; margin-left: 8px;">
          (보고서 작성 시 차트 우상단 다운로드 버튼으로 고화질 이미지 복사 가능)
        </span>
      </h4>

      <div class="final-charts-grid">
        <!-- Chart 1: Positioning Map -->
        <div class="final-chart-card">
          <div class="chart-card-header">
            <span class="chart-badge">그래프 1</span>
            <span class="chart-title">기호도 vs 야외 물리적 내구성 2축 포지셔닝 맵</span>
            <button class="btn-chart-copy" onclick="finalReportManager.downloadChart('chart-positioning', '기호도_내구성_포지셔닝맵.png')">
              <i class="fa-solid fa-camera"></i> PPT용 저장
            </button>
          </div>
          <div class="chart-canvas-wrap" style="height: 290px;">
            <canvas id="chart-positioning"></canvas>
          </div>
          <div class="chart-caption">
            * 붉은점(a. 옥수수사료 밀렵형): 기호도는 있으나 내구성(20%) 취약 ➔ 신규 제형인 <b>c. 밤모양 투명 젤리 & d. 과일향 사각형 젤리</b>가 내구성과 기호도를 모두 충족하는 우상향(★최적 영역)으로 도약
          </div>
        </div>

        <!-- Chart 2: Decay Curve -->
        <div class="final-chart-card">
          <div class="chart-card-header">
            <span class="chart-badge">그래프 2</span>
            <span class="chart-title">야외 노출 일수별 미끼 형태 잔존율 감쇄 곡선</span>
            <button class="btn-chart-copy" onclick="finalReportManager.downloadChart('chart-decay', '형태잔존율_감쇄곡선.png')">
              <i class="fa-solid fa-camera"></i> PPT용 저장
            </button>
          </div>
          <div class="chart-canvas-wrap" style="height: 290px;">
            <canvas id="chart-decay"></canvas>
          </div>
          <div class="chart-caption">
            * a. 옥수수사료 밀렵형은 3~5일 차 우천 시 급격한 형태 붕괴(0%) 발생 ➔ 신규 c. 밤모양 젤리 및 d. 과일향 사각 젤리는 30일 후에도 65~78% 이상 원형 유지
          </div>
        </div>

        <!-- Chart 3: Radar Chart -->
        <div class="final-chart-card" style="grid-column: span 2;">
          <div class="chart-card-header">
            <span class="chart-badge">그래프 3</span>
            <span class="chart-title">차세대 4대 후보 제형 5각 성능 방사형 비교 (Radar Chart)</span>
            <button class="btn-chart-copy" onclick="finalReportManager.downloadChart('chart-radar', '후보제형_5각_방사형비교.png')">
              <i class="fa-solid fa-camera"></i> PPT용 저장
            </button>
          </div>
          <div class="chart-canvas-wrap" style="height: 310px;">
            <canvas id="chart-radar"></canvas>
          </div>
          <div class="chart-caption" style="text-align: center;">
            * 5대 평가 축(기호도, 방수성, 유효일수, 비대상 배제, 균일성) 종합 평가 시 기존 2종(a, b)의 한계를 극복하고 신규 2종(c. 밤모양 젤리, d. 과일향 사각 젤리)이 종합 최우수 후보로 도출
          </div>
        </div>
      </div>
    `;
  }

  initCharts() {
    if (!this.data || !this.data.chart_data) return;

    const cd = this.data.chart_data;

    // 1. Positioning Chart (Scatter / Bubble)
    const ctxPos = document.getElementById('chart-positioning');
    if (ctxPos) {
      this.charts.positioning = new Chart(ctxPos, {
        type: 'bubble',
        data: {
          datasets: cd.positioning.map(p => ({
            label: p.name,
            data: [{ x: p.x, y: p.y, r: p.r }],
            backgroundColor: p.color + 'cc',
            borderColor: p.color,
            borderWidth: 2
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: '야외 물리적 지속성 / 방수 내구성 (%)', color: '#94a3b8' },
              min: 0,
              max: 100,
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              title: { display: true, text: '멧돼지 섭취 선호도 / 반응률 (%)', color: '#94a3b8' },
              min: 0,
              max: 100,
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: '#94a3b8' }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#cbd5e1', boxWidth: 10, font: { size: 10 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: 내구성 ${ctx.raw.x}%, 기호도 ${ctx.raw.y}%`
              }
            }
          }
        }
      });
    }

    // 2. Decay Curve Chart (Line)
    const ctxDecay = document.getElementById('chart-decay');
    if (ctxDecay) {
      this.charts.decay = new Chart(ctxDecay, {
        type: 'line',
        data: {
          labels: cd.decay_curve.labels,
          datasets: cd.decay_curve.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            borderColor: ds.borderColor,
            backgroundColor: ds.borderColor + '22',
            borderWidth: ds.label.includes('현재') ? 3 : 2,
            borderDash: ds.label.includes('현재') ? [4, 4] : [],
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              title: { display: true, text: '형태 유지율 (%)', color: '#94a3b8' },
              min: 0,
              max: 100,
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: '#94a3b8' }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 10 } }
            }
          }
        }
      });
    }

    // 3. Radar Chart
    const ctxRadar = document.getElementById('chart-radar');
    if (ctxRadar) {
      this.charts.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels: cd.radar.labels,
          datasets: cd.radar.types.map(t => ({
            label: t.label,
            data: t.data,
            borderColor: t.borderColor,
            backgroundColor: t.borderColor + '26',
            borderWidth: 2,
            pointRadius: 3
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: 'rgba(255,255,255,0.1)' },
              grid: { color: 'rgba(255,255,255,0.1)' },
              pointLabels: { color: '#e2e8f0', font: { size: 11, weight: 'bold' } },
              suggestedMin: 50,
              suggestedMax: 100,
              ticks: { color: '#94a3b8', backdropColor: 'transparent', stepSize: 15 }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  destroyCharts() {
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key].destroy();
        this.charts[key] = null;
      }
    });
  }

  downloadChart(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const imgUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = filename || 'chart.png';
    a.click();
  }

  exportToExcel() {
    if (!this.data) return;

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 9pt; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
          th { background-color: #E2E8F0; border: 1pt solid #000; font-weight: bold; text-align: center; padding: 6px; }
          td { border: 1pt solid #000; padding: 5px; }
          .title { font-size: 16pt; font-weight: bold; border: none; padding: 10px 0; }
          .sec-title { font-size: 12pt; font-weight: bold; background: #F1F5F9; border: none; padding: 8px 0; }
          .appr-table th, .appr-table td { border: 1pt solid #000; text-align: center; }
        </style>
      </head>
      <body>
        <table style="border: none;">
          <tr>
            <td colspan="5" class="title">${this.data.meta.project_title}</td>
            <td colspan="3" style="border: none; text-align: right;">
              <table class="appr-table" style="width: 220px; display: inline-table;">
                <tr>
                  <th rowspan="2" style="width: 25px;">결<br>재</th>
                  <th style="width: 65px;">담 당</th>
                  <th style="width: 65px;">검 토</th>
                  <th style="width: 65px;">결 재</th>
                </tr>
                <tr>
                  <td style="height: 38px;"></td>
                  <td style="height: 38px;"></td>
                  <td style="height: 38px;"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="8" style="border: none; font-size: 9pt; color: #475569;">
              <b>수행기관:</b> ${this.data.meta.organization} &nbsp;|&nbsp; <b>실증구분:</b> 1단계 한계 분석 및 2단계 4×4 교차 실증 &nbsp;|&nbsp; <b>종료예정:</b> ${this.data.meta.target_completion}
            </td>
          </tr>
        </table>

        <!-- Table 1 -->
        <h3 class="sec-title">[표 1] 1단계 기존 미끼 제형별 현장 한계 및 실증 평가 비교표</h3>
        <table>
          <thead>
            <tr>
              <th>제형 구분</th>
              <th>적용 지점</th>
              <th>유인 반응률</th>
              <th>실제 완식률</th>
              <th>야외 잔존일수</th>
              <th>강우 후 유지율</th>
              <th>비대상 배제율</th>
              <th>핵심 한계점 및 개선 방향</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.phase1_summary.comparison_table.map(r => `
              <tr>
                <td style="font-weight: bold;">${r.bait_type}</td>
                <td style="text-align: center;">${r.sites}</td>
                <td style="text-align: center;">${r.attract_rate}</td>
                <td style="text-align: center;">${r.consumption_rate}</td>
                <td style="text-align: center;">${r.durability}</td>
                <td style="text-align: center;">${r.rain_resistance}</td>
                <td style="text-align: center;">${r.non_target_exclusion}</td>
                <td>[한계] ${r.core_limitation} / [개선] ${r.improvement_point}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Table 2 -->
        <h3 class="sec-title">[표 2] 4대 실험지 × 4대 후보 제형 4×4 전면 교차 투입 실증 매트릭스</h3>
        <table>
          <thead>
            <tr>
              <th>실험지</th>
              <th>권역</th>
              <th>지번 소재지</th>
              <th>투입 미끼 제형 (동시 배치)</th>
              <th>모니터링 및 실측 방식</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.phase2_cross_matrix.sites_matrix.map(m => `
              <tr>
                <td style="font-weight: bold; text-align: center;">${m.site_code}</td>
                <td style="text-align: center;">${m.region}</td>
                <td>${m.address}</td>
                <td>${m.installed_baits}</td>
                <td>${m.monitoring_method}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Table 3 -->
        <h3 class="sec-title">[표 3] 현장 1개월 실증 평가 지표 및 100점 만점 배점 기준표</h3>
        <table>
          <thead>
            <tr>
              <th>평가 영역</th>
              <th>배점</th>
              <th>측정 정량 지표</th>
              <th>목표 달성 기준</th>
              <th>세부 배점 기준</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.evaluation_kpi.map(k => `
              <tr>
                <td style="font-weight: bold;">${k.domain}</td>
                <td style="text-align: center; font-weight: bold;">${k.weight}</td>
                <td>${k.indicators.replace(/\n/g, '<br>')}</td>
                <td>${k.target}</td>
                <td>${k.score_standard}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2026_야생멧돼지_미끼백신_최종보고서_수치화표_${new Date().toISOString().slice(0,10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Global instance
window.finalReportManager = new FinalReportManager();
