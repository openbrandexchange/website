"""Render the voice-over lines with ElevenLabs.

  python3 scripts/voiceover.py src/copy/en.json public/voice/en --language en [--voice ID] [--speed 1.0] [--only id,id]

Reads ELEVENLABS_API_KEY from the environment (never written anywhere). Writes one mp3 per
line plus durations.json, which the composition reads to place every line, and appends the
character cost to .drafts/cost-log.jsonl. --only re-renders a few lines and keeps the rest.
"""

import argparse
import json
import os
import subprocess
import time
import urllib.error
import urllib.request

MODEL = "eleven_v4"
# Pro plan: $99 for 500k characters.
USD_PER_CHARACTER = 99 / 500_000
LOG = os.path.join(os.path.dirname(__file__), "..", ".drafts", "cost-log.jsonl")
# Calm, even narration: steadier and less stylised than a promo read.
SETTINGS = {"stability": 0.55, "similarity_boost": 0.75, "style": 0.1, "use_speaker_boost": True}
# One voice per language, each a native speaker: a calm British broadcaster and a calm Dutch narrator.
VOICES = {"en": "onwK4e9ZLuTAKqWW03F9", "nl": "h6uBOiAjLKklte8hdYio"}


def synthesize(text, voice, language, speed, out, previous, following):
    body = {
        "text": text,
        "model_id": MODEL,
        "language_code": language,
        "voice_settings": {**SETTINGS, "speed": speed},
        "previous_text": previous,
        "next_text": following,
    }
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": os.environ["ELEVENLABS_API_KEY"]},
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response, open(out, "wb") as handle:
            handle.write(response.read())
    except urllib.error.HTTPError as error:
        raise SystemExit(f"HTTP {error.code}: {error.read().decode()[:1000]}")


def seconds(path):
    """Where the speech ends: the file length minus the silence ElevenLabs leaves at the end."""
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True,
        text=True,
    ).stdout
    total = float(output.strip())
    log = subprocess.run(
        ["ffmpeg", "-i", path, "-af", "silencedetect=noise=-45dB:d=0.2", "-f", "null", "-"],
        capture_output=True,
        text=True,
    ).stderr
    starts = [float(x.split("silence_start: ")[1].split()[0]) for x in log.splitlines() if "silence_start: " in x]
    ends = [float(x.split("silence_end: ")[1].split()[0]) for x in log.splitlines() if "silence_end: " in x]
    if starts and ends and len(starts) == len(ends) and ends[-1] >= total - 0.05:
        return round(starts[-1] + 0.1, 3)
    return total


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("copy")
    parser.add_argument("outdir")
    parser.add_argument("--language", required=True)
    parser.add_argument("--voice")
    parser.add_argument("--speed", type=float, default=1.12)
    parser.add_argument("--only", default="")
    args = parser.parse_args()
    voice = args.voice or VOICES[args.language]
    only = {x for x in args.only.split(",") if x}
    with open(args.copy) as handle:
        lines = json.load(handle)["voice"]
    os.makedirs(args.outdir, exist_ok=True)
    path = os.path.join(args.outdir, "durations.json")
    durations = json.load(open(path)) if only and os.path.exists(path) else {}
    characters = 0
    for index, line in enumerate(lines):
        if only and line["id"] not in only:
            continue
        out = os.path.join(args.outdir, f"{line['id']}.mp3")
        previous = lines[index - 1]["text"] if index else ""
        following = lines[index + 1]["text"] if index + 1 < len(lines) else ""
        synthesize(line["text"], voice, args.language, args.speed, out, previous, following)
        durations[line["id"]] = round(seconds(out), 3)
        characters += len(line["text"])
    durations = {line["id"]: durations[line["id"]] for line in lines if line["id"] in durations}
    with open(path, "w") as handle:
        json.dump(durations, handle, indent=2)
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    entry = {
        "at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "kind": "voice",
        "out": args.outdir,
        "model": MODEL,
        "voice": voice,
        "language": args.language,
        "speed": args.speed,
        "characters": characters,
        "usd": round(characters * USD_PER_CHARACTER, 4),
    }
    with open(LOG, "a") as handle:
        handle.write(json.dumps(entry) + "\n")
    print(json.dumps(entry), json.dumps(durations))


if __name__ == "__main__":
    main()
