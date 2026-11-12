import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { clamp, Fit, Icon, Kicker, useStage } from "./kit";

const CYCLE = 34; // frames per brand: one row copied over
const FILES = ["brand_a_products.xlsx", "brand_b_2027.xlsx", "items_brand_c.csv"];

const bar = (w: number, shade = 0.16) => (
  <span style={{ display: "block", width: w, height: 10, background: `rgba(17,17,17,${shade})` }} />
);

/** A spreadsheet window: a file name, a header row with this brand's own column names, rows of data. */
const Sheet = ({
  title,
  cols,
  width,
  rows,
  active = false,
  highlight = -1,
  filled = rows,
  typing = 1,
  widths,
}: {
  title: string;
  cols: string[];
  width: number;
  rows: number;
  active?: boolean;
  highlight?: number;
  filled?: number;
  typing?: number;
  widths: number[];
}) => (
  <div style={{ width, background: theme.surface, border: `${active ? 2.5 : 1.5}px solid ${theme.fg}` }}>
    <div style={{ height: 46, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: `1.5px solid ${theme.fg}`, fontFamily: theme.mono, fontSize: 19, color: theme.fg2 }}>
      <span style={{ width: 14, height: 14, background: theme.fg, flex: "none" }} />
      {title}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: widths.map((w) => `${w}fr`).join(" "), background: theme.bgAlt, borderBottom: `1px solid ${theme.line}` }}>
      {cols.map((c, i) => (
        <div key={i} style={{ padding: "9px 14px", fontFamily: theme.mono, fontSize: 17, fontWeight: 600, color: theme.fg2, borderLeft: i ? `1px solid ${theme.line}` : undefined, whiteSpace: "nowrap", overflow: "hidden" }}>
          {c}
        </div>
      ))}
    </div>
    {Array.from({ length: rows }, (_, r) => (
      <div key={r} style={{ display: "grid", gridTemplateColumns: widths.map((w) => `${w}fr`).join(" "), borderBottom: r < rows - 1 ? `1px solid ${theme.line}` : undefined, height: 38 }}>
        {cols.map((_, i) => {
          const isHi = r === 0 && i === highlight;
          const show = r < filled - 1 || (r === filled - 1 && i < Math.ceil(typing * cols.length));
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 14px", borderLeft: i ? `1px solid ${theme.line}` : undefined, outline: isHi ? `3px solid ${theme.accent}` : undefined, outlineOffset: -3 }}>
              {show && bar(((r * 7 + i * 13) % 5) * 12 + 36, isHi ? 0.5 : 0.16)}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

export const BeforeScene = ({ ui, locale, rushAt }: { ui: Ui["before"]; locale: string; rushAt: number }) => {
  const frame = useCurrentFrame();
  const { portrait, boxW, boxH, top, padX } = useStage();
  const cycle = Math.floor(Math.max(0, frame - 10) / CYCLE);
  const t = (Math.max(0, frame - 10) % CYCLE) / CYCLE;
  const active = cycle % 3;
  const brandNo = String(7 + cycle).padStart(2, "0");
  const fmt = new Intl.NumberFormat(locale === "en" ? "en-GB" : locale);
  const rush = interpolate(frame, [rushAt + 4, rushAt + 40], [0, 1], clamp);
  const toEnter = Math.round(312 - 4 * cycle + rush * (1248 - 312));
  const appear = (i: number) => interpolate(frame, [i * 5, i * 5 + 14], [0, 1], clamp);

  // Layout of the drawing (natural size), landscape and portrait.
  const W = portrait ? 920 : 1640;
  const H = portrait ? 1130 : 680;
  const sheetW = portrait ? 640 : 600;
  const step = portrait ? { x: 70, y: 96 } : { x: 92, y: 104 };
  const target = portrait ? { x: 0, y: 470, w: 920 } : { x: 900, y: 40, w: 740 };
  const counters = portrait ? { y: 1010 } : { y: 590 };
  const widths = [[1.2, 1, 0.8, 1.2], [1.1, 1, 1.4, 1.1], [1.2, 0.8, 0.7, 1]];

  // The copied cell travels from the active sheet's highlighted cell to the next row in the webshop sheet.
  const from = { x: active * step.x + sheetW * 0.3, y: active * step.y + 46 + 40 + 19 };
  const to = { x: target.x + target.w * 0.3, y: target.y + 46 + 40 + 38 * Math.min(cycle, 6) + 19 };
  const move = interpolate(t, [0.15, 0.6], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const chip = { x: from.x + (to.x - from.x) * move, y: from.y + (to.y - from.y) * move, o: interpolate(t, [0.1, 0.18, 0.6, 0.7], [0, 1, 1, 0], clamp) };

  return (
    <AbsoluteFill style={{ padding: `${top}px ${padX}px 0`, alignItems: "center" }}>
      <div style={{ width: boxW, height: boxH, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Fit w={W} h={H} boxW={boxW} boxH={boxH} max={1.2}>
          <div style={{ position: "relative", width: W, height: H, fontFamily: theme.font, color: theme.fg }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", left: i * step.x, top: i * step.y, opacity: appear(i), transform: `translateY(${(1 - appear(i)) * 14}px)` }}>
                <Sheet title={FILES[i]} cols={ui.sheets[i]} width={sheetW} rows={6} active={i === active} highlight={i === active && chip.o > 0 ? [0, 2, 1][i] : -1} widths={widths[i]} />
              </div>
            ))}
            <div style={{ position: "absolute", left: target.x, top: target.y, opacity: appear(3), transform: `translateY(${(1 - appear(3)) * 14}px)` }}>
              <Sheet
                title={ui.target}
                cols={ui.sheets[0]}
                width={target.w}
                rows={7}
                active
                widths={widths[0]}
                filled={Math.min(cycle + (move >= 1 ? 1 : 0), 7)}
                typing={interpolate(t, [0.6, 0.95], [0, 1], clamp)}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: chip.x - 60,
                top: chip.y - 17,
                width: 120,
                height: 34,
                background: theme.surface,
                border: `3px solid ${theme.accent}`,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                opacity: chip.o,
                boxShadow: "4px 4px 0 rgba(17,17,17,0.18)",
              }}
            >
              {bar(70, 0.5)}
            </div>
            <div style={{ position: "absolute", left: 0, top: counters.y, width: W, display: "flex", justifyContent: portrait ? "space-between" : "flex-start", gap: portrait ? 0 : 0, alignItems: "flex-end", opacity: appear(4) }}>
              <div style={{ width: portrait ? "auto" : target.x }}>
                <Kicker size={22} color={theme.muted}>
                  {ui.brand.replace("{n}", brandNo)}
                </Kicker>
                <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <span key={i} style={{ width: portrait ? 14 : 18, height: 18, background: i < 7 + cycle ? theme.fg : "transparent", border: `1.5px solid ${theme.fg}` }} />
                  ))}
                </div>
              </div>
              <div style={{ textAlign: portrait ? "right" : "left" }}>
                <Kicker size={22} color={theme.muted} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: portrait ? "flex-end" : "flex-start" }}>
                  <Icon name="clock" size={26} color={rush > 0 ? theme.accent : theme.muted} stroke={1.6} />
                  {ui.toEnter}
                </Kicker>
                <div style={{ marginTop: 6, fontFamily: theme.mono, fontSize: 64, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: rush > 0 ? theme.accent : theme.fg, fontVariantNumeric: "tabular-nums" }}>
                  {fmt.format(toEnter)}
                </div>
              </div>
            </div>
          </div>
        </Fit>
      </div>
    </AbsoluteFill>
  );
};
