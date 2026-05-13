#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

function printHelp() {
  console.log(`Compress silent stretches of a video for the web.

Detects intervals where the speaker is not talking (silence longer than
--silence-duration), then speeds each one up between --min-speed and
--max-speed. Speech segments are left at 1x. Audio is sped up in lockstep
with video (atempo) so A/V stays in sync.

Usage:
  node scripts/compress-silence.mjs --input=<file> [options]

Options:
  --input=<path>              Source video (required)
  --output=<path>             Destination (default: <input dir>/<basename>.web.mp4)
  --silence-duration=<sec>    Minimum gap to compress (default: 2)
  --max-output-duration=<sec> Try to keep sped-up gaps under this (default: 5)
  --min-speed=<x>             Initial speedup factor (default: 5)
  --max-speed=<x>             Hard cap on speedup factor (default: 10)
  --noise=<dB>                Silence detection floor (default: -30dB)
  --fps=<n>                   Output frame rate (default: 30)
  --crf=<n>                   x264 quality (default: 23; lower = better)
  --dry-run                   Print the segment plan and ffmpeg command, don't encode
  -h, --help                  Show this help
`);
}

function parseArgs(argv) {
  const opts = {
    input: null,
    output: null,
    silenceDuration: 2,
    maxOutputDuration: 5,
    minSpeed: 5,
    maxSpeed: 10,
    noise: "-30dB",
    fps: 30,
    crf: 23,
    dryRun: false,
  };
  for (const raw of argv.slice(2)) {
    if (raw === "-h" || raw === "--help") {
      printHelp();
      process.exit(0);
    }
    if (raw === "--dry-run") {
      opts.dryRun = true;
      continue;
    }
    const eq = raw.indexOf("=");
    if (!raw.startsWith("--") || eq === -1) {
      throw new Error(`Unrecognized argument: ${raw}`);
    }
    const key = raw.slice(2, eq);
    const val = raw.slice(eq + 1);
    switch (key) {
      case "input": opts.input = val; break;
      case "output": opts.output = val; break;
      case "silence-duration": opts.silenceDuration = Number(val); break;
      case "max-output-duration": opts.maxOutputDuration = Number(val); break;
      case "min-speed": opts.minSpeed = Number(val); break;
      case "max-speed": opts.maxSpeed = Number(val); break;
      case "noise": opts.noise = val; break;
      case "fps": opts.fps = Number(val); break;
      case "crf": opts.crf = Number(val); break;
      default: throw new Error(`Unknown option: --${key}`);
    }
  }
  if (!opts.input) {
    printHelp();
    throw new Error("--input is required");
  }
  if (!opts.output) {
    const dir = path.dirname(opts.input);
    const base = path.basename(opts.input, path.extname(opts.input));
    opts.output = path.join(dir, `${base}.web.mp4`);
  }
  if (opts.minSpeed < 1) throw new Error("--min-speed must be >= 1");
  if (opts.maxSpeed < opts.minSpeed) throw new Error("--max-speed must be >= --min-speed");
  if (opts.silenceDuration <= 0) throw new Error("--silence-duration must be > 0");
  if (opts.maxOutputDuration <= 0) throw new Error("--max-output-duration must be > 0");
  return opts;
}

function run(cmd, args, { capture = "stderr" } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => { stdout += b.toString(); });
    child.stderr.on("data", (b) => { stderr += b.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${cmd} exited with code ${code}\n${stderr}`));
        return;
      }
      resolve(capture === "stdout" ? stdout : stderr);
    });
  });
}

function streamRun(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${cmd} exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

async function probeDuration(input) {
  const out = await run(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "csv=p=0",
      input,
    ],
    { capture: "stdout" },
  );
  const d = Number(out.trim());
  if (!Number.isFinite(d) || d <= 0) {
    throw new Error(`Could not read duration of ${input}: ${out}`);
  }
  return d;
}

async function detectSilence(input, noise, minDuration) {
  const stderr = await run("ffmpeg", [
    "-hide_banner", "-nostats",
    "-i", input,
    "-af", `silencedetect=noise=${noise}:d=${minDuration}`,
    "-f", "null", "-",
  ]);
  const intervals = [];
  let pendingStart = null;
  const startRe = /silence_start:\s*(-?\d+(?:\.\d+)?)/;
  const endRe = /silence_end:\s*(-?\d+(?:\.\d+)?)\s*\|\s*silence_duration:\s*(\d+(?:\.\d+)?)/;
  for (const line of stderr.split("\n")) {
    const ms = startRe.exec(line);
    if (ms) {
      pendingStart = Math.max(0, Number(ms[1]));
      continue;
    }
    const me = endRe.exec(line);
    if (me) {
      const end = Number(me[1]);
      const duration = Number(me[2]);
      const start = pendingStart ?? Math.max(0, end - duration);
      pendingStart = null;
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        intervals.push({ start, end });
      }
    }
  }
  return intervals;
}

function pickSpeed(duration, { minSpeed, maxSpeed, maxOutputDuration }) {
  let speed = minSpeed;
  if (duration / speed > maxOutputDuration) {
    speed = Math.min(maxSpeed, duration / maxOutputDuration);
  }
  return Math.round(speed * 100) / 100;
}

function buildSegments(silences, totalDuration, opts) {
  const segments = [];
  let cursor = 0;
  const MIN_SEG = 0.01;
  for (const s of silences) {
    const start = Math.max(cursor, s.start);
    const end = Math.min(totalDuration, s.end);
    if (end - start < opts.silenceDuration) continue;
    if (start - cursor > MIN_SEG) {
      segments.push({ start: cursor, end: start, speed: 1 });
    }
    segments.push({
      start,
      end,
      speed: pickSpeed(end - start, opts),
    });
    cursor = end;
  }
  if (totalDuration - cursor > MIN_SEG) {
    segments.push({ start: cursor, end: totalDuration, speed: 1 });
  }
  return segments;
}

function buildFilterComplex(segments) {
  const parts = [];
  const labels = [];
  segments.forEach((seg, i) => {
    const vLabel = `v${i}`;
    const aLabel = `a${i}`;
    const speedExpr = (1 / seg.speed).toFixed(6);
    parts.push(
      `[0:v]trim=start=${seg.start.toFixed(6)}:end=${seg.end.toFixed(6)},` +
      `setpts=(PTS-STARTPTS)*${speedExpr}[${vLabel}]`,
    );
    parts.push(
      `[0:a]atrim=start=${seg.start.toFixed(6)}:end=${seg.end.toFixed(6)},` +
      `asetpts=PTS-STARTPTS,atempo=${seg.speed.toFixed(4)}[${aLabel}]`,
    );
    labels.push(`[${vLabel}][${aLabel}]`);
  });
  parts.push(`${labels.join("")}concat=n=${segments.length}:v=1:a=1[v][a]`);
  return parts.join(";");
}

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toFixed(2).padStart(5, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
}

function printPlan(segments, totalDuration) {
  let originalSilence = 0;
  let compressedSilence = 0;
  let speechTotal = 0;
  console.log("\nSegment plan:");
  console.log("  #  start       end         dur        speed   out-dur");
  segments.forEach((seg, i) => {
    const dur = seg.end - seg.start;
    const outDur = dur / seg.speed;
    if (seg.speed === 1) speechTotal += dur;
    else { originalSilence += dur; compressedSilence += outDur; }
    console.log(
      `  ${String(i + 1).padStart(2)}  ${formatTime(seg.start)}  ${formatTime(seg.end)}  ` +
      `${dur.toFixed(2).padStart(6)}s   ${seg.speed.toFixed(2)}x   ${outDur.toFixed(2)}s`,
    );
  });
  const outputDuration = speechTotal + compressedSilence;
  console.log("");
  console.log(`  Source duration:        ${totalDuration.toFixed(2)}s`);
  console.log(`  Silence detected:       ${originalSilence.toFixed(2)}s across ${segments.filter(s => s.speed !== 1).length} interval(s)`);
  console.log(`  Silence after compress: ${compressedSilence.toFixed(2)}s`);
  console.log(`  Estimated output:       ${outputDuration.toFixed(2)}s (saves ${(totalDuration - outputDuration).toFixed(2)}s)`);
  console.log("");
}

async function main() {
  const opts = parseArgs(process.argv);

  console.log(`Detecting silence in ${opts.input} (noise=${opts.noise}, min=${opts.silenceDuration}s) ...`);
  const [totalDuration, silences] = await Promise.all([
    probeDuration(opts.input),
    detectSilence(opts.input, opts.noise, opts.silenceDuration),
  ]);
  console.log(`Found ${silences.length} silent interval(s); source is ${totalDuration.toFixed(2)}s.`);

  const segments = buildSegments(silences, totalDuration, opts);
  if (segments.length === 0) {
    throw new Error("No segments produced (empty video?)");
  }
  printPlan(segments, totalDuration);

  const filter = buildFilterComplex(segments);
  const ffmpegArgs = [
    "-hide_banner",
    "-y",
    "-i", opts.input,
    "-filter_complex", filter,
    "-map", "[v]",
    "-map", "[a]",
    "-r", String(opts.fps),
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", String(opts.crf),
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-c:a", "aac",
    "-b:a", "128k",
    opts.output,
  ];

  if (opts.dryRun) {
    console.log("Dry run — ffmpeg command:");
    console.log(`  ffmpeg ${ffmpegArgs.map((a) => (/\s|;|,|\[|\]/.test(a) ? JSON.stringify(a) : a)).join(" ")}`);
    return;
  }

  console.log(`Encoding to ${opts.output} (${opts.fps}fps, CRF ${opts.crf}) ...`);
  await streamRun("ffmpeg", ffmpegArgs);
  console.log(`Done. Wrote ${opts.output}.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
