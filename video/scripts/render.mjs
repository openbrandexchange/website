// Renders one locale to site-ready files:
//   node scripts/render.mjs en [--portrait]
// Writes a high-quality master to .drafts/, then encodes the small H.264 mp4 (faststart), the VP9
// webm and a poster JPEG. The home page plays only the landscape cut (../public/video/obx-<locale>.*);
// the portrait cut lands in out/ for social posts instead of the site build.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const locale = process.argv[2] ?? "en";
const portrait = process.argv.includes("--portrait");
const composition = `Explainer${portrait ? "9x16" : "16x9"}`;
const out = portrait ? "out" : join("..", "public", "video");
const name = `obx-${locale}${portrait ? "-9x16" : ""}`;
const master = join(".drafts", `master-${name}.mp4`);
const base = join(out, name);
// 1280x720 (or 720x1280) keeps the file small; everything is drawn at 1080p and scaled down.
const scale = String(2 / 3);
// The poster is the end card: the name, the address and who it is for.
const posterSeconds = process.env.POSTER_SECONDS ?? "-0.3";

mkdirSync(out, { recursive: true });
mkdirSync(".drafts", { recursive: true });
const run = (command, args) => execFileSync(command, args, { stdio: "inherit" });

run("npx", [
  "remotion", "render", "src/index.ts", composition, master,
  `--props=${JSON.stringify({ locale })}`,
  "--codec=h264", "--crf=16", `--scale=${scale}`,
  "--concurrency=4", "--timeout=120000",
]);

run("ffmpeg", ["-loglevel", "error", "-y", "-i", master,
  "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-movflags", "+faststart", "-c:a", "aac", "-b:a", "96k", "-ac", "1", `${base}.mp4`]);

run("ffmpeg", ["-loglevel", "error", "-y", "-i", master,
  "-c:v", "libvpx-vp9", "-crf", "42", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
  "-c:a", "libopus", "-b:a", "64k", "-ac", "1", `${base}.webm`]);

// A negative time counts back from the end.
run("ffmpeg", ["-loglevel", "error", "-y", ...(posterSeconds.startsWith("-") ? ["-sseof", posterSeconds] : ["-ss", posterSeconds]),
  "-i", master, "-frames:v", "1", "-q:v", "4", `${base}.jpg`]);

const seconds = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `${base}.mp4`]).toString().trim();
for (const extension of ["mp4", "webm", "jpg"]) {
  const file = `${base}.${extension}`;
  console.log(file, `${(statSync(file).size / 1024 / 1024).toFixed(2)} MB`, extension === "mp4" ? `${Number(seconds).toFixed(2)} s` : "");
}
if (process.env.KEEP_MASTER !== "1") rmSync(master);
