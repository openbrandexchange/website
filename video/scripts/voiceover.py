"""Render the voice-over lines with ElevenLabs.

  python3 scripts/voiceover.py src/copy/en.json public/voice/en --language en [--voice ID] [--speed 1.0] [--only id,id]
  python3 scripts/voiceover.py src/v2/copy/en.json public/voice-v2/en --language en --timestamps --voice ID --speed 1.0 [--tempo 1.06]

--timestamps (v2) asks ElevenLabs for the character alignment as well: it writes <id>.json with the
alignment, takes the end of the speech from it, and writes chunks.json with the start (in seconds,
from the start of the line) of every caption chunk. A v2 line has a "caption" with "|" between the
chunks and "*" around the words shown in the accent colour, and optionally a "text" (the same, but
spelled for the voice, e.g. "E.A.N."), with the same number of chunks.

Reads ELEVENLABS_API_KEY from the environment (never written anywhere). Writes one mp3 per
line plus durations.json, which the composition reads to place every line, and appends the
character cost to .drafts/cost-log.jsonl. --tempo plays every line a little faster afterwards (ffmpeg
atempo, pitch kept; eleven_v4 barely follows --speed) and scales the alignment to match. --only re-renders a few lines and keeps the rest.
"""

import argparse
import base64
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


def spoken(line):
    """The text the voice reads, and where each caption chunk starts in it (character index)."""
    raw = line.get("text") or line["caption"]
    chunks = [part.strip() for part in raw.replace("*", "").split("|")]
    starts, at = [], 0
    for chunk in chunks:
        starts.append(at)
        at += len(chunk) + 1
    return " ".join(chunks), starts


def synthesize(text, voice, language, speed, out, previous, following, timestamps=False):
    body = {
        "text": text,
        "model_id": MODEL,
        "language_code": language,
        "voice_settings": {**SETTINGS, "speed": speed},
        "previous_text": previous,
        "next_text": following,
    }
    endpoint = "/with-timestamps" if timestamps else ""
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}{endpoint}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": os.environ["ELEVENLABS_API_KEY"]},
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            data = response.read()
        if timestamps:
            result = json.loads(data)
            with open(out, "wb") as handle:
                handle.write(base64.b64decode(result["audio_base64"]))
            return result["alignment"]
        with open(out, "wb") as handle:
            handle.write(data)
    except urllib.error.HTTPError as error:
        raise SystemExit(f"HTTP {error.code}: {error.read().decode()[:1000]}")


def retime(path, tempo, alignment):
    """Play a line `tempo` times faster (same pitch) and scale its alignment to match."""
    temp = path + ".tmp.mp3"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-filter:a", f"atempo={tempo}", "-c:a", "libmp3lame", "-b:a", "128k", temp],
        check=True,
    )
    os.replace(temp, path)
    if alignment:
        for key in ("character_start_times_seconds", "character_end_times_seconds"):
            alignment[key] = [round(t / tempo, 3) for t in alignment[key]]
    return alignment


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
    parser.add_argument("--timestamps", action="store_true")
    parser.add_argument("--tempo", type=float, default=1.0)
    args = parser.parse_args()
    voice = args.voice or VOICES[args.language]
    only = {x for x in args.only.split(",") if x}
    with open(args.copy) as handle:
        lines = json.load(handle)["voice"]
    os.makedirs(args.outdir, exist_ok=True)
    path = os.path.join(args.outdir, "durations.json")
    durations = json.load(open(path)) if only and os.path.exists(path) else {}
    chunks_path = os.path.join(args.outdir, "chunks.json")
    chunks = json.load(open(chunks_path)) if only and os.path.exists(chunks_path) else {}
    say = (lambda line: spoken(line)[0]) if args.timestamps else (lambda line: line["text"])
    characters = 0
    for index, line in enumerate(lines):
        if only and line["id"] not in only:
            continue
        out = os.path.join(args.outdir, f"{line['id']}.mp3")
        previous = say(lines[index - 1]) if index else ""
        following = say(lines[index + 1]) if index + 1 < len(lines) else ""
        alignment = synthesize(say(line), voice, args.language, args.speed, out, previous, following, args.timestamps)
        if args.tempo != 1.0:
            alignment = retime(out, args.tempo, alignment)
        durations[line["id"]] = round(seconds(out), 3)
        if alignment:
            with open(os.path.join(args.outdir, f"{line['id']}.json"), "w") as handle:
                json.dump(alignment, handle)
            # The alignment's last character runs to the end of the file, so the speech end stays
            # the silence-detected one above.
            begins = alignment["character_start_times_seconds"]
            chunks[line["id"]] = [round(begins[i] if i < len(begins) else 0, 3) for i in spoken(line)[1]]
            chunks[line["id"]][0] = 0
        characters += len(say(line))
    durations = {line["id"]: durations[line["id"]] for line in lines if line["id"] in durations}
    with open(path, "w") as handle:
        json.dump(durations, handle, indent=2)
    if args.timestamps:
        chunks = {line["id"]: chunks[line["id"]] for line in lines if line["id"] in chunks}
        with open(chunks_path, "w") as handle:
            json.dump(chunks, handle, indent=2)
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    entry = {
        "at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "kind": "voice",
        "out": args.outdir,
        "model": MODEL,
        "voice": voice,
        "language": args.language,
        "speed": args.speed,
        "tempo": args.tempo,
        "characters": characters,
        "usd": round(characters * USD_PER_CHARACTER, 4),
    }
    with open(LOG, "a") as handle:
        handle.write(json.dumps(entry) + "\n")
    print(json.dumps(entry), json.dumps(durations))


if __name__ == "__main__":
    main()
