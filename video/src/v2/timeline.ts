import type { LineId } from "./copy";

export const FPS = 30;

type Beat = { id: string; lines: LineId[]; minSeconds?: number; extraSeconds?: number };

// One beat per scene; each lasts as long as its voice lines plus a calm breath around them.
export const BEATS: Beat[] = [
  { id: "before", lines: ["before", "rush"] },
  { id: "idea", lines: ["idea"], extraSeconds: 0.1 },
  { id: "flow", lines: ["in", "standard", "out"], extraSeconds: 0.8 },
  { id: "after", lines: ["after"] },
  { id: "once", lines: ["once"] },
  { id: "dev", lines: ["dev"] },
  { id: "open", lines: ["open", "connect", "portal"] },
  { id: "example", lines: ["example"] },
  { id: "end", lines: ["end"], minSeconds: 3.0 },
];

const BREATH = { first: 0.5, lead: 0.3, gap: 0.3, tail: 0.35 };

export type Line = { id: LineId; from: number; frames: number };
export type Span = { from: number; frames: number };

export const buildTimeline = (durations: Record<string, number>) => {
  const scenes: Record<string, Span> = {};
  const lines: Line[] = [];
  let cursor = 0;
  BEATS.forEach((beat, index) => {
    let at = index === 0 ? BREATH.first : BREATH.lead;
    for (const id of beat.lines) {
      lines.push({ id, from: Math.round((cursor + at) * FPS), frames: Math.ceil((durations[id] ?? 4) * FPS) });
      at += (durations[id] ?? 4) + BREATH.gap;
    }
    const seconds = Math.max(beat.minSeconds ?? 0, at - BREATH.gap + BREATH.tail + (beat.extraSeconds ?? 0));
    scenes[beat.id] = { from: Math.round(cursor * FPS), frames: Math.round(seconds * FPS) };
    cursor += seconds;
  });
  const total = Math.round(cursor * FPS);
  // The poster: the full In → standard → Out diagram, just before the flow scene fades out.
  const posterFrame = scenes.flow.from + scenes.flow.frames - 12;
  return { scenes, lines, totalFrames: total, posterFrame };
};
