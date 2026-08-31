import os
import sys
import subprocess
import imageio_ffmpeg

sys.stdout.reconfigure(encoding='utf-8')

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print("FFmpeg:", ffmpeg_exe)

target_dirs = [
    r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor\assets\videos\confirmed",
    r"C:\Users\Owner\.gemini\antigravity\scratch\bait-vaccine-monitor\assets\videos\ignored"
]

converted_cnt = 0

for vdir in target_dirs:
    if not os.path.exists(vdir):
        continue
    for f in os.listdir(vdir):
        if f.endswith(".mp4"):
            fp = os.path.join(vdir, f)
            temp_fp = os.path.join(vdir, "temp_" + f)
            
            cmd = [
                ffmpeg_exe, "-y",
                "-i", fp,
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-preset", "fast",
                "-crf", "22",
                "-movflags", "+faststart",
                temp_fp
            ]
            
            res = subprocess.run(cmd, capture_output=True)
            if res.returncode == 0 and os.path.exists(temp_fp) and os.path.getsize(temp_fp) > 0:
                os.remove(fp)
                os.rename(temp_fp, fp)
                converted_cnt += 1
                print(f"[OK] Converted: {f} ({os.path.getsize(fp)/1024:.1f} KB)")
            else:
                if os.path.exists(temp_fp):
                    os.remove(temp_fp)
                print(f"[ERR] Failed: {f}")

print(f"\nAll {converted_cnt} videos are now 100% Web H.264 compatible!")
