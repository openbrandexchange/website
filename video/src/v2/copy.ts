import de from "./copy/de.json";
import en from "./copy/en.json";
import fr from "./copy/fr.json";
import nl from "./copy/nl.json";
import enChunks from "../../public/voice-v2/en/chunks.json";
import enDurations from "../../public/voice-v2/en/durations.json";
import nlChunks from "../../public/voice-v2/nl/chunks.json";
import nlDurations from "../../public/voice-v2/nl/durations.json";

export type Locale = "en" | "nl" | "de" | "fr";
export type VoiceLocale = "en" | "nl";
export type Copy = typeof en;
export type Ui = Copy["ui"];
export type LineId = "before" | "rush" | "idea" | "in" | "standard" | "out" | "after" | "once" | "end";

const copies: Record<Locale, Copy> = { en, nl, de: de as Copy, fr: fr as Copy };
const voices: Record<VoiceLocale, { durations: Record<string, number>; chunks: Record<string, number[]> }> = {
  en: { durations: enDurations, chunks: enChunks },
  nl: { durations: nlDurations, chunks: nlChunks },
};

/** German and French are caption-only versions of the English voice-over. */
export const voiceFor = (locale: Locale): VoiceLocale => (locale === "nl" ? "nl" : "en");

export const copyFor = (locale: Locale) => ({ copy: copies[locale], voice: voiceFor(locale), ...voices[voiceFor(locale)] });

/** A caption without its markup: "|" splits it into chunks, "*" marks the accent words. */
export const chunksOf = (caption: string) => caption.replace(/\*/g, "").split("|").map((part) => part.trim());
export const plain = (caption: string) => chunksOf(caption).join(" ");
