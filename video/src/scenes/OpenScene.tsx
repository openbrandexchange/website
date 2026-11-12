import type { Ui } from "../copy";
import { theme } from "../theme";
import { lift, Mark, Stage, usePortrait, useRise } from "./kit";

export const OpenScene = ({ ui, openFrames, foundationAt }: { ui: Ui["open"]; openFrames: number; foundationAt: number }) => {
  const rise = useRise();
  const portrait = usePortrait();
  // Follow the sentence: open spec, three editions, 61 checks; the languages land just after.
  const at = [0.05, 0.35, 0.72, 0.92].map((f) => Math.round(12 + f * openFrames));

  const facts = (
    <div style={{ display: "grid", gridTemplateColumns: portrait ? "1fr 1fr" : "repeat(4, 1fr)", columnGap: 40, rowGap: 48 }}>
      {ui.facts.map((fact, index) => (
        <div key={fact.l} style={{ borderTop: `1px solid ${theme.inkLineStrong}`, paddingTop: 26, ...lift(rise(at[index])) }}>
          <div style={{ fontSize: 104, fontWeight: 680, letterSpacing: "-0.04em", lineHeight: 1, color: index === 0 ? theme.inkAccent : theme.inkFg }}>{fact.v}</div>
          <div style={{ marginTop: 16, fontSize: 28, lineHeight: 1.3, color: theme.inkFg2 }}>{fact.l}</div>
        </div>
      ))}
    </div>
  );

  const editions = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 44 }}>
      {ui.editions.map((name, index) => (
        <span
          key={name}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 25,
            fontWeight: 600,
            background: theme.inkPanel,
            boxShadow: `0 0 0 1px ${theme.inkLine}`,
            ...lift(rise(at[1] + 8 + index * 5), 12),
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.inkAccent} strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="7" rx="2" />
            <rect x="3" y="13" width="18" height="7" rx="2" />
            <path d="M7 7.5h.01M7 16.5h.01" />
          </svg>
          {name}
        </span>
      ))}
    </div>
  );

  const foundation = (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: portrait ? 70 : 54, fontSize: 30, fontWeight: 620, ...lift(rise(foundationAt + 8)) }}>
      <Mark size={44} />
      {ui.foundation}
    </div>
  );

  const visual = portrait ? { w: 920, h: 1000 } : { w: 1680, h: 520 };
  return (
    <Stage dark eyebrow={ui.eyebrow} title={ui.title} layout="top" visual={visual} maxScale={1}>
      <div style={{ width: visual.w }}>
        {facts}
        {editions}
        {foundation}
      </div>
    </Stage>
  );
};
