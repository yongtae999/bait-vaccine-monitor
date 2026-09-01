import os
import sys
import json
import shutil
import re
from datetime import datetime

try:
    import cv2
except ImportError:
    cv2 = None

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor"
SRC_BASE = r"E:\0. 2026년\미끼백신관련"

VIDEOS_CONFIRMED_DIR = os.path.join(BASE_DIR, "assets", "videos", "confirmed")
VIDEOS_IGNORED_DIR = os.path.join(BASE_DIR, "assets", "videos", "ignored")
THUMBS_DIR = os.path.join(BASE_DIR, "assets", "thumbnails")
DATA_DIR = os.path.join(BASE_DIR, "data")
VIDEOS_JSON = os.path.join(DATA_DIR, "wildboar_videos.json")
CAMERAS_JSON = os.path.join(DATA_DIR, "cameras.json")

os.makedirs(VIDEOS_CONFIRMED_DIR, exist_ok=True)
os.makedirs(VIDEOS_IGNORED_DIR, exist_ok=True)
os.makedirs(THUMBS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


def parse_timestamp_from_filename(filename):
    # Pattern 1: 0034_V20260805_211252000_...
    m = re.search(r'V?(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})', filename)
    if m:
        d_str = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        t_str = f"{m.group(4)}:{m.group(5)}:{m.group(6)}"
        return d_str, t_str
    
    # Pattern 2: 0624_20260826_020851_000_10_P.mp4
    m2 = re.search(r'(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})', filename)
    if m2:
        d_str = f"{m2.group(1)}-{m2.group(2)}-{m2.group(3)}"
        t_str = f"{m2.group(4)}:{m2.group(5)}:{m2.group(6)}"
        return d_str, t_str

    return "2026-08-01", "12:00:00"


def determine_camera_info(filepath, filename):
    fp_low = filepath.lower()
    fn_low = filename.lower()

    if "산135" in fp_low or "공주먹이" in fp_low:
        return "cam-gj-san135", "문금리 산135 (공주먹이)", "멧돼지미끼틀 + 유인제배합", 36.64276, 127.012234
    elif "142-5" in fp_low:
        return "cam-gj-142-5", "문금리 142-5 (진입로 능선)", "멧돼지미끼틀 + 유인제배합", 36.639449, 127.010684
    elif "대구" in fp_low or "경산" in fp_low or "남하리" in fp_low:
        return "cam-dg-1", "경산 하양 남하리 산 127", "멧돼지미끼틀 + 유인제배합", 35.891449, 128.760951
    else:
        return "cam-gj-59-3", "문금리 59-3 (집중 출몰지)", "멧돼지미끼틀 + 유인제배합", 36.640111, 127.010993


def extract_thumbnail(video_path, thumb_path):
    if cv2 is None:
        return False
    try:
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames > 0:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(total_frames * 0.3))
            ret, frame = cap.read()
            if ret:
                cv2.imwrite(thumb_path, frame)
                cap.release()
                return True
        cap.release()
    except Exception as e:
        print(f"  [Thumbnail Error] {e}")
    return False


def sync_curated_videos():
    print("🎬 멧돼지 선별 및 확정 영상 동기화 시작...")

    confirmed_sources = [
        os.path.join(SRC_BASE, "미끼백신 동영상 정리_공주시", "멧돼지 선별결과", "멧돼지확정"),
        os.path.join(SRC_BASE, "미끼백신 동영상 정리_대구시", "멧돼지 선별결과", "멧돼지확정"),
        os.path.join(SRC_BASE, "미끼백신 동영상 정리_공주시", "동영상", "미끼문금리142-5", "2026-09-01")
    ]
    ignored_sources = [
        os.path.join(SRC_BASE, "미끼백신 동영상 정리_공주시", "멧돼지 선별결과", "제외_고라니")
    ]

    video_items = []
    
    # 1. Process Confirmed Wild Boars
    for src in confirmed_sources:
        if not os.path.exists(src):
            continue
        for root, dirs, files in os.walk(src):
            for f in sorted(files):
                if f.lower().endswith(".mp4"):
                    full_p = os.path.join(root, f)
                    dest_p = os.path.join(VIDEOS_CONFIRMED_DIR, f)
                    
                    if not os.path.exists(dest_p):
                        shutil.copy2(full_p, dest_p)
                        print(f"  [복사] {f}")

                    date_str, time_str = parse_timestamp_from_filename(f)
                    hour = int(time_str.split(":")[0])
                    is_night = (hour < 6 or hour >= 19)

                    cam_id, cam_site, bait_type, lat, lng = determine_camera_info(full_p, f)

                    # Thumbnail
                    thumb_name = f"{os.path.splitext(f)[0]}.jpg"
                    thumb_p = os.path.join(THUMBS_DIR, thumb_name)
                    if not os.path.exists(thumb_p):
                        extract_thumbnail(dest_p, thumb_p)

                    video_items.append({
                        "id": f"vid-{f[:4] if f[:4].isdigit() else os.path.splitext(f)[0]}",
                        "filename": f,
                        "video_url": f"assets/videos/confirmed/{f}",
                        "thumbnail_url": f"assets/thumbnails/{thumb_name}",
                        "camera_id": cam_id,
                        "site_name": cam_site,
                        "date": date_str,
                        "time": time_str,
                        "is_night": is_night,
                        "animal_type": "야생 멧돼지 (Sus scrofa)",
                        "category": "멧돼지확정",
                        "reaction": "야간 미끼 섭취 및 반응 관찰" if is_night else "주간 미끼 섭취 및 반응 관찰",
                        "bait_type": bait_type,
                        "lat": lat,
                        "lng": lng
                    })

    # 2. Process Ignored (Roe Deer)
    for src in ignored_sources:
        if not os.path.exists(src):
            continue
        for root, dirs, files in os.walk(src):
            for f in sorted(files):
                if f.lower().endswith(".mp4"):
                    full_p = os.path.join(root, f)
                    dest_p = os.path.join(VIDEOS_IGNORED_DIR, f)

                    if not os.path.exists(dest_p):
                        shutil.copy2(full_p, dest_p)

                    date_str, time_str = parse_timestamp_from_filename(f)
                    hour = int(time_str.split(":")[0])
                    is_night = (hour < 6 or hour >= 19)

                    cam_id, cam_site, bait_type, lat, lng = determine_camera_info(full_p, f)

                    thumb_name = f"{os.path.splitext(f)[0]}.jpg"
                    thumb_p = os.path.join(THUMBS_DIR, thumb_name)
                    if not os.path.exists(thumb_p):
                        extract_thumbnail(dest_p, thumb_p)

                    video_items.append({
                        "id": f"vid-ign-{f[:4] if f[:4].isdigit() else os.path.splitext(f)[0]}",
                        "filename": f,
                        "video_url": f"assets/videos/ignored/{f}",
                        "thumbnail_url": f"assets/thumbnails/{thumb_name}",
                        "camera_id": cam_id,
                        "site_name": cam_site,
                        "date": date_str,
                        "time": time_str,
                        "is_night": is_night,
                        "animal_type": "고라니 (Hydropotes inermis)",
                        "category": "제외 (비대상 동물)",
                        "reaction": "비대상 동물 (고라니 미끼 접근)",
                        "bait_type": bait_type,
                        "lat": lat,
                        "lng": lng
                    })

    # Sort by date + time descending
    video_items.sort(key=lambda x: f"{x['date']} {x['time']}", reverse=True)

    with open(VIDEOS_JSON, "w", encoding="utf-8") as f:
        json.dump(video_items, f, ensure_ascii=False, indent=2)

    print(f"✅ 총 {len(video_items)}개 선별 영상(멧돼지확정 {len([v for v in video_items if v['category']=='멧돼지확정'])}건) 동기화 완료!")


def calculate_raw_clip_stats():
    # Count all raw clips per camera
    print("📊 734개 원본 영상 날짜별·카메라별 실측 수집 통계 분석 중...")

    # Load cameras.json
    with open(CAMERAS_JSON, "r", encoding="utf-8") as f:
        cameras = json.load(f)

    # Count real files
    cam_counts = {
        "cam-gj-142-5": 0,
        "cam-gj-59-3": 0,
        "cam-gj-san135": 0,
        "cam-dg-1": 0
    }

    # Walk through Gongju
    gj_dir = os.path.join(SRC_BASE, "미끼백신 동영상 정리_공주시", "동영상")
    if os.path.exists(gj_dir):
        for root, dirs, files in os.walk(gj_dir):
            for f in files:
                if f.lower().endswith(".mp4"):
                    if "142-5" in root:
                        cam_counts["cam-gj-142-5"] += 1
                    elif "59-3" in root:
                        cam_counts["cam-gj-59-3"] += 1
                    elif "산135" in root or "공주먹이" in root:
                        cam_counts["cam-gj-san135"] += 1

    # Walk through Daegu
    dg_dir = os.path.join(SRC_BASE, "미끼백신 동영상 정리_대구시", "미끼대구")
    if os.path.exists(dg_dir):
        for root, dirs, files in os.walk(dg_dir):
            for f in files:
                if f.lower().endswith(".mp4"):
                    cam_counts["cam-dg-1"] += 1

    # Load wildboar_videos.json to count confirmed
    with open(VIDEOS_JSON, "r", encoding="utf-8") as f:
        videos = json.load(f)

    confirmed_counts = {
        "cam-gj-142-5": 0,
        "cam-gj-59-3": 0,
        "cam-gj-san135": 0,
        "cam-dg-1": 0
    }
    for v in videos:
        if v.get("category") == "멧돼지확정":
            cid = v.get("camera_id")
            if cid in confirmed_counts:
                confirmed_counts[cid] += 1

    for c in cameras:
        cid = c["id"]
        c["total_clips"] = cam_counts.get(cid, c["total_clips"])
        c["wildboar_confirmed"] = confirmed_counts.get(cid, c["wildboar_confirmed"])

    with open(CAMERAS_JSON, "w", encoding="utf-8") as f:
        json.dump(cameras, f, ensure_ascii=False, indent=2)

    print("✅ 카메라별 실측 통계 갱신 완료:")
    for c in cameras:
        print(f"  - {c['name']}: 총 영상 {c['total_clips']}건 (멧돼지 확정 {c['wildboar_confirmed']}건)")


if __name__ == "__main__":
    sync_curated_videos()
    calculate_raw_clip_stats()
