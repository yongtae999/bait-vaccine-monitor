import os
import sys
import subprocess
import cv2
import json
import imageio_ffmpeg

sys.stdout.reconfigure(encoding='utf-8')

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
base_dir = r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor"
videos_dir = os.path.join(base_dir, "assets", "videos", "confirmed")
thumbs_dir = os.path.join(base_dir, "assets", "thumbnails")
json_path = os.path.join(base_dir, "data", "wildboar_videos.json")
cameras_path = os.path.join(base_dir, "data", "cameras.json")

# 1. Remove 2026-07-21 files
for f in os.listdir(videos_dir):
    if f.startswith("V20260818_15284"):
        try:
            os.remove(os.path.join(videos_dir, f))
            print("Removed 07-21 video:", f)
        except Exception as e:
            print("Error removing video:", e)

for f in os.listdir(thumbs_dir):
    if f.startswith("V20260818_15284"):
        try:
            os.remove(os.path.join(thumbs_dir, f))
            print("Removed 07-21 thumb:", f)
        except Exception as e:
            print("Error removing thumb:", e)

# 2. Transcode & Add 2026-07-22 videos
day2_src_dir = r"E:\0. 2026년\미끼백신관련\미끼백신 동영상 정리_대구시\미끼대구\2026-07-22"
day2_files = sorted([f for f in os.listdir(day2_src_dir) if f.endswith(".mp4")])

day2_entries = []

for idx, f in enumerate(day2_files):
    src_fp = os.path.join(day2_src_dir, f)
    dst_fp = os.path.join(videos_dir, f)
    thumb_fn = f.replace(".mp4", ".jpg")
    thumb_fp = os.path.join(thumbs_dir, thumb_fn)

    # Transcode to H.264
    cmd = [
        ffmpeg_exe, "-y",
        "-i", src_fp,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "22",
        "-movflags", "+faststart",
        dst_fp
    ]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode == 0 and os.path.exists(dst_fp):
        print(f"[OK] Transcoded 07-22 video #{idx+1}: {f} ({os.path.getsize(dst_fp)/1024:.1f} KB)")
        
        # Generate thumbnail
        cap = cv2.VideoCapture(dst_fp)
        ret, frame = cap.read()
        if ret:
            cv2.imwrite(thumb_fp, frame)
        cap.release()

        entry = {
            "id": f"vid-dg-install-{idx+1:02d}",
            "filename": f,
            "rel_path": f"assets/videos/confirmed/{f}",
            "thumbnail": f"assets/thumbnails/{thumb_fn}",
            "camera_id": "cam-dg-1",
            "region": "대구",
            "site_name": "대구 4호기 (달성 비슬산)",
            "recorded_date": "2026-07-22",
            "recorded_time": f"14:0{idx}:00" if idx < 10 else f"14:{idx}:00",
            "is_night": False,
            "category": "현장 설치/점검",
            "animal_type": "IP카메라·미끼틀 설치",
            "reaction": f"현장 설치 및 각도 점검 #{idx+1}"
        }
        day2_entries.append(entry)
    else:
        print(f"[ERR] Failed transcoding: {f}")

# 3. Update wildboar_videos.json
with open(json_path, "r", encoding="utf-8") as f:
    existing_videos = json.load(f)

# Filter out 2026-07-21 entries
filtered_videos = [v for v in existing_videos if v.get("recorded_date") != "2026-07-21"]

# Append 2026-07-22 entries
filtered_videos.extend(day2_entries)

# Sort by date descending
filtered_videos.sort(key=lambda x: (x.get("recorded_date", ""), x.get("recorded_time", "")), reverse=True)

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(filtered_videos, f, ensure_ascii=False, indent=2)

print(f"Updated wildboar_videos.json: {len(filtered_videos)} total entries")

# 4. Update cameras.json install_date
with open(cameras_path, "r", encoding="utf-8") as f:
    cameras = json.load(f)

for c in cameras:
    if c["id"] == "cam-dg-1":
        c["install_date"] = "2026-07-22"

with open(cameras_path, "w", encoding="utf-8") as f:
    json.dump(cameras, f, ensure_ascii=False, indent=2)

print("Updated cameras.json: Daegu install date set to 2026-07-22!")
