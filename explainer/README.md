# GPP explainer renderer

A deterministic 1920 × 1080 / 30 fps canvas renderer, a Python neural-voice
pipeline, and a small ambient music synthesizer.

## Layout

```
src/
  render-scene.js       frame loop → raw RGBA → ffmpeg/x264
  lib/                  theme, drawing primitives, map, HUD, subtitles
  scenes/scene1..7.js   one animated scene per source video section
scripts/
  narration_scenes.py   narration text, pronunciation spellings, markers
  generate_narration.py edge-tts voice + word timings + SRT + timeline.json
  build_audio.py        voice placement, music bed, mix, narration MP3
  render_all.sh         renders the seven scene clips
  assemble.sh           concatenates and muxes the final deliverables
assets/fonts/           Inter, Space Grotesk and JetBrains Mono (OFL)
```

## Timing model

`build/timeline.json` is the single source of truth. Each scene has a start,
duration, audio start, word-level markers, sentence spans and subtitle cues.
Scene visuals call `markerTime(scene, "pmg", fallback)` when a component should
react to a spoken term; subtitles are drawn from the same timeline, so the
voiceover, animation and captions cannot drift apart.

## Rendering notes

- `build/scenes/sceneN.mp4` are silent H.264 clips; `assemble.sh` concatenates
  them and muxes `build/final_audio.wav`.
- All animation is time-based, not frame-count-based; preview frames from any
  point are stable.
- The background texture is baked once; per-frame effects use modest shadows to
  keep the 1080p render practical on a four-core machine.

## QA

`generate_narration.py` writes `build/narration.srt`; `build_audio.py` writes
`build/mix_report.txt` with integrated loudness and true peak. Decode the final
file with:

```bash
ffmpeg -v error -i ../GPP_Introduction_Animated_Explainer_With_Voiceover.mp4 -f null -
```
