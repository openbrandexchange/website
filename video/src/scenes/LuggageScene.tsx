import { interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { clamp, lift, Stage, usePortrait, useRise } from "./kit";

// Spec fixture KO-1008, size CABIN: 55 × 40 × 20 cm. Drawn at 7.5 px per cm.
const CM = 7.5;
const TOP = 60;
const H = 55 * CM;
const FRONT = { x: 120, w: 40 * CM };
const SIDE = { x: 560, w: 20 * CM };
const BOTTOM = TOP + H;

const line = (progress: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - progress });

const Arrow = ({ x1, y1, x2, y2, progress }: { x1: number; y1: number; x2: number; y2: number; progress: number }) => {
  const vertical = x1 === x2;
  const tick = 12;
  return (
    <g stroke={theme.inkAccent} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={progress > 0 ? 1 : 0}>
      <path d={`M${x1} ${y1} L${x2} ${y2}`} {...line(progress)} />
      {vertical ? (
        <>
          <path d={`M${x1 - tick} ${y1} h${2 * tick} M${x2 - tick} ${y2} h${2 * tick}`} opacity={progress} />
          <path d={`M${x1 - 7} ${y1 + 11} L${x1} ${y1 + 2} L${x1 + 7} ${y1 + 11} M${x2 - 7} ${y2 - 11} L${x2} ${y2 - 2} L${x2 + 7} ${y2 - 11}`} opacity={progress} />
        </>
      ) : (
        <>
          <path d={`M${x1} ${y1 - tick} v${2 * tick} M${x2} ${y2 - tick} v${2 * tick}`} opacity={progress} />
          <path d={`M${x1 + 11} ${y1 - 7} L${x1 + 2} ${y1} L${x1 + 11} ${y1 + 7} M${x2 - 11} ${y2 - 7} L${x2 - 2} ${y2} L${x2 - 11} ${y2 + 7}`} opacity={progress} />
        </>
      )}
    </g>
  );
};

const Suitcase = ({ draw, dims, labels }: { draw: number; dims: number[]; labels: Ui["luggage"] }) => {
  const stroke = { stroke: theme.inkFg2, strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const bodyTop = TOP + 26;
  const bodyBottom = BOTTOM - 30;
  const label = (x: number, y: number, text: string, opacity: number, anchor: "middle" | "end" = "middle") => (
    <text x={x} y={y} textAnchor={anchor} fill={theme.inkFg} fontSize={30} fontWeight={650} fontFamily={theme.font} opacity={opacity}>
      {text}
    </text>
  );
  return (
    <svg width={760} height={620} viewBox="0 0 760 620" style={{ overflow: "visible" }}>
      {/* Front: body, top handle, ribs, lock, wheels. */}
      <rect x={FRONT.x} y={bodyTop} width={FRONT.w} height={bodyBottom - bodyTop} rx={30} {...stroke} {...line(draw)} />
      <path d={`M${FRONT.x + 110} ${bodyTop} v-16 a10 10 0 0 1 10 -10 h60 a10 10 0 0 1 10 10 v16`} {...stroke} {...line(draw)} />
      {[0.3, 0.5, 0.7].map((f) => (
        <path key={f} d={`M${FRONT.x + FRONT.w * f} ${bodyTop + 50} V${bodyBottom - 50}`} {...stroke} strokeWidth={2} opacity={0.55} {...line(draw)} />
      ))}
      <rect x={FRONT.x + FRONT.w - 76} y={bodyTop + 46} width={44} height={30} rx={6} {...stroke} strokeWidth={2.5} {...line(draw)} />
      {[FRONT.x + 34, FRONT.x + FRONT.w - 34].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 14} ${bodyBottom} v8 M${cx + 14} ${bodyBottom} v8`} {...stroke} strokeWidth={2.5} {...line(draw)} />
          <circle cx={cx} cy={BOTTOM - 11} r={11} {...stroke} {...line(draw)} />
        </g>
      ))}
      {/* Side: depth, expansion zip, wheels. */}
      <rect x={SIDE.x} y={bodyTop} width={SIDE.w} height={bodyBottom - bodyTop} rx={22} {...stroke} {...line(draw)} />
      <path d={`M${SIDE.x + SIDE.w / 2} ${bodyTop + 12} V${bodyBottom - 12}`} {...stroke} strokeWidth={2} strokeDasharray="6 8" opacity={draw} />
      <path d={`M${SIDE.x + SIDE.w / 2 - 25} ${bodyTop} v-16 a8 8 0 0 1 8 -8 h34 a8 8 0 0 1 8 8 v16`} {...stroke} {...line(draw)} />
      {[SIDE.x + 30, SIDE.x + SIDE.w - 30].map((cx) => (
        <circle key={cx} cx={cx} cy={BOTTOM - 11} r={11} {...stroke} {...line(draw)} />
      ))}

      {/* Dimensions: outside, including wheels and handles. */}
      <Arrow x1={60} y1={TOP} x2={60} y2={BOTTOM} progress={dims[0]} />
      {label(48, TOP + H / 2 + 10, labels.height, dims[0], "end")}
      <Arrow x1={FRONT.x} y1={BOTTOM + 44} x2={FRONT.x + FRONT.w} y2={BOTTOM + 44} progress={dims[1]} />
      {label(FRONT.x + FRONT.w / 2, BOTTOM + 96, labels.width, dims[1])}
      <Arrow x1={SIDE.x} y1={BOTTOM + 44} x2={SIDE.x + SIDE.w} y2={BOTTOM + 44} progress={dims[2]} />
      {label(SIDE.x + SIDE.w / 2, BOTTOM + 96, labels.depth, dims[2])}
    </svg>
  );
};

export const LuggageScene = ({ ui, lineFrames }: { ui: Ui["luggage"]; lineFrames: number }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const portrait = usePortrait();
  const draw = interpolate(frame, [6, 46], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const dims = [0, 1, 2].map((i) => interpolate(frame, [36 + i * 10, 56 + i * 10], [0, 1], clamp));
  const featuresAt = Math.min(70, Math.round(lineFrames * 0.45));

  const features = (
    <div style={{ width: portrait ? 900 : 360, display: portrait ? "flex" : "grid", flexWrap: "wrap", gap: portrait ? 14 : 14 }}>
      <div style={{ fontSize: 26, fontWeight: 650, color: theme.inkFg, marginBottom: 8, width: portrait ? "100%" : undefined, ...lift(rise(20)) }}>{ui.product}</div>
      {ui.features.map((feature, index) => (
        <span
          key={feature}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 27,
            fontWeight: 600,
            background: theme.inkPanel,
            boxShadow: `0 0 0 1px ${theme.inkLine}`,
            color: theme.inkFg,
            justifySelf: "start",
            ...lift(rise(featuresAt + index * 6), 12),
          }}
        >
          {feature}
        </span>
      ))}
    </div>
  );

  const visual = portrait ? { w: 920, h: 1040 } : { w: 1160, h: 760 };
  return (
    <Stage dark eyebrow={ui.eyebrow} title={ui.title} visual={visual} headerWidth={500} maxScale={1.15}>
      <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", gap: 40, alignItems: portrait ? "flex-start" : "center", width: visual.w }}>
        <Suitcase draw={draw} dims={dims} labels={ui} />
        {features}
      </div>
      <div style={{ position: "absolute", left: portrait ? 0 : 60, bottom: 0, fontSize: 22, color: theme.inkMuted, ...lift(rise(featuresAt + 30)) }}>{ui.note}</div>
    </Stage>
  );
};
