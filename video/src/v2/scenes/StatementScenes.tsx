import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { Accented, clamp, Kicker, lift, Mark, useRise, useStage } from "./kit";

/** A spoken sentence set large on screen (it replaces the caption), with a small drawing above it. */
const Statement = ({ text, graphic }: { text: string; graphic: ReactNode }) => {
  const rise = useRise();
  const { portrait, padX, boxW } = useStage();
  return (
    <AbsoluteFill style={{ padding: `0 ${padX}px`, justifyContent: "center", paddingBottom: portrait ? 200 : 20, paddingTop: portrait ? 200 : 150 }}>
      <div style={{ maxWidth: portrait ? boxW : 1500 }}>
        <div style={{ ...lift(rise(2)) }}>{graphic}</div>
        <div
          style={{
            marginTop: portrait ? 64 : 56,
            fontFamily: theme.font,
            fontSize: portrait ? 92 : 104,
            fontWeight: 640,
            letterSpacing: "-0.035em",
            lineHeight: 1.06,
            color: theme.fg,
            textWrap: "balance",
            ...lift(rise(6)),
          }}
        >
          <Accented text={text} underline={portrait ? 10 : 12} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Six different blocks (every party's own layout) settle on one baseline. */
const Aligning = () => {
  const frame = useCurrentFrame();
  const { portrait } = useStage();
  const settle = interpolate(frame, [10, 46], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const offsets = [-38, 26, -12, 44, -30, 14];
  const heights = [56, 40, 72, 48, 64, 36];
  const size = portrait ? 64 : 72;
  return (
    <div style={{ display: "flex", gap: portrait ? 18 : 22, alignItems: "flex-end", height: 140 }}>
      {offsets.map((o, i) => {
        const h = heights[i] + (size - heights[i]) * settle;
        return (
          <span
            key={i}
            style={{
              width: size,
              height: h,
              border: `3px solid ${theme.fg}`,
              background: i === 5 && settle > 0.98 ? theme.accent : i % 2 ? theme.surface : theme.fg,
              borderColor: i === 5 && settle > 0.98 ? theme.accent : theme.fg,
              transform: `translateY(${o * (1 - settle)}px) rotate(${(i % 2 ? 6 : -5) * (1 - settle)}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

export const IdeaScene = ({ text }: { text: string }) => <Statement text={text} graphic={<Aligning />} />;

/** One mark ("once"), then a rule that runs on through the years. */
const Years = ({ ui, lineFrames }: { ui: Ui["once"]; lineFrames: number }) => {
  const frame = useCurrentFrame();
  const { portrait } = useStage();
  const n = portrait ? 4 : 6;
  const span = portrait ? 860 : 1500;
  const run = interpolate(frame, [12, Math.max(40, lineFrames + 10)], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  const stepW = (span - 80) / n;
  return (
    <div style={{ position: "relative", width: span, height: 120 }}>
      <span style={{ position: "absolute", left: 0, top: 30, width: 48, height: 48, background: theme.accent }} />
      <span style={{ position: "absolute", left: 48, top: 53, height: 3, width: (span - 48) * run, background: theme.fg }} />
      {Array.from({ length: n }, (_, i) => {
        const x = 80 + stepW * (i + 1) - 4;
        const shown = interpolate(run * (span - 48) + 48, [x - 20, x + 20], [0, 1], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: x - 70, width: 140, top: 40, textAlign: "center", opacity: shown }}>
            <span style={{ display: "block", margin: "0 auto", width: 3, height: 28, background: theme.fg }} />
            <Kicker size={20} color={theme.muted} style={{ marginTop: 14, letterSpacing: "0.04em" }}>
              {ui.year.replace("{n}", String(i + 1))}
            </Kicker>
          </div>
        );
      })}
    </div>
  );
};

export const OnceScene = ({ text, ui, lineFrames }: { text: string; ui: Ui["once"]; lineFrames: number }) => (
  <Statement text={text} graphic={<Years ui={ui} lineFrames={lineFrames} />} />
);

export const EndScene = ({ ui }: { ui: Ui["end"] }) => {
  const rise = useRise();
  const { portrait } = useStage();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: theme.font, color: theme.fg, paddingBottom: portrait ? 120 : 0 }}>
      <div style={{ ...lift(rise(0)) }}>
        <Mark height={portrait ? 120 : 132} />
      </div>
      <div style={{ marginTop: 48, fontSize: portrait ? 92 : 112, fontWeight: 680, letterSpacing: "-0.04em", lineHeight: 1, ...lift(rise(6)) }}>Open Brand Exchange</div>
      <div style={{ marginTop: 34, maxWidth: portrait ? 860 : 1400, fontSize: portrait ? 52 : 54, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.18, color: theme.fg2, textWrap: "balance", ...lift(rise(12)) }}>{ui.line}</div>
      <div style={{ marginTop: 64, ...lift(rise(20)) }}>
        <span style={{ display: "inline-block", padding: "20px 36px", border: `2.5px solid ${theme.fg}`, boxShadow: `8px 8px 0 ${theme.fg}`, background: theme.surface, fontFamily: theme.mono, fontSize: portrait ? 40 : 44, fontWeight: 600, letterSpacing: "0.01em" }}>
          {ui.url}
        </span>
      </div>
    </AbsoluteFill>
  );
};
