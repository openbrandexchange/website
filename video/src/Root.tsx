import { Composition } from "remotion";
import { copyFor } from "./copy";
import { Explainer, type ExplainerProps } from "./Explainer";
import { buildTimeline, FPS } from "./timeline";

const durationFor = (props: ExplainerProps) => buildTimeline(copyFor(props.locale).durations).totalFrames;

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
  </>
);
