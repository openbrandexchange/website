"""Print the scene and line frames for a locale (mirrors src/timeline.ts), to pick stills."""
import json, math, sys
FPS = 30
BEATS = [("problem", ["problem"], 7.0, 0), ("portal", ["portal", "buyers"], 0, 0.5), ("api", ["api"], 0, 0.6),
         ("label", ["label", "labelLaw"], 0, 0.6), ("luggage", ["luggage"], 0, 0.5), ("rights", ["rights"], 0, 0.4),
         ("open", ["open", "foundation"], 0, 0.5), ("end", ["cta"], 5.4, 0)]
lead, gap, tail = 0.3, 0.25, 0.4
d = json.load(open(f"public/voice/{sys.argv[1]}/durations.json"))
cursor = 0
for bid, lines, mins, extra in BEATS:
    at = 0.7 if bid == "problem" else lead
    out = []
    for l in lines:
        out.append(f"{l}@{round((cursor + at) * FPS)}")
        at += d[l] + gap
    secs = max(mins, at - gap + tail + extra)
    print(f"{bid:8} from {round(cursor*FPS):5} frames {round(secs*FPS):4}  {' '.join(out)}")
    cursor += secs
print(f"total {cursor:.2f}s {round(cursor*FPS)} frames")
