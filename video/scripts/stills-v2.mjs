// Renders review stills of the v2 explainer at its key moments, into .drafts/stills-v2/:
//   node scripts/stills-v2.mjs en 16x9 [frame …]
// Without frames it picks one still per scene.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { FPS, timelineV2 } from "./timeline-v2.mjs";

const [locale = "en", format = "16x9", ...given] = process.argv.slice(2);
const { lines, chunks: c, end, posterFrame } = timelineV2(locale);
const auto = {
  before: lines.rush + 50,
  idea: end("idea") - 14,
  in: lines.in + Math.round((c.in[1] + 1.6) * FPS),
  standard: lines.standard + Math.round((c.standard[2] + 1.2) * FPS),
  out: lines.out + Math.round((c.out[1] + 0.8) * FPS),
  poster: posterFrame,
  after: end("after") - 14,
  once: end("once") - 14,
  end: end("end") - 2,
};
const frames = given.length ? given.map((f) => [f, Number(f)]) : Object.entries(auto);

const serveUrl = await bundle({ entryPoint: resolve("src/index.ts") });
const inputProps = { locale };
const composition = await selectComposition({ serveUrl, id: `ExplainerV2-${format}`, inputProps });
console.log(`${locale} ${format}: ${composition.durationInFrames} frames, ${(composition.durationInFrames / FPS).toFixed(2)} s`);
const dir = join(".drafts", "stills-v2");
mkdirSync(dir, { recursive: true });
for (const [name, frame] of frames) {
  const output = join(dir, `${locale}-${format}-${name}.png`);
  await renderStill({ serveUrl, composition, inputProps, frame, output, scale: 0.5 });
  console.log(output, frame);
}
