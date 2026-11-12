import en from "./copy/en.json";
import enChunks from "../../public/voice-v2/en/chunks.json";
import enDurations from "../../public/voice-v2/en/durations.json";

export type Copy = typeof en;
export type Ui = Copy["ui"];
export type LineId = "before" | "rush" | "idea" | "in" | "standard" | "out" | "after" | "once" | "dev" | "open" | "connect" | "portal" | "example" | "end";

// Every site language, all on the English voice-over: only the burned-in captions and labels differ.
// Every copy/<locale>.json is picked up (webpack's require.context, which the Remotion bundler provides).
declare const require: { context: (dir: string, deep: boolean, filter: RegExp) => { keys: () => string[]; (key: string): Copy } };
const files = require.context("./copy", false, /^\.\/[a-z]{2}\.json$/);
const copies: Record<string, Copy> = Object.fromEntries(files.keys().map((key) => [key.slice(2, 4), files(key)]));
export type Locale = string;
export const LOCALES = Object.keys(copies);

export const voiceFor = (_locale: Locale) => "en" as const;

export const copyFor = (locale: Locale) => {
  const copy = copies[locale];
  if (!copy) throw new Error(`No video copy for "${locale}"`);
  return { copy, voice: voiceFor(locale), durations: enDurations as Record<string, number>, chunks: enChunks as Record<string, number[]> };
};

/** A caption without its markup: "|" splits it into chunks, "*" marks the accent words. */
export const chunksOf = (caption: string) => caption.replace(/\*/g, "").split("|").map((part) => part.trim());
export const plain = (caption: string) => chunksOf(caption).join(" ");
