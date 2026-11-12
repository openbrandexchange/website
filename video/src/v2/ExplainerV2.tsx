import type { ReactNode } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { chunksOf, copyFor, type LineId, type Locale } from "./copy";
import { Fonts } from "./Fonts";
import { AfterScene } from "./scenes/AfterScene";
import { BeforeScene } from "./scenes/BeforeScene";
import { FlowScene, type FlowTimes } from "./scenes/FlowScene";
import { clamp, Kicker, Mark } from "./scenes/kit";
import { DevScene } from "./scenes/DevScene";
import { ExampleScene, OpenScene, type OpenTimes } from "./scenes/OpenScenes";
import { EndScene, IdeaScene, OnceScene } from "./scenes/StatementScenes";
import { theme } from "./theme";
import { buildTimeline, FPS, type Line } from "./timeline";

export type ExplainerV2Props = { locale: Locale };

/** Fades a scene's content in and out over the paper background that stays put. */
const Fade = ({ children, frames, out = true }: { children: ReactNode; frames: number; out?: boolean }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(interpolate(frame, [0, 10], [0, 1], clamp), out ? interpolate(frame, [frames - 10, frames], [1, 0], clamp) : 1);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** The name on the left, the chapter on the right, a solid black rule beneath: like the website's header. */
const Header = ({ chapters, hideAt }: { chapters: { from: number; n: number; label: string }[]; hideAt: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const padX = portrait ? 72 : 96;
  const y = portrait ? 150 : 64;
  const show = interpolate(frame, [4, 18], [0, 1], clamp) * interpolate(frame, [hideAt - 10, hideAt], [1, 0], clamp);
  let current = chapters[0];
  for (const c of chapters) if (frame >= c.from) current = c;
  const switchIn = interpolate(frame, [current.from, current.from + 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: show, fontFamily: theme.font, color: theme.fg }}>
      <div style={{ position: "absolute", left: padX, right: padX, top: y, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark height={portrait ? 34 : 32} />
          {!portrait && <span style={{ fontSize: 28, fontWeight: 650, letterSpacing: "-0.02em" }}>Open Brand Exchange</span>}
        </div>
        <Kicker size={portrait ? 24 : 22} style={{ display: "flex", gap: 14, opacity: switchIn, transform: `translateY(${(1 - switchIn) * 8}px)` }}>
          <span style={{ color: theme.accentFg }}>{String(current.n).padStart(2, "0")}</span>
          <span>{current.label}</span>
        </Kicker>
      </div>
      <div style={{ position: "absolute", left: padX, right: padX, top: y + 70, height: 2, background: theme.fg }} />
    </AbsoluteFill>
  );
};

/** The spoken words, burned in, a chunk at a time (chunk times come from the voice alignment). */
const Caption = ({ text, frames, first, last }: { text: string; frames: number; first: boolean; last: boolean }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const opacity = Math.min(first ? interpolate(frame, [0, 4], [0, 1], clamp) : 1, last ? interpolate(frame, [frames - 5, frames], [1, 0], clamp) : 1);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: portrait ? 330 : 58 }}>
      <div
        style={{
          maxWidth: portrait ? 900 : 1440,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: theme.font,
          fontWeight: 520,
          fontSize: portrait ? 46 : 40,
          lineHeight: 1.3,
          letterSpacing: "-0.005em",
          color: theme.inkFg,
          background: theme.ink,
          padding: portrait ? "16px 28px" : "12px 26px",
          opacity,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const ExplainerV2 = ({ locale }: ExplainerV2Props) => {
  const { copy, voice, durations, chunks } = copyFor(locale);
  const { scenes, lines } = buildTimeline(durations);
  const ui = copy.ui;
  const line = (id: LineId) => lines.find((l) => l.id === id) as Line;
  const at = (id: LineId, scene: string, seconds = 0) => line(id).from - scenes[scene].from + Math.round(seconds * FPS);
  const chunkAt = (id: LineId, scene: string, i: number) => at(id, scene, (chunks as Record<string, number[]>)[id][i]);

  const t: FlowTimes = {
    in: at("in", "flow"),
    inPhotos: chunkAt("in", "flow", 1),
    standard: at("standard", "flow") - 6,
    same: chunkAt("standard", "flow", 1),
    images: chunkAt("standard", "flow", 2),
    out: at("out", "flow") - 6,
    outDownload: chunkAt("out", "flow", 1),
    all: at("out", "flow") + line("out").frames + 6,
  };

  const chapters = [
    { from: scenes.before.from, n: 1, label: ui.chapters.before },
    { from: scenes.idea.from, n: 2, label: ui.chapters.idea },
    { from: scenes.flow.from, n: 3, label: ui.chapters.in },
    { from: scenes.flow.from + t.standard, n: 4, label: ui.chapters.standard },
    { from: scenes.flow.from + t.out, n: 5, label: ui.chapters.out },
    { from: scenes.after.from, n: 6, label: ui.chapters.after },
    { from: scenes.once.from, n: 7, label: ui.chapters.once },
    { from: scenes.dev.from, n: 8, label: ui.chapters.dev },
    { from: scenes.open.from, n: 9, label: ui.chapters.open },
    { from: scenes.example.from, n: 10, label: ui.chapters.example },
  ];

  const open: OpenTimes = {
    open: at("open", "open"),
    connect: at("connect", "open"),
    parties: chunkAt("connect", "open", 1),
    systems: chunkAt("connect", "open", 2),
    portal: at("portal", "open"),
  };

  const scene = (id: string, children: ReactNode) => (
    <Sequence key={id} from={scenes[id].from} durationInFrames={scenes[id].frames} name={id}>
      <Fade frames={scenes[id].frames} out={id !== "end"}>
        {children}
      </Fade>
    </Sequence>
  );

  const caption = (id: LineId) => copy.voice.find((v) => v.id === id)!.caption;

  // Captions: every chunk from its start in the voice to the next chunk (or the end of the line).
  const captionSpans = lines.flatMap((l) => {
    const entry = copy.voice.find((v) => v.id === l.id)!;
    if ("onScreen" in entry && entry.onScreen) return [];
    const texts = chunksOf(entry.caption);
    const starts = (chunks as Record<string, number[]>)[l.id];
    if (texts.length !== starts.length) throw new Error(`${locale}/${l.id}: ${texts.length} caption chunks, ${starts.length} in the ${voice} voice`);
    return texts.map((text, i) => {
      const from = l.from + Math.round(starts[i] * FPS);
      const to = i + 1 < starts.length ? l.from + Math.round(starts[i + 1] * FPS) : l.from + l.frames + 8;
      return { key: `${l.id}-${i}`, text, from, frames: to - from, first: i === 0, last: i === texts.length - 1 };
    });
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <Fonts />
      {scene("before", <BeforeScene ui={ui.before} locale={locale} rushAt={at("rush", "before")} />)}
      {scene("idea", <IdeaScene text={caption("idea")} />)}
      {scene("flow", <FlowScene ui={ui.flow} t={t} />)}
      {scene("after", <AfterScene ui={ui.after} names={ui.flow.products.map((p) => p.name)} />)}
      {scene("once", <OnceScene text={caption("once")} ui={ui.once} lineFrames={line("once").frames} />)}
      {scene("dev", <DevScene ui={ui.dev} names={ui.flow.products.map((p) => p.name)} t={{ start: at("dev", "dev"), assistant: chunkAt("dev", "dev", 1), months: chunkAt("dev", "dev", 2) }} />)}
      {scene("open", <OpenScene ui={ui.open} t={open} end={scenes.open.frames + 30} />)}
      {scene("example", <ExampleScene ui={ui.example} />)}
      {scene("end", <EndScene ui={ui.end} />)}

      <Header chapters={chapters} hideAt={scenes.end.from + 6} />

      {captionSpans.map((c) => (
        <Sequence key={c.key} from={c.from} durationInFrames={c.frames} layout="none">
          <Caption text={c.text} frames={c.frames} first={c.first} last={c.last} />
        </Sequence>
      ))}

      {lines.map((l) => (
        <Sequence key={l.id} from={l.from} durationInFrames={l.frames + 20} layout="none">
          <Audio src={staticFile(`voice-v2/${voice}/${l.id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
