import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { Ui } from "../copy";
import { FPS } from "../timeline";
import { theme } from "../theme";
import { clamp, CodeWindow, lift, RevealLine, Stage, usePortrait, useRise } from "./kit";

// Product KT-2001 of the spec's fictional test brand, as on the website's retailers page
// (website/src/data/label-example.ts).
const LABEL = {
  styleNumber: "KT-2001",
  materials: [
    { part: "outer", fibers: [{ fiber: "recycled_polyester", percentage: 100 }] },
    { part: "lining", fibers: [{ fiber: "polyamide", percentage: 88 }, { fiber: "elastane", percentage: 12 }] },
  ],
  care: ["wash_30", "do_not_bleach", "do_not_tumble_dry", "do_not_iron", "do_not_dry_clean"],
  variants: [
    { size: "S", gtin: "02000200101017" },
    { size: "M", gtin: "02000200101024" },
    { size: "L", gtin: "02000200101031" },
  ],
} as const;

type Section = "materials" | "care" | "origin" | "variants";

// GET /obx/v1/products/{id}, the label fields only; each line knows which part of the label it shows.
const JSON_LINES: { text: string; section?: Section }[] = [
  { text: "{" },
  { text: '  "style_number": "KT-2001",' },
  { text: '  "materials": [', section: "materials" },
  { text: '    { "part": "outer", "fibers": [', section: "materials" },
  { text: '      { "fiber": "recycled_polyester", "percentage": 100 } ] },', section: "materials" },
  { text: '    { "part": "lining", "fibers": [', section: "materials" },
  { text: '      { "fiber": "polyamide", "percentage": 88 },', section: "materials" },
  { text: '      { "fiber": "elastane", "percentage": 12 } ] }', section: "materials" },
  { text: "  ],", section: "materials" },
  { text: '  "care": [', section: "care" },
  ...LABEL.care.map((code, i) => ({ text: `    { "code": "${code}", "text": null }${i < LABEL.care.length - 1 ? "," : ""}`, section: "care" as const })),
  { text: "  ],", section: "care" },
  { text: '  "country_of_origin": "VN",', section: "origin" },
  { text: '  "variants": [', section: "variants" },
  ...LABEL.variants.map((v, i) => ({ text: `    { "size": "${v.size}", "gtin": "${v.gtin}", "color": { "code": "BLK" } }${i < 2 ? "," : ""}`, section: "variants" as const })),
  { text: "  ]", section: "variants" },
  { text: "}" },
];
const LINE = 33;
const VISIBLE_LANDSCAPE = 13;
const VISIBLE_PORTRAIT = 9;

export const LabelScene = ({ ui, lawAt }: { ui: Ui["label"]; lawAt: number }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const portrait = usePortrait();
  const VISIBLE = portrait ? VISIBLE_PORTRAIT : VISIBLE_LANDSCAPE;

  // Walk through the label while the first line is spoken, then back to the composition for the law.
  const order: Section[] = ["materials", "care", "origin", "variants"];
  const starts = [0.9, 2.0, 3.1, 3.9].map((s) => Math.round(s * FPS));
  const back = Math.max(lawAt - 6, starts[3] + 20);
  const focus = (section: Section) => {
    const index = order.indexOf(section);
    if (frame >= back) return section === "materials" ? interpolate(frame, [back, back + 12], [0, 1], clamp) : 0;
    const start = starts[index];
    const end = index + 1 < starts.length ? starts[index + 1] : back;
    return interpolate(frame, [start - 4, start + 6, end - 2, end + 6], [0, 1, 1, 0], clamp);
  };

  const firstLine = (section: Section) => JSON_LINES.findIndex((l) => l.section === section);
  const scrollTargets = order.map((s) => Math.max(0, Math.min(firstLine(s) - 1, JSON_LINES.length - VISIBLE)));
  // Scroll the JSON so the part being shown is in view, and back to the top for the law.
  const keys = starts.flatMap((start) => [start, start + 14]).concat([back, back + 16]);
  const values = scrollTargets.flatMap((target, i) => [i === 0 ? 0 : scrollTargets[i - 1], target]).concat([scrollTargets[3], 0]);
  const scroll = interpolate(frame, keys, values, clamp);

  const law = (
    <div
      style={{
        width: portrait ? 920 : 760,
        marginTop: portrait ? 34 : 4,
        padding: "20px 26px",
        borderRadius: 12,
        background: theme.surface,
        boxShadow: `inset 4px 0 0 ${theme.accent}, ${theme.shadow}`,
        ...lift(rise(lawAt + 4)),
      }}
    >
      <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", textWrap: "balance" }}>{ui.law}</div>
      <div style={{ marginTop: 8, fontSize: 21, color: theme.muted }}>{ui.lawSource}</div>
    </div>
  );

  const row = (label: string, section: Section, children: ReactNode) => {
    const f = focus(section);
    return (
      <>
        <dt style={{ fontWeight: 650, color: theme.fg, padding: "6px 0" }}>{label}</dt>
        <dd
          style={{
            margin: 0,
            padding: "6px 14px",
            marginLeft: -14,
            borderRadius: 8,
            background: `rgba(36, 80, 232, ${0.09 * f})`,
            boxShadow: `inset 3px 0 0 rgba(36, 80, 232, ${f})`,
          }}
        >
          {children}
        </dd>
      </>
    );
  };

  const card = (
    <div style={{ width: portrait ? 760 : 680, background: theme.surface, border: `1px solid ${theme.lineStrong}`, borderRadius: 12, boxShadow: theme.shadow, padding: 30, fontSize: 21, lineHeight: 1.45, ...lift(rise(4), 24) }}>
      <div style={{ marginBottom: 20, fontSize: 24 }}>
        <strong style={{ fontWeight: 650 }}>Kestrel Trail · {ui.product}</strong> <span style={{ color: theme.muted }}>KT-2001 · {ui.colour}</span>
      </div>
      <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: 22, rowGap: 6, margin: 0 }}>
        {row(
          ui.composition,
          "materials",
          LABEL.materials.map((m) => (
            <div key={m.part}>
              {m.part === "outer" ? ui.outer : ui.lining}: {m.fibers.map((f) => `${f.percentage}% ${ui.fibres[f.fiber]}`).join(", ")}
            </div>
          )),
        )}
        {row(
          ui.care,
          "care",
          <ol style={{ margin: 0, paddingLeft: 26 }}>
            {LABEL.care.map((code) => (
              <li key={code}>{ui.careText[code]}</li>
            ))}
          </ol>,
        )}
        {row(ui.origin, "origin", ui.country)}
        {row(
          ui.sizes,
          "variants",
          LABEL.variants.map((v) => (
            <div key={v.size}>
              {ui.size} {v.size}: <span style={{ fontFamily: theme.mono, fontSize: 19, color: theme.muted }}>{v.gtin}</span>
            </div>
          )),
        )}
      </dl>
    </div>
  );

  const code = (
    <div style={{ ...lift(rise(12), 24) }}>
      <CodeWindow title="GET /obx/v1/products/{id}" label={ui.codeLabel} width={portrait ? 960 : 940}>
        <div style={{ height: VISIBLE * LINE, overflow: "hidden", margin: "0 -22px", padding: "0 22px" }}>
          <div style={{ transform: `translateY(${-scroll * LINE}px)`, margin: "0 -22px", padding: "0 22px" }}>
            {JSON_LINES.map((line, index) => (
              <RevealLine key={index} text={line.text} at={10 + Math.min(index, VISIBLE) * 2} glow={line.section ? focus(line.section) : 0} />
            ))}
          </div>
        </div>
      </CodeWindow>
    </div>
  );

  const visual = portrait ? { w: 960, h: 1000 } : { w: 1680, h: 640 };
  return (
    <Stage dark={false} eyebrow={ui.eyebrow} title={ui.title} layout="top" visual={visual} aside={law} asideHeight={210} maxScale={1}>
      <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", gap: portrait ? 40 : 60, alignItems: portrait ? "center" : "flex-start" }}>
        {card}
        {code}
      </div>
    </Stage>
  );
};
