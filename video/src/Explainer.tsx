import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Captions } from "./Captions";
import { copyFor, type Locale, type VoiceId } from "./copy";
import { Fonts } from "./Fonts";
import { ApiScene } from "./scenes/ApiScene";
import { EndScene } from "./scenes/EndScene";
import { Fade } from "./scenes/Fade";
import { LabelScene } from "./scenes/LabelScene";
import { LuggageScene } from "./scenes/LuggageScene";
import { OpenScene } from "./scenes/OpenScene";
import { PortalScene } from "./scenes/PortalScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { RightsScene } from "./scenes/RightsScene";
import { buildTimeline } from "./timeline";
import { theme } from "./theme";

export type ExplainerProps = { locale: Locale };

// Voice only: no music bed, so the narration stays clear.
export const Explainer = ({ locale }: ExplainerProps) => {
  const { copy, durations } = copyFor(locale);
  const { scenes, lines } = buildTimeline(durations);
  const ui = copy.ui;
  const text = Object.fromEntries(copy.voice.map((line) => [line.id, "caption" in line ? (line.caption as string) : line.text]));
  const line = (id: VoiceId) => lines.find((l) => l.id === id)!;
  const at = (id: VoiceId, sceneId: string) => line(id).from - scenes[sceneId].from;

  const scene = (id: string, children: ReactNode) => (
    <Sequence key={id} from={scenes[id].from} durationInFrames={scenes[id].frames} name={id}>
      <Fade inFrames={id === "problem" ? 12 : 9} outFrames={id === "end" ? 0 : 9}>
        {children}
      </Fade>
    </Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink }}>
      <Fonts />
      {scene("problem", <ProblemScene ui={ui.problem} />)}
      {scene("portal", <PortalScene ui={ui.portal} locale={locale} buyersAt={at("buyers", "portal")} />)}
      {scene("api", <ApiScene ui={ui.api} switchAt={at("api", "api") + Math.round(line("api").frames * 0.5)} />)}
      {scene("label", <LabelScene ui={ui.label} lawAt={at("labelLaw", "label")} />)}
      {scene("luggage", <LuggageScene ui={ui.luggage} lineFrames={line("luggage").frames} />)}
      {scene("rights", <RightsScene ui={ui.rights} lineFrames={line("rights").frames} />)}
      {scene("open", <OpenScene ui={ui.open} openFrames={line("open").frames} foundationAt={at("foundation", "open")} />)}
      {scene("end", <EndScene ui={ui.end} />)}

      <Captions lines={lines.map((l) => ({ ...l, text: text[l.id] }))} />

      {lines.map((l) => (
        <Sequence key={l.id} from={l.from} durationInFrames={l.frames + 15} layout="none">
          <Audio src={staticFile(`voice/${locale}/${l.id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
