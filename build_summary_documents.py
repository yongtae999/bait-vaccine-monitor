import os
import shutil
import docx
from docx.shared import Pt, RGBColor, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import hwpx

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_docx(filename):
    doc = docx.Document()
    
    # 1. Page Margins (A4 Portrait, narrow margins for 1-page fit)
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.top_margin = Mm(12)
    section.bottom_margin = Mm(12)
    section.left_margin = Mm(14)
    section.right_margin = Mm(14)

    # Set base font
    doc.styles['Normal'].font.name = '맑은 고딕'
    doc.styles['Normal'].font.size = Pt(8.5)
    doc.styles['Normal'].font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # Clean Full-Width Header (No approval box, no badge)
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("2026년 야생 멧돼지 미끼백신 향후 실험 일정 및 실증 현황")
    run_title.font.size = Pt(14)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(6)
    p_sub.paragraph_format.line_spacing = 1.15
    run_sub = p_sub.add_run(
        "• 과제명: 2026년 야생 멧돼지 미끼백신 섭취 기호도 평가 및 차세대 제형 현장 실증\n"
        "• 보고일자: 2026년 10월 18일 (10/17 현장 설치 반영)  |  보고자: 권용태 사무국장 (야생생물관리협회)\n"
        "• 실증거점: 공주 C지점(문금리 142-5, 멧돼지 35건 확정·집중 출현지) 및 공주 A·B, 경산 D"
    )
    run_sub.font.size = Pt(7.8)
    run_sub.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # KPI Strip Table
    kpi_tbl = doc.add_table(rows=1, cols=4)
    kpi_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(kpi_tbl, color="BAE6FD", sz="6")
    kpi_widths = [Mm(45), Mm(45), Mm(46), Mm(46)]
    
    kpis = [
        ("현장 실증 거점", "4개소 (공주 3 + 경산 1)"),
        ("1단계 영상 감시", "878건 수집 (초단위 분석)"),
        ("멧돼지 출현 확정", "80건 (C지점 35건·10/15 4마리 집중)"),
        ("10/17 실증 제형", "5종 (미끼 4종 + 대조군 1종 설치완료)")
    ]
    for idx, (label, val) in enumerate(kpis):
        cell = kpi_tbl.cell(0, idx)
        cell.width = kpi_widths[idx]
        set_cell_background(cell, "F0F9FF")
        set_cell_margins(cell, top=60, bottom=60, left=60, right=60)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r1 = p.add_run(f"{label}\n")
        r1.font.size = Pt(7)
        r1.font.color.rgb = RGBColor(0x03, 0x69, 0xA1)
        r2 = p.add_run(val)
        r2.font.size = Pt(8.5)
        r2.font.bold = True
        if idx == 2:
            r2.font.color.rgb = RGBColor(0xDC, 0x26, 0x26)
        else:
            r2.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Helper for Section Titles
    def add_sec_title(title_text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(title_text)
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        return p

    # 1. 1단계 실증 성과 및 한계점
    add_sec_title("1. 1단계 기초 실증 성과 결산 및 기술 한계점 정밀 진단")
    sec1_tbl = doc.add_table(rows=1, cols=3)
    sec1_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(sec1_tbl, color="E2E8F0", sz="4")
    sec1_widths = [Mm(60), Mm(61), Mm(61)]
    
    sec1_items = [
        ("기존 동물사료 미끼틀 한계", "섭취 기피 및 반응 미흡", "틀 주변 냄새 탐색 등 접근은 관찰되나, 실제 적극적인 섭취 반응이 미흡하여 백신 전달 효율 한계 도출"),
        ("유인제배합 고형사료 한계", "환경 내구성 취약 (형태 붕괴)", "유인 효과와 섭취 반응은 우수하나, 강우·지면 습기 노출 시 수일 내 형태가 쉽게 붕괴(물러짐)되어 야외 지속성 결여"),
        ("비대상 야생동물 관찰", "단순 통과 및 자연 채식 (누적 37건)", "고라니 25건(공주C 22·공주B 3), 오소리 12건 출현 시 미끼틀 주변 단순 통과 및 자연 초생 채식만 관찰됨 (미끼 섭취 시도 미확인)")
    ]
    for idx, (title, sub, desc) in enumerate(sec1_items):
        cell = sec1_tbl.cell(0, idx)
        cell.width = sec1_widths[idx]
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        r_t = p.add_run(f"[{title}]\n")
        r_t.font.size = Pt(7.5)
        r_t.font.bold = True
        r_t.font.color.rgb = RGBColor(0x02, 0x84, 0xC7) if idx == 2 else RGBColor(0xDC, 0x26, 0x26)
        r_s = p.add_run(f"{sub}\n")
        r_s.font.size = Pt(8)
        r_s.font.bold = True
        r_s.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        r_d = p.add_run(desc)
        r_d.font.size = Pt(7)
        r_d.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # 2. 향후 핵심 실험 일정 로드맵
    add_sec_title("2. 핵심 실험 일정 로드맵 및 진행 현황 (2026.10.11 ~ 11월 중순)")
    road_tbl = doc.add_table(rows=5, cols=4)
    road_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(road_tbl, color="CBD5E1", sz="4")
    road_widths = [Mm(22), Mm(26), Mm(80), Mm(54)]

    # Header Row
    headers = ["단계", "일정 / 기간", "주요 업무 및 실험 실행 내용", "주요 성과 / 세부 내용"]
    for idx, h in enumerate(headers):
        cell = road_tbl.cell(0, idx)
        cell.width = road_widths[idx]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=40, bottom=40, left=40, right=40)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.size = Pt(7.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    # Data Rows
    rows_data = [
        ("Step 1\n(완료)", "10.11 (일)\n08:30~09:30", "공주 3개 사이트 멧돼지 유인제 일제 살포 (총 6통)\n• 공주 A(산135), B(59-3), C(142-5) 각 2통씩 총 6통 집중 살포 완료\n• 이동 길목 유인선 구축 및 무인 센서 카메라 감도/화각 최적화", "• 작업자: 권용태(사무국장)\n• 10/11 살포 후 10/15 야간 멧돼지 4마리 집중 출현(10건 연속, 누적 35건) 확인 ➔ 비교 테스트 최적 조건 충족"),
        ("Step 2\n(완료)", "10.11 ~ 10.16\n(6일간)", "테스트용 차세대 미끼 4종(Type A, B, C, D) 최종 제작 및 성분 분석 완료\n• Type A: 유인제 밀랍 성형형  |  Type B: 옥수수모양 젤리(기성품)\n• Type C: 밤모양 옥수수 젤라틴 젤리  |  Type D: 자두복숭아 수제 젤리바", "• 미끼 4종 전량 제작 완료\n• 공인 성분표 분석 및 현장 설치 패키징 완료"),
        ("Step 3\n(설치·실측완료)", "10.17 ~ 10.31\n(10/20 3일차실측)", "공주 C지점(문금리 142-5) 미끼 4종 + 대조군(총 5종) 설치 및 3일차 섭취율 실측\n• 10/17 설치 ➔ 10/20 현장 실측: 미끼B 10개 완식(100%), 미끼C 3개(30%), 미끼A·D·대조군 각 1개(10%)\n• 10/20 심야 멧돼지 1마리 테스트용 먹이 섭취 영상 4건 확보 / 24시간 상시 감시", "• 작업자: 권용태(사무국장)\n• 10/17 설치 및 10/20 3일차 실측 완료 (현장사진 12장, 10/20 영상 4건 기록)"),
        ("Step 4\n(종료/보고)", "11월 중순\n(사업 종료)", "2026년도 사업 종료 및 최종보고서 제출 / 2027년 연계 검토\n• C지점 2주간 비교 실증 데이터 종합 분석 및 최종 결과보고서 납품\n• 도출된 최우수 제형 기반으로 향후 시제품 제작 및 특허 출원 연계 검토", "• 2026년 실증 용역 과제 완료\n• 최종 실증 결과 보고서 제출")
    ]
    for r_idx, r_data in enumerate(rows_data):
        for c_idx, text in enumerate(r_data):
            cell = road_tbl.cell(r_idx + 1, c_idx)
            cell.width = road_widths[c_idx]
            set_cell_margins(cell, top=40, bottom=40, left=40, right=40)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if c_idx < 2:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(text)
            r.font.size = Pt(7.2)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7) if "Step 1" in text else (RGBColor(0x05, 0x96, 0x69) if "Step 2" in text else (RGBColor(0xD9, 0x77, 0x06) if "Step 3" in text else RGBColor(0x64, 0x74, 0x8B)))

    # 3. 차세대 미끼 4종 스펙 및 C지점 5종 설치 현황
    add_sec_title("3. 차세대 미끼 4종 실물 스펙 및 공주 C지점(10/17 설치 완료) 5종 비교 실증 현황")
    bait_tbl = doc.add_table(rows=2, cols=4)
    bait_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(bait_tbl, color="E2E8F0", sz="4")
    bait_widths = [Mm(45), Mm(45), Mm(46), Mm(46)]
    
    baits = [
        ("Type A: 유인제 밀랍 성형형", "개선 개발 1  |  지속 20일 이상", "• 성분: 천연 밀랍, 멧돼지 전용 액상/분말 유인제, 옥수수 배합사료\n• 특징: 밀랍 용융 방수 코팅으로 비·습기 붕괴 100% 차단 (강우 저항 우수)"),
        ("Type B: 옥수수모양 젤리", "기성품 대조 2  |  지속 10~14일", "• 성분: 옥수수퓌레 25%, 맥아당시럽, 카라기난, 옥수수향 0.04% (319kcal)\n• 특징: 시판 사출 젤리, 낱개 밀봉 포장, 장기 노출 시 연화"),
        ("Type C: 밤모양 옥수수 젤리", "신규 개발 1  |  지속 20일 이상", "• 성분: 식용 젤라틴 + 천연 옥수수 알곡 원물 1:1 비율 정밀 배합\n• 특징: 가을철 최고 선호 밤 외형 반구형 모방, 고탄성 겔 지속"),
        ("Type D: 자두복숭아 젤리바", "신규 개발 2  |  지속 25일 이상", "• 성분: 국내산 젤라틴 36% + 천연 자두복숭아청 50% (영천자두, 경산복숭아)\n• 특징: 수제젤리 정형 사각 바(60g), 돼지 유래 젤라틴 후각 극대화")
    ]
    for idx, (b_title, b_sub, b_desc) in enumerate(baits):
        cell = bait_tbl.cell(0, idx)
        cell.width = bait_widths[idx]
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=40, bottom=40, left=40, right=40)
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r_t = p.add_run(f"{b_title}\n")
        r_t.font.size = Pt(7.5)
        r_t.font.bold = True
        r_t.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        r_s = p.add_run(f"{b_sub}\n")
        r_s.font.size = Pt(6.8)
        r_s.font.bold = True
        r_s.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
        r_d = p.add_run(b_desc)
        r_d.font.size = Pt(6.8)
        r_d.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # Banner for C Site Comparative Test
    p_c_box = doc.add_paragraph()
    p_c_box.paragraph_format.space_before = Pt(3)
    p_c_box.paragraph_format.space_after = Pt(3)
    p_c_box.paragraph_format.line_spacing = 1.15
    r_c_box = p_c_box.add_run("★ 10/17 공주 C지점(문금리 142-5) 5종 비교 실증 설치 완료 (2주 집중 실증 진행 중): ")
    r_c_box.font.size = Pt(7.5)
    r_c_box.font.bold = True
    r_c_box.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
    r_c_desc = p_c_box.add_run("10/15 야간 멧돼지 4마리 집중 출현(10건 연속, 누적 35건 확정)으로 최적 테스트 조건이 충족된 C지점에 10/17 차세대 미끼 4종(A·B·C·D)과 기존 동물사료 미끼틀/알곡 대조군을 그리드 배열로 동시 설치 완료하여 2주간(10.17~10.31) 직접 비교 검증을 수행 중입니다.")
    r_c_desc.font.size = Pt(7.2)
    r_c_desc.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # 4. [참고용 예시안] 최종보고서 수치화 평가 기준
    add_sec_title("4. [참고용 예시안] 최종보고서 수치화 평가 기준 (KPI 배점 체계)")
    
    p_kpi_note = doc.add_paragraph()
    p_kpi_note.paragraph_format.space_before = Pt(0)
    p_kpi_note.paragraph_format.space_after = Pt(2)
    r_note = p_kpi_note.add_run("※ [참고용 안내] 본 수치화 평가 기준 및 배점 항목은 향후 최종보고서 작성을 위한 단순 예시(안)이며, 과제 수행기관이 결정하는 사안이 아닙니다. 발주기관(국립야생동물질병관리원) 협의 및 평가 심의를 위한 사전 참고 자료로만 제시합니다.")
    r_note.font.size = Pt(6.8)
    r_note.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    kpi_eval_tbl = doc.add_table(rows=6, cols=5)
    kpi_eval_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(kpi_eval_tbl, color="CBD5E1", sz="4")
    eval_widths = [Mm(30), Mm(22), Mm(56), Mm(40), Mm(34)]

    # Headers
    e_headers = ["평가 영역", "배점(예시)", "핵심 실측 지표", "목표 기준치(예시)", "세부 배점 기준(예시안)"]
    for idx, eh in enumerate(e_headers):
        cell = kpi_eval_tbl.cell(0, idx)
        cell.width = eval_widths[idx]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=30, bottom=30, left=30, right=30)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(eh)
        r.font.size = Pt(7.2)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    eval_data = [
        ("1. 섭취 기호도", "40점", "• 최초 반응 시간 • 섭취 반응도 • 동시 섭취수", "적극적인 섭취 유도", "우수: 40점 / 보통: 35점 / 미흡: 30점"),
        ("2. 환경 내구성", "30점", "• 강우 후 형태 유지 • 변패 발생일 • 유효 지속일", "강우 후 형태 유지, 20일+", "25일↑: 30점 / 20일↑: 25점"),
        ("3. 비대상 배제", "15점", "• 고라니·오소리 섭취 여부 • 단순 통과율(%)", "비대상 섭취 0건 (미끼 무관심)", "섭취 0건: 15점 / 1건: 10점"),
        ("4. 현장 실용성", "15점", "• 산림 운반/살포 편의성 • 투하 시 파손 저항도", "취급/운반 시 형태 유지", "우수: 15점 / 보통: 10점"),
        ("합 계", "100점", "※ 본 표는 향후 평가 시 활용 가능한 단순 참고용 예시(안)입니다.", "", "")
    ]
    for r_idx, r_data in enumerate(eval_data):
        for c_idx, val in enumerate(r_data):
            cell = kpi_eval_tbl.cell(r_idx + 1, c_idx)
            cell.width = eval_widths[c_idx]
            set_cell_margins(cell, top=30, bottom=30, left=30, right=30)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if c_idx in [0, 1, 3, 4] and r_idx < 4:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.size = Pt(7)
            if r_idx == 4:
                set_cell_background(cell, "F0F9FF")
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    # Merge last row columns 2, 3, 4
    cell_start = kpi_eval_tbl.cell(5, 2)
    cell_end = kpi_eval_tbl.cell(5, 4)
    cell_start.merge(cell_end)

    doc.save(filename)
    print(f"DOCX created: {filename}")

def build_hwpx(filename):
    doc = hwpx.HwpxDocument.new()
    
    # 1. Title Paragraph
    doc.add_paragraph("2026년 야생 멧돼지 미끼백신 향후 실험 일정 및 실증 현황")
    doc.add_paragraph("• 과제명: 2026년 야생 멧돼지 미끼백신 섭취 기호도 평가 및 차세대 제형 현장 실증")
    doc.add_paragraph("• 발주/수행: 국립야생동물질병관리원 / (사)야생생물관리협회 대전ㆍ세종ㆍ충남지부")
    doc.add_paragraph("• 보고일자: 2026년 10월 18일 (10/17 현장 설치 반영)  |  보고자: 권용태 사무국장")
    doc.add_paragraph("• 실증거점: 공주 C지점(문금리 142-5, 멧돼지 35건 확정·집중 출현지) 및 공주 A·B, 경산 D")
    doc.add_paragraph("--------------------------------------------------------------------------------")
    
    # KPI Summary Table
    t_kpi = doc.add_table(2, 4)
    kpis = ["현장 실증 거점", "1단계 영상 감시", "멧돼지 출현 확정", "10/17 실증 제형"]
    vals = ["4개소 (공주3 + 경산1)", "878건 수집 (초단위 분석)", "80건 (C지점 35건·10/15 4마리 집중)", "5종 (미끼4 + 대조군1 설치완료)"]
    for i in range(4):
        t_kpi.set_cell_text(0, i, kpis[i])
        t_kpi.set_cell_text(1, i, vals[i])

    # Section 1
    doc.add_paragraph("\n1. 1단계 기초 실증 성과 결산 및 기술 한계점 정밀 진단")
    t_sec1 = doc.add_table(2, 3)
    t_sec1.set_cell_text(0, 0, "기존 동물사료 미끼틀")
    t_sec1.set_cell_text(0, 1, "유인제배합 고형사료")
    t_sec1.set_cell_text(0, 2, "비대상 야생동물 관찰")
    t_sec1.set_cell_text(1, 0, "섭취 기피 및 반응 미흡\n틀 주변 냄새 탐색 등 접근은 관찰되나, 실제 적극적인 섭취 반응이 미흡하여 백신 전달 효율 한계")
    t_sec1.set_cell_text(1, 1, "환경 내구성 취약 (형태 붕괴)\n유인 효과와 섭취 반응은 우수하나, 강우·지면 습기 노출 시 수일 내 형태가 쉽게 붕괴(물러짐)되어 야외 지속성 결여")
    t_sec1.set_cell_text(1, 2, "단순 통과 및 자연 채식 (누적 37건)\n고라니 25건(공주C 22·공주B 3), 오소리 12건 출현 시 미끼틀 주변 단순 통과 및 자연 초생 채식만 관찰됨 (미끼 섭취 시도 미확인)")

    # Section 2 Roadmap
    doc.add_paragraph("\n2. 핵심 실험 일정 로드맵 및 진행 현황 (2026.10.11 ~ 11월 중순)")
    t_road = doc.add_table(5, 4)
    headers = ["단계", "일정 / 기간", "주요 업무 및 실험 실행 내용", "주요 성과 / 세부 내용"]
    for j, h in enumerate(headers):
        t_road.set_cell_text(0, j, h)

    rows_data = [
        ("Step 1 (완료)", "10.11 (일)\n08:30~09:30", "공주 3개 사이트 멧돼지 유인제 일제 살포 (총 6통)\n• 공주 A, B, C 각 2통씩 살포 완료\n• 이동 길목 유인선 구축 및 무인 센서 카메라 감도/화각 최적화", "• 작업자: 권용태(사무국장)\n• 10/11 살포 후 10/15 야간 멧돼지 4마리 집중 출현(10건 연속, 누적 35건) 확인 ➔ 비교 테스트 최적 조건 충족"),
        ("Step 2 (완료)", "10.11 ~ 10.16\n(6일간)", "테스트용 차세대 미끼 4종(Type A, B, C, D) 최종 제작 및 성분 분석 완료\n• Type A: 유인제 밀랍 성형형  |  Type B: 옥수수 젤리\n• Type C: 밤모양 옥수수 젤리  |  Type D: 자두복숭아 젤리바", "• 미끼 4종 전량 제작 완료\n• 공인 성분표 분석 및 현장 설치 패키징 완료"),
        ("Step 3 (설치·실측완료)", "10.17 ~ 10.31\n(10/20 3일차실측)", "공주 C지점(문금리 142-5) 미끼 4종 + 대조군(총 5종) 설치 및 3일차 섭취율 실측\n• 10/17 설치 ➔ 10/20 실측: 미끼B 10개 완식(100%), 미끼C 3개(30%), 미끼A·D·대조군 각 1개(10%)\n• 10/20 심야 멧돼지 1마리 테스트용 먹이 섭취 영상 4건 확보 / 24시간 상시 감시", "• 작업자: 권용태(사무국장)\n• 10/17 설치 및 10/20 3일차 실측 완료 (현장사진 12장, 10/20 영상 4건 기록)"),
        ("Step 4 (종료/보고)", "11월 중순\n(사업 종료)", "2026년도 사업 종료 및 최종보고서 제출 / 2027년 연계 검토\n• C지점 2주간 비교 실증 데이터 분석 및 최종 결과보고서 납품\n• 도출된 최우수 제형 기반으로 향후 시제품 제작 및 특허 출원 연계 검토", "• 2026년 실증 용역 과제 완료\n• 최종 실증 결과 보고서 제출")
    ]
    for r_idx, r_data in enumerate(rows_data):
        for c_idx, val in enumerate(r_data):
            t_road.set_cell_text(r_idx + 1, c_idx, val)

    # Section 3
    doc.add_paragraph("\n3. 차세대 미끼 4종 실물 스펙 및 공주 C지점(10/17 설치 완료) 5종 비교 실증 현황")
    t_bait = doc.add_table(2, 4)
    t_bait.set_cell_text(0, 0, "Type A: 유인제 밀랍 성형형\n[실측: 1/10 (10%)]")
    t_bait.set_cell_text(0, 1, "Type B: 옥수수모양 젤리\n★ [실측: 10/10 완식(100%)]")
    t_bait.set_cell_text(0, 2, "Type C: 밤모양 옥수수 젤리\n[실측: 3/10 (30%)]")
    t_bait.set_cell_text(0, 3, "Type D: 자두복숭아 젤리바\n[실측: 1/10 (10%)]")
    
    t_bait.set_cell_text(1, 0, "밀랍 용융 방수 코팅으로 비·습기 붕괴 차단\n성분: 천연 밀랍, 멧돼지 유인제, 옥수수사료")
    t_bait.set_cell_text(1, 1, "시판 사출 젤리 (OPP 밀봉 포장)\n성분: 옥수수퓌레 25%, 카라기난, 옥수수향")
    t_bait.set_cell_text(1, 2, "가을철 최고 선호 밤 외형 모방 반구형\n성분: 식용 젤라틴 + 옥수수 알곡 1:1 배합")
    t_bait.set_cell_text(1, 3, "수제젤리 정형 사각 바(60g), 후각 극대화\n성분: 국내산 젤라틴 36% + 자두복숭아청 50%")

    doc.add_paragraph("★ 10/17 공주 C지점(문금리 142-5) 5종 비교 실증 설치 완료: 10/15 야간 멧돼지 4마리 집중 출현(10건 연속, 누적 35건 확정)으로 최적 테스트 조건이 충족된 C지점에 10/17 5종 동시 설치 및 2주간 집중 비교 실증 진행 중")

    # Section 4
    doc.add_paragraph("\n4. [참고용 예시안] 최종보고서 수치화 평가 기준 (KPI 배점 체계)")
    doc.add_paragraph("※ [참고용 안내] 본 수치화 평가 기준 및 배점 항목은 향후 최종보고서 작성을 위한 단순 예시(안)이며, 과제 수행기관이 독자 결정하는 사안이 아니므로 발주기관(국립야생동물질병관리원) 협의 및 평가 심의를 위한 사전 참고 자료로만 제시합니다.")
    
    t_eval = doc.add_table(6, 5)
    e_headers = ["평가 영역", "배점(예시)", "핵심 실측 지표", "목표 기준치(예시)", "세부 배점 기준(예시안)"]
    for j, eh in enumerate(e_headers):
        t_eval.set_cell_text(0, j, eh)

    e_rows = [
        ("1. 섭취 기호도", "40점", "• 최초 반응 시간 • 섭취 반응도 • 동시 섭취수", "적극적인 섭취 유도", "우수: 40점 / 보통: 35점 / 미흡: 30점"),
        ("2. 환경 내구성", "30점", "• 강우 후 형태 유지 • 변패 발생일 • 유효 지속일", "강우 후 형태 유지, 20일+", "25일↑: 30점 / 20일↑: 25점"),
        ("3. 비대상 배제", "15점", "• 고라니·오소리 섭취 여부 • 단순 통과율(%)", "비대상 섭취 0건 (미끼 무관심)", "섭취 0건: 15점 / 1건: 10점"),
        ("4. 현장 실용성", "15점", "• 산림 운반/살포 편의성 • 투하 시 파손 저항도", "취급/운반 시 형태 유지", "우수: 15점 / 보통: 10점"),
        ("합 계", "100점", "※ 본 표는 향후 평가 시 활용 가능한 단순 참고용 예시(안)입니다.", "-", "-")
    ]
    for r_idx, r_data in enumerate(e_rows):
        for c_idx, val in enumerate(r_data):
            t_eval.set_cell_text(r_idx + 1, c_idx, val)

    doc.save_to_path(filename)
    print(f"HWPX created: {filename}")

if __name__ == '__main__':
    os.makedirs('assets/documents', exist_ok=True)
    
    # 1. Output in workspace
    docx_path = 'assets/documents/2026_미끼백신_향후실험일정_1장요약보고서.docx'
    hwpx_path = 'assets/documents/2026_미끼백신_향후실험일정_1장요약보고서.hwpx'
    build_docx(docx_path)
    build_hwpx(hwpx_path)

    # Copy to root for quick access
    shutil.copy(docx_path, '2026_미끼백신_향후실험일정_1장요약보고서.docx')
    shutil.copy(hwpx_path, '2026_미끼백신_향후실험일정_1장요약보고서.hwpx')

    # Copy to artifacts directory
    art_dir = r'C:\Users\Owner\.gemini\antigravity\brain\e600dde4-feaf-431b-81ad-6a77ef8a67c4'
    if os.path.exists(art_dir):
        shutil.copy(docx_path, os.path.join(art_dir, '2026_미끼백신_향후실험일정_1장요약보고서.docx'))
        shutil.copy(hwpx_path, os.path.join(art_dir, '2026_미끼백신_향후실험일정_1장요약보고서.hwpx'))
        print("Copied to artifacts directory successfully!")
