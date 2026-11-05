#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p build/scenes
: > build/render.log
rm -f build/render.done

render() {
  echo "START scene $1 $(date +%H:%M:%S)" >> build/render.log
  node src/render-scene.js --scene "$1" --out "build/scenes/scene$1.mp4" \
    --crf 19 --preset medium >> build/render.log 2>&1
  echo "DONE scene $1 $(date +%H:%M:%S)" >> build/render.log
}

# Two scenes at a time keeps the four-core box responsive.
render 1 & p1=$!
render 2 & p2=$!
wait "$p1" "$p2"

render 3 & p3=$!
render 4 & p4=$!
wait "$p3" "$p4"

render 5 & p5=$!
render 6 & p6=$!
wait "$p5" "$p6"

render 7

echo "ALL_SCENES_DONE $(date +%H:%M:%S)" >> build/render.log
touch build/render.done
