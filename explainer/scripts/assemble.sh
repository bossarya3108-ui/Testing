#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(cd .. && pwd)"

: > build/scenes.txt
for i in 1 2 3 4 5 6 7; do
  echo "file '$PWD/build/scenes/scene$i.mp4'" >> build/scenes.txt
done

ffmpeg -hide_banner -loglevel error -y \
  -f concat -safe 0 -i build/scenes.txt \
  -i build/final_audio.wav \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k \
  -shortest -movflags +faststart \
  -metadata title="Global Payments Platform (GPP) - Animated Explainer" \
  -metadata comment="Conceptual payments education module with AI voiceover" \
  "$ROOT/GPP_Introduction_Animated_Explainer_With_Voiceover.mp4"

cp build/narration_script.txt "$ROOT/GPP_Introduction_Narration_Script.txt"
cp build/narration.srt "$ROOT/GPP_Introduction_Animated_Explainer.srt"

echo "Assembled:"
ls -lh "$ROOT/GPP_Introduction_Animated_Explainer_With_Voiceover.mp4"
