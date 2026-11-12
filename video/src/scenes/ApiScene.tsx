import { interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { theme } from "../theme";
import { clamp, CodeWindow, lift, RevealLine, Stage, usePortrait, useRise } from "./kit";

// The change feed as the spec defines it (GET /obx/v1/changes): a snapshot first, then live changes.
const SNAPSHOT = [
  "{",
  '  "phase": "snapshot",',
  '  "changes": [',
  '    { "op": "upsert", "type": "product", "external_id": "KO-1001" },',
  '    { "op": "upsert", "type": "variant", "external_id": "2000100101018" },',
  '    { "op": "upsert", "type": "asset", "external_id": "KO-1001_NVY_1" },',
  '    { "op": "upsert", "type": "asset", "external_id": "KO-1001_NVY_2" },',
  '    { "op": "upsert", "type": "product", "external_id": "KO-1002" },',
  "    …",
  "  ],",
  '  "has_more": true',
  "}",
];
const LIVE = [
  "{",
  '  "phase": "live",',
  '  "changes": [',
  '    { "op": "upsert", "type": "variant", "external_id": "2000100101025" },',
  '    { "op": "delete", "type": "asset", "external_id": "KO-1001_NVY_2" }',
  "  ],",
  '  "has_more": false',
  "}",
];
const WITHDRAWN_LINE = 4;

export const ApiScene = ({ ui, switchAt }: { ui: Ui["api"]; switchAt: number }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const portrait = usePortrait();
  const live = interpolate(frame, [switchAt - 4, switchAt + 8], [0, 1], clamp);
  const pill = rise(switchAt + 40);

  const steps = (
    <div style={{ marginTop: portrait ? 36 : 56, display: "grid", gap: 18 }}>
      {ui.steps.map((step, index) => {
        const active = index === 0 ? 1 - live : live;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: 18, ...lift(rise(10 + index * 6)) }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                background: `rgba(36, 80, 232, ${0.15 + 0.85 * active})`,
                color: "#fff",
                boxShadow: `0 0 0 1px rgba(142, 169, 255, ${0.4 - 0.3 * active})`,
              }}
            >
              {index + 1}
            </span>
            <span style={{ fontSize: 30, fontWeight: 600, color: active > 0.5 ? theme.inkFg : theme.inkMuted }}>{step}</span>
          </div>
        );
      })}
    </div>
  );

  const tag = (
    <span
      style={{
        display: "inline-block",
        marginLeft: 16,
        padding: "0 14px",
        borderRadius: 99,
        fontFamily: theme.font,
        fontSize: 18,
        lineHeight: "28px",
        fontWeight: 650,
        background: theme.tKw,
        color: theme.codeInk,
        opacity: pill,
        transform: `translateX(${(1 - pill) * 12}px)`,
      }}
    >
      {ui.withdrawn}
    </span>
  );

  const block = (lines: string[], start: number, opacity: number, glowLine = -1) => (
    <div style={{ position: "absolute", left: 22, right: 22, top: 20, opacity }}>
      {lines.map((line, index) => (
        <RevealLine key={index} text={line} at={start + index * 4} glow={index === glowLine ? pill : 0} suffix={index === glowLine ? tag : undefined} />
      ))}
    </div>
  );

  return (
    <Stage dark eyebrow={ui.eyebrow} title={ui.title} visual={{ w: 1040, h: 500 }} headerWidth={540} aside={steps} asideHeight={150} maxScale={1.25}>
      <div style={{ ...lift(rise(6), 30) }}>
        <CodeWindow title="GET /obx/v1/changes" label={ui.software.join(" · ")} width={1040}>
          <div style={{ position: "relative", height: 420, margin: "-20px -22px -24px" }}>
            {block(SNAPSHOT, 12, 1 - live)}
            {block(LIVE, switchAt + 4, live, WITHDRAWN_LINE)}
          </div>
        </CodeWindow>
      </div>
    </Stage>
  );
};
