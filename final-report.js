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
      btnPrint.addEventListener('click', () => window.print());
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

    let html = `
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
              <td class="appr-sign"></td>
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
          <span class="val">856 <small>건 (초단위 녹화)</small></span>
        </div>
        <div class="summary-kpi-item highlight">
          <span class="lbl">멧돼지 선별 확정</span>
          <span class="val">68 <small>건 (행동 분석 완료)</small></span>
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

    container.innerHTML = html;

    // After DOM update, initialize charts if Section 3 is visible
    if (this.activeSection === 'all' || this.activeSection === 'charts') {
      setTimeout(() => this.initCharts(), 50);
    }
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
