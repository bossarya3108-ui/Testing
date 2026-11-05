#!/usr/bin/env python3
"""Generate the GPP narration and the shared video timeline.

For every scene this script:
  * synthesises a neural female voice (edge-tts, en-GB-SoniaNeural),
  * captures word boundaries for frame-accurate animation cues,
  * rebuilds punctuated captions with correct technical spellings,
  * writes the scene timing map consumed by the Node renderer.

Outputs (under explainer/build):
  narration/sceneN.mp3
  narration/sceneN.words.json
  timeline.json
  narration.srt
  narration_script.txt
"""

import argparse
import asyncio
import difflib
import json
import re
import sys
import time
from pathlib import Path

import edge_tts

from narration_scenes import (
    DISPLAY_PHRASES,
    LEAD_IN,
    PITCH,
    RATE,
    SCENES,
    TAIL,
    VOICE,
)

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
NARRATION = BUILD / "narration"
CHARS_PER_CUE = 78


def norm(token: str) -> str:
    return re.sub(r"[^a-z0-9]", "", token.lower())


def has_punctuation(token: str, chars: str) -> bool:
    return bool(token) and token[-1] in chars


async def synthesize(scene: dict, force: bool) -> None:
    mp3 = NARRATION / f"scene{scene['id']}.mp3"
    words_file = NARRATION / f"scene{scene['id']}.words.json"
    if mp3.exists() and words_file.exists() and not force:
        print(f"  scene {scene['id']}: cached")
        return

    last_error = None
    for attempt in range(1, 5):
        try:
            communicate = edge_tts.Communicate(
                scene["tts"],
                VOICE,
                rate=RATE,
                pitch=PITCH,
                boundary="WordBoundary",
            )
            words = []
            tmp = mp3.with_suffix(".part.mp3")
            with open(tmp, "wb") as fh:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        fh.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        words.append(
                            {
                                "start": round(chunk["offset"] / 1e7, 3),
                                "end": round((chunk["offset"] + chunk["duration"]) / 1e7, 3),
                                "text": chunk["text"],
                            }
                        )
            if tmp.stat().st_size < 20_000 or len(words) < 10:
                raise RuntimeError("incomplete audio response")
            tmp.replace(mp3)
            words_file.write_text(json.dumps(words, indent=1))
            print(
                f"  scene {scene['id']}: {len(words)} words, "
                f"{words[-1]['end']:.1f}s"
            )
            return
        except Exception as exc:  # noqa: BLE001 - network TTS is flaky
            last_error = exc
            print(f"  scene {scene['id']} attempt {attempt} failed: {exc}")
            await asyncio.sleep(2 * attempt)

    raise RuntimeError(f"TTS failed for scene {scene['id']}: {last_error}")


def align_words(raw_tokens, boundaries):
    """Return a start/end time for each whitespace token in the TTS text."""
    raw_norm = [norm(t) for t in raw_tokens]
    boundary_norm = [norm(w["text"]) for w in boundaries]

    times = [None] * len(raw_tokens)
    matcher = difflib.SequenceMatcher(a=raw_norm, b=boundary_norm, autojunk=False)
    for op, a0, a1, b0, b1 in matcher.get_opcodes():
        if op == "equal" or (op == "replace" and (a1 - a0) == (b1 - b0)):
            for offset in range(a1 - a0):
                times[a0 + offset] = (boundaries[b0 + offset]["start"],
                                      boundaries[b0 + offset]["end"])

    # Fall back to proportional interpolation for any unmatched tokens.
    last_end = 0.0
    for i, slot in enumerate(times):
        if slot is None:
            nxt = next((times[j] for j in range(i + 1, len(times)) if times[j]), None)
            prev = last_end
            if nxt:
                span = max(0.08, (nxt[0] - prev) / 2)
                times[i] = (prev, prev + span)
            else:
                times[i] = (prev, prev + 0.25)
        last_end = times[i][1]
    return times


def display_tokens(raw_tokens, times):
    """Merge phonetic tokens into the technical spellings used on screen."""
    tokens = []
    i = 0
    while i < len(raw_tokens):
        matched = False
        for phrase, display in DISPLAY_PHRASES:
            size = len(phrase)
            if [norm(t) for t in raw_tokens[i:i + size]] == phrase:
                tail = raw_tokens[i + size - 1]
                suffix = tail[len(tail.rstrip(".,;:!?")):] if re.search(r"[.,;:!?]$", tail) else ""
                tokens.append(
                    {
                        "text": display + suffix,
                        "start": times[i][0],
                        "end": times[i + size - 1][1],
                    }
                )
                i += size
                matched = True
                break
        if not matched:
            tokens.append(
                {"text": raw_tokens[i], "start": times[i][0], "end": times[i][1]}
            )
            i += 1
    return tokens


def build_cues(tokens, scene_end):
    """Group display tokens into two-line-friendly subtitle cues."""
    cues = []
    current = []

    def flush():
        if not current:
            return
        text = " ".join(t["text"] for t in current)
        text = re.sub(r"\s+([.,;:!?])", r"\1", text)
        if text:
            cues.append(
                {
                    "text": text,
                    "start": max(0.0, current[0]["start"] - 0.08),
                    "end": min(scene_end, current[-1]["end"] + 0.45),
                }
            )
        current.clear()

    for token in tokens:
        candidate = " ".join(t["text"] for t in current + [token])
        if current and len(candidate) > CHARS_PER_CUE:
            flush()
        current.append(token)
        text = " ".join(t["text"] for t in current)
        if len(text) >= 38 and has_punctuation(token["text"], ".!?"):
            flush()
        elif len(text) >= 64 and has_punctuation(token["text"], ",;:"):
            flush()
    flush()

    # Cues should hand over cleanly, with no overlap.
    for i, cue in enumerate(cues):
        if i + 1 < len(cues):
            cue["end"] = min(cue["end"], cues[i + 1]["start"] - 0.04)
        cue["start"] = round(max(0.0, cue["start"]), 3)
        cue["end"] = round(max(cue["start"] + 0.9, cue["end"]), 3)
    return cues


def find_markers(raw_tokens, times, definitions):
    lookup = {}
    counts = {}
    for i, token in enumerate(raw_tokens):
        key = norm(token)
        counts[key] = counts.get(key, 0) + 1
        lookup.setdefault(key, []).append(i)

    markers = {}
    for name, keyword, occurrence in definitions:
        indexes = lookup.get(keyword, [])
        if len(indexes) >= occurrence:
            idx = indexes[occurrence - 1]
            markers[name] = round(times[idx][0], 3)
        else:
            print(f"    warning: marker {name!r} ({keyword} #{occurrence}) not found")
            markers[name] = None
    return markers


def sentence_spans(raw_tokens, times, audio_end):
    spans = []
    start = times[0][0] if times else 0.0
    for i, token in enumerate(raw_tokens):
        if has_punctuation(token, ".!?"):
            end = times[i][1]
            spans.append({"start": round(start, 3), "end": round(end, 3)})
            if i + 1 < len(times):
                start = times[i + 1][0]
    if not spans or spans[-1]["end"] < audio_end - 1.0:
        spans.append({"start": round(start, 3), "end": round(audio_end, 3)})
    return spans


def fmt_srt(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="regenerate cached audio")
    args = parser.parse_args()

    NARRATION.mkdir(parents=True, exist_ok=True)
    timeline = {"fps": 30, "width": 1920, "height": 1080, "scenes": []}
    srt_rows = []
    script_lines = [
        "GLOBAL PAYMENTS PLATFORM (GPP)",
        "Animated explainer - narration script",
        f"Voice: {VOICE} | rate {RATE} | pitch {PITCH}",
        "",
    ]

    cursor = 0.0
    for scene in SCENES:
        print(f"Scene {scene['id']}: {scene['title']}")
        asyncio.run(synthesize(scene, args.force))

        mp3 = NARRATION / f"scene{scene['id']}.mp3"
        boundaries = json.loads(
            (NARRATION / f"scene{scene['id']}.words.json").read_text()
        )
        raw_tokens = scene["tts"].split()
        times = align_words(raw_tokens, boundaries)
        audio_end = max(boundaries[-1]["end"] + 0.35, times[-1][1] + 0.35)
        tokens = display_tokens(raw_tokens, times)
        cues = build_cues(tokens, audio_end)
        markers = find_markers(raw_tokens, times, scene["markers"])
        spans = sentence_spans(raw_tokens, times, audio_end)

        duration = round(LEAD_IN + audio_end + TAIL, 3)
        scene_data = {
            "id": scene["id"],
            "slug": scene["slug"],
            "section": scene["section"],
            "title": scene["title"],
            "start": round(cursor, 3),
            "duration": duration,
            "audioStart": round(cursor + LEAD_IN, 3),
            "audioDuration": round(audio_end, 3),
            "leadIn": LEAD_IN,
            "tail": TAIL,
            "markers": markers,
            "sentences": spans,
            "cues": [
                {
                    "text": cue["text"],
                    "start": round(cue["start"] + LEAD_IN, 3),
                    "end": round(cue["end"] + LEAD_IN, 3),
                }
                for cue in cues
            ],
        }
        timeline["scenes"].append(scene_data)

        script_lines.append(f"SCENE {scene['id']} - {scene['title'].upper()}")
        script_lines.append("")
        script_lines.append(" ".join(t["text"] for t in tokens))
        script_lines.append("")

        for cue in scene_data["cues"]:
            srt_rows.append(
                (
                    cursor + cue["start"],
                    cursor + cue["end"],
                    cue["text"],
                )
            )

        cursor += duration
        print(
            f"  duration {duration:.1f}s | starts {scene_data['start']:.1f}s | "
            f"markers {sum(1 for v in markers.values() if v is not None)}/{len(markers)}"
        )

    timeline["duration"] = round(cursor, 3)
    (BUILD / "timeline.json").write_text(json.dumps(timeline, indent=1))

    srt = []
    for i, (start, end, text) in enumerate(srt_rows, 1):
        srt.append(f"{i}\n{fmt_srt(start)} --> {fmt_srt(end)}\n{text}\n")
    (BUILD / "narration.srt").write_text("\n".join(srt))
    (BUILD / "narration_script.txt").write_text("\n".join(script_lines).rstrip() + "\n")

    print(
        f"\nTotal video: {timeline['duration']:.1f}s "
        f"({int(timeline['duration'] // 60)}:{timeline['duration'] % 60:04.1f})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
