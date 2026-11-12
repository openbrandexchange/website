import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

type Line = { id: string; from: number; frames: number; text: string };

// The spoken line, burned in, so the video reads without sound.
const Caption = ({ text, frames }: { text: string; frames: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const opacity = interpolate(frame, [0, 5, frames - 5, frames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: portrait ? 230 : 56 }}>
      <div
        style={{
          maxWidth: portrait ? 940 : 1380,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: theme.font,
          fontFeatureSettings: theme.features,
          fontWeight: 560,
          fontSize: portrait ? 46 : 40,
          lineHeight: 1.32,
          letterSpacing: "-0.01em",
          color: theme.inkFg,
          background: "rgba(10, 16, 32, 0.86)",
          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.08)",
          padding: portrait ? "16px 30px" : "13px 28px",
          borderRadius: 14,
          opacity,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Captions = ({ lines }: { lines: Line[] }) => (
  <>
    {lines.map((line) => (
      <Sequence key={line.id} from={line.from} durationInFrames={line.frames + 8} layout="none">
        <Caption text={line.text} frames={line.frames + 8} />
      </Sequence>
    ))}
  </>
);
