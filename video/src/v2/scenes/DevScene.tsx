import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { clamp, Icon, Kicker, lift, Product, PRODUCT_KEYS, useRise, useStage } from "./kit";

export type DevTimes = { start: number; assistant: number; months: number };

/** A step of the afternoon: framed while it happens, quieter once the next one starts. */
const Panel = ({ title, from, next, children, style }: { title: string; from: number; next: number; children: ReactNode; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const shown = rise(from, 18);
  const active = interpolate(frame, [from, from + 6], [0, 1], clamp) * interpolate(frame, [next, next + 10], [1, 0], clamp);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: theme.surface,
        border: `${1.5 + 1.5 * active}px solid ${active > 0.5 ? theme.fg : theme.lineStrong}`,
        boxShadow: `${8 * active}px ${8 * active}px 0 ${theme.fg}`,
        padding: "24px 26px 26px",
        opacity: shown * (1 - 0.35 * (1 - active) * (frame > next ? 1 : 0)),
        transform: `translateY(${(1 - shown) * 18}px)`,
        minWidth: 0,
        ...style,
      }}
    >
      <Kicker size={21}>{title}</Kicker>
      <div style={{ marginTop: 18, flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
};

const mono: CSSProperties = { fontFamily: theme.mono, letterSpacing: "0.01em" };

const ROWS = [
  ["10417", "OLV", "M", "2041000000117"],
  ["20085", "BRS", "-", "2041000000285"],
  ["30352", "BLU", "42", "2041000000353"],
  ["40921", "BLK", "-", "2041000000421"],
];

/** The ERP export as it comes: a plain table with the ERP's own column names. */
const Export = ({ at }: { at: number }) => {
  const rise = useRise();
  const { portrait } = useStage();
  // On a phone the size column is left out, so the EANs fit.
  const pick = (row: string[]) => (portrait ? [row[0], row[1], row[3]] : row);
  return (
    <div style={{ ...mono, fontSize: 17, borderTop: `2px solid ${theme.fg}` }}>
      {[["ITEM_NO", "COL", "SZ", "EAN"], ...ROWS].map((row, r) => (
        <div
          key={r}
          style={{
            display: "grid",
            gridTemplateColumns: portrait ? "7ch 4ch 1fr" : "7ch 4ch 3ch 1fr",
            gap: 8,
            padding: "9px 4px",
            borderBottom: `1px solid ${r === 0 ? theme.fg : theme.line}`,
            color: r === 0 ? theme.muted : theme.fg,
            fontWeight: r === 0 ? 600 : 450,
            fontSize: r === 0 ? 15 : 17,
            opacity: r === 0 ? 1 : rise(at + 4 + r * 4),
          }}
        >
          {pick(row).map((cell, c) => (
            <span key={c} style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const CODE = ["ITEM_NO    → article", "COL, SZ    → variant", "EAN        → ean", "→ products.csv"];

/** A generic chat panel: the pasted prompt, and a reply with a glimpse of the mapping it wrote. */
const Assistant = ({ ui, at }: { ui: Ui["dev"]; at: number }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const typed = interpolate(frame, [at + 2, at + 14], [0, 1], clamp);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ justifySelf: "end", maxWidth: "92%", background: theme.surface2, border: `1.5px solid ${theme.line}`, padding: "12px 14px", ...lift(typed, 8) }}>
        <Kicker size={14} color={theme.accentFg}>
          {ui.pasted}
        </Kicker>
        <div style={{ marginTop: 6, fontSize: 19, lineHeight: 1.3, fontWeight: 480, color: theme.fg2 }}>{ui.prompt}</div>
      </div>
      <div style={{ maxWidth: "96%", ...lift(rise(at + 26), 8) }}>
        <div style={{ fontSize: 20, lineHeight: 1.3, fontWeight: 560 }}>{ui.reply}</div>
        <div style={{ marginTop: 10, background: theme.ink, color: theme.inkFg, padding: "10px 14px", ...mono, fontSize: 16, lineHeight: 1.55, whiteSpace: "pre" }}>
          {CODE.map((line, i) => (
            <div key={i} style={{ opacity: rise(at + 32 + i * 5) }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** The compatibility check: one green tick per part of the format. */
const Check = ({ ui, at }: { ui: Ui["dev"]; at: number }) => {
  const rise = useRise();
  const done = rise(at + 6 + ui.checks.length * 7);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "grid", gap: 12 }}>
        {ui.checks.map((item, i) => {
          const r = rise(at + 6 + i * 7, 12);
          return (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 21, fontWeight: 520, lineHeight: 1.2, fontFamily: i === 0 ? theme.mono : theme.font }}>
              <span style={{ width: 32, height: 32, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: r > 0.5 ? theme.ok : theme.surface2, transform: `scale(${0.8 + 0.2 * r})` }}>
                <Icon name="check" size={24} color={r > 0.5 ? "#ffffff" : theme.line} stroke={2.2} />
              </span>
              <span style={{ opacity: 0.45 + 0.55 * r }}>{item}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: theme.okSoft, color: theme.ok, border: `2px solid ${theme.ok}`, ...mono, fontSize: 18, fontWeight: 650, letterSpacing: "0.06em", textTransform: "uppercase", ...lift(done, 6) }}>
          <Icon name="check" size={20} color={theme.ok} stroke={2.4} />
          {ui.passed}
        </span>
      </div>
    </div>
  );
};

/** The brand's portal fills with the products. */
const Portal = ({ names, at }: { names: string[]; at: number }) => {
  const rise = useRise();
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {PRODUCT_KEYS.map((key, i) => {
        const r = rise(at + 4 + i * 6, 14);
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 8px", border: `1.5px solid ${theme.line}`, ...lift(r, 10) }}>
            <span style={{ width: 52, height: 52, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: theme.surface2 }}>
              <Product name={key} size={40} stroke={4.5} />
            </span>
            <span style={{ fontSize: 20, fontWeight: 560, lineHeight: 1.15, flex: 1, minWidth: 0 }}>{names[i]}</span>
            <Icon name="check" size={22} color={theme.ok} stroke={2.2} />
          </div>
        );
      })}
    </div>
  );
};

/** A developer at a brand links the ERP to the format in an afternoon, with an AI assistant and the ready-made prompt. */
export const DevScene = ({ ui, names, t }: { ui: Ui["dev"]; names: string[]; t: DevTimes }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const { portrait, padX, top, bottom } = useStage();
  const steps = [t.start, t.assistant - 6, t.assistant + 52, t.months - 8];
  const clock = interpolate(frame, [t.start, t.months + 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ padding: `${top - 10}px ${padX}px ${bottom - 20}px`, justifyContent: "center", fontFamily: theme.font, color: theme.fg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, ...lift(rise(t.start - 4)) }}>
        <Icon name="clock" size={portrait ? 44 : 36} color={theme.accentFg} stroke={1.6} />
        <span style={{ fontSize: portrait ? 46 : 38, fontWeight: 640, letterSpacing: "-0.025em" }}>{ui.time}</span>
        <span style={{ marginLeft: 8, flex: portrait ? 1 : "none", width: portrait ? undefined : 260, height: 3, background: theme.line, position: "relative" }}>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${clock * 100}%`, background: theme.fg }} />
        </span>
      </div>
      <div
        style={{
          marginTop: portrait ? 28 : 24,
          display: "grid",
          gridTemplateColumns: portrait ? "1fr 1fr" : "1.1fr 1.2fr 1fr 0.95fr",
          gridAutoRows: portrait ? "1fr" : "auto",
          gap: portrait ? 18 : 22,
          minHeight: 0,
          // On a phone the 2 × 2 grid is laid out at 740 px and drawn 1.26 × larger.
          ...(portrait ? { width: 740, zoom: 1.26 } : {}),
        }}
      >
        <Panel title={ui.erp} from={steps[0]} next={steps[1]}>
          <Export at={steps[0]} />
        </Panel>
        <Panel title={ui.assistant} from={steps[1]} next={steps[2]}>
          <Assistant ui={ui} at={steps[1] + 4} />
        </Panel>
        <Panel title={ui.check} from={steps[2]} next={steps[3]}>
          <Check ui={ui} at={steps[2]} />
        </Panel>
        <Panel title={ui.portal} from={steps[3]} next={100000}>
          <Portal names={names} at={steps[3]} />
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
