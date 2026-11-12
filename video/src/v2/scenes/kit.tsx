import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 with a calm, critically damped spring, starting at `delay` frames. */
export const useRise = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, durationInFrames = 18) => spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames });
};

export const lift = (value: number, distance = 16): CSSProperties => ({ opacity: value, transform: `translateY(${(1 - value) * distance}px)` });

export const usePortrait = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** The OBX mark (website/src/components/Logo.astro): a woven label with notched ends. */
export const Mark = ({ height = 26, color = theme.fg, letters = theme.bg }: { height?: number; color?: string; letters?: string }) => (
  <svg viewBox="0 0 44 26" width={(height * 44) / 26} height={height} style={{ display: "block", flex: "none" }}>
    <path d="M0 0h44l-4.5 13L44 26H0l4.5-13z" fill={color} />
    <text x="22" y="17.1" textAnchor="middle" fill={letters} style={{ fontFamily: theme.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: 1.4 }}>
      OBX
    </text>
  </svg>
);

/** The website's small line icons (src/components/Icon.astro), 16 px grid. */
const ICONS = {
  database: '<ellipse cx="8" cy="3.8" rx="5" ry="1.8"/><path d="M3 3.8v8.4c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V3.8M3 8c0 1 2.2 1.8 5 1.8S13 9 13 8"/>',
  image: '<rect x="2" y="2.5" width="12" height="11" rx="1.6"/><circle cx="5.7" cy="6" r="1.2"/><path d="m2.4 12 3.8-3.7 2.6 2.4 1.9-1.7 3 2.9"/>',
  browser: '<rect x="1.8" y="2.5" width="12.4" height="11" rx="1.6"/><path d="M1.8 5.6h12.4M4 4.1h.01M5.6 4.1h.01"/>',
  layers: '<path d="M8 2 1.8 5.2 8 8.4l6.2-3.2L8 2Z"/><path d="m1.8 8.2 6.2 3.2 6.2-3.2M1.8 11.1 8 14.3l6.2-3.2"/>',
  barcode: '<path d="M2.5 3v10M4.5 3v10M7 3v10M8.5 3v10M11 3v10M13.5 3v10"/>',
  download: '<path d="M8 2.5v8M4.8 7.4 8 10.6l3.2-3.2M2.5 13.5h11"/>',
  check: '<path d="m3.5 8.3 2.8 2.7 6.2-6.3"/>',
  clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/>',
};
export type IconName = keyof typeof ICONS;

export const Icon = ({ name, size = 28, color = "currentColor", stroke = 1.5 }: { name: IconName; size?: number; color?: string; stroke?: number }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", flex: "none" }}
    dangerouslySetInnerHTML={{ __html: ICONS[name] }}
  />
);

/** Four products from different branches, drawn as simple line illustrations (100 × 100). */
const PRODUCTS: Record<string, ReactNode> = {
  jacket: (
    <>
      <path d="M38 16 L26 21 L14 29 L9 64 L20 66 L24 44 L24 86 L76 86 L76 44 L80 66 L91 64 L86 29 L74 21 L62 16" />
      <path d="M38 16 L50 30 L62 16" />
      <path d="M38 16 C42 12 58 12 62 16" />
      <path d="M50 30 V86" />
      <path d="M31 64 H42 M58 64 H69" />
    </>
  ),
  lamp: (
    <>
      <path d="M33 18 H67 L79 50 H21 Z" />
      <path d="M50 50 V80" />
      <path d="M36 86 H64 L60 80 H40 Z" />
      <path d="M64 50 V60" />
      <circle cx="64" cy="62.5" r="2.5" />
    </>
  ),
  shoe: (
    <>
      <path d="M8 70 V54 C8 47 14 45 20 47 L38 52 L50 36 L60 33 C63 41 70 45 79 47 C89 49 93 57 93 65 V70 Z" />
      <path d="M8 70 H93 V77 H8 Z" />
      <path d="M43 47 L50 51 M47 42 L54 46 M51 37 L58 41" />
      <path d="M66 56 C72 58 80 58 86 56" />
    </>
  ),
  coffee: (
    <>
      <path d="M24 12 H76 V88 H24 Z" />
      <path d="M24 30 H76" />
      <circle cx="35" cy="21" r="3" />
      <circle cx="45" cy="21" r="3" />
      <path d="M58 21 H68" />
      <path d="M42 38 H58 V46 H42 Z" />
      <path d="M50 46 V52" />
      <path d="M41 60 H59 V74 H41 Z" />
      <path d="M59 63 H64 V70 H59" />
      <path d="M32 80 H68" />
    </>
  ),
};
export const PRODUCT_KEYS = ["jacket", "lamp", "shoe", "coffee"] as const;
export type ProductKey = (typeof PRODUCT_KEYS)[number];

export const Product = ({ name, size = 100, stroke = 3, color = theme.fg }: { name: ProductKey; size?: number; stroke?: number; color?: string }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinejoin="miter"
    strokeLinecap="square"
    style={{ display: "block", flex: "none" }}
  >
    {PRODUCTS[name]}
  </svg>
);

/** A product photo, as the brand supplies it: a framed square with the product drawn in it. */
export const Photo = ({ name, size, label }: { name: ProductKey; size: number; label?: string }) => (
  <div style={{ width: size, background: theme.surface, border: `1.5px solid ${theme.fg}`, flex: "none" }}>
    <div style={{ height: size * 0.78, display: "flex", alignItems: "center", justifyContent: "center", background: theme.surface2 }}>
      <Product name={name} size={size * 0.56} stroke={3.4} />
    </div>
    {label !== undefined && (
      <div style={{ height: size * 0.22, display: "flex", alignItems: "center", padding: `0 ${size * 0.07}px`, fontFamily: theme.mono, fontSize: size * 0.085, color: theme.muted, borderTop: `1.5px solid ${theme.fg}` }}>
        {label}
      </div>
    )}
  </div>
);

/** A small uppercase monospace label, like the website's block headings. */
export const Kicker = ({ children, size = 22, color = theme.fg, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) => (
  <div style={{ fontFamily: theme.mono, fontSize: size, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

/** Scale a drawing of natural size w × h to fit a box, centred. */
export const Fit = ({ w, h, boxW, boxH, max = 1.6, children }: { w: number; h: number; boxW: number; boxH: number; max?: number; children: ReactNode }) => {
  const scale = Math.min(boxW / w, boxH / h, max);
  return (
    <div style={{ width: w * scale, height: h * scale, position: "relative" }}>
      <div style={{ width: w, height: h, position: "absolute", left: 0, top: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
};

/** Text with the "*accent*" words drawn with a red underline. */
export const Accented = ({ text, underline = 8 }: { text: string; underline?: number }) => {
  const frame = useCurrentFrame();
  const parts = text.replace(/\|/g, " ").split("*");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 ? (
          <span
            key={i}
            style={{
              backgroundImage: `linear-gradient(${theme.accent}, ${theme.accent})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 92%",
              backgroundSize: `${interpolate(frame, [20, 44], [0, 100], clamp)}% ${underline}px`,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

/** Layout constants: the room left between the header and the captions. */
export const useStage = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const padX = portrait ? 72 : 96;
  const top = portrait ? 300 : 170;
  const bottom = portrait ? 470 : 190;
  return { portrait, width, height, padX, top, bottom, boxW: width - 2 * padX, boxH: height - top - bottom };
};
