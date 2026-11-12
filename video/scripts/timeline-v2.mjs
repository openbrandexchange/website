// The v2 timeline for the scripts (mirrors src/v2/timeline.ts; keep the two in step).
import { readFileSync } from "node:fs";

export const FPS = 30;
const BEATS = [
  ["before", ["before", "rush"], 0, 0],
  ["idea", ["idea"], 0, 0.1],
  ["flow", ["in", "standard", "out"], 0, 0.3],
  ["after", ["after"], 0, 0],
  ["once", ["once"], 0, 0],
  ["dev", ["dev"], 0, 0],
  ["open", ["open", "connect", "portal"], 0, 0],
  ["example", ["example"], 0, 0],
  ["end", ["end"], 3.0, 0],
];
const BREATH = { first: 0.5, lead: 0.3, gap: 0.3, tail: 0.35 };

export const timelineV2 = (locale) => {
  const voice = "en"; // every language uses the English voice; only the captions differ
  const d = JSON.parse(readFileSync(`public/voice-v2/${voice}/durations.json`, "utf8"));
  const chunks = JSON.parse(readFileSync(`public/voice-v2/${voice}/chunks.json`, "utf8"));
  const scenes = {};
  const lines = {};
  let cursor = 0;
  BEATS.forEach(([id, ls, min, extra], i) => {
    let at = i === 0 ? BREATH.first : BREATH.lead;
    for (const l of ls) {
      lines[l] = Math.round((cursor + at) * FPS);
      at += d[l] + BREATH.gap;
    }
    const seconds = Math.max(min, at - BREATH.gap + BREATH.tail + extra);
    scenes[id] = { from: Math.round(cursor * FPS), frames: Math.round(seconds * FPS) };
    cursor += seconds;
  });
  const end = (id) => scenes[id].from + scenes[id].frames;
  // The poster: the full In → standard → Out diagram, just before the flow scene fades out.
  return { scenes, lines, chunks, end, posterFrame: end("flow") - 16, totalFrames: Math.round(cursor * FPS) };
};
