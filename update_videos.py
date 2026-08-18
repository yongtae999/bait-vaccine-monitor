#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Wild Boar Bait Vaccine Monitoring System
Automated Video & Metadata Synchronization Pipeline

Usage:
    python update_videos.py
    python update_videos.py --src "E:\\0. 2026년\\미끼백신관련"
"""

import os
import sys
import json
import shutil
import re
import argparse
from datetime import datetime

try:
    import cv2
except ImportError:
    cv2 = None

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
VIDEOS_DIR = os.path.join(ASSETS_DIR, "videos", "confirmed")
THUMBS_DIR = os.path.join(ASSETS_DIR, "thumbnails")
DATA_DIR = os.path.join(BASE_DIR, "data")
VIDEOS_JSON = os.path.join(DATA_DIR, "wildboar_videos.json")
CAMERAS_JSON = os.path.join(DATA_DIR, "cameras.json")

os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(THUMBS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


def parse_timestamp_from_filename(filename):
    """
    Extract YYYY-MM-DD and HH:MM:SS from filename like '0034_V20260805_211252000_...mp4'
    """
    m = re.search(r'V(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})', filename)
    if m:
        d_str = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        t_str = f"{m.group(4)}:{m.group(5)}:{m.group(6)}"
        return d_str, t_str
    return "2026-08-01", "12:00:00"


def determine_camera_id_and_site(filepath, filename):
    """
    Determine camera location based on path or folder keywords
    """
    fp_low = filepath.lower()
    fn_low = filename.lower()

    if "산135" in fp_low or "공주먹이" in fp_low:
        return "cam-gj-san135", "문금리 산135 (공주먹이)", "멧돼지미끼틀"
    elif "142-5" in fp_low:
        return "cam-gj-142-5", "문금리 142-5 (진입로)", "멧돼지미끼틀 + 유인제배합"
    elif "대구" in fp_low or "달성" in fp_low:
        return "cam-dg-1", "대구 달성 관제구역", "사료형 + 유인제틀"
    else:
        # Default Gongju 59-3
        return "cam-gj-59-3", "문금리 59-3 (집중 출몰)", "유인제배합 고형사료"


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


def run_sync(source_dir):
    print("=" * 65)
    print("🐗 야생 멧돼지 미끼백신 수집 영상 자동 동기화 파이프라인")
    print("=" * 65)
    print(f"📁 소스 디렉토리: {source_dir}")
    print(f"📁 대상 디렉토리: {VIDEOS_DIR}\n")

    if not os.path.exists(source_dir):
        print(f"❌ 오류: 소스 디렉토리를 찾을 수 없습니다: {source_dir}")
        return

    # Load existing json
    existing_videos = []
    if os.path.exists(VIDEOS_JSON):
        with open(VIDEOS_JSON, "r", encoding="utf-8") as f:
            existing_videos = json.load(f)

    existing_filenames = {v["filename"]: v for v in existing_videos}
    new_added_count = 0

    for root, dirs, files in os.walk(source_dir):
        for f in files:
            if f.lower().endswith(('.mp4', '.avi', '.mov')):
                src_file_path = os.path.join(root, f)
                dst_file_path = os.path.join(VIDEOS_DIR, f)
                thumb_file_name = os.path.splitext(f)[0] + ".jpg"
                thumb_file_path = os.path.join(THUMBS_DIR, thumb_file_name)

                # Copy video if not exists or updated
                if not os.path.exists(dst_file_path):
                    shutil.copy2(src_file_path, dst_file_path)
                    print(f"  [+] 신규 영상 복사: {f}")

                # Create thumbnail
                if not os.path.exists(thumb_file_path):
                    extract_thumbnail(dst_file_path, thumb_file_path)

                if f not in existing_filenames:
                    date_str, time_str = parse_timestamp_from_filename(f)
                    hour = int(time_str.split(':')[0])
                    is_night = (hour >= 19 or hour <= 6)
                    cam_id, site_name, bait_type = determine_camera_id_and_site(src_file_path, f)

                    new_entry = {
                        "id": f"vid-{len(existing_videos) + 1:04d}",
                        "filename": f,
                        "rel_path": f"assets/videos/confirmed/{f}",
                        "thumbnail": f"assets/thumbnails/{thumb_file_name}" if os.path.exists(thumb_file_path) else "",
                        "camera_id": cam_id,
                        "site_name": site_name,
                        "recorded_date": date_str,
                        "recorded_time": time_str,
                        "is_night": is_night,
                        "category": "멧돼지확정",
                        "animal_type": "야생 멧돼지 (Sus scrofa)",
                        "reaction": "야간 미끼 반응 관찰" if is_night else "주간 미끼 반응 관찰",
                        "file_size_mb": round(os.path.getsize(dst_file_path) / (1024 * 1024), 2)
                    }

                    existing_videos.append(new_entry)
                    existing_filenames[f] = new_entry
                    new_added_count += 1
                    print(f"  [✓] 메타데이터 등록: {f} ({date_str} {time_str})")

    # Sort videos by date/time descending
    existing_videos.sort(key=lambda x: (x.get("recorded_date", ""), x.get("recorded_time", "")), reverse=True)

    # Save wildboar_videos.json
    with open(VIDEOS_JSON, "w", encoding="utf-8") as f:
        json.dump(existing_videos, f, ensure_ascii=False, indent=2)

    print("\n" + "-" * 65)
    print(f"🎉 동기화 완료! (신규 등록: {new_added_count}건 / 전체 등록: {len(existing_videos)}건)")
    print(f"📄 갱신된 파일: {VIDEOS_JSON}")
    print("-" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Wild Boar Video Synchronization Tool")
    parser.add_argument("--src", type=str, default=r"E:\0. 2026년\미끼백신관련", help="Source directory containing video clips")
    args = parser.parse_args()

    # Fallback to local confirmed folder if E: is not plugged in
    target_src = args.src
    if not os.path.exists(target_src):
        target_src = VIDEOS_DIR

    run_sync(target_src)
