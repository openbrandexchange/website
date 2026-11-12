import { AbsoluteFill } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { lift, Mark, usePortrait, useRise } from "./kit";

export const EndScene = ({ ui }: { ui: Ui["end"] }) => {
  const rise = useRise();
  const portrait = usePortrait();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.ink,
        backgroundImage: `linear-gradient(${theme.inkGrid} 1px, transparent 1px), linear-gradient(90deg, ${theme.inkGrid} 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        backgroundPosition: "center top",
        color: theme.inkFg,
        fontFamily: theme.font,
        fontFeatureSettings: theme.features,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingBottom: portrait ? 300 : 120,
      }}
    >
      <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", gap: portrait ? 34 : 30, ...lift(rise(0)) }}>
        <Mark size={portrait ? 140 : 112} />
        <span style={{ fontSize: portrait ? 84 : 92, fontWeight: 680, letterSpacing: "-0.04em", lineHeight: 1 }}>Open Brand Exchange</span>
      </div>
      <div style={{ marginTop: 44, fontSize: portrait ? 50 : 52, fontWeight: 600, letterSpacing: "-0.025em", color: theme.inkFg2, ...lift(rise(8)) }}>{ui.line}</div>
      <div style={{ marginTop: 56, display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", gap: portrait ? 30 : 36, ...lift(rise(14)) }}>
        <span style={{ padding: "18px 34px", borderRadius: 12, background: theme.accent, color: "#fff", fontSize: 36, fontWeight: 650, letterSpacing: "-0.01em" }}>{ui.url}</span>
        <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.inkAccent }}>{ui.audience}</span>
      </div>
    </AbsoluteFill>
  );
};
