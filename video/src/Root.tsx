import { Composition } from "remotion";
import { copyFor } from "./copy";
import { Explainer, type ExplainerProps } from "./Explainer";
import { buildTimeline, FPS } from "./timeline";
import { copyFor as copyForV2 } from "./v2/copy";
import { ExplainerV2, type ExplainerV2Props } from "./v2/ExplainerV2";
import { buildTimeline as buildTimelineV2 } from "./v2/timeline";

const durationFor = (props: ExplainerProps) => buildTimeline(copyFor(props.locale).durations).totalFrames;
const durationForV2 = (props: ExplainerV2Props) => buildTimelineV2(copyForV2(props.locale).durations).totalFrames;

export const Root = () => (
  <>
    <Composition
      id="Explainer16x9"
      component={Explainer}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={durationFor({ locale: "en" })}
      defaultProps={{ locale: "en" } satisfies ExplainerProps}
      calculateMetadata={({ props }) => ({ durationInFrames: durationFor(props) })}
    />
    <Composition
      id="Explainer9x16"
      component={Explainer}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={durationFor({ locale: "en" })}
      defaultProps={{ locale: "en" } satisfies ExplainerProps}
      calculateMetadata={({ props }) => ({ durationInFrames: durationFor(props) })}
    />
    {/* Version 2 (2026-11): the "Label" style, industry-neutral, In → the open standard → Out. */}
    {([["ExplainerV2-16x9", 1920, 1080], ["ExplainerV2-9x16", 1080, 1920]] as const).map(([id, width, height]) => (
      <Composition
        key={id}
        id={id}
        component={ExplainerV2}
        width={width}
        height={height}
        fps={FPS}
        durationInFrames={durationForV2({ locale: "en" })}
        defaultProps={{ locale: "en" } satisfies ExplainerV2Props}
        calculateMetadata={({ props }) => ({ durationInFrames: durationForV2(props) })}
      />
    ))}
  </>
);
