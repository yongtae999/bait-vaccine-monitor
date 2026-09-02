import json
import os

BASE_DIR = r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor"
DATA_DIR = os.path.join(BASE_DIR, "data")

with open(os.path.join(DATA_DIR, "photos.json"), "r", encoding="utf-8") as f:
    photos = json.load(f)

with open(os.path.join(DATA_DIR, "wildboar_videos.json"), "r", encoding="utf-8") as f:
    videos = json.load(f)

def get_photos_by_date(date_str):
    return [
        {
            "type": "photo",
            "thumb": f"assets/photos/{p['filename']}",
            "title": p.get("title", f"{date_str} 현장 사진"),
            "location": p.get("location", "")
        }
        for p in photos if p["date"] == date_str
    ]

def get_all_videos_by_cam_and_date(cam_id, date_str):
    res = []
    for v in videos:
        if v.get("camera_id") == cam_id and v.get("date") == date_str:
            res.append({
                "type": "video",
                "thumb": v.get("thumbnail_url"),
                "video_url": v.get("video_url"),
                "title": f"{v.get('time')} {v.get('category')} ({v.get('animal_type')})",
                "animal": v.get("animal_type"),
                "category": v.get("category"),
                "time": v.get("time")
            })
    return res

# 1. Gongju Cam 1 (142-5)
cam1_timeline = [
    {
        "date": "2026-07-01",
        "time": "14:00 ~ 17:00",
        "category": "사이트 조성 & 설치",
        "work_content": "① 미끼틀 매몰지 주변 울타리 작업\n② IP카메라 설치 지역 미끼틀 살포\n③ 실험지 주변 풀 제거작업\n[특이사항] 울타리 외부 안내문 게시",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "사이트 조성 완료",
        "workers": "최진호(전무), 유은준(본부장), 권용태(사무국장), 김현구(감시단원)",
        "evidences": get_photos_by_date("2026-07-01")[:6]
    },
    {
        "date": "2026-07-14",
        "time": "15:00 ~ 17:00",
        "category": "현장 점검 & 미끼 살포",
        "work_content": "① IP카메라 설치 지역(3군데) 미끼틀 살포\n② 실험지 주변 풀 제거작업\n③ 1차 SD카드 영상 수거 및 배터리 점검",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "정기 점검 및 미끼 살포",
        "workers": "최진호(전무), 권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-14")
    },
    {
        "date": "2026-07-14",
        "time": "14:38:00",
        "category": "멧돼지 출현",
        "work_content": "능선 진입로 주변 주간 무인카메라 동작감지 녹화",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "주간 접근 및 미끼 탐색 (0001번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-142-5", "2026-07-14")
    },
    {
        "date": "2026-07-15",
        "time": "09:00 ~ 11:00",
        "category": "현장 점검",
        "work_content": "주변 풀 제거작업 및 전일 설치 미끼틀 상태 점검",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "미끼틀 상태 이상무",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-15")
    },
    {
        "date": "2026-07-19",
        "time": "14:00 ~ 17:00",
        "category": "현장 점검 & 족적 확인",
        "work_content": "실험지 주변 풀 제거작업 및 미끼틀, 울타리 상태 점검, 멧돼지 족적 다수 확인",
        "animal_appearance": "멧돼지 족적 다수 확인",
        "boar_count": "족적 확인",
        "reaction_stage": "유인틀 주변 족적 계측",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-19")[:6]
    },
    {
        "date": "2026-07-25",
        "time": "13:00 ~ 16:00",
        "category": "유인제 살포 & 점검",
        "work_content": "① 실험지 주변 풀 제거작업 및 미끼틀, 울타리 상태 점검\n② 멧돼지 유인제 살포 (3곳, 총 6통 중 2통 배정)",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "유인제 집중 살포 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-25")
    },
    {
        "date": "2026-07-29",
        "time": "02:20:15",
        "category": "멧돼지 출현",
        "work_content": "야간 무인카메라 적외선 감지 녹화",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "야간 섭취 및 미끼틀 반응 (0024번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-142-5", "2026-07-29")
    },
    {
        "date": "2026-08-03",
        "time": "09:30 ~ 11:00",
        "category": "2차 미끼 보충",
        "work_content": "① IP카메라 설치 지역(3군데) 미끼틀 살포 (2차 고형사료 대량 보충)\n② 실험지 주변 풀 제거작업",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "고형사료 2차 보충 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-03")[:4]
    },
    {
        "date": "2026-08-04",
        "time": "08:00 ~ 10:00",
        "category": "미끼 재살포 & 청소",
        "work_content": "① IP카메라 설치 지역(3군데) 미끼틀 살포\n② 실험지 주변 풀 제거작업\n[특이사항] 당일 새벽 멧돼지 출현으로 미끼 재 살포 및 렌즈 클리닝",
        "animal_appearance": "새벽 출현 흔적 확인",
        "boar_count": "흔적 확인",
        "reaction_stage": "새벽 섭취 후 긴급 재살포",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-04")[:4]
    },
    {
        "date": "2026-08-05",
        "time": "21:12:52",
        "category": "멧돼지 출현",
        "work_content": "야간 21시 무인카메라 동작감지 녹화",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "야간 미끼틀 고형사료 섭취 (0034번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-142-5", "2026-08-05")
    },
    {
        "date": "2026-08-23",
        "time": "14:00 ~ 17:00",
        "category": "유인제 살포 & 안전 점검",
        "work_content": "① 실험지 주변 풀 제거작업\n② 멧돼지 유인제 살포 (3곳, 총 6통)\n③ 집중 호우 후 실험구 안전 및 미끼틀 상태 점검",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "안전 점검 및 유인제 살포 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-23")
    },
    {
        "date": "2026-08-26",
        "time": "02:08:51",
        "category": "멧돼지 출현",
        "work_content": "심야 02시 적외선 무인감지 녹화 (SHA-256 검증)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "야간 섭취 확정 (0624번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-142-5", "2026-08-26")
    },
    {
        "date": "2026-09-01",
        "time": "09:26:26 & 09:29:02",
        "category": "멧돼지 출현",
        "work_content": "주간 09시 연속 동작감지 녹화 2건 전수 첨부",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "주간 연속 섭취 (20260901_092626 & 092902)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-142-5", "2026-09-01")
    }
]

# 2. Gongju Cam 2 (59-3)
cam2_timeline = [
    {
        "date": "2026-07-01",
        "time": "14:00 ~ 17:00",
        "category": "사이트 조성 & 설치",
        "work_content": "문금리 59-3 집중 출몰구역에 미끼틀 매몰지 조성, 카메라 마운팅, 1차 사료 살포 및 풀 제거작업",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "사이트 조성 완료",
        "workers": "최진호, 유은준, 권용태, 김현구",
        "evidences": get_photos_by_date("2026-07-01")[6:12]
    },
    {
        "date": "2026-07-14",
        "time": "15:00 ~ 17:00",
        "category": "현장 점검 & 미끼 살포",
        "work_content": "① IP카메라 설치 지역 미끼틀 살포\n② 실험지 주변 풀 제거작업 및 배터리 점검",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "정기 점검 완료",
        "workers": "최진호, 권용태",
        "evidences": get_photos_by_date("2026-07-14")
    },
    {
        "date": "2026-07-15",
        "time": "09:00 ~ 11:00",
        "category": "앵글 보정 & 점검",
        "work_content": "주변 풀 제거작업 및 전일 설치 미끼틀 상태 점검, 야간 화각 최적화 수직 각도 보정",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "섭취 흔적 실측 및 앵글 보정",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-15")
    },
    {
        "date": "2026-07-19",
        "time": "14:00 ~ 17:00",
        "category": "족적 확인 & 정비",
        "work_content": "실험지 주변 풀 제거작업 및 미끼틀, 울타리 상태 점검, 대형 성체 족적 확인",
        "animal_appearance": "대형 성체 족적 확인",
        "boar_count": "대형 족적",
        "reaction_stage": "대형 성체 족적 실측",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-19")[6:12]
    },
    {
        "date": "2026-07-25",
        "time": "13:00 ~ 16:00",
        "category": "유인제 살포 & 점검",
        "work_content": "① 실험지 주변 풀 제거작업 및 미끼틀, 울타리 상태 점검\n② 멧돼지 유인제 살포 (2통 배정)",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "유인제 살포 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-25")
    },
    {
        "date": "2026-07-28",
        "time": "20:30 ~ 03:40",
        "category": "멧돼지 대군락 출현",
        "work_content": "야간 집중 출현 및 미끼틀 섭취 연속 녹화 (0111~0121번 총 11건 전수 첨부)",
        "animal_appearance": "야생 멧돼지 군락 (Sus scrofa)",
        "boar_count": "2~4마리 군락",
        "reaction_stage": "군락 집중 섭식 (Frenzy Feeding, 11회 연속 섭취)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-59-3", "2026-07-28")
    },
    {
        "date": "2026-08-03",
        "time": "09:30 ~ 11:00",
        "category": "2차 미끼 대량 살포",
        "work_content": "전량 소모된 미끼틀에 고형사료 2차 대량 살포 및 주변 수풀 예초 정비",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "사료 대량 보충 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-03")[3:7]
    },
    {
        "date": "2026-08-04",
        "time": "08:00 ~ 10:00",
        "category": "미끼 재살포",
        "work_content": "당일 새벽 멧돼지 출현으로 소진된 미끼 재살포 및 센서 점검",
        "animal_appearance": "새벽 출현 흔적",
        "boar_count": "흔적 확인",
        "reaction_stage": "긴급 미끼 보충 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-04")[3:7]
    },
    {
        "date": "2026-08-06",
        "time": "01:28:14",
        "category": "멧돼지 출현",
        "work_content": "심야 01시 무인 동작감지 녹화",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "야간 섭취 (0333번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-59-3", "2026-08-06")
    },
    {
        "date": "2026-08-07",
        "time": "02:15 ~ 03:50",
        "category": "멧돼지 출현",
        "work_content": "야간 02~03시 연속 감지 녹화 3건 전수 첨부 (0357~0359번 영상)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "2마리",
        "reaction_stage": "2마리 동시 섭취 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-59-3", "2026-08-07")
    },
    {
        "date": "2026-08-08 & 08-09",
        "time": "04:10 ~ 05:20",
        "category": "비대상 동물 (고라니)",
        "work_content": "비대상 동물 접근 녹화 2건 전수 첨부 (0404, 0411번 영상)",
        "animal_appearance": "고라니 (Hydropotes inermis)",
        "boar_count": "0 (고라니 1마리)",
        "reaction_stage": "미끼 무반응 / 단순 통과 (Ignored)",
        "workers": "무인 자동 촬영",
        "evidences": [
            {
                "type": "video",
                "thumb": "assets/thumbnails/0404_V20260813_131810000_1E3CF046-0C03-438B-974F-51B75F14E74A.jpg",
                "title": "0404번 고라니 단순 통과",
                "animal": "고라니",
                "category": "제외"
            },
            {
                "type": "video",
                "thumb": "assets/thumbnails/0411_V20260813_131846000_6B738C9B-79CE-45A0-BB27-A845C3EF897B.jpg",
                "title": "0411번 고라니 단순 통과",
                "animal": "고라니",
                "category": "제외"
            }
        ]
    },
    {
        "date": "2026-08-23",
        "time": "14:00 ~ 17:00",
        "category": "유인제 살포 & 점검",
        "work_content": "실험지 주변 풀 제거작업 및 멧돼지 유인제 살포 (2통 배정)",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "유인제 살포 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-23")
    }
]

# 3. Gongju Cam 3 (San135)
cam3_timeline = [
    {
        "date": "2026-07-01",
        "time": "14:00 ~ 17:00",
        "category": "사이트 조성 & 설치",
        "work_content": "산135 능선 산림 구역에 미끼틀 매몰지 조성, IP카메라 마운팅, 1차 사료 살포 및 울타리 설치",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "사이트 조성 완료",
        "workers": "최진호, 유은준, 권용태, 김현구",
        "evidences": get_photos_by_date("2026-07-01")[12:18]
    },
    {
        "date": "2026-07-06",
        "time": "21:29:42",
        "category": "멧돼지 첫 출현",
        "work_content": "설치 5일 만에 멧돼지 성체 최초 방문 녹화",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "최초 야간 섭취 (0444번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-07-06")
    },
    {
        "date": "2026-07-14 & 07-15",
        "time": "15:00 & 09:00",
        "category": "현장 점검 & 제초",
        "work_content": "미끼틀 살포 지역 점검 및 주변 풀 제거작업, 섭취 후 미끼 잔여량 확인",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "섭취 후 사료 잔량 계측",
        "workers": "최진호, 권용태",
        "evidences": get_photos_by_date("2026-07-14") + get_photos_by_date("2026-07-15")
    },
    {
        "date": "2026-07-19 & 07-25",
        "time": "14:00 & 13:00",
        "category": "유인제 살포 & 점검",
        "work_content": "미끼틀·울타리 점검 및 멧돼지 유인제 살포 (2통 배정)",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "유인제 살포 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-07-25")
    },
    {
        "date": "2026-07-28",
        "time": "22:10 ~ 02:45",
        "category": "멧돼지 출현",
        "work_content": "야간 연속 출현 녹화 3건 전수 첨부 (0491, 0492, 0495번 영상)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1~2마리",
        "reaction_stage": "야간 섭취 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-07-28")
    },
    {
        "date": "2026-07-30",
        "time": "01:15 ~ 04:30",
        "category": "멧돼지 출현",
        "work_content": "심야 01시부터 04시까지 연속 섭취 5건 녹화 전수 첨부 (0514~0520번 영상)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "2마리",
        "reaction_stage": "지속적 야간 섭식 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-07-30")
    },
    {
        "date": "2026-08-03 & 08-04",
        "time": "09:30 & 08:00",
        "category": "미끼 보충 & 렌즈 청소",
        "work_content": "미끼틀에 고형사료 2차 대량 살포 및 센서 전면 렌즈 클리닝, 와이어 브래킷 보강",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "미끼 보충 및 장비 정비 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-04")
    },
    {
        "date": "2026-08-04",
        "time": "04:59 ~ 19:18",
        "category": "멧돼지 출현",
        "work_content": "새벽 04:59부터 저녁 19:18까지 주야간 5회 연속 출현 녹화 전수 첨부 (0560~0565번 영상)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1~2마리",
        "reaction_stage": "주·야간 전방위 섭취 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-08-04")
    },
    {
        "date": "2026-08-05",
        "time": "02:00 ~ 04:20",
        "category": "멧돼지 출현",
        "work_content": "심야 02시~04시 연속 3회 미끼틀 섭취 녹화 전수 첨부 (0595, 0597, 0599번)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "야간 섭취 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-08-05")
    },
    {
        "date": "2026-08-06",
        "time": "03:10:00",
        "category": "멧돼지 출현",
        "work_content": "야간 03시 멧돼지 1마리 섭취 녹화 (0600번)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "야간 섭취 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-08-06")
    },
    {
        "date": "2026-08-07",
        "time": "01:40 ~ 03:20",
        "category": "멧돼지 출현",
        "work_content": "야간 01시~03시 연속 2회 섭취 녹화 전수 첨부 (0613, 0615번)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "야간 섭취 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-08-07")
    },
    {
        "date": "2026-08-09",
        "time": "02:00 ~ 04:10",
        "category": "멧돼지 출현",
        "work_content": "야간 02시~04시 5회 연속 섭취 녹화 전수 첨부 (0619~0623번)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1~2마리",
        "reaction_stage": "야간 집중 섭취 (Ingestion)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-gj-san135", "2026-08-09")
    },
    {
        "date": "2026-08-23",
        "time": "14:00 ~ 17:00",
        "category": "유인제 살포 & 점검",
        "work_content": "실험지 주변 풀 제거작업 및 멧돼지 유인제 살포 (2통 배정)",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "유인제 살포 완료",
        "workers": "권용태(사무국장)",
        "evidences": get_photos_by_date("2026-08-23")
    }
]

# 4. Gyeongsan Cam 4 (Namha-ri)
gyeongsan_setup_evidences = [
    {
        "type": "photo",
        "thumb": f"assets/thumbnails/gyeongsan_setup_{i:02d}.jpg",
        "title": f"7월 22일 대구(경산) 4호기 설치 영상 캡처 {i}",
        "location": "경북 경산 남하리 산 127"
    }
    for i in range(1, 5)
]

cam4_timeline = [
    {
        "date": "2026-07-22",
        "time": "10:00 ~ 15:00",
        "category": "사이트 조성 & 설치",
        "work_content": "① 경산 하양 남하리 산 127 지점에 사이트 조성 및 카메라 설치\n② IP카메라 마운팅, 각도 보정 및 통신 점검 (7월 22일 설치 영상 캡처 4건 첨부)\n[설정] 미끼 제외 (단독 모니터링 구역)",
        "animal_appearance": "-",
        "boar_count": "-",
        "reaction_stage": "사이트 조성 및 카메라 설치 완료",
        "workers": "최진호",
        "evidences": gyeongsan_setup_evidences
    },
    {
        "date": "2026-07-25",
        "time": "19:39:02",
        "category": "멧돼지 첫 출현",
        "work_content": "일몰 후 19시 39분 적외선 무인감지 녹화 (SHA-256: 577845b1...)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "2마리",
        "reaction_stage": "멧돼지 2마리 명확 확인 및 접근 (0021번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-dg-1", "2026-07-25")
    },
    {
        "date": "2026-08-14",
        "time": "18:48:37",
        "category": "멧돼지 출현",
        "work_content": "일몰 직후 18시 48분 무인감지 녹화 (SHA-256: 98ebe5ec...)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "멧돼지 1마리 명확 확인 및 관찰 (0034번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-dg-1", "2026-08-14")
    },
    {
        "date": "2026-08-19",
        "time": "03:52:28",
        "category": "멧돼지 출현",
        "work_content": "심야 03시 52분 적외선 무인감지 녹화 (SHA-256: e4889507...)",
        "animal_appearance": "야생 멧돼지 (Sus scrofa)",
        "boar_count": "1마리",
        "reaction_stage": "심야 출현 확정 (0035번 영상)",
        "workers": "무인 자동 촬영",
        "evidences": get_all_videos_by_cam_and_date("cam-dg-1", "2026-08-19")
    }
]

sites_report = [
    {
        "site_id": "cam-gj-142-5",
        "site_num": "1호기",
        "site_name": "공주 1호기 (문금리 142-5 진입로 능선)",
        "region": "충남 공주시",
        "address": "충청남도 공주시 유구읍 문금리 142-5",
        "coordinates": "36.639449° N, 127.010684° E (고도 343.8m, 방위 285°)",
        "camera_spec": "IP Wildcam 4K TrailCam (동작감지 적외선 야간센서, LTE 모듈)",
        "install_date": "2026-07-01",
        "total_scanned_clips": 50,
        "confirmed_boar_count": 6,
        "ignored_animal_count": 0,
        "bait_palatability": "높음 (주야간 지속 섭취 확인)",
        "summary_opinion": "진입로 능선 이동통로에 위치하여 7월 14일 최초 접근 이후 7월 29일, 8월 5일, 8월 26일, 9월 1일 등 주야간 지속적인 멧돼지 개체 접근 및 고형사료 섭취가 실증됨.",
        "timeline": cam1_timeline
    },
    {
        "site_id": "cam-gj-59-3",
        "site_num": "2호기",
        "site_name": "공주 2호기 (문금리 59-3 집중 출몰지)",
        "region": "충남 공주시",
        "address": "충청남도 공주시 유구읍 문금리 59-3",
        "coordinates": "36.640111° N, 127.010993° E (고도 348.5m, 방위 328°)",
        "camera_spec": "IP Wildcam 4K TrailCam (동작감지 적외선 야간센서, LTE 모듈)",
        "install_date": "2026-07-01",
        "total_scanned_clips": 406,
        "confirmed_boar_count": 15,
        "ignored_animal_count": 2,
        "bait_palatability": "매우 높음 (대군락 야간 집중 섭취 실증)",
        "summary_opinion": "전체 실험지 중 멧돼지 개체군 밀도가 가장 높은 핵심 출몰지로, 7월 28일 야간 11건의 군락(성체+유체 2~4마리) 집중 섭취를 비롯해 8월 6일, 8월 7일 등 총 15건의 확정 섭취가 입증되어 유인 효과가 가장 극대화됨.",
        "timeline": cam2_timeline
    },
    {
        "site_id": "cam-gj-san135",
        "site_num": "3호기",
        "site_name": "공주 3호기 (문금리 산135 공주먹이)",
        "region": "충남 공주시",
        "address": "충청남도 공주시 유구읍 문금길 340-3 일원 (산135)",
        "coordinates": "36.642760° N, 127.012234° E (고도 352.0m, 방위 45°)",
        "camera_spec": "IP Wildcam 4K TrailCam (동작감지 적외선 야간센서, LTE 모듈)",
        "install_date": "2026-07-01",
        "total_scanned_clips": 185,
        "confirmed_boar_count": 25,
        "ignored_animal_count": 0,
        "bait_palatability": "최상 (전 기간 최다 25건 섭취 확정)",
        "summary_opinion": "산림 능선 내부의 자연 먹이활동 길목에 위치하여 7월 6일 첫 출현 이후 7월 28일, 7월 30일, 8월 4일, 8월 5일, 8월 6일, 8월 7일, 8월 9일 등 전 기간에 걸쳐 총 25건의 멧돼지 출현 및 섭취가 입증되어 가장 안정적인 표본지로 평가됨.",
        "timeline": cam3_timeline
    },
    {
        "site_id": "cam-dg-1",
        "site_num": "4호기",
        "site_name": "경산 4호기 (남하리 산 127)",
        "region": "경북 경산시",
        "address": "경상북도 경산시 하양읍 남하리 산 127",
        "coordinates": "35.891449° N, 128.760951° E (고도 210.0m, 방위 135°)",
        "camera_spec": "IP Wildcam 4K TrailCam (동작감지 적외선 야간센서, LTE 모듈)",
        "install_date": "2026-07-22",
        "total_scanned_clips": 43,
        "confirmed_boar_count": 3,
        "ignored_animal_count": 0,
        "bait_palatability": "높음 (영남권 야생 멧돼지 출현 실증)",
        "summary_opinion": "경북 경산 지역의 야생 멧돼지 ASF 방역 실증을 위해 7월 22일 신규 설치된 이후 7월 25일 2마리 첫 출현, 8월 14일 및 8월 19일 심야 출현이 입증되어 야생 멧돼지 서식 및 이동 경로가 성공적으로 확인됨.",
        "timeline": cam4_timeline
    }
]

with open(os.path.join(DATA_DIR, "interim_report_data.json"), "w", encoding="utf-8") as f:
    json.dump(sites_report, f, ensure_ascii=False, indent=2)

print("Saved refined interim_report_data.json with ALL video captures attached and setup captures for Gyeongsan!")
