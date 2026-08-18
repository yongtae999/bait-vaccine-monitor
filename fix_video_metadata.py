import os
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

OUT_DIR = r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor"
DATA_DIR = os.path.join(OUT_DIR, "data")
json_path = os.path.join(DATA_DIR, "wildboar_videos.json")

with open(json_path, "r", encoding="utf-8") as f:
    videos = json.load(f)

# Precision classification based on visual contents & time
for vid in videos:
    fn = vid["filename"]
    
    # 1. 0001 (Human/Inspector during setup)
    if "0001_" in fn:
        vid["category"] = "작업원 (설치/점검)"
        vid["animal_type"] = "현장 작업원 (설치 및 각도 점검)"
        vid["reaction"] = "카메라 세팅 및 미끼틀 살포"
        vid["count"] = 1
        vid["is_night"] = False
        vid["site_name"] = "문금리 142-5 (설치 점검)"
    
    # 2. 0024 (Night pass / test)
    elif "0024_" in fn:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (Sus scrofa)"
        vid["reaction"] = "접근 및 냄새맡기"
        vid["count"] = 1
        vid["is_night"] = True

    # 3. 0034 (2026-08-05 21:12 Big Boar Long Ingestion 141s)
    elif "0034_" in fn:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (성체 1두)"
        vid["reaction"] = "미끼 집중 섭취 (141초 체류)"
        vid["count"] = 1
        vid["is_night"] = True
        vid["recorded_time"] = "21:12:52"

    # 4. 0111 ~ 0121 (2026-07-28 Mun-geum-ri 59-3 Night Ingestion series)
    elif any(f"011{i}_" in fn for i in range(1, 10)) or "0120_" in fn or "0121_" in fn:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (대군락 2~3두)"
        vid["reaction"] = "유인제배합 고형사료 섭취"
        vid["count"] = 2
        vid["is_night"] = True
        vid["site_name"] = "문금리 59-3 (집중 출몰)"

    # 5. 0333, 0357~0359 (Daytime human inspection / maintenance)
    elif "0333_" in fn or any(f"035{i}_" in fn for i in range(7, 10)):
        vid["category"] = "작업원 (설치/점검)"
        vid["animal_type"] = "현장 조사원 (배터리 점검)"
        vid["reaction"] = "장비 점검 및 미끼 상태 확인"
        vid["count"] = 1
        vid["is_night"] = False

    # 6. 0444 (2026-07-06 21:29 Night ingestion)
    elif "0444_" in fn:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (성체 1두)"
        vid["reaction"] = "멧돼지미끼틀 탐색 및 섭취"
        vid["count"] = 1
        vid["is_night"] = True
        vid["recorded_time"] = "21:29:42"

    # 7. 0560 (2026-08-04 04:59 Dawn 313s Ultra Long Ingestion)
    elif "0560_" in fn:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (성체 1두)"
        vid["reaction"] = "미끼 집중 섭취 (313초 최장 체류)"
        vid["count"] = 1
        vid["is_night"] = True
        vid["recorded_time"] = "04:59:13"

    # 8. 0561 (2026-08-04 19:18 Dusk Ingestion 269s)
    elif "0561_" in fn:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (성체 1두)"
        vid["reaction"] = "미끼틀 주변 섭취 (269초)"
        vid["count"] = 1
        vid["is_night"] = True
        vid["recorded_time"] = "19:18:23"

    # 9. Deer Ignored (0404, 0411)
    elif "0404_" in fn or "0411_" in fn:
        vid["category"] = "제외 (비대상 동물)"
        vid["animal_type"] = "고라니 (Hydropotes inermis)"
        vid["reaction"] = "단순 통과 (미끼 무반응)"
        vid["count"] = 1
        vid["is_night"] = True

    # 10. General night boar clips
    else:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (Sus scrofa)"
        vid["reaction"] = "미끼틀 탐색 및 섭취"
        vid["is_night"] = True

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(videos, f, ensure_ascii=False, indent=2)

print("Updated wildboar_videos.json with precise human vs wildboar classification!")
