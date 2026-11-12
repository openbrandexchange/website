import type { VoiceId } from "./copy";

export const FPS = 30;

export type Beat = { id: string; lines: VoiceId[]; minSeconds?: number; extraSeconds?: number };

// One beat per point; each beat lasts as long as its voice lines plus a breath.
const BEATS: Beat[] = [
  { id: "problem", lines: ["problem"], minSeconds: 7.0 },
  { id: "portal", lines: ["portal", "buyers"], extraSeconds: 0.5 },
  { id: "api", lines: ["api"], extraSeconds: 0.6 },
  { id: "label", lines: ["label", "labelLaw"], extraSeconds: 0.6 },
  { id: "luggage", lines: ["luggage"], extraSeconds: 0.5 },
  { id: "rights", lines: ["rights"], extraSeconds: 0.4 },
  { id: "open", lines: ["open", "foundation"], extraSeconds: 0.5 },
  { id: "end", lines: ["cta"], minSeconds: 5.4 },
];

// A breath before and after every beat's voice so cuts never land mid-sentence.
const BREATH = { lead: 0.3, gap: 0.25, tail: 0.4 };

export type Line = { id: VoiceId; from: number; frames: number };

export const buildTimeline = (durations: Record<string, number>) => {
  const voice = (id: VoiceId) => durations[id] ?? 4;
  const scenes: Record<string, { from: number; frames: number }> = {};
  const lines: Line[] = [];
  let cursor = 0;

  for (const beat of BEATS) {
    let at = beat.id === "problem" ? 0.7 : BREATH.lead;
    for (const id of beat.lines) {
      lines.push({ id, from: Math.round((cursor + at) * FPS), frames: Math.ceil(voice(id) * FPS) });
      at += voice(id) + BREATH.gap;
    }
    const spoken = beat.lines.length ? at - BREATH.gap + BREATH.tail : 0;
    const seconds = Math.max(beat.minSeconds ?? 0, spoken + (beat.extraSeconds ?? 0));
    scenes[beat.id] = { from: Math.round(cursor * FPS), frames: Math.round(seconds * FPS) };
    cursor += seconds;
  }

  return { scenes, lines, totalFrames: Math.round(cursor * FPS) };
};
