import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { Stage, usePortrait, useRise } from "./kit";

type Kind = "mail" | "link" | "sheet" | "portal";

// Twelve deliveries, each in its own shape: the same content, sent a different way every time.
const CARDS: { kind: Kind; item: number; tilt: number; shift: [number, number]; scale: number }[] = [
  { kind: "mail", item: 0, tilt: -1.2, shift: [6, 10], scale: 1 },
  { kind: "sheet", item: 0, tilt: 0.8, shift: [-8, -4], scale: 0.94 },
  { kind: "link", item: 0, tilt: -0.4, shift: [4, 14], scale: 0.9 },
  { kind: "portal", item: 0, tilt: 1.1, shift: [-6, 0], scale: 1 },
  { kind: "link", item: 1, tilt: 0.6, shift: [10, -6], scale: 0.92 },
  { kind: "portal", item: 1, tilt: -0.9, shift: [0, 8], scale: 0.96 },
  { kind: "mail", item: 1, tilt: 1.4, shift: [-10, 2], scale: 0.9 },
  { kind: "sheet", item: 1, tilt: -0.5, shift: [6, -8], scale: 1 },
  { kind: "sheet", item: 2, tilt: 1.0, shift: [-4, 6], scale: 0.92 },
  { kind: "mail", item: 2, tilt: -1.3, shift: [8, -2], scale: 0.98 },
  { kind: "portal", item: 2, tilt: 0.4, shift: [-8, 10], scale: 0.9 },
  { kind: "link", item: 2, tilt: -0.8, shift: [2, -10], scale: 0.96 },
];

const Icon = ({ kind, color }: { kind: Kind; color: string }) => {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (kind === "mail")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
      </svg>
    );
  if (kind === "link")
    return (
      <svg {...common}>
        <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
        <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
      </svg>
    );
  if (kind === "sheet")
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M4 9h16M4 15h16M10 3v18" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </svg>
  );
};

const bar = (w: number | string, color: string, h = 10): CSSProperties => ({ width: w, height: h, borderRadius: 99, background: color });

// The body of each card hints at what kind of delivery it is, without real content.
const Body = ({ kind }: { kind: Kind }) => {
  if (kind === "mail")
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={bar("86%", "#e3e7ee")} />
        <div style={bar("64%", "#e3e7ee")} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 46, height: 34, borderRadius: 6, background: "#eceff4", border: "1px solid #dfe3ea" }} />
          ))}
        </div>
      </div>
    );
  if (kind === "link")
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ height: 12, borderRadius: 99, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: "58%", height: "100%", background: theme.inkFg2, borderRadius: 99 }} />
        </div>
        <div style={bar("44%", "rgba(255,255,255,0.14)")} />
      </div>
    );
  if (kind === "sheet")
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid #d9dee6" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ height: 17, borderRight: i % 4 === 3 ? "none" : "1px solid #d9dee6", borderBottom: i < 8 ? "1px solid #d9dee6" : "none", background: i < 4 ? "#e8f1ea" : "#fff" }} />
        ))}
      </div>
    );
  return (
    <div style={{ display: "grid", gap: 9 }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ height: 22, borderRadius: 4, border: "1.5px solid #cfd5df", background: "#fff" }} />
      ))}
      <div style={{ ...bar(96, "#5b6477", 22), borderRadius: 4 }} />
    </div>
  );
};

const look: Record<Kind, { bg: string; fg: string; sub: string; radius: number; border: string }> = {
  mail: { bg: "#ffffff", fg: theme.fg, sub: theme.muted, radius: 14, border: "none" },
  link: { bg: "#232c46", fg: theme.inkFg, sub: theme.inkMuted, radius: 22, border: "1px solid rgba(255,255,255,0.12)" },
  sheet: { bg: "#f7f8f5", fg: theme.fg, sub: theme.muted, radius: 4, border: "none" },
  portal: { bg: "#eef0f4", fg: theme.fg, sub: theme.muted, radius: 8, border: "2px solid #c7cedb" },
};

const Card = ({ kind, label, text, style }: { kind: Kind; label: string; text: string; style: CSSProperties }) => {
  const l = look[kind];
  return (
    <div
      style={{
        width: 360,
        padding: 24,
        background: l.bg,
        color: l.fg,
        borderRadius: l.radius,
        border: l.border,
        boxShadow: "0 18px 40px -16px rgba(0,0,0,0.6)",
        display: "grid",
        gap: 16,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Icon kind={kind} color={l.sub} />
        <span style={{ fontSize: 19, fontWeight: 600, color: l.sub, letterSpacing: "0.01em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.25, textWrap: "balance" }}>{text}</div>
      <Body kind={kind} />
    </div>
  );
};

export const ProblemScene = ({ ui }: { ui: Ui["problem"] }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const portrait = usePortrait();
  const columns = portrait ? 2 : 4;
  const cards = portrait ? CARDS.slice(0, 8) : CARDS;
  const cellW = 410;
  const cellH = 250;
  const visual = { w: columns * cellW, h: Math.ceil(cards.length / columns) * cellH };

  const cells: ReactNode[] = cards.map((card, index) => {
    const order = [0, 5, 2, 7, 4, 9, 1, 11, 6, 3, 10, 8][index] ?? index;
    const shown = rise(6 + order * 4);
    const drift = Math.sin((frame + index * 23) / 38) * 4;
    return (
      <div key={index} style={{ width: cellW, height: cellH, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card
          kind={card.kind}
          label={ui.kinds[card.kind]}
          text={ui.items[card.kind][card.item]}
          style={{
            opacity: shown,
            transform: `translate(${card.shift[0]}px, ${card.shift[1] + drift + (1 - shown) * 26}px) rotate(${card.tilt}deg) scale(${card.scale})`,
          }}
        />
      </div>
    );
  });

  return (
    <Stage dark eyebrow={ui.eyebrow} title={ui.title} layout="top" visual={visual} maxScale={1}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, ${cellW}px)` }}>{cells}</div>
    </Stage>
  );
};
