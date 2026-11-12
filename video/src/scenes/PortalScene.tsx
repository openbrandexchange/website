import { interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Locale, Ui } from "../copy";
import { theme } from "../theme";
import { BrowserFrame, clamp, lift, Screen, Stage, usePortrait, useRise } from "./kit";

const W = 1280;
const H = 800;

const Download = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </svg>
);

/** The brand's portal on its own domain: the catalog, then the EAN list, then what buyers take away. */
export const PortalScene = ({ ui, locale, buyersAt }: { ui: Ui["portal"]; locale: Locale; buyersAt: number }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const portrait = usePortrait();
  const ean = interpolate(frame, [buyersAt - 6, buyersAt + 10], [0, 1], clamp);
  const urlGlow = interpolate(frame, [18, 30, 70, 90], [0, 1, 1, 0], clamp);
  const pan = interpolate(frame, [buyersAt + 30, buyersAt + 150], [0, -116], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const chipsAt = buyersAt + 75;

  const chips = (
    <div style={{ marginTop: portrait ? 34 : 54, ...lift(rise(chipsAt - 8)) }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: theme.muted, marginBottom: 16 }}>{ui.downloads}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, maxWidth: portrait ? 920 : 470 }}>
        {ui.chips.map((chip, index) => (
          <span
            key={chip}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 10,
              fontSize: 24,
              fontWeight: 600,
              background: index === 3 ? theme.accent : theme.surface,
              color: index === 3 ? "#fff" : theme.fg,
              boxShadow: index === 3 ? "none" : theme.shadow,
              ...lift(rise(chipsAt + index * 5), 10),
            }}
          >
            <Download />
            {chip}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <Stage dark={false} eyebrow={ui.eyebrow} title={ui.title} visual={{ w: W, h: H + 50 }} headerWidth={480} aside={chips} asideHeight={portrait ? 230 : 0}>
      <div style={{ ...lift(rise(4), 30) }}>
        <BrowserFrame url={ui.domain} width={W} highlightUrl={urlGlow}>
          <div style={{ position: "relative", width: W, height: H }}>
            <Screen src={staticFile(`screens/${locale}/portal-catalog.webp`)} width={W} height={H} style={{ position: "absolute", transform: `scale(${1 + frame / 6000})`, transformOrigin: "top center" }} />
            <div style={{ position: "absolute", inset: 0, opacity: ean, overflow: "hidden", background: theme.surface }}>
              <Screen src={staticFile(`screens/${locale}/portal-ean.webp`)} width={W} height={960} style={{ transform: `translateY(${pan}px)` }} />
            </div>
          </div>
        </BrowserFrame>
      </div>
    </Stage>
  );
};
