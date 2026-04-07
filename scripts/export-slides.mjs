#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const DEFAULT_SLIDE_TIME_MS = 60000;
const DEFAULT_CLICK_INTERVAL_MS = 2000;
const DEFAULT_BASE_URL = "http://127.0.0.1:4173";

/**
 * @typedef {{ id: string; title: string }} SlideManifestItem
 * @typedef {{ index: number; id: string; title: string }} IndexedSlide
 */

function printHelp() {
  console.log(`Export a VibePPT deck to PNG and/or PDF.

Usage:
  npm run export -- --deck=<name> [options]

Options:
  --deck=<name>             Deck folder name to export (required)
  --format=png|pdf|both     Output format (default: pdf)
  --out=<dir>               Output directory (default: exports/<deckName>)
  --base-url=<url>          App URL (default: ${DEFAULT_BASE_URL})
  --width=<px>              Viewport width (default: ${DEFAULT_WIDTH})
  --height=<px>             Viewport height (default: ${DEFAULT_HEIGHT})
  --slide-time=<ms>         Simulated time per slide for click-driven reveals (default: ${DEFAULT_SLIDE_TIME_MS})
  --click-interval=<ms>     Interval between simulated clicks (default: ${DEFAULT_CLICK_INTERVAL_MS})
  --slides=<sel>            Only export specific slides, 1-based (e.g. 2  or  1,3,5  or  2-4  or  1,3-5,8)
  --concurrency=<n>         Parallel browser pages (default: CPU count)
  --no-server               Do not start Vite automatically
  --help                    Show this help
`);
}

export function parseArgs(argv) {
  const options = {
    deck: null,
    format: "pdf",
    outDir: null,
    baseUrl: DEFAULT_BASE_URL,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    slideTimeMs: DEFAULT_SLIDE_TIME_MS,
    clickIntervalMs: DEFAULT_CLICK_INTERVAL_MS,
    concurrency: cpus().length,
    startServer: true,
    slides: null, // null = all; Set<number> of 1-based indices otherwise
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--no-server") {
      options.startServer = false;
      continue;
    }
    if (!arg.startsWith("--")) continue;

    const [key, valueRaw] = arg.slice(2).split("=");
    const value = valueRaw?.trim();

    switch (key) {
      case "deck":
        if (!value) throw new Error("Missing value for --deck");
        options.deck = value;
        break;
      case "format":
        if (value === "png" || value === "pdf" || value === "both") {
          options.format = value;
        } else {
          throw new Error(`Invalid --format value: ${valueRaw}`);
        }
        break;
      case "out":
        if (!value) throw new Error("Missing value for --out");
        options.outDir = value;
        break;
      case "base-url":
        if (!value) throw new Error("Missing value for --base-url");
        options.baseUrl = value.replace(/\/+$/, "");
        break;
      case "width":
        options.width = parseIntOrThrow(valueRaw, "--width");
        break;
      case "height":
        options.height = parseIntOrThrow(valueRaw, "--height");
        break;
      case "slide-time":
        options.slideTimeMs = parseIntOrThrow(valueRaw, "--slide-time");
        break;
      case "click-interval":
        options.clickIntervalMs = parseIntOrThrow(valueRaw, "--click-interval");
        break;
      case "concurrency":
        options.concurrency = parseIntOrThrow(valueRaw, "--concurrency");
        break;
      case "slides":
        if (!value) throw new Error("Missing value for --slides");
        options.slides = parseSlideSelection(value);
        break;
      default:
        throw new Error(`Unknown option: --${key}`);
    }
  }

  return options;
}

/**
 * Parse a slide selection string like "1,3,5-7" into a Set of 1-based indices.
 * @param {string} raw
 * @returns {Set<number>}
 */
export function parseSlideSelection(raw) {
  const indices = new Set();
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const from = Number.parseInt(rangeMatch[1], 10);
      const to = Number.parseInt(rangeMatch[2], 10);
      if (from > to) throw new Error(`Invalid range in --slides: ${trimmed}`);
      for (let i = from; i <= to; i++) indices.add(i);
    } else {
      const n = Number.parseInt(trimmed, 10);
      if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid slide number in --slides: ${trimmed}`);
      indices.add(n);
    }
  }
  return indices;
}

export function parseIntOrThrow(raw, argName) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric value for ${argName}: ${raw}`);
  }
  return parsed;
}

export function sanitizeForFilename(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Split an array into `n` roughly equal chunks.
 * @param {IndexedSlide[]} arr
 * @param {number} n
 * @returns {IndexedSlide[][]}
 */
export function chunkByWorkers(arr, n) {
  const result = [];
  const size = Math.ceil(arr.length / n);
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.ok || response.status === 304) return;
    } catch {
      // Retry until timeout.
    }
    await wait(500);
  }

  throw new Error(`Timed out waiting for server at ${url}`);
}

async function startViteServer(cwd) {
  // 1. Build first
  console.log('Building production bundle...')
  await new Promise((resolve, reject) => {
    const build = spawn('npm', ['run', 'build'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    build.stdout.on('data', (chunk) => process.stdout.write(`[build] ${chunk}`))
    build.stderr.on('data', (chunk) => process.stderr.write(`[build] ${chunk}`))
    build.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Build failed with exit code ${code}`))
    })
  })

  // 2. Start preview server
  const child = spawn(
    'npm',
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
    {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    },
  )
  child.stdout.on('data', (chunk) => process.stdout.write(`[vite] ${chunk}`))
  child.stderr.on('data', (chunk) => process.stderr.write(`[vite] ${chunk}`))
  return child
}

/**
 * Navigate to a slide, simulate clicks at fake-time intervals, fast-forward
 * all JS timers, then snap remaining WAAPI animations to their final state
 * before taking a screenshot.
 * @param {import('playwright').Page} page
 * @param {number} index
 * @param {(i: number) => string} slideUrl
 * @param {number} slideTimeMs
 * @param {number} clickIntervalMs
 * @returns {Promise<Buffer>}
 */
async function captureSlide(page, index, slideUrl, slideTimeMs, clickIntervalMs) {
  // Install fake clock BEFORE navigation so all page scripts (including
  // setTimeout-based animation loops) use it from the start.
  await page.clock.install({ time: 0 });

  await page.goto(slideUrl(index), { waitUntil: "networkidle" });

  const viewport = page.viewportSize();
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  // Advance 15s before clicking so that one-shot state-machine animations
  // (e.g. CycleSlide needing up to ~11s, entry fades) complete their first
  // run before we start the click loop. This keeps the total fake time at
  // 15s + slideTimeMs, ensuring cyclic animations land in a predictable spot.
  await page.clock.fastForward(15_000);

  // Simulate clicks at fake-time intervals to trigger click-driven reveals
  // (e.g. KeyTakeawaySlide, FunctionCalling). fastForward is instant.
  const clicks = Math.floor(slideTimeMs / clickIntervalMs);
  for (let c = 0; c < clicks; c++) {
    await page.mouse.click(centerX, centerY);
    await page.clock.fastForward(clickIntervalMs);
  }

  // After fastForward, React processes state updates asynchronously via
  // MessageChannel. Wait for React to re-render AND for CSS transitions
  // (typically 0.3–0.9s) to complete before we touch the animations.
  await wait(1500);

  // Snap any still-running WAAPI animations to their end state. At this point
  // finite animations (entry fades, Framer Motion) have already completed; this
  // mainly stops infinite looping animations at the end of their first iteration.
  await page.evaluate(() => {
    for (const anim of document.getAnimations({ subtree: true })) {
      try {
        const timing = anim.effect?.getTiming?.();
        if (timing?.iterations === Infinity) {
          const d = typeof timing.duration === "number" ? timing.duration : 0;
          if (d > 0) anim.currentTime = d;
          anim.pause();
        } else {
          anim.finish();
        }
      } catch {
        // Ignore errors on individual animations.
      }
    }
  });

  // Brief settle for any DOM updates triggered by the finish/pause calls.
  await wait(100);

  return page.screenshot({ type: "png", fullPage: false });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!options.deck) {
    printHelp();
    throw new Error("--deck=<name> is required");
  }

  const deckName = options.deck;

  // Prevent path traversal: deck name must be a plain folder name with no separators.
  if (/[/\\]/.test(deckName)) {
    throw new Error(`--deck must be a simple folder name (no path separators), got: ${deckName}`);
  }

  const cwd = process.cwd();
  const outDir = path.resolve(cwd, options.outDir ?? `exports/${deckName}`);
  await mkdir(outDir, { recursive: true });

  const slideUrl = (index) =>
    `${options.baseUrl}/?deck=${encodeURIComponent(deckName)}&slide=${index}&export=1`;

  const pageOptions = {
    viewport: { width: options.width, height: options.height },
    deviceScaleFactor: 1,
  };

  let viteProcess;
  let browser;

  try {
    if (options.startServer) {
      console.log("Building and starting preview server...");
      viteProcess = await startViteServer(cwd);
      await waitForServer(slideUrl(0));
      console.log(`Server ready at ${options.baseUrl}`);
    }

    browser = await chromium.launch({ headless: true });

    // Fetch manifest with a temporary page.
    const manifestPage = await browser.newPage(pageOptions);
    await manifestPage.goto(slideUrl(0), { waitUntil: "networkidle" });

    /** @type {SlideManifestItem[] | null} */
    const rawManifest = await manifestPage.evaluate(() => {
      const manifest = window.__SLIDE_EXPORT_MANIFEST__
      if (!Array.isArray(manifest)) return null
      return manifest.map((slide) => ({
        id: String(slide.id),
        title: String(slide.title),
      }))
    });

    await manifestPage.close();

    if (!rawManifest || rawManifest.length === 0) {
      throw new Error(
        "Slide manifest is not available. Ensure the app exposes window.__SLIDE_EXPORT_MANIFEST__.",
      );
    }

    /** @type {IndexedSlide[]} */
    const manifest = rawManifest.map((slide, i) => ({ ...slide, index: i }));

    const slidesToExport = options.slides
      ? manifest.filter((s) => options.slides.has(s.index + 1))
      : manifest;

    if (slidesToExport.length === 0) {
      throw new Error(
        options.slides
          ? `No slides matched --slides selection (deck has ${manifest.length} slides)`
          : "Deck has no slides",
      );
    }

    const nConcurrent = Math.min(slidesToExport.length, options.concurrency);
    const batches = chunkByWorkers(slidesToExport, nConcurrent);
    const roundsNeeded = Math.max(...batches.map((b) => b.length));
    const estimatedMinutes = Math.ceil((roundsNeeded * options.slideTimeMs) / 60000);

    const selectionNote = options.slides
      ? ` (${slidesToExport.length} of ${manifest.length} selected)`
      : "";
    console.log(
      `Exporting ${slidesToExport.length} slides${selectionNote} across ${nConcurrent} workers` +
        ` (fake clock: ${estimatedMinutes * 60}s simulated → seconds of real time)...`,
    );

    /** @type {{ index: number; title: string; buffer: Buffer }[]} */
    const results = new Array(manifest.length);

    await Promise.all(
      batches.map(async (batch) => {
        const page = await browser.newPage(pageOptions);
        try {
          for (const { index, title } of batch) {
            console.log(`Capturing slide ${index + 1}/${manifest.length}: ${title}`);
            results[index] = {
              index,
              title,
              buffer: await captureSlide(
                page,
                index,
                slideUrl,
                options.slideTimeMs,
                options.clickIntervalMs,
              ),
            };
          }
        } finally {
          await page.close();
        }
      }),
    );

    // Ordered results for output (preserves deck order even with partial selection).
    const orderedResults = slidesToExport.map((s) => results[s.index]);

    if (options.format === "pdf" || options.format === "both") {
      const pdfDoc = await PDFDocument.create();

      for (const shot of orderedResults) {
        const image = await pdfDoc.embedPng(shot.buffer);
        const pdfPage = pdfDoc.addPage([options.width, options.height]);
        pdfPage.drawImage(image, {
          x: 0,
          y: 0,
          width: options.width,
          height: options.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const pdfPath = path.join(outDir, "slides.pdf");
      await writeFile(pdfPath, pdfBytes);
      console.log(`Saved PDF: ${pdfPath}`);
    }

    if (options.format === "png" || options.format === "both") {
      for (const shot of orderedResults) {
        const paddedIndex = String(shot.index + 1).padStart(2, "0");
        const safeTitle = sanitizeForFilename(shot.title || `slide-${shot.index}`);
        const pngPath = path.join(outDir, `${paddedIndex}-${safeTitle}.png`);
        await writeFile(pngPath, shot.buffer);
      }
      console.log(`Saved PNGs to: ${outDir}`);
    }
  } finally {
    if (browser) {
      await browser.close();
    }

    if (viteProcess && !viteProcess.killed) {
      viteProcess.kill("SIGTERM");
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
