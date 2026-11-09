# -*- coding: utf-8 -*-
import os
import shutil
import docx
from docx.shared import Pt, RGBColor, Mm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import hwpx

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_docx(filename):
    doc = docx.Document()
    
    # Page Setup (A4)
    sec = doc.sections[0]
    sec.page_width = Mm(210)
    sec.page_height = Mm(297)
    sec.top_margin = Mm(18)
    sec.bottom_margin = Mm(18)
    sec.left_margin = Mm(18)
    sec.right_margin = Mm(18)

    doc.styles['Normal'].font.name = '맑은 고딕'
    doc.styles['Normal'].font.size = Pt(9)
    doc.styles['Normal'].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    # Agency Tag
    p_tag = doc.add_paragraph()
    p_tag.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tag = p_tag.add_run("국립야생동물질병관리원 실증 용역 · (사)야생생물관리협회 대전ㆍ세종ㆍ충남지부")
    r_tag.font.size = Pt(9.5)
    r_tag.font.bold = True
    r_tag.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(2)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("2026년 야생 멧돼지 미끼 유형별 실증 및 기호도조사\n현장 실증결과 최종보고서")
    r_title.font.size = Pt(16.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(10)
    r_sub = p_sub.add_run("— 공주 C지점(문금리 142-5) 테스트 미끼 4종 + 대조군 2종(총 6종) 현장 실증 및 중복 배제 개체 분석 —")
    r_sub.font.size = Pt(10)
    r_sub.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # Meta Table
    tbl_meta = doc.add_table(rows=1, cols=3)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meta, color="E2E8F0", sz="4")
    meta_widths = [Mm(58), Mm(58), Mm(58)]
    meta_texts = [
        "실증 기간: 2026.10.17 ~ 10.31 (15일)",
        "현장 작업: 권용태 (사무국장)",
        "보고서 작성일: 2026년 11월"
    ]
    for idx, txt in enumerate(meta_texts):
        cell = tbl_meta.cell(0, idx)
        cell.width = meta_widths[idx]
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=50, bottom=50, left=50, right=50)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(txt)
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    def add_heading1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(text)
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x03, 0x69, 0xA1)

    def add_heading2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Section 1: 요약 (Executive Summary)
    add_heading1("1. 실증 요약 및 핵심 성과")
    
    # Key Summary Boxes Table
    k_tbl = doc.add_table(rows=2, cols=4)
    k_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(k_tbl, color="CBD5E1", sz="4")
    k_w = [Mm(43.5), Mm(43.5), Mm(43.5), Mm(43.5)]
    k_vals = ["81개", "30회", "최소 7두", "B젤리 & 고형사료"]
    k_lbls = ["누적 설치 미끼 총량\n(1차 50 + 2차 21 + 3차 10)", "독립 방문 횟수\n(영상 71건 30분 간격 정합)", "멧돼지 확인 개체\n(독립 6회 방문, 연 12두)", "최고 섭취율 기록 제형\n(100% 완식 압도적 1위)"]
    for i in range(4):
        c0 = k_tbl.cell(0, i)
        c0.width = k_w[i]
        set_cell_background(c0, "F1F5F9")
        set_cell_margins(c0, top=50, bottom=30, left=30, right=30)
        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r0 = p0.add_run(k_vals[i])
        r0.font.size = Pt(12)
        r0.font.bold = True
        r0.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C) if i in [2, 3] else RGBColor(0x03, 0x69, 0xA1)

        c1 = k_tbl.cell(1, i)
        c1.width = k_w[i]
        set_cell_background(c1, "FAFAFA")
        set_cell_margins(c1, top=30, bottom=50, left=30, right=30)
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r1 = p1.add_run(k_lbls[i])
        r1.font.size = Pt(7.5)
        r1.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    p_sum_bullet = doc.add_paragraph()
    p_sum_bullet.paragraph_format.space_before = Pt(5)
    p_sum_bullet.paragraph_format.space_after = Pt(4)
    p_sum_bullet.paragraph_format.line_spacing = 1.15
    p_sum_bullet.add_run(
        "• 공식 과업 명칭 정립: 10월 17일 이후 진행된 실증 실험의 공식 명칭을 「미끼 유형별 실증 및 기호도조사」로 정정 확정함.\n"
        "• 미끼 6종 체계 구성: 테스트 미끼 4종(Type A 밀랍형, Type B 옥수수콘 젤리, Type C 밤모양 옥수수 젤리, Type D 자두복숭아 젤리바)과 대조군 2종(① 기존 동물사료 미끼틀, ② 유인제배합 고형사료) 총 6종 체계로 비교 실증을 수행함.\n"
        "• 최고 섭취율 제형 (핵심 결론): 옥수수콘 젤리(Type B)와 대조군인 유인제배합 고형사료의 섭취율이 전 기간 통틀어 가장 높았음.\n"
        "  - Type B 옥수수콘 젤리: 1차 실측(10/20)에서 멧돼지에 의해 10개 전량 완식(100%)되었으며, 10/23 2차 추가 설치분(4개)에서도 야생동물(오소리 등)의 즉각적인 완식 반응이 나타나 압도적인 유인력과 기호성을 입증함.\n"
        "  - 유인제배합 고형사료(대조군 ②): 10/23 추가설치(8개) 완식에 이어 10/25 추가설치분 10개(지표 5+매립 5) 전량이 멧돼지 대군집(7마리)에 의해 지표면 및 지중 굴토로 100% 완식됨.\n"
        "• 살포 방식 혁신 (미끼틀 외면): 기존 동물사료 미끼틀(대조군 ①)은 10/17 1차(10%), 10/23 2차(9개), 10/25 3차에 걸친 테스트에서 멧돼지 7마리 대군집 출현 시에도 0.0%로 완전 외면(기피율 100%)되어 인공틀 방식의 한계가 명확히 실증됨.\n"
        "• 비대상 동물 및 타임라인 경과: 10/23 2차 추가설치 후 야간부터 24일~25일 새벽까지 오소리가 출현하여 완식하는 것을 영상으로 확인 후 10/25 3차 추가설치를 진행함. 이후 25일 야간 오소리 출현, 26일 오소리 및 멧돼지 1마리 출현하여 고형사료 완식 개시, 27일 새벽 멧돼지 7마리 대군집이 매립 고형사료까지 주둥이 굴토로 전량 완식하였으며, 10/31 오소리가 멧돼지 굴토 자리를 앞발로 토양 굴착하는 행동이 포착됨."
    )

    # Section 2: 방법론
    add_heading1("2. 개체수 산정 및 중복 배제 방법론")
    p_method = doc.add_paragraph()
    p_method.paragraph_format.space_before = Pt(2)
    p_method.paragraph_format.space_after = Pt(3)
    p_method.paragraph_format.line_spacing = 1.15
    p_method.add_run(
        "무인 센서 카메라는 1개체의 동물이 머무는 동안 연속적으로 다수의 클립(10~60초)을 녹화하므로, 단순히 영상 수를 개체수로 계산하면 심각한 과대 산정 왜곡이 발생합니다. 본 보고서는 야생동물 생태 조사 표준에 따라 아래 5대 원칙으로 정합화하였습니다."
    )

    tbl_meth = doc.add_table(rows=5, cols=2)
    tbl_meth.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meth, color="CBD5E1", sz="4")
    m_w = [Mm(45), Mm(129)]
    m_data = [
        ("① 독립 방문 (Visit Event)", "동일 카메라·동일 동물종 기준 연속 영상 간격이 30분 이내이면 1회 방문으로 통합"),
        ("② 동시 출현 마릿수 (MaxN)", "각 독립 방문의 연속 영상 중 단일 화면에 동시에 포착된 최대 마릿수를 개체수로 확정"),
        ("③ 연 출현 개체수 (Animal-Visits)", "독립 방문별 MaxN의 총합계로, 재방문을 포함한 해당 장소의 총 이용 강도를 의미함"),
        ("④ 최소 확인 개체수 (MNI)", "전 기간 중 단일 화면에 동시 포착된 최대 군집 규모 (예: 10/27 새벽 멧돼지 7마리 동시 확인)"),
        ("⑤ 5단계 행동 반응 분류", "섭취(Eat) > 접촉/시도(Touch) > 토양굴착(Dig) > 냄새탐색/배회(Sniff) > 단순통과(Pass)")
    ]
    for r_idx, (col1, col2) in enumerate(m_data):
        c0 = tbl_meth.cell(r_idx, 0)
        c0.width = m_w[0]
        set_cell_background(c0, "F8FAFC")
        set_cell_margins(c0, top=35, bottom=35, left=45, right=45)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(col1)
        r0.font.size = Pt(8.3)
        r0.font.bold = True
        r0.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

        c1 = tbl_meth.cell(r_idx, 1)
        c1.width = m_w[1]
        set_cell_margins(c1, top=35, bottom=35, left=45, right=45)
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(col2)
        r1.font.size = Pt(8.3)

    # Section 3: 실험 미끼 구성 및 설치 내역
    add_heading1("3. 실험 미끼 종류(테스트 4종 + 대조군 2종), 설치일, 수량 및 설치 방식")
    tbl_baits = doc.add_table(rows=10, cols=6)
    tbl_baits.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_baits, color="CBD5E1", sz="4")
    b_w = [Mm(25), Mm(38), Mm(54), Mm(22), Mm(14), Mm(21)]
    b_headers = ["제형 구분", "명칭", "주요 성분 및 제원", "설치일자", "수량", "설치 방식"]
    for j, h in enumerate(b_headers):
        cell = tbl_baits.cell(0, j)
        cell.width = b_w[j]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=35, bottom=35, left=35, right=35)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.size = Pt(8)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    b_rows = [
        ("Type A (테스트 1)", "유인제 밀랍 성형형", "천연 밀랍 + 유인제 + 옥수수사료 (방수 고형화)", "10.17 (토)", "10개", "지표 그리드"),
        ("Type B (테스트 2)", "옥수수콘 젤리", "옥수수퓌레 25%, 카라기난, 옥수수향 (시판 OPP포장)", "10.17 (토)", "10개", "지표 그리드"),
        ("Type C (테스트 3)", "밤모양 옥수수 젤리", "식용 젤라틴 + 옥수수 알곡 1:1 혼합 매트릭스", "10.17 (토)", "10개", "지표 그리드"),
        ("Type D (테스트 4)", "자두복숭아 젤리바", "국내산 젤라틴 36% + 자두복숭아청 50% (사각 바 60g)", "10.17 (토)", "10개", "지표 그리드"),
        ("대조군 ① (미끼틀)", "기존 동물사료 미끼틀", "동물 배합사료(옥수수·소맥 펠릿) 거치형 미끼틀", "10.17 (토)", "10개", "지표 그리드"),
        ("대조군 ① (2차추가)", "기존 동물사료 미끼틀", "동물 배합사료 거치형 미끼틀 추가 보충", "10.23 (금)", "9개", "지표 거치"),
        ("Type B (2차추가)", "옥수수콘 젤리", "옥수수콘 젤리 (3개 지표 노출, 1개 지중 매립)", "10.23 (금)", "4개", "지표 3 / 매립 1"),
        ("대조군 ② (2차추가)", "유인제배합 고형사료", "멧돼지 전용 유인제 고압 압축 사료 (지표 6, 매립 2)", "10.23 (금)", "8개", "지표 6 / 매립 2"),
        ("대조군 ② (3차추가)", "유인제배합 고형사료", "멧돼지 전용 유인제 고압 압축 사료 (지표 5, 매립 5)", "10.25 (일)", "10개", "지표 5 / 매립 5")
    ]
    for r_idx, r_data in enumerate(b_rows):
        for c_idx, val in enumerate(r_data):
            cell = tbl_baits.cell(r_idx + 1, c_idx)
            cell.width = b_w[c_idx]
            set_cell_margins(cell, top=30, bottom=30, left=35, right=35)
            p = cell.paragraphs[0]
            if c_idx in [0, 3, 4, 5]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.size = Pt(7.8)
            if c_idx == 0:
                r.font.bold = True
                if "Type B" in val:
                    r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
                elif "대조군 ②" in val:
                    r.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C)

    # Section 4: 현장 실측 섭취율 결과
    add_heading1("4. 현장 실측 섭취율 및 설치 단계별 경과 분석")
    add_heading2("1) 1차 설치 및 실측 결과 (2026.10.17 설치 ➔ 10.20 14:20 실측)")
    
    t_1st = doc.add_table(rows=6, cols=6)
    t_1st.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_1st, color="CBD5E1", sz="4")
    w_1st = [Mm(40), Mm(16), Mm(16), Mm(16), Mm(20), Mm(66)]
    h_1st = ["미끼 제형 (구분)", "설치", "섭취", "잔여", "섭취율", "현장 관찰 상태 및 평가"]
    for j, h in enumerate(h_1st):
        cell = t_1st.cell(0, j)
        cell.width = w_1st[j]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=35, bottom=35, left=35, right=35)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.size = Pt(8)
        r.font.bold = True

    data_1st = [
        ("Type B (옥수수콘 젤리)", "10", "10", "0", "100.0%", "★ 압도적 1위: 개체 진입 즉시 10개 전량 완식 (최고 기호성)"),
        ("Type C (밤모양 옥수수 젤리)", "10", "3", "7", "30.0%", "2위: 3개 선별 섭취, 잔여 7개 고탄성 형태 완벽 유지"),
        ("Type A (유인제 밀랍 성형형)", "10", "1", "9", "10.0%", "공동 3위: 1개 섭취, 잔여 9개 방수 외형 완벽 유지"),
        ("Type D (자두복숭아 젤리바)", "10", "1", "9", "10.0%", "공동 3위: 1개 섭취, 잔여 9개 형태 유지 및 과일향 발산"),
        ("대조군 ① (기존 동물사료 미끼틀)", "10", "1", "9", "10.0%", "공동 3위: 틀 내부 사료 섭취 극히 저조 (반응 미흡)")
    ]
    for r_idx, r_data in enumerate(data_1st):
        for c_idx, val in enumerate(r_data):
            cell = t_1st.cell(r_idx + 1, c_idx)
            cell.width = w_1st[c_idx]
            set_cell_margins(cell, top=30, bottom=30, left=35, right=35)
            p = cell.paragraphs[0]
            if c_idx in [1, 2, 3, 4]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.size = Pt(8)
            if c_idx == 0:
                r.font.bold = True
            if c_idx == 4 and "100" in val:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    p_1st_note = doc.add_paragraph()
    p_1st_note.paragraph_format.space_before = Pt(3)
    p_1st_note.paragraph_format.space_after = Pt(4)
    p_1st_note.paragraph_format.line_spacing = 1.15
    r_1st_n = p_1st_note.add_run("※ 1차 섭취 주체 확인: 10/17~10/20 무인 카메라 판독 결과 야간 멧돼지 1마리(2회 방문: 02:31 섭취 개시, 03:24 재진입 완식) 외 비대상 출현은 0건이었으므로, 16개 섭취는 멧돼지 1마리의 선택적 섭식 결과임.")
    r_1st_n.font.size = Pt(7.8)
    r_1st_n.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    add_heading2("2) 2차 추가설치(10/23) 및 오소리 완식 경과 (10/23 밤 ~ 10/25 새벽)")
    p_2nd_text = doc.add_paragraph()
    p_2nd_text.paragraph_format.space_before = Pt(2)
    p_2nd_text.paragraph_format.space_after = Pt(4)
    p_2nd_text.paragraph_format.line_spacing = 1.15
    p_2nd_text.add_run(
        "• 10월 23일 추가 설치 내역: 기존 동물사료 미끼틀 9개, 옥수수콘 젤리(Type B) 4개(3개 지표 노출, 1개 지중 매립), 유인제배합 고형사료 8개(6개 지표 노출, 2개 지중 매립) 총 21개를 추가 투입함.\n"
        "• 오소리 출현 및 완식 관찰: 10월 23일 추가 설치 직후 심야(19:47~22:11)부터 오소리 2마리가 출현(연속 9건 영상 포착)하여 설치된 먹이를 집중 탐색·섭취하기 시작하였으며, 24일과 25일 새벽까지 오소리가 현장에 연속 방문하여 추가 설치된 미끼 및 사료를 전량 완식한 사실을 무인 영상 판독으로 확인함."
    )

    add_heading2("3) 3차 추가설치(10/25) 및 오소리·멧돼지 완식 실측 (10/25 야간 ~ 10/27)")
    p_3rd_text = doc.add_paragraph()
    p_3rd_text.paragraph_format.space_before = Pt(2)
    p_3rd_text.paragraph_format.space_after = Pt(4)
    p_3rd_text.paragraph_format.line_spacing = 1.15
    p_3rd_text.add_run(
        "• 10월 25일 추가 설치 진행: 오소리의 완식을 확인한 후 현장 점검을 거쳐 유인제배합 고형사료 10개(지표 5개 + 매립 5개) 및 미끼틀 사료 보충을 실시함.\n"
        "• 10/25 야간 ~ 26일 경과: 25일 야간 오소리 출현(19:22, 23:31)에 이어, 26일에는 오소리(19:50, 23:23) 및 멧돼지 1마리(20:57 섭취 반응, 22:25 통과)가 출현하여 완식 과정이 시작됨.\n"
        "• 10/27 새벽 멧돼지 대군집(7마리) 완식: 선두 개체 진입 후 최대 7마리가 동시 출현(03:24~03:25)하여 지표면 고형사료 5개뿐만 아니라 5~10cm 지중에 매립된 고형사료 5개까지 주둥이 굴토(Rooting)로 전량 완식함. 반면 기존 미끼틀 내부 사료는 0.0%로 완전 외면(기피)함."
    )

    t_2nd = doc.add_table(rows=4, cols=5)
    t_2nd.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_2nd, color="CBD5E1", sz="4")
    w_2nd = [Mm(45), Mm(18), Mm(18), Mm(22), Mm(71)]
    h_2nd = ["미끼 제형 및 설치 방식", "설치 수량", "섭취 수량", "실측 섭취율", "현장 실측 상태 및 행동 관찰 소견"]
    for j, h in enumerate(h_2nd):
        cell = t_2nd.cell(0, j)
        cell.width = w_2nd[j]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=35, bottom=35, left=35, right=35)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.size = Pt(8)
        r.font.bold = True

    data_2nd = [
        ("고형사료 — 지표면 노출", "5개", "5개", "100.0%", "바닥을 훑으며 5개 흔적 없이 전량 완식 (멧돼지·오소리)"),
        ("고형사료 — 지중 5~10cm 매립", "5개", "5개", "100.0%", "★ 멧돼지 7두가 주둥이로 깊게 파헤친 굴토 흔적 확인, 5개 완식"),
        ("대조군 ① (기존 동물사료 미끼틀)", "거치분", "0개", "0.0%", "★ 대군집(7마리) 출현에도 미끼틀 미접근 외면 (0% 섭취)")
    ]
    for r_idx, r_data in enumerate(data_2nd):
        for c_idx, val in enumerate(r_data):
            cell = t_2nd.cell(r_idx + 1, c_idx)
            cell.width = w_2nd[c_idx]
            set_cell_margins(cell, top=30, bottom=30, left=35, right=35)
            p = cell.paragraphs[0]
            if c_idx in [1, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.size = Pt(8)
            if c_idx == 0:
                r.font.bold = True
            if c_idx == 3:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7) if "100" in val else RGBColor(0xDC, 0x26, 0x26)

    # Section 5: 출현 동물종별 개체수 및 세부 반응 분석
    add_heading1("5. 출현 동물종별 개체수 및 반응 분석 (중복 배제 정밀 집계)")
    
    t_sp = doc.add_table(rows=5, cols=9)
    t_sp.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_sp, color="CBD5E1", sz="4")
    w_sp = [Mm(24), Mm(14), Mm(14), Mm(16), Mm(16), Mm(14), Mm(14), Mm(14), Mm(48)]
    h_sp = ["동물종", "영상", "방문", "연출현", "최소개체", "섭취", "접촉", "통과", "미끼 반응 및 주요 생태 특이사항"]
    for j, h in enumerate(h_sp):
        cell = t_sp.cell(0, j)
        cell.width = w_sp[j]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=35, bottom=35, left=30, right=30)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.size = Pt(7.8)
        r.font.bold = True

    data_sp = [
        ("야생 멧돼지", "17건", "6회", "12두·회", "7마리", "4회", "1회", "1회", "Type B 100%, 고형사료(지표/매립) 100% 완식, 미끼틀 0%"),
        ("오소리 (비대상)", "50건", "23회", "25두·회", "2마리", "1회*", "0회", "21회", "10/23 추가설치분 완식, 10/31 멧돼지 굴토자리 앞발굴착 1회"),
        ("고라니 (비대상)", "4건", "1회", "1두·회", "1마리", "0회", "0회", "1회", "미끼 무관심, 주변 초생 채식 후 통과 (섭취 0회)"),
        ("총 계", "71건", "30회", "38두·회", "—", "5회", "1회", "23회", "영상 71건을 30분 간격 30회 독립 방문으로 정합화 완료")
    ]
    for r_idx, r_data in enumerate(data_sp):
        for c_idx, val in enumerate(r_data):
            cell = t_sp.cell(r_idx + 1, c_idx)
            cell.width = w_sp[c_idx]
            if r_idx == 3:
                set_cell_background(cell, "F8FAFC")
            set_cell_margins(cell, top=30, bottom=30, left=30, right=30)
            p = cell.paragraphs[0]
            if c_idx in [1, 2, 3, 4, 5, 6, 7]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.size = Pt(7.8)
            if c_idx == 0 or r_idx == 3:
                r.font.bold = True

    # 멧돼지 및 주요 동물 방문 상세
    add_heading2("• 멧돼지 독립 방문별 세부 관찰 기록 (총 6회 방문 / 17건 영상)")
    t_v = doc.add_table(rows=7, cols=5)
    t_v.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_v, color="CBD5E1", sz="4")
    w_v = [Mm(14), Mm(32), Mm(18), Mm(20), Mm(90)]
    h_v = ["방문", "일시", "개체수", "반응 단계", "세부 관찰 행동 및 섭취 결과"]
    for j, h in enumerate(h_v):
        cell = t_v.cell(0, j)
        cell.width = w_v[j]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=30, bottom=30, left=30, right=30)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.size = Pt(7.8)
        r.font.bold = True

    data_v = [
        ("No. 1", "10/20 02:31~02:32", "1마리", "섭취 (Eat)", "심야 살포지 진입, 5종 미끼 중 Type B(옥수수콘 젤리) 집중 섭취 개시"),
        ("No. 2", "10/20 03:24", "1마리", "섭취 (Eat)", "52분 후 재방문, Type B 잔여분 전량 완식 및 Type C(3개) 선별 섭취"),
        ("No. 3", "10/22 02:26~02:41", "1마리", "접촉/탐색", "잔여 미끼(A, C, D)에 밀착 접근하여 코로 냄새 맡고 툭 건드림 (섭취 미확인)"),
        ("No. 4", "10/26 20:57~20:58", "1마리", "섭취 (Eat)", "10/25 추가 고형사료 구역 진입, 지표면 사료 탐색 및 섭취 반응"),
        ("No. 5", "10/26 22:25", "1마리", "단순 통과", "살포지 재진입 후 센서 전방 주변 수풀 탐색 후 신속 이동 통과"),
        ("No. 6", "10/27 03:24~03:25", "★ 7마리 군집", "집중 섭취", "선두 개체 진입 후 최대 7마리 동시 출현, 지표 고형사료 5개 완식 및 5~10cm 매립 사료 5개 전량 주둥이 굴토 완식. 기존 미끼틀 0% 외면")
    ]
    for r_idx, r_data in enumerate(data_v):
        for c_idx, val in enumerate(r_data):
            cell = t_v.cell(r_idx + 1, c_idx)
            cell.width = w_v[c_idx]
            if r_idx == 5:
                set_cell_background(cell, "FEF2F2")
            set_cell_margins(cell, top=25, bottom=25, left=30, right=30)
            p = cell.paragraphs[0]
            if c_idx in [0, 1, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.size = Pt(7.8)
            if c_idx in [0, 2] or r_idx == 5:
                r.font.bold = True

    # Section 6: 종합 결론 및 정책 제언
    add_heading1("6. 종합 결론 및 향후 미끼백신 사업 제언")
    p_concl = doc.add_paragraph()
    p_concl.paragraph_format.space_before = Pt(2)
    p_concl.paragraph_format.space_after = Pt(4)
    p_concl.paragraph_format.line_spacing = 1.2
    p_concl.add_run(
        "1. 최고 기호성 제형 확정 (옥수수콘 젤리 Type B & 대조군 고형사료의 압도적 섭취율)\n"
        "   • 전 기간 실증 결과, 옥수수콘 젤리(Type B)와 대조군인 유인제배합 고형사료의 섭취율이 가장 높았음.\n"
        "   • Type B는 멧돼지 1차 투입 시 3일 만에 10개 전량 완식(100%)되었을 뿐만 아니라 10/23 2차 추가 설치분에서도 즉각적인 완식 반응이 나타나 타깃 기호성 1위를 입증함.\n"
        "   • 신규 개발 Type C(밤모양 옥수수 젤라틴 젤리)는 30%의 초기 섭취율과 함께 고탄성 겔 매트릭스로 15일 이상의 우수한 야외 형태 보존력을 입증함.\n"
        "   • 향후 백신 제형화 시 Type B의 ‘고기호성 옥수수 유인 성분’과 Type C의 ‘고탄성 방수 젤라틴 매트릭스’를 결합한 하이브리드 젤리 제형 개발이 가장 유망함.\n\n"
        "2. 살포 방식의 혁신 (인공 미끼틀 전면 폐기 ➔ 지표 살포 및 5cm 얕은 매립 전환)\n"
        "   • 7마리의 대군집 멧돼지가 출현했을 때도 기존 철제/플라스틱 미끼틀 내부 사료는 0.0%로 철저히 기피됨(기피율 100%).\n"
        "   • 반면 지표면 노출 사료 100% 및 지중 5~10cm 매립 사료 100%가 완식됨. 멧돼지는 뛰어난 후각으로 땅속 사료를 정확히 탐지하여 주둥이 굴토(Rooting)로 파헤쳐 섭취하므로, 향후 미끼백신 살포는 인공틀을 배제하고 지표 살포 또는 5cm 내외 얕은 매립 방식이 필수적임.\n\n"
        "3. 비대상 야생동물 생태 반응 및 안전성\n"
        "   • 10/23 추가설치 직후 야간부터 25일 새벽까지 오소리가 출현하여 지표 및 노출 사료를 완식하는 과정이 포착되었고, 10/31에는 멧돼지 굴토 자리를 앞발로 파헤치는 토양 굴착(Dig) 행동이 확인됨.\n"
        "   • 향후 매립 깊이를 5~10cm로 정밀 조정하고 비대상 동물이 기피하면서 멧돼지만 유인할 수 있는 전용 유인향 배합 고도화가 요구됨."
    )

    doc.save(filename)
    print(f"DOCX created: {filename}")

def build_hwpx(filename):
    doc = hwpx.HwpxDocument.new()

    doc.add_paragraph("2026년 야생 멧돼지 미끼 유형별 실증 및 기호도조사 현장 실증결과 최종보고서")
    doc.add_paragraph("— 공주 C지점(문금리 142-5) 테스트 미끼 4종 + 대조군 2종(총 6종) 현장 실증 및 중복 배제 개체 분석 —")
    doc.add_paragraph("• 발주/수행: 국립야생동물질병관리원 실증 용역 / (사)야생생물관리협회 대전ㆍ세종ㆍ충남지부")
    doc.add_paragraph("• 실증 기간: 2026.10.17 ~ 10.31 (15일간 집중 비교 실증)  |  현장 실측: 권용태 (사무국장)")
    doc.add_paragraph("================================================================================")

    # 1. 요약
    doc.add_paragraph("\n1. 실증 요약 및 핵심 성과")
    t_k = doc.add_table(2, 4)
    k_h = ["누적 설치 미끼 총량", "독립 방문 횟수", "멧돼지 확인 개체", "최고 섭취율 제형"]
    k_v = ["81개 (1차 50+2차 21+3차 10)", "30회 (영상 71건 통합)", "최소 7두 (독립 6회 방문)", "옥수수콘 젤리(B) & 고형사료 (100% 완식)"]
    for i in range(4):
        t_k.set_cell_text(0, i, k_h[i])
        t_k.set_cell_text(1, i, k_v[i])

    doc.add_paragraph("\n• 공식 과업 명칭 정립: 10월 17일 이후 공식 과업 명칭을 「미끼 유형별 실증 및 기호도조사」로 정정 확정함.")
    doc.add_paragraph("• 미끼 6종 체계 구성: 테스트 미끼 4종(Type A, B, C, D) + 대조군 2종(① 기존 동물사료 미끼틀, ② 유인제배합 고형사료) 총 6종 체계로 비교 실증 수행.")
    doc.add_paragraph("• 최고 섭취율 (핵심 결론): 옥수수콘 젤리(Type B)와 대조군 고형사료의 섭취율이 전 기간 통틀어 가장 높았음 (압도적 1위).")
    doc.add_paragraph("• 10/23 추가설치(미끼틀 9, B 4[매립 1], 고형사료 8[매립 2]) 후 23일 밤~25일 새벽 오소리 출현 완식 확인 후 10/25 추가설치 진행.")
    doc.add_paragraph("• 10/25 야간 오소리, 10/26 오소리 및 멧돼지 출현 완식 개시, 10/27 새벽 멧돼지 7마리 대군집이 매립 고형사료까지 100% 완식(미끼틀 0% 외면).")

    # 2. 방법론
    doc.add_paragraph("\n2. 개체수 산정 및 중복 배제 방법론")
    t_m = doc.add_table(5, 2)
    m_data = [
        ("① 독립 방문 (Visit Event)", "동일 카메라·동일 동물종 기준 연속 영상 간격이 30분 이내이면 1회 방문으로 통합"),
        ("② 동시 출현 마릿수 (MaxN)", "각 독립 방문의 연속 영상 중 단일 화면에 동시에 포착된 최대 마릿수를 개체수로 확정"),
        ("③ 연 출현 개체수", "독립 방문별 MaxN의 총합계로 해당 장소의 총 이용 강도를 나타냄"),
        ("④ 최소 확인 개체수 (MNI)", "전 기간 중 단일 화면에 동시 포착된 최대 군집 규모 (10/27 새벽 멧돼지 7마리)"),
        ("⑤ 5단계 행동 반응", "섭취(Eat) > 접촉/시도(Touch) > 토양굴착(Dig) > 냄새탐색/배회(Sniff) > 단순통과(Pass)")
    ]
    for r_idx, (col1, col2) in enumerate(m_data):
        t_m.set_cell_text(r_idx, 0, col1)
        t_m.set_cell_text(r_idx, 1, col2)

    # 3. 미끼 구성
    doc.add_paragraph("\n3. 실험 미끼 종류(테스트 4종 + 대조군 2종), 설치일, 수량 및 배치 내역")
    t_b = doc.add_table(10, 6)
    b_h = ["제형 구분", "명칭", "주요 성분 및 제원", "설치일자", "수량", "설치 방식"]
    for j, h in enumerate(b_h):
        t_b.set_cell_text(0, j, h)
    b_rows = [
        ("Type A (테스트 1)", "유인제 밀랍 성형형", "천연 밀랍 + 유인제 + 옥수수사료 (방수 고형화)", "10.17 (토)", "10개", "지표 그리드"),
        ("Type B (테스트 2)", "옥수수콘 젤리", "옥수수퓌레 25%, 카라기난, 옥수수향 (시판 OPP포장)", "10.17 (토)", "10개", "지표 그리드"),
        ("Type C (테스트 3)", "밤모양 옥수수 젤리", "식용 젤라틴 + 옥수수 알곡 1:1 혼합 매트릭스", "10.17 (토)", "10개", "지표 그리드"),
        ("Type D (테스트 4)", "자두복숭아 젤리바", "국내산 젤라틴 36% + 자두복숭아청 50% (사각 바 60g)", "10.17 (토)", "10개", "지표 그리드"),
        ("대조군 ① (미끼틀)", "기존 동물사료 미끼틀", "동물 배합사료 거치형 미끼틀", "10.17 (토)", "10개", "지표 그리드"),
        ("대조군 ① (2차추가)", "기존 동물사료 미끼틀", "동물 배합사료 거치형 미끼틀 추가 보충", "10.23 (금)", "9개", "지표 거치"),
        ("Type B (2차추가)", "옥수수콘 젤리", "옥수수콘 젤리 (3개 지표 노출, 1개 지중 매립)", "10.23 (금)", "4개", "지표 3 / 매립 1"),
        ("대조군 ② (2차추가)", "유인제배합 고형사료", "멧돼지 유인제 압축 사료 (지표 6, 매립 2)", "10.23 (금)", "8개", "지표 6 / 매립 2"),
        ("대조군 ② (3차추가)", "유인제배합 고형사료", "멧돼지 유인제 압축 사료 (지표 5, 매립 5)", "10.25 (일)", "10개", "지표 5 / 매립 5")
    ]
    for r_idx, r_data in enumerate(b_rows):
        for c_idx, val in enumerate(r_data):
            t_b.set_cell_text(r_idx + 1, c_idx, val)

    # 4. 실측 섭취율
    doc.add_paragraph("\n4. 현장 실측 섭취율 및 설치 단계별 경과 분석")
    doc.add_paragraph("[1차 실측: 10/20(화), 설치 3일차]")
    t_1 = doc.add_table(6, 5)
    t1_h = ["미끼 제형 (구분)", "설치 수량", "섭취 수량", "섭취율", "현장 관찰 결과 및 소견"]
    for j, h in enumerate(t1_h):
        t_1.set_cell_text(0, j, h)
    t1_data = [
        ("Type B (옥수수콘 젤리)", "10개", "10개", "100.0%", "압도적 1위: 진입 즉시 10개 전량 집중 완식 (최고 기호도)"),
        ("Type C (밤모양 옥수수 젤리)", "10개", "3개", "30.0%", "2위: 3개 선별 섭취, 잔여 7개 고탄성 형태 유지"),
        ("Type A (유인제 밀랍 성형형)", "10개", "1개", "10.0%", "공동 3위: 1개 섭취, 잔여 9개 방수 외형 완벽 유지"),
        ("Type D (자두복숭아 젤리바)", "10개", "1개", "10.0%", "공동 3위: 1개 섭취, 잔여 9개 형태 유지 및 향 발산"),
        ("대조군 ① (기존 동물사료 미끼틀)", "10개", "1개", "10.0%", "공동 3위: 틀 내부 사료 섭취 극히 저조 (반응 미흡)")
    ]
    for r_idx, r_data in enumerate(t1_data):
        for c_idx, val in enumerate(r_data):
            t_1.set_cell_text(r_idx + 1, c_idx, val)

    doc.add_paragraph("\n[2차 추가설치(10/23) 및 3차 추가설치(10/25) 후 실측]")
    t_2 = doc.add_table(4, 5)
    t2_h = ["미끼 제형 및 설치 방식", "설치 수량", "섭취 수량", "실측 섭취율", "현장 실측 상태 및 소견"]
    for j, h in enumerate(t2_h):
        t_2.set_cell_text(0, j, h)
    t2_data = [
        ("고형사료 — 지표면 노출", "5개", "5개", "100.0%", "바닥을 훑으며 5개 흔적 없이 전량 완식 (멧돼지·오소리)"),
        ("고형사료 — 지중 5~10cm 매립", "5개", "5개", "100.0%", "주둥이로 깊게 파헤친 굴토 흔적 확인, 5개 완식"),
        ("대조군 ① (기존 동물사료 미끼틀)", "거치분", "0개", "0.0%", "대군집(7마리) 출현에도 미끼틀 미접근 외면 (0% 섭취)")
    ]
    for r_idx, r_data in enumerate(t2_data):
        for c_idx, val in enumerate(r_data):
            t_2.set_cell_text(r_idx + 1, c_idx, val)

    # 5. 동물별 반응
    doc.add_paragraph("\n5. 출현 동물종별 개체수 및 반응 분석 (중복 배제 정밀 집계)")
    t_s = doc.add_table(5, 7)
    ts_h = ["동물종", "녹화 영상", "독립 방문", "최소 확인 개체", "섭취", "접촉/통과", "미끼 반응 및 주요 생태"]
    for j, h in enumerate(ts_h):
        t_s.set_cell_text(0, j, h)
    ts_data = [
        ("야생 멧돼지", "17건", "6회", "7마리 (대군집)", "4회", "2회", "Type B 100%, 고형사료 100% 완식, 미끼틀 0%"),
        ("오소리 (비대상)", "50건", "23회", "2마리 (동시출현)", "1회*", "22회", "10/23 추가설치분 완식, 10/31 멧돼지 굴토자리 토양굴착 1회"),
        ("고라니 (비대상)", "4건", "1회", "1마리", "0회", "1회", "미끼 무관심, 주변 초생 채식 후 통과 (섭취 0회)"),
        ("총 계", "71건", "30회", "—", "5회", "25회", "영상 71건을 30분 간격 30회 독립 방문으로 정합화 완료")
    ]
    for r_idx, r_data in enumerate(ts_data):
        for c_idx, val in enumerate(r_data):
            t_s.set_cell_text(r_idx + 1, c_idx, val)

    # 6. 결론
    doc.add_paragraph("\n6. 종합 결론 및 향후 미끼백신 사업 제언")
    doc.add_paragraph("1) 최고 기호성 제형 확정 (Type B 옥수수콘 젤리 & 대조군 고형사료 압도적 섭취율)")
    doc.add_paragraph("   • 전 기간 실증 결과 옥수수콘 젤리(Type B)와 대조군 고형사료의 섭취율이 가장 높았음.")
    doc.add_paragraph("   • Type B의 고기호성 옥수수 성분과 Type C의 젤라틴 방수 매트릭스를 결합한 하이브리드 젤리 백신 개발 제언.")
    doc.add_paragraph("2) 살포 방식의 혁신 (인공 미끼틀 폐기 -> 지표 살포 및 5cm 얕은 매립 전환)")
    doc.add_paragraph("   • 대군집 7두 출현 시에도 기존 미끼틀 0.0% 외면 vs 지표 노출 100% 및 지중 5~10cm 매립 100% 완식 (주둥이 굴토 섭취).")
    doc.add_paragraph("   • 야생 멧돼지의 인공틀 기피 특성을 확인하였으므로, 향후 백신 살포는 미끼틀을 배제하고 지표 살포 또는 5cm 얕은 매립 방식 적용 필수.")
    doc.add_paragraph("3) 비대상 야생동물 생태 반응 및 안전성")
    doc.add_paragraph("   • 10/23 추가설치 직후 오소리 출현 완식 및 10/31 토양 굴착이 확인되었으므로, 매립 깊이(5~10cm) 및 멧돼지 전용 유인향 고도화 필요.")

    doc.save(filename)
    print(f"HWPX created: {filename}")

if __name__ == "__main__":
    os.makedirs("assets/documents", exist_ok=True)
    
    docx_path = "assets/documents/2026_야생멧돼지_미끼실험_실증결과보고서.docx"
    hwpx_path = "assets/documents/2026_야생멧돼지_미끼실험_실증결과보고서.hwpx"
    
    build_docx(docx_path)
    build_hwpx(hwpx_path)
    
    # Copy to project root
    shutil.copy(docx_path, "2026_야생멧돼지_미끼실험_실증결과보고서.docx")
    shutil.copy(hwpx_path, "2026_야생멧돼지_미끼실험_실증결과보고서.hwpx")
    
    # Copy to artifacts directory
    art_dir = "C:/Users/Owner/.gemini/antigravity/brain/e600dde4-feaf-431b-81ad-6a77ef8a67c4"
    if os.path.exists(art_dir):
        shutil.copy(docx_path, os.path.join(art_dir, "2026_야생멧돼지_미끼실험_실증결과보고서.docx"))
        shutil.copy(hwpx_path, os.path.join(art_dir, "2026_야생멧돼지_미끼실험_실증결과보고서.hwpx"))
        print("Copied to artifacts directory successfully!")
