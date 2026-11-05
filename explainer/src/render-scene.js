"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { once } = require("events");
const { createCanvas, registerFont } = require("canvas");

const theme = require("./lib/theme");
const { drawBackdrop, drawHud, drawSceneChrome } = require("./lib/background");
const { drawSubtitles } = require("./lib/subtitles");
const scenes = require("./scenes");

const ROOT = path.resolve(__dirname, "..");
const W = theme.width;
const H = theme.height;
const FPS = theme.fps;

function loadFonts() {
  const dir = path.join(ROOT, "assets", "fonts");
  for (const file of fs.readdirSync(dir)) {
    const match = file.match(/^(.+)-(\d+)\.ttf$/);
    if (!match) continue;
    registerFont(path.join(dir, file), { family: match[1], weight: match[2] });
  }
}

function parseArgs(argv) {
  const args = { fps: FPS, crf: 19, preset: "medium" };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--scene") { args.scene = Number(value); i += 1; }
    else if (key === "--out") { args.out = value; i += 1; }
    else if (key === "--crf") { args.crf = Number(value); i += 1; }
    else if (key === "--preset") { args.preset = value; i += 1; }
    else if (key === "--frame-time") { args.frameTime = Number(value); i += 1; }
    else if (key === "--png") { args.png = value; i += 1; }
  }
  return args;
}

function drawFrame(ctx, timeline, scene, t, globalTime) {
  const renderer = scenes[scene.id];
  if (!renderer) throw new Error(`No renderer for scene ${scene.id}`);

  ctx.save();
  drawBackdrop(ctx, t, { particles: 36 });
  ctx.__t = t;
  renderer(ctx, t, scene, globalTime);
  ctx.restore();

  drawHud(ctx, scene, globalTime, timeline.duration);
  drawSubtitles(ctx, scene.cues, t);
  drawSceneChrome(ctx, t, scene.duration);
}

async function main() {
  loadFonts();
  const args = parseArgs(process.argv);
  if (!args.scene) throw new Error("--scene is required");
  const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, "build", "timeline.json"), "utf8"));
  const scene = timeline.scenes.find((s) => s.id === args.scene);
  if (!scene) throw new Error(`Scene ${args.scene} not found`);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  if (args.frameTime !== undefined) {
    const t = Math.min(args.frameTime, scene.duration - 0.001);
    drawFrame(ctx, timeline, scene, t, scene.start + t);
    const out = args.png || path.join(ROOT, "build", `preview_scene${scene.id}_${t}.png`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, canvas.toBuffer("image/png"));
    console.log(`wrote ${out}`);
    return;
  }

  if (!args.out) throw new Error("--out is required");
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  const totalFrames = Math.round(scene.duration * args.fps);

  const ffmpeg = spawn("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "rawvideo",
    "-pix_fmt", "rgba",
    "-s", `${W}x${H}`,
    "-r", String(args.fps),
    "-i", "-",
    "-an",
    "-c:v", "libx264",
    "-preset", args.preset,
    "-crf", String(args.crf),
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    args.out,
  ], { stdio: ["pipe", "inherit", "inherit"] });

  const started = Date.now();
  for (let frame = 0; frame < totalFrames; frame += 1) {
    const t = frame / args.fps;
    drawFrame(ctx, timeline, scene, t, scene.start + t);
    const image = ctx.getImageData(0, 0, W, H);
    const buffer = Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength);
    if (!ffmpeg.stdin.write(buffer)) {
      await once(ffmpeg.stdin, "drain");
    }
    if (frame % (args.fps * 4) === 0 && frame > 0) {
      const elapsed = (Date.now() - started) / 1000;
      const fps = frame / elapsed;
      process.stdout.write(
        `\rscene ${scene.id}: ${frame}/${totalFrames} frames (${fps.toFixed(1)} fps render)`
      );
    }
  }
  process.stdout.write("\n");
  ffmpeg.stdin.end();
  const [code] = await once(ffmpeg, "close");
  if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
  console.log(`scene ${scene.id} -> ${args.out} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
