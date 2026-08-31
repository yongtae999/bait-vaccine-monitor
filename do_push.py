import subprocess
import sys
import time

log_file = "push_log.txt"
with open(log_file, "w", encoding="utf-8") as f:
    f.write("Starting git push...\n")

cmd = ["git", "push", "--progress", "origin", "main"]
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)

with open(log_file, "a", encoding="utf-8") as f:
    for line in proc.stdout:
        f.write(line)
        f.flush()

proc.wait()
with open(log_file, "a", encoding="utf-8") as f:
    f.write(f"\nFinished with code {proc.returncode}\n")

print(f"Push finished with code {proc.returncode}")
