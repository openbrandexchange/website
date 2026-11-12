import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { clamp, Fit, Icon, Kicker, Product, PRODUCT_KEYS, useRise, useStage } from "./kit";

/** The retailer's own webshop: the new collection appears, every article online, nothing left to type. */
export const AfterScene = ({ ui, names }: { ui: Ui["after"]; names: string[] }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const { portrait, boxW, boxH, top, padX } = useStage();
  const W = portrait ? 920 : 1560;
  const cols = portrait ? 2 : 4;
  const pad = 36;
  const gap = 28;
  const cardW = (W - 2 * pad - (cols - 1) * gap) / cols;
  const imgH = portrait ? 300 : 250;
  const H = 56 + 2 * pad + 90 + (portrait ? 2 : 1) * (imgH + 110) + (portrait ? gap : 0);
  const counter = Math.round(interpolate(frame, [6, 40], [24, 0], clamp));

  return (
    <AbsoluteFill style={{ padding: `${top}px ${padX}px 0`, alignItems: "center" }}>
      <div style={{ width: boxW, height: boxH, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Fit w={W} h={H} boxW={boxW} boxH={boxH} max={1.15}>
          <div style={{ width: W, height: H, background: theme.surface, border: `2.5px solid ${theme.fg}`, boxShadow: `10px 10px 0 ${theme.fg}`, fontFamily: theme.font, color: theme.fg, opacity: rise(0), transform: `translateY(${(1 - rise(0)) * 16}px)` }}>
            <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: `2px solid ${theme.fg}`, fontFamily: theme.mono, fontSize: 20, color: theme.fg2 }}>
              <span style={{ width: 14, height: 14, background: theme.fg }} />
              {ui.shop}
            </div>
            <div style={{ padding: pad }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 66, marginBottom: 24 }}>
                <div style={{ fontSize: 50, fontWeight: 660, letterSpacing: "-0.03em", lineHeight: 1 }}>{ui.title}</div>
                <Kicker size={20} color={theme.muted} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {ui.toEnter}
                  <span style={{ fontSize: 30, color: theme.fg, fontVariantNumeric: "tabular-nums" }}>{counter}</span>
                  {counter === 0 && <Icon name="check" size={30} color={theme.fg} stroke={2} />}
                </Kicker>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cardW}px)`, gap }}>
                {PRODUCT_KEYS.map((key, i) => {
                  const r = rise(8 + i * 6);
                  const live = interpolate(frame, [26 + i * 8, 32 + i * 8], [0, 1], clamp);
                  return (
                    <div key={key} style={{ border: `1.5px solid ${theme.lineStrong}`, opacity: r, transform: `translateY(${(1 - r) * 18}px)` }}>
                      <div style={{ height: imgH, background: theme.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Product name={key} size={imgH * 0.6} stroke={3} />
                      </div>
                      <div style={{ padding: "16px 18px", borderTop: `1.5px solid ${theme.lineStrong}`, height: 110, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.015em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{names[i]}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: theme.mono, fontSize: 18, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: live }}>
                          <span style={{ width: 12, height: 12, background: theme.accent }} />
                          {ui.online}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Fit>
      </div>
    </AbsoluteFill>
  );
};
