import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

/** 0 → 1 with a calm spring, starting at `delay` frames. */
export const useRise = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, durationInFrames?: number) => spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames });
};

export const lift = (value: number, distance = 18): CSSProperties => ({ opacity: value, transform: `translateY(${(1 - value) * distance}px)` });

export const usePortrait = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The OBX mark (website/src/components/Logo.astro): two arrows that pass each other. */
export const Mark = ({ size = 26 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} style={{ flex: "none", display: "block" }}>
    <rect width="32" height="32" rx="8" fill={theme.accent} />
    <path d="M8 12.5h12.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="m18.5 8.5 4 4-4 4" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 19.5H11.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".62" />
    <path d="m13.5 15.5-4 4 4 4" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".62" />
  </svg>
);

export const Eyebrow = ({ children, dark }: { children: ReactNode; dark: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontSize: 24,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: dark ? theme.inkAccent : theme.accentFg,
    }}
  >
    <span style={{ width: 30, height: 2, background: "currentColor" }} />
    {children}
  </div>
);

type Layout = "side" | "top";

/**
 * One scene: a light or dark band with an eyebrow and a heading, and a visual drawn at its natural
 * size (w × h) that is scaled to fit the room left over. The bottom stays free for the captions.
 */
export const Stage = ({
  dark,
  grid = dark,
  eyebrow,
  title,
  layout = "side",
  visual,
  maxScale = 1.5,
  headerWidth = 560,
  aside,
  asideHeight = 0,
  children,
}: {
  dark: boolean;
  grid?: boolean;
  eyebrow: string;
  title: string;
  layout?: Layout;
  visual: { w: number; h: number };
  maxScale?: number;
  headerWidth?: number;
  /** Under the heading (side layout, portrait) or to its right (top layout). */
  aside?: ReactNode;
  /** Extra header room the aside needs when it sits under the heading in a column layout. */
  asideHeight?: number;
  children: ReactNode;
}) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const rise = useRise();
  const side = layout === "side" && !portrait;

  const padX = portrait ? 80 : 120;
  const top = portrait ? 170 : 104;
  const bottom = portrait ? 420 : 215;
  const headerH = (portrait ? 250 + asideHeight : side ? 0 : 150);
  const gap = portrait ? 70 : side ? 90 : 44;
  const boxW = side ? width - 2 * padX - headerWidth - gap : width - 2 * padX;
  const boxH = height - top - bottom - (side ? 0 : headerH + gap);
  const scale = Math.min(boxW / visual.w, boxH / visual.h, maxScale);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: dark ? theme.ink : theme.paper,
        backgroundImage: grid
          ? `linear-gradient(${theme.inkGrid} 1px, transparent 1px), linear-gradient(90deg, ${theme.inkGrid} 1px, transparent 1px)`
          : undefined,
        backgroundSize: "64px 64px",
        backgroundPosition: "center top",
        color: dark ? theme.inkFg : theme.fg,
        fontFamily: theme.font,
        fontFeatureSettings: theme.features,
        padding: `${top}px ${padX}px ${bottom}px`,
        display: "flex",
        flexDirection: side ? "row" : "column",
        alignItems: side ? "center" : "stretch",
        justifyContent: side ? "flex-start" : "flex-start",
        gap,
      }}
    >
      <div
        style={{
          flex: side ? `0 0 ${headerWidth}px` : "none",
          minHeight: side ? undefined : headerH,
          display: !side && !portrait ? "flex" : "block",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 60,
        }}
      >
        <div style={{ ...lift(rise(0)), maxWidth: !side && !portrait && aside ? 820 : undefined }}>
          <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
          <div
            style={{
              marginTop: 22,
              fontSize: portrait ? 78 : side ? 66 : 62,
              fontWeight: 650,
              letterSpacing: "-0.034em",
              lineHeight: 1.06,
              textWrap: "balance",
            }}
          >
            {title}
          </div>
        </div>
        {aside}
      </div>
      <div style={{ flex: "1 1 0", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0, minHeight: 0 }}>
        <div style={{ width: visual.w * scale, height: visual.h * scale, position: "relative" }}>
          <div style={{ width: visual.w, height: visual.h, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** A browser window around a real product screenshot, like the website's .frame. */
export const BrowserFrame = ({ url, width, children, dark = false, highlightUrl = 0 }: { url: string; width: number; children: ReactNode; dark?: boolean; highlightUrl?: number }) => (
  <div
    style={{
      width,
      background: dark ? "#1a2035" : theme.surface,
      borderRadius: 14,
      boxShadow: dark ? theme.shadowDark : theme.shadowLg,
      overflow: "hidden",
    }}
  >
    <div style={{ height: 50, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", background: dark ? "#1a2035" : theme.surface2, boxShadow: `inset 0 -1px 0 ${theme.line}` }}>
      <span style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <i key={i} style={{ width: 12, height: 12, borderRadius: 99, background: theme.lineStrong }} />
        ))}
      </span>
      <span
        style={{
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 19,
          lineHeight: "34px",
          padding: "0 22px",
          borderRadius: 8,
          background: "#fff",
          color: theme.fg2,
          boxShadow: `0 0 0 ${2 * highlightUrl}px rgba(36, 80, 232, ${0.9 * highlightUrl})`,
        }}
      >
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke={theme.muted} strokeWidth="1.8">
          <rect x="1.5" y="7" width="11" height="8" rx="2" />
          <path d="M4 7V5a3 3 0 0 1 6 0v2" />
        </svg>
        {url}
      </span>
      <span style={{ width: 52 }} />
    </div>
    <div style={{ position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);

export const Screen = ({ src, width, height, style }: { src: string; width: number; height: number; style?: CSSProperties }) => (
  <Img src={src} style={{ display: "block", width, height, objectFit: "cover", objectPosition: "top left", ...style }} />
);

// --- JSON with the website's code colours -------------------------------------------------------

const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b|([{}[\],:])|(…)/g;

export const JsonLine = ({ text }: { text: string }) => {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    const [whole, str, colon, num, kw] = match;
    const color = str ? (colon ? theme.tKey : theme.tStr) : num ? theme.tNum : kw ? theme.tKw : theme.codeFg;
    parts.push(
      <span key={index} style={{ color }}>
        {str && colon ? str : whole}
      </span>,
    );
    if (str && colon) parts.push(colon);
    last = index + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
};

export const CodeWindow = ({
  title,
  label,
  width,
  children,
}: {
  title: string;
  label?: string;
  width: number;
  children: ReactNode;
}) => {
  const method = title.match(/^(GET|POST|PUT|PATCH|DELETE) /)?.[1];
  const rest = method ? title.slice(method.length + 1) : title;
  return (
    <div
      style={{
        width,
        background: theme.codeInk,
        color: theme.codeFg,
        borderRadius: 14,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px -12px rgba(3,6,16,0.55)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          height: 52,
          padding: "0 22px",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.08)",
          fontFamily: theme.mono,
          fontSize: 18,
          color: "#aeb7cb",
        }}
      >
        {method && <span style={{ fontWeight: 700, color: theme.tStr }}>{method}</span>}
        <span>{rest}</span>
        {label && <span style={{ marginLeft: "auto", fontFamily: theme.font, color: "#8e98ae" }}>{label}</span>}
      </div>
      <div style={{ padding: "20px 22px 24px", fontFamily: theme.mono, fontSize: 20, lineHeight: 1.65, whiteSpace: "pre" }}>{children}</div>
    </div>
  );
};

/** A JSON line that types in from `at`, with an optional highlight band behind it. */
export const RevealLine = ({ text, at, glow = 0, suffix }: { text: string; at: number; glow?: number; suffix?: ReactNode }) => {
  const frame = useCurrentFrame();
  const shown = interpolate(frame, [at, at + 8], [0, 1], clamp);
  return (
    <div
      style={{
        opacity: shown,
        transform: `translateX(${(1 - shown) * 10}px)`,
        margin: "0 -22px",
        padding: "0 22px",
        background: `rgba(142, 169, 255, ${0.14 * glow})`,
        boxShadow: glow ? `inset 3px 0 0 rgba(142, 169, 255, ${glow})` : undefined,
      }}
    >
      <JsonLine text={text} />
      {suffix}
      {"\u200b"}
    </div>
  );
};
