import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { clamp, Icon, Kicker, lift, useRise, useStage } from "./kit";

export type OpenTimes = { open: number; connect: number; parties: number; systems: number; portal: number };

/** One point of the three: framed while it is spoken about, quieter once the next one starts. */
const Row = ({ n, from, next, children }: { n: number; from: number; next: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const { portrait } = useStage();
  const shown = rise(from, 20);
  const active = interpolate(frame, [next, next + 12], [1, 0], clamp);
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: portrait ? "1fr" : "92px 1fr",
        gap: portrait ? 14 : 0,
        alignItems: "start",
        background: theme.surface,
        border: `${1.5 + 1.5 * active}px solid ${active > 0.5 ? theme.fg : theme.lineStrong}`,
        boxShadow: `${10 * active}px ${10 * active}px 0 ${theme.fg}`,
        padding: portrait ? "30px 34px 34px" : "30px 38px 32px 30px",
        opacity: shown * (1 - 0.45 * (1 - active)),
        transform: `translateY(${(1 - shown) * 18}px)`,
      }}
    >
      <Kicker size={portrait ? 24 : 26} color={theme.accentFg} style={{ paddingTop: portrait ? 0 : 12 }}>
        {String(n).padStart(2, "0")}
      </Kicker>
      <div>{children}</div>
    </div>
  );
};

const Heading = ({ children }: { children: ReactNode }) => {
  const { portrait } = useStage();
  return (
    <div style={{ fontFamily: theme.font, fontSize: portrait ? 50 : 54, fontWeight: 640, letterSpacing: "-0.03em", lineHeight: 1.08, color: theme.fg, textWrap: "balance" }}>{children}</div>
  );
};

const Chip = ({ children, at, mono = false, dark = false }: { children: ReactNode; at: number; mono?: boolean; dark?: boolean }) => {
  const rise = useRise();
  const { portrait } = useStage();
  const r = rise(at, 14);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: portrait ? 62 : 60,
        padding: "0 22px",
        border: `2px solid ${theme.fg}`,
        background: dark ? theme.fg : theme.surface,
        color: dark ? theme.bg : theme.fg,
        fontFamily: mono ? theme.mono : theme.font,
        fontSize: mono ? 26 : 28,
        fontWeight: mono ? 600 : 560,
        letterSpacing: mono ? "0.04em" : "-0.01em",
        ...lift(r, 10),
      }}
    >
      {children}
    </span>
  );
};

/** Open and non-profit, every party connects, the portal is the brand's: three short points. */
export const OpenScene = ({ ui, t, end }: { ui: Ui["open"]; t: OpenTimes; end: number }) => {
  const rise = useRise();
  const { portrait, padX, top, bottom } = useStage();
  const brands = ui.parties.slice(0, 3);
  const systems = ui.parties.slice(3);
  const detail: CSSProperties = { marginTop: 18, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" };
  return (
    <AbsoluteFill style={{ padding: `${top}px ${padX}px ${bottom}px`, justifyContent: "center", fontFamily: theme.font, color: theme.fg }}>
      <div style={{ display: "grid", gap: portrait ? 30 : 24 }}>
        <Row n={1} from={t.open - 4} next={t.connect}>
          <Heading>{ui.free}</Heading>
          <div style={{ marginTop: 14, fontSize: portrait ? 30 : 28, fontWeight: 450, lineHeight: 1.25, color: theme.muted, letterSpacing: "-0.005em", ...lift(rise(t.open + 16), 8) }}>
            {ui.feeNote}
          </div>
        </Row>
        <Row n={2} from={t.connect - 4} next={t.portal}>
          <Heading>{ui.connect}</Heading>
          <div style={detail}>
            {brands.map((p, i) => (
              <Chip key={p} at={t.parties + i * 7}>
                {p}
              </Chip>
            ))}
            {systems.map((p, i) => (
              <Chip key={p} at={t.systems + i * 7} mono dark>
                {p}
              </Chip>
            ))}
          </div>
        </Row>
        <Row n={3} from={t.portal - 4} next={end}>
          <Heading>{ui.portal}</Heading>
          <div style={{ ...detail, gap: portrait ? 10 : 30, flexDirection: portrait ? "column" : "row", alignItems: portrait ? "flex-start" : "center" }}>
            {ui.portalItems.map((item, i) => (
              <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: portrait ? 31 : 30, fontWeight: 540, letterSpacing: "-0.01em", ...lift(rise(t.portal + 14 + i * 9), 8) }}>
                <Icon name="check" size={30} color={theme.accentFg} stroke={1.8} />
                {item}
              </span>
            ))}
          </div>
        </Row>
      </div>
    </AbsoluteFill>
  );
};

/** One neutral example of a party that implements the standard for both sides. */
export const ExampleScene = ({ ui }: { ui: Ui["example"] }) => {
  const rise = useRise();
  const { portrait, padX } = useStage();
  return (
    <AbsoluteFill style={{ padding: `0 ${padX}px`, justifyContent: "center", paddingTop: portrait ? 200 : 150, paddingBottom: portrait ? 260 : 60, fontFamily: theme.font, color: theme.fg }}>
      <div style={{ maxWidth: portrait ? undefined : 1500 }}>
        <Kicker size={portrait ? 28 : 28} color={theme.muted} style={{ ...lift(rise(2)) }}>
          {ui.lead}
        </Kicker>
        <div style={{ marginTop: 18, fontSize: portrait ? 104 : 116, fontWeight: 660, letterSpacing: "-0.04em", lineHeight: 1, ...lift(rise(6)) }}>{ui.name}</div>
        <div style={{ marginTop: portrait ? 48 : 52, borderTop: `2px solid ${theme.fg}`, maxWidth: portrait ? undefined : 1200 }}>
          {ui.sides.map((side, i) => (
            <div
              key={side.h}
              style={{
                display: "grid",
                gridTemplateColumns: portrait ? "1fr" : "260px 1fr",
                gap: portrait ? 8 : 0,
                alignItems: "baseline",
                padding: portrait ? "22px 0" : "22px 0 20px",
                borderBottom: `1px solid ${i === ui.sides.length - 1 ? theme.fg : theme.line}`,
                ...lift(rise(14 + i * 8), 10),
              }}
            >
              <Kicker size={24} color={theme.accentFg}>
                {side.h}
              </Kicker>
              <span style={{ fontSize: portrait ? 36 : 36, fontWeight: 480, letterSpacing: "-0.015em", lineHeight: 1.2, color: theme.fg2 }}>{side.p}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
