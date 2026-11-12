import type { ReactNode } from "react";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { lift, Stage, usePortrait, useRise } from "./kit";

// A product image drawn like the website's screenshots: the spec's KO-1003 tee in rust, on warm grey.
const Product = () => (
  <svg width="440" height="520" viewBox="0 0 440 520">
    <rect width="440" height="520" fill="#efedea" />
    <ellipse cx="220" cy="452" rx="130" ry="12" fill="rgba(0,0,0,0.08)" />
    <path
      d="M150 92 C170 110 270 110 290 92 L360 122 L392 200 L340 222 L322 186 L322 430 L118 430 L118 186 L100 222 L48 200 L80 122 Z"
      fill="#a9502f"
    />
    <path d="M150 92 C170 120 270 120 290 92" fill="none" stroke="#8a3f24" strokeWidth="9" strokeLinecap="round" />
    <path d="M118 186 L118 430 L322 430 L322 186" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2" />
  </svg>
);

const icons: ReactNode[] = [
  <path key="r" d="M5 12.5l4.5 4.5L19 7.5" />,
  <g key="e">
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </g>,
  <g key="a">
    <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.6L12 15l-1.8-4.4L5.5 9l4.7-1.4z" />
    <path d="M18 15l.8 2 2 .7-2 .8-.8 2-.8-2-2-.8 2-.7z" />
  </g>,
];

export const RightsScene = ({ ui, lineFrames }: { ui: Ui["rights"]; lineFrames: number }) => {
  const rise = useRise();
  const portrait = usePortrait();
  // The three facts follow the sentence: rights, embargo, AI.
  const at = [0.22, 0.45, 0.72].map((f) => Math.round(12 + f * lineFrames));

  const rows = (
    <div style={{ display: "grid", gap: 20, width: portrait ? 920 : 600 }}>
      {ui.rows.map((row, index) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "22px 26px",
            borderRadius: 14,
            background: theme.surface,
            boxShadow: theme.shadow,
            ...lift(rise(at[index]), 14),
          }}
        >
          <span style={{ flex: "none", width: 52, height: 52, borderRadius: 12, background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.accentFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {icons[index]}
            </svg>
          </span>
          <div>
            <div style={{ fontSize: 21, fontWeight: 600, color: theme.muted }}>{row.label}</div>
            <div style={{ marginTop: 2, fontSize: 27, fontWeight: 620, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{row.value}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const ai = rise(at[2] + 6);
  const image = (
    <div style={{ width: 440, background: theme.surface, borderRadius: 14, boxShadow: theme.shadowLg, overflow: "hidden", ...lift(rise(4), 24) }}>
      <div style={{ position: "relative" }}>
        <Product />
        <span
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            padding: "6px 14px",
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 700,
            background: theme.fg,
            color: "#fff",
            opacity: ai,
            transform: `scale(${0.9 + 0.1 * ai})`,
          }}
        >
          AI
        </span>
      </div>
      <div style={{ padding: "16px 20px", fontFamily: theme.mono, fontSize: 20, color: theme.fg2 }}>{ui.file}</div>
    </div>
  );

  const visual = portrait ? { w: 920, h: 1080 } : { w: 1120, h: 600 };
  return (
    <Stage dark={false} eyebrow={ui.eyebrow} title={ui.title} visual={visual} headerWidth={500} maxScale={1.1}>
      <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", gap: portrait ? 40 : 80, width: visual.w, height: visual.h, justifyContent: "center" }}>
        {image}
        {rows}
      </div>
    </Stage>
  );
};
