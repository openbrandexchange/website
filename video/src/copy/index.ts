import en from "./en.json";
import nl from "./nl.json";
import enDurations from "../../public/voice/en/durations.json";
import nlDurations from "../../public/voice/nl/durations.json";

export type Locale = "en" | "nl";

export type Copy = typeof en;
export type Ui = Copy["ui"];
export type VoiceId = Copy["voice"][number]["id"];

const copies: Record<Locale, { copy: Copy; durations: Record<string, number> }> = {
  en: { copy: en, durations: enDurations },
  nl: { copy: nl, durations: nlDurations },
};

export const copyFor = (locale: Locale) => copies[locale];
