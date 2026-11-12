// Renders the explainer (composition ExplainerV2, cut v3: one English voice, captions per language) into out/v3/:
//   node scripts/render-v2.mjs                 all: every caption language in 16:9, en nl in 9:16
//   node scripts/render-v2.mjs en:16x9 nl:9x16 only these
// 16:9 → obx-v3-<locale>.mp4 (H.264, faststart) + .jpg poster (the framed standard), and .webm (VP9) for
// en nl de fr. 9:16 → obx-v3-<locale>-9x16.mp4. Every cut is drawn at 1080p; masters go to .drafts/ and are deleted.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { timelineV2 } from "./timeline-v2.mjs";

const FIRST = ["en", "nl", "de", "fr"];
const OTHERS = readdirSync("src/v2/copy").map((f) => f.replace(".json", "")).filter((l) => !FIRST.includes(l)).sort();
const ALL = [...FIRST.map((l) => `${l}:16x9`), "en:9x16", "nl:9x16", ...OTHERS.map((l) => `${l}:16x9`)];
const WEBM = new Set(FIRST);
const jobs = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const out = join("out", "v3");
mkdirSync(out, { recursive: true });
mkdirSync(".drafts", { recursive: true });
const run = (args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });
const mb = (file) => `${(statSync(file).size / 1024 / 1024).toFixed(2)} MB`;
const seconds = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString()).toFixed(2);

// Speech at the usual web loudness, the same for every language.
const LOUDNESS = ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000"];

const serveUrl = await bundle({ entryPoint: resolve("src/index.ts") });

for (const job of jobs) {
  const [locale, format] = job.split(":");
  const portrait = format === "9x16";
  const inputProps = { locale };
  const composition = await selectComposition({ serveUrl, id: `ExplainerV2-${format}`, inputProps });
  const name = `obx-v3-${locale}${portrait ? "-9x16" : ""}`;
  const master = join(".drafts", `master-${name}.mp4`);
  const base = join(out, name);
  console.log(`${name}: ${composition.durationInFrames} frames`);

  await renderMedia({ serveUrl, composition, inputProps, codec: "h264", crf: 14, outputLocation: master, concurrency: 6, timeoutInMilliseconds: 120000 });

  // Flat drawings on paper compress well: a high CRF stays sharp and keeps the file small.
  run(["-i", master, "-c:v", "libx264", "-preset", "slow", "-crf", portrait ? "24" : "23", "-tune", "animation", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", ...LOUDNESS, "-c:a", "aac", "-b:a", "96k", "-ac", "1", `${base}.mp4`]);
  const made = [`${base}.mp4`];

  if (!portrait && WEBM.has(locale)) {
    run(["-i", master, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
      ...LOUDNESS, "-c:a", "libopus", "-b:a", "64k", "-ac", "1", `${base}.webm`]);
    made.push(`${base}.webm`);
  }
  if (!portrait) {
    const png = join(".drafts", `${name}-poster.png`);
    await renderStill({ serveUrl, composition, inputProps, frame: timelineV2(locale).posterFrame, output: png });
    run(["-i", png, "-q:v", "3", `${base}.jpg`]);
    rmSync(png);
    made.push(`${base}.jpg`);
  }
  for (const file of made) console.log(file, mb(file), file.endsWith(".jpg") ? "" : `${seconds(file)} s`);
  if (process.env.KEEP_MASTER !== "1") rmSync(master);
}
