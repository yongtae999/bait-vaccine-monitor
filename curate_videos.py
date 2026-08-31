import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor\data"
json_path = os.path.join(DATA_DIR, "wildboar_videos.json")

# Filter to the curated 45 confirmed & reviewed clips (53MB, perfect for web streaming)
with open(json_path, "r", encoding="utf-8") as f:
    all_videos = json.load(f)

# Curated list contains filenames starting with 0001, 0024, 0034, 0111~0121, 0333, 0357~0359, 0404, 0411, 0444, 0491~0623
curated = []
for v in all_videos:
    fn = v["filename"]
    # Check if file exists in assets/videos/confirmed or assets/videos/ignored
    is_curated_num = any(fn.startswith(f"{i:04d}_") for i in range(1, 700))
    if is_curated_num:
        if "0404_" in fn or "0411_" in fn:
            v["category"] = "제외 (비대상 동물)"
            v["animal_type"] = "고라니 (Hydropotes inermis)"
            v["reaction"] = "비대상 동물 (고라니)"
        elif "0001_" in fn:
            v["category"] = "멧돼지 선별영상"
            v["animal_type"] = "현장 설치 및 모니터링"
            v["reaction"] = "실험구 점검 및 관찰"
        else:
            v["category"] = "멧돼지확정"
            v["animal_type"] = "야생 멧돼지 (Sus scrofa)"
            v["reaction"] = "야간 미끼 반응 관찰" if v.get("is_night", True) else "주간 미끼 반응 관찰"
        curated.append(v)

print(f"Curated web streaming videos: {len(curated)} items")

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(curated, f, ensure_ascii=False, indent=2)

print("Saved clean 45 curated videos to wildboar_videos.json!")
