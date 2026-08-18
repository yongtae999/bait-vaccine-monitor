import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

OUT_DIR = r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor"
DATA_DIR = os.path.join(OUT_DIR, "data")
json_path = os.path.join(DATA_DIR, "wildboar_videos.json")

with open(json_path, "r", encoding="utf-8") as f:
    videos = json.load(f)

for vid in videos:
    fn = vid["filename"]
    
    # Deer Ignored (0404, 0411)
    if "0404_" in fn or "0411_" in fn:
        vid["category"] = "제외 (비대상 동물)"
        vid["animal_type"] = "고라니 (Hydropotes inermis)"
        vid["reaction"] = "비대상 동물 (고라니)"
    # First video (0001) which user noted had human/setup
    elif "0001_" in fn:
        vid["category"] = "멧돼지 선별영상"
        vid["animal_type"] = "현장 설치 및 모니터링"
        vid["reaction"] = "실험구 점검 및 관찰"
    # All other confirmed wild boar videos
    else:
        vid["category"] = "멧돼지확정"
        vid["animal_type"] = "야생 멧돼지 (Sus scrofa)"
        if vid.get("is_night", True):
            vid["reaction"] = "야간 미끼 반응 관찰"
        else:
            vid["reaction"] = "주간 미끼 반응 관찰"

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(videos, f, ensure_ascii=False, indent=2)

print("Updated wildboar_videos.json cleanly!")
