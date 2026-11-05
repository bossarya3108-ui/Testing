#!/usr/bin/env python3
"""Build the GPP voice track, ambient music bed and final mix.

Outputs:
  build/voice.wav             scene narration placed on the video timeline
  build/voice_norm.wav        loudness-normalised narration
  build/music.wav             synthesized corporate ambience
  build/final_audio.wav       narration + ducked music
  build/mix_report.txt        measured levels
  GPP_Introduction_Voiceover.mp3
"""

import json
import math
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
NARRATION = BUILD / "narration"
SR = 48000


def run(cmd, **kwargs):
    return subprocess.run(cmd, check=True, text=True, **kwargs)


def read_wav(path):
    with wave.open(str(path), "rb") as fh:
        channels = fh.getnchannels()
        width = fh.getsampwidth()
        rate = fh.getframerate()
        frames = fh.readframes(fh.getnframes())
    if width != 2:
        raise ValueError(f"unexpected sample width {width} for {path}")
    data = np.frombuffer(frames, dtype="<i2").astype(np.float32) / 32768.0
    if channels == 1:
        data = np.repeat(data, 2)
    return data.reshape(-1, 2), rate


def write_wav(path, data, rate=SR):
    clipped = np.clip(data, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as fh:
        fh.setnchannels(2)
        fh.setsampwidth(2)
        fh.setframerate(rate)
        fh.writeframes(pcm.tobytes())


def loudness(path, target_i=-16.0, target_tp=-1.5, target_lra=11.0):
    """Two-pass EBU R128 normalisation, returning the measured summary."""
    first = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
            "-af", f"loudnorm=I={target_i}:TP={target_tp}:LRA={target_lra}:print_format=json",
            "-f", "null", "-",
        ],
        check=True, text=True, capture_output=True,
    )
    blocks = re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", first.stderr, re.S)
    if not blocks:
        raise RuntimeError("could not read loudnorm measurements")
    measured = json.loads(blocks[-1])
    out = path.with_name(path.stem + "_norm.wav")
    af = (
        f"loudnorm=I={target_i}:TP={target_tp}:LRA={target_lra}"
        f":measured_I={measured['input_i']}:measured_TP={measured['input_tp']}"
        f":measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}"
        f":offset={measured['target_offset']}:linear=true"
    )
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(path),
        "-af", af, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(out),
    ])
    return out, measured


def build_voice(timeline):
    total = timeline["duration"]
    voice = np.zeros((int(math.ceil(total * SR)), 2), dtype=np.float32)
    scenes = timeline["scenes"]
    for idx, scene in enumerate(scenes):
        mp3 = NARRATION / f"scene{scene['id']}.mp3"
        wav = NARRATION / f"scene{scene['id']}.wav"
        run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp3),
            "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(wav),
        ])
        data, rate = read_wav(wav)
        if rate != SR:
            raise RuntimeError("unexpected sample rate")
        start = int(round(scene["audioStart"] * SR))
        end = start + len(data)
        if end > len(voice):
            raise RuntimeError(f"scene {scene['id']} exceeds the audio buffer")
        voice[start:end] += data
        next_start = (
            int(round(scenes[idx + 1]["start"] * SR))
            if idx + 1 < len(scenes)
            else len(voice)
        )
        if end > next_start:
            raise RuntimeError(f"scene {scene['id']} narration overlaps the next scene")
    out = BUILD / "voice.wav"
    write_wav(out, voice)
    return out


def build_music(duration):
    """A slow, warm pad progression with a soft sub pulse.

    Kept deliberately simple and low-mid focused so it sits under a voice.
    """
    total = duration
    n = int(math.ceil(total * SR))
    t = np.arange(n, dtype=np.float64) / SR

    # Am9 -> Fmaj7 -> Cmaj7 -> G6, ten seconds per chord with a soft overlap.
    chords = [
        [110.00, 164.81, 220.00, 246.94, 329.63, 493.88],
        [87.31, 130.81, 174.61, 220.00, 261.63, 349.23],
        [130.81, 196.00, 246.94, 329.63, 392.00, 493.88],
        [98.00, 146.83, 196.00, 246.94, 293.66, 392.00],
    ]
    segment = 10.0
    fade = 3.0
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)

    seg_count = int(math.ceil(total / segment)) + 1
    for seg in range(seg_count):
        start = seg * segment
        end = min(total, start + segment + fade)
        if start >= total:
            break
        a = int(start * SR)
        b = int(end * SR)
        local = t[a:b] - start
        length = len(local)
        if length <= 1:
            continue

        # Cosine fade-in and fade-out for each chord block.
        env = np.ones(length)
        fade_n = int(fade * SR)
        if fade_n > 0 and length > 2 * fade_n:
            env[:fade_n] = 0.5 - 0.5 * np.cos(np.linspace(0, math.pi, fade_n))
            env[-fade_n:] = 0.5 + 0.5 * np.cos(np.linspace(0, math.pi, fade_n))
        else:
            ramp = np.linspace(0, math.pi, length)
            env = 0.5 - 0.5 * np.cos(ramp)

        note_left = np.zeros(length)
        note_right = np.zeros(length)
        for ni, freq in enumerate(chords[seg % len(chords)]):
            # A touch of detune and stereo spread keeps the pad alive.
            detune = 1.0 + (0.0006 if ni % 2 else -0.0004)
            phase = ni * 0.7
            tone = (
                np.sin(2 * math.pi * freq * detune * local + phase)
                + 0.22 * np.sin(2 * math.pi * freq * 2 * local + phase * 1.3)
                + 0.06 * np.sin(2 * math.pi * freq * 3 * local + phase * 0.7)
            )
            pan = 0.5 + 0.18 * math.sin(ni * 1.7)
            note_left += tone * (1.0 - pan)
            note_right += tone * pan

        slow = 0.82 + 0.18 * np.sin(2 * math.pi * 0.035 * local + seg * 0.8)
        left[a:b] += note_left * env * slow
        right[a:b] += note_right * env * slow

    # Soft sub pulse every two seconds.
    pulse_period = 2.0
    pulse_count = int(total / pulse_period) + 1
    for i in range(pulse_count):
        start = i * pulse_period
        a = int(start * SR)
        b = min(n, a + int(1.4 * SR))
        if a >= n:
            break
        local = t[a:b] - start
        env = np.exp(-local * 3.2) * (1 - np.exp(-local * 60.0))
        sub = np.sin(2 * math.pi * 55.0 * local) * env * 0.16
        left[a:b] += sub
        right[a:b] += sub

    # Very quiet high air, filtered noise.
    rng = np.random.default_rng(20260418)
    noise = rng.standard_normal(n)
    spectrum = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(n, 1.0 / SR)
    shape = np.exp(-0.5 * ((freqs - 3200.0) / 1400.0) ** 2)
    air = np.fft.irfft(spectrum * shape, n=n) * 0.014
    left += air
    right += air

    # Normalise, then gentle emotional fades.
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-9)
    left = left / peak * 0.48
    right = right / peak * 0.48
    fade_in = int(2.0 * SR)
    fade_out = int(3.0 * SR)
    envelope = np.ones(n)
    envelope[:fade_in] = np.linspace(0, 1, fade_in) ** 1.6
    envelope[-fade_out:] = np.linspace(1, 0, fade_out) ** 1.4
    left *= envelope
    right *= envelope

    data = np.stack([left, right], axis=1).astype(np.float32)
    # Match the final video length exactly.
    target_n = int(math.ceil(duration * SR))
    data = data[:target_n]
    out = BUILD / "music.wav"
    write_wav(out, data)
    return out


def measure(path):
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
            "-af", "ebur128=peak=true", "-f", "null", "-",
        ],
        check=True, text=True, capture_output=True,
    )
    tail = result.stderr[-2500:]
    integrated = re.findall(r"I:\s*(-?\d+\.\d+) LUFS", tail)
    peak = re.findall(r"Peak:\s*(-?\d+\.\d+) dBFS", tail)
    return {
        "integrated_lufs": float(integrated[-1]) if integrated else None,
        "true_peak_dbfs": float(peak[-1]) if peak else None,
    }


def main():
    timeline = json.loads((BUILD / "timeline.json").read_text())
    duration = timeline["duration"]

    print("Building voice track...")
    voice = build_voice(timeline)
    voice_norm, measured = loudness(voice)
    print(f"  narration measured at {measured['input_i']} LUFS")

    print("Synthesizing music bed...")
    music = build_music(duration)

    print("Mixing...")
    final = BUILD / "final_audio.wav"
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(voice_norm), "-i", str(music),
        "-filter_complex",
        (
            "[0:a]aformat=channel_layouts=stereo,asplit=2[voice_mix][voice_sc];"
            "[1:a]volume=0.26[music];"
            "[music][voice_sc]sidechaincompress="
            "threshold=0.025:ratio=7:attack=25:release=500:makeup=1[ducked];"
            "[voice_mix][ducked]amix=inputs=2:duration=first:normalize=0,"
            "alimiter=limit=0.94[out]"
        ),
        "-map", "[out]", "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(final),
    ])

    voice_mp3 = ROOT.parent / "GPP_Introduction_Voiceover.mp3"
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(voice_norm), "-c:a", "libmp3lame", "-b:a", "192k",
        "-ar", str(SR), str(voice_mp3),
    ])

    report = {
        "voice": measure(voice_norm),
        "music": measure(music),
        "final": measure(final),
        "duration": duration,
        "voice_mp3": str(voice_mp3),
    }
    (BUILD / "mix_report.txt").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
