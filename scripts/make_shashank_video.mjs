#!/usr/bin/env node
/**
 * Builds `shashank_black_screen.mp4`: a completely black 1280x720 video whose
 * only content is Shashank introducing himself in a Sarvam AI text-to-speech
 * voice.
 *
 * Usage:
 *   SARVAM_API_KEY=<key> node scripts/make_shashank_video.mjs [output.mp4]
 *
 * Requires Node 18+ (global fetch) and ffmpeg on PATH.
 */

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

// "kunal" is Sarvam's kids (young boy) voice, which matches the character.
const VOICE = {
  model: "bulbul:v4-flash",
  speaker: "kunal_hi_kids",
  languageCode: "en-IN",
  sampleRate: 24000,
  pace: 1.1,
};

const SHASHANK_INTRO = `Hi, I'm Shashank. I'm nine, I love cricket, and I'm going to Mars one day. Bye!`;

/** Asks Sarvam for speech and returns the decoded WAV bytes. */
async function synthesizeSpeech(apiKey) {
  const response = await fetch(SARVAM_TTS_URL, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: SHASHANK_INTRO,
      language_code: VOICE.languageCode,
      speaker: VOICE.speaker,
      model: VOICE.model,
      speech_sample_rate: VOICE.sampleRate,
      pace: VOICE.pace,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = payload?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Sarvam text-to-speech failed: ${reason}`);
  }

  const chunks = payload?.audios;
  if (!Array.isArray(chunks) || chunks.length !== 1) {
    throw new Error(
      `Sarvam text-to-speech returned ${Array.isArray(chunks) ? chunks.length : 0} audio clips, expected 1`,
    );
  }
  return Buffer.from(chunks[0], "base64");
}

/** Reads the duration of a PCM WAV file from its RIFF header. */
export function wavDurationSeconds(wav) {
  if (wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Expected a WAV file from Sarvam");
  }

  let byteRate = 0;
  for (let offset = 12; offset + 8 <= wav.length; ) {
    const chunkId = wav.toString("ascii", offset, offset + 4);
    const chunkSize = wav.readUInt32LE(offset + 4);

    if (chunkId === "fmt ") {
      byteRate = wav.readUInt32LE(offset + 16);
    } else if (chunkId === "data") {
      if (!byteRate) throw new Error("WAV data chunk appeared before its format");
      const dataSize = Math.min(chunkSize, wav.length - offset - 8);
      return dataSize / byteRate;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  throw new Error("Could not find a data chunk in the WAV audio");
}

/** Runs a child process and rejects with a readable error if it fails. */
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", (error) => {
      reject(
        error.code === "ENOENT"
          ? new Error(`\`${command}\` was not found. Install it and try again.`)
          : error,
      );
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

/** Muxes the voice track onto a black canvas and writes the MP4. */
async function renderBlackVideo(audioPath, outputPath) {
  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-f", "lavfi",
    "-i", "color=c=black:s=1280x720:r=25",
    "-i", audioPath,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "30",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "96k",
    "-af", "volume=-2dB",
    "-shortest",
    "-movflags", "+faststart",
    outputPath,
  ]);
}

async function main() {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.error("SARVAM_API_KEY is not set. Export your Sarvam API key and run again.");
    process.exitCode = 1;
    return;
  }

  const outputPath = process.argv[2] ?? "shashank_black_screen.mp4";
  const workDir = await mkdtemp(join(tmpdir(), "shashank-video-"));
  try {
    const wav = await synthesizeSpeech(apiKey);
    const wavPath = join(workDir, "voice.wav");
    await writeFile(wavPath, wav);

    const seconds = wavDurationSeconds(wav);
    if (!(seconds > 0)) throw new Error("Sarvam returned empty audio");

    await renderBlackVideo(wavPath, outputPath);
    console.log(
      `Wrote ${outputPath}: ${seconds.toFixed(1)}s of black 1280x720 video with Shashank's voice (${VOICE.speaker}).`,
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
