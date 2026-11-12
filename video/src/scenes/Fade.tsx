import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const EDGE = 9;

export const Fade = ({ children, inFrames = EDGE, outFrames = EDGE }: { children: ReactNode; inFrames?: number; outFrames?: number }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = Math.min(
    inFrames ? interpolate(frame, [0, inFrames], [0, 1], { extrapolateRight: "clamp" }) : 1,
    outFrames ? interpolate(frame, [durationInFrames - outFrames, durationInFrames], [1, 0], { extrapolateLeft: "clamp" }) : 1,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
