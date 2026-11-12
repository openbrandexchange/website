import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { clamp, Icon, type IconName, Kicker, Mark, Photo, Product, PRODUCT_KEYS, useRise, useStage } from "./kit";

export type FlowTimes = {
  in: number;
  inPhotos: number;
  standard: number;
  same: number;
  images: number;
  out: number;
  outDownload: number;
  all: number;
};

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const PRODUCT_CYCLE = 48;

/** How present a block is: hidden before it starts, full while it is spoken about, dimmed after. */
const usePresence = (t: FlowTimes) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const phases = [t.in, t.standard, t.out, t.all];
  return (block: 0 | 1 | 2) => {
    const shown = rise(phases[block], 20);
    const next = phases[block + 1];
    const dim = interpolate(frame, [next, next + 12], [0, 1], clamp) * (1 - interpolate(frame, [t.all, t.all + 14], [0, 1], clamp));
    return { opacity: shown * (1 - 0.6 * dim), transform: `translateY(${(1 - shown) * 18}px)` } as CSSProperties;
  };
};

const Block = ({ children, framed = false, style }: { children: ReactNode; framed?: boolean; style?: CSSProperties }) => (
  <div
    style={{
      position: "relative",
      background: theme.surface,
      border: framed ? `3px solid ${theme.fg}` : `1.5px solid ${theme.lineStrong}`,
      boxShadow: framed ? `10px 10px 0 ${theme.fg}` : undefined,
      padding: framed ? "34px 38px 38px" : "30px 32px 32px",
      ...style,
    }}
  >
    {children}
  </div>
);

const Lead = ({ children }: { children: ReactNode }) => (
  <div style={{ marginTop: 10, fontSize: 28, fontWeight: 450, color: theme.fg2, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{children}</div>
);

const Item = ({ icon, children, style }: { icon: IconName; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 27, fontWeight: 540, letterSpacing: "-0.01em", lineHeight: 1.2, ...style }}>
    <Icon name={icon} size={30} color={theme.accentFg} stroke={1.5} />
    <span>{children}</span>
  </div>
);

const InBlock = ({ ui, t, portrait }: { ui: Ui["flow"]; t: FlowTimes; portrait: boolean }) => {
  const rise = useRise();
  const size = portrait ? 196 : 180;
  return (
    <Block style={{ height: "100%" }}>
      <Kicker size={24}>{ui.inTitle}</Kicker>
      <Lead>{ui.inLead}</Lead>
      <div style={{ marginTop: 26, display: "grid", gap: 14 }}>
        <Item icon="database" style={{ opacity: rise(t.in + 6) }}>{ui.inItems[0]}</Item>
        <Item icon="image" style={{ opacity: rise(t.inPhotos) }}>{ui.inItems[1]}</Item>
      </div>
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: `repeat(${portrait ? 4 : 2}, ${size}px)`, gap: portrait ? 20 : 22 }}>
        {PRODUCT_KEYS.map((key, i) => {
          const r = rise(t.inPhotos + 4 + i * 5);
          return (
            <div key={key} style={{ opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}>
              <Photo name={key} size={size} label={`IMG_${4120 + i * 7}.jpg`} />
            </div>
          );
        })}
      </div>
    </Block>
  );
};

const StandardBlock = ({ ui, t }: { ui: Ui["flow"]; t: FlowTimes }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const since = frame - t.same;
  const index = since < 0 ? 0 : Math.floor(since / PRODUCT_CYCLE) % 4;
  const flip = since < 0 ? 1 : interpolate(since % PRODUCT_CYCLE, [0, 7], [0, 1], clamp);
  const product = ui.products[index];
  const values = [product.name, product.variant, product.ean, product.materials, product.care, product.dimensions, product.rights];
  const rights = interpolate(frame, [t.images, t.images + 10], [0, 1], clamp);
  return (
    <Block framed style={{ height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Mark height={36} />
        <Kicker size={24}>{ui.stdTitle}</Kicker>
      </div>
      <Lead>{ui.stdLead}</Lead>
      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        {PRODUCT_KEYS.map((key, i) => {
          const on = i === index;
          return (
            <span
              key={key}
              style={{
                width: 66,
                height: 66,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${theme.fg}`,
                background: on ? theme.fg : theme.surface,
                opacity: rise(t.standard + 8 + i * 3),
              }}
            >
              <Product name={key} size={46} stroke={4.5} color={on ? theme.bg : theme.fg} />
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 22, borderTop: `2px solid ${theme.fg}` }}>
        {ui.fields.map((field, i) => {
          const r = rise(t.standard + 12 + i * 4);
          const last = i === ui.fields.length - 1;
          return (
            <div
              key={field}
              style={{
                display: "grid",
                gridTemplateColumns: "210px 1fr",
                alignItems: "center",
                height: 54,
                borderBottom: `1px solid ${last ? theme.fg : theme.line}`,
                background: last ? `rgba(207, 58, 36, ${0.1 * rights})` : undefined,
                boxShadow: last ? `inset ${5 * rights}px 0 0 ${theme.accent}` : undefined,
                paddingLeft: 14,
                opacity: r,
              }}
            >
              <span style={{ fontFamily: theme.mono, fontSize: 17, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: last && rights > 0.5 ? theme.accentFg : theme.muted }}>{field}</span>
              <span
                style={{
                  fontFamily: i === 2 ? theme.mono : theme.font,
                  fontSize: i === 2 ? 23 : 25,
                  fontWeight: i === 0 ? 620 : 470,
                  letterSpacing: i === 2 ? "0.02em" : "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  opacity: flip,
                  transform: `translateY(${(1 - flip) * 8}px)`,
                }}
              >
                {values[i]}
              </span>
            </div>
          );
        })}
      </div>
    </Block>
  );
};

const OUT_ICONS: IconName[] = ["browser", "layers", "barcode", "download"];

const OutBlock = ({ ui, t, portrait }: { ui: Ui["flow"]; t: FlowTimes; portrait: boolean }) => {
  const frame = useCurrentFrame();
  const starts = [t.out + 34, t.out + 52, t.out + 70, t.outDownload];
  return (
    <Block style={{ height: "100%" }}>
      <Kicker size={24}>{ui.outTitle}</Kicker>
      <Lead>{ui.outLead}</Lead>
      <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: portrait ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 16 }}>
        {ui.outItems.map((item, i) => {
          const on = interpolate(frame, [starts[i], starts[i] + 8], [0, 1], clamp);
          return (
            <div
              key={item}
              style={{
                height: portrait ? 168 : 158,
                padding: "18px 18px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: `2px solid ${theme.fg}`,
                background: on > 0.5 ? theme.fg : theme.surface,
                color: on > 0.5 ? theme.bg : theme.fg,
                opacity: 0.4 + 0.6 * on,
              }}
            >
              <Icon name={OUT_ICONS[i]} size={40} color={on > 0.5 ? "#ff8a75" : theme.fg} stroke={1.4} />
              <span style={{ fontSize: 24, fontWeight: 560, lineHeight: 1.12, letterSpacing: "-0.01em", textWrap: "balance" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </Block>
  );
};

/** A solid black connector with an arrowhead; small squares (the data) travel along it once it is drawn. */
const Connector = ({ at, length, vertical }: { at: number; length: number; vertical: boolean }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 14], [0, 1], { ...clamp, easing: ease });
  const packets = frame > at + 14 ? [((frame - at - 14) % 40) / 40] : [];
  const line: CSSProperties = vertical
    ? { left: "50%", top: 0, width: 3, marginLeft: -1.5, height: (length - 10) * draw }
    : { top: "50%", left: 0, height: 3, marginTop: -1.5, width: (length - 10) * draw };
  return (
    <div style={{ position: "relative", width: vertical ? 40 : length, height: vertical ? length : 40, flex: "none", alignSelf: "center" }}>
      <span style={{ position: "absolute", background: theme.fg, ...line }} />
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        style={{ position: "absolute", opacity: draw >= 1 ? 1 : 0, ...(vertical ? { left: 11, bottom: 0, transform: "rotate(90deg)" } : { right: 0, top: 11 }) }}
      >
        <path d="M0 0 L18 9 L0 18 Z" fill={theme.fg} />
      </svg>
      {packets.map((p, k) => (
        <span
          key={k}
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            background: theme.accent,
            opacity: interpolate(p, [0, 0.15, 0.8, 1], [0, 1, 1, 0]),
            ...(vertical ? { left: 15, top: p * (length - 22) } : { top: 15, left: p * (length - 22) }),
          }}
        />
      ))}
    </div>
  );
};

export const FlowScene = ({ ui, t }: { ui: Ui["flow"]; t: FlowTimes }) => {
  const frame = useCurrentFrame();
  const presence = usePresence(t);
  const { portrait, boxW, boxH, top, padX } = useStage();

  if (!portrait) {
    const W = 1728;
    const H = 720;
    const scale = Math.min(boxW / W, boxH / H, 1.1);
    return (
      <AbsoluteFill style={{ padding: `${top}px ${padX}px 0`, alignItems: "center" }}>
        <div style={{ width: boxW, height: boxH, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: W * scale, height: H * scale, position: "relative" }}>
            <div style={{ position: "absolute", width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", display: "flex", alignItems: "center", fontFamily: theme.font, color: theme.fg }}>
              <div style={{ width: 456, ...presence(0) }}>
                <InBlock ui={ui} t={t} portrait={false} />
              </div>
              <Connector at={t.standard} length={64} vertical={false} />
              <div style={{ width: 640, ...presence(1) }}>
                <StandardBlock ui={ui} t={t} />
              </div>
              <Connector at={t.out} length={64} vertical={false} />
              <div style={{ width: 504, ...presence(2) }}>
                <OutBlock ui={ui} t={t} portrait={false} />
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Portrait: the blocks stack; the camera follows the block being spoken about, then shows all three.
  const W = 920;
  const heights = [480, 660, 350];
  const gap = 64;
  const tops = [0, heights[0] + gap, heights[0] + heights[1] + 2 * gap];
  const total = tops[2] + heights[2];
  const fitAll = Math.min(boxH / total, boxW / W);
  const keys = [
    { at: 0, center: heights[0] / 2, s: 1 },
    { at: t.standard, center: tops[1] + heights[1] / 2, s: 1 },
    { at: t.out, center: tops[2] + heights[2] / 2, s: 1 },
    { at: t.all, center: total / 2, s: fitAll },
  ];
  let cam = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = ease(interpolate(frame, [keys[i].at - 4, keys[i].at + 22], [0, 1], clamp));
    cam = { at: 0, center: cam.center + (keys[i].center - cam.center) * k, s: cam.s + (keys[i].s - cam.s) * k };
  }
  const ty = boxH / 2 - cam.center * cam.s;
  const mask = "linear-gradient(to bottom, transparent 0, #000 70px, #000 calc(100% - 70px), transparent 100%)";
  return (
    <AbsoluteFill style={{ padding: `${top - 40}px ${padX}px 0` }}>
      <div style={{ width: boxW, height: boxH + 80, overflow: "hidden", position: "relative", maskImage: mask, WebkitMaskImage: mask }}>
        <div
          style={{
            position: "absolute",
            left: (boxW - W * cam.s) / 2,
            top: 40 + ty,
            width: W,
            height: total,
            transform: `scale(${cam.s})`,
            transformOrigin: "top left",
            fontFamily: theme.font,
            color: theme.fg,
          }}
        >
          <div style={{ position: "absolute", top: tops[0], width: W, height: heights[0], ...presence(0) }}>
            <InBlock ui={ui} t={t} portrait />
          </div>
          <div style={{ position: "absolute", top: heights[0], left: W / 2 - 20 }}>
            <Connector at={t.standard} length={gap} vertical />
          </div>
          <div style={{ position: "absolute", top: tops[1], width: W, height: heights[1], ...presence(1) }}>
            <StandardBlock ui={ui} t={t} />
          </div>
          <div style={{ position: "absolute", top: tops[1] + heights[1], left: W / 2 - 20 }}>
            <Connector at={t.out} length={gap} vertical />
          </div>
          <div style={{ position: "absolute", top: tops[2], width: W, height: heights[2], ...presence(2) }}>
            <OutBlock ui={ui} t={t} portrait />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
