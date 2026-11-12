// Renders stills at given frames for checking layouts, into .drafts/stills/:
//   node scripts/stills.mjs en 16x9 120 400 900
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const [locale = "en", format = "16x9", ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: resolve("src/index.ts") });
const inputProps = { locale };
const composition = await selectComposition({ serveUrl, id: `Explainer${format}`, inputProps });
const dir = join(".drafts", "stills");
mkdirSync(dir, { recursive: true });
for (const frame of frames.map(Number)) {
  const output = join(dir, `${locale}-${format}-${String(frame).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, inputProps, frame, output, scale: 0.5 });
  console.log(output);
}
