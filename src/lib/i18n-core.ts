// Language logic shared by the pages, the browser script and the tests.
// No imports, so Node can run it directly in tests (type stripping).

/** The 25 site languages, in alphabetical order of their code. English is the source. */
export const langs = [
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'ga', 'hr', 'hu',
  'it', 'lt', 'lv', 'mt', 'nl', 'nb', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv',
] as const;
export type Lang = (typeof langs)[number];

/** Where a visitor lands when none of their browser languages is supported (Dutch audience first). */
export const defaultLang: Lang = 'nl';
/** The hreflang x-default target for search engines. */
export const xDefaultLang: Lang = 'en';
/** The source language every other locale is checked against. */
export const sourceLang: Lang = 'en';

/** Each language's name in that language, for the language switcher. */
export const nativeNames: Record<Lang, string> = {
  bg: 'Български', cs: 'Čeština', da: 'Dansk', de: 'Deutsch', el: 'Ελληνικά',
  en: 'English', es: 'Español', et: 'Eesti', fi: 'Suomi', fr: 'Français',
  ga: 'Gaeilge', hr: 'Hrvatski', hu: 'Magyar', it: 'Italiano', lt: 'Lietuvių',
  lv: 'Latviešu', mt: 'Malti', nl: 'Nederlands', nb: 'Norsk bokmål', pl: 'Polski',
  pt: 'Português', ro: 'Română', sk: 'Slovenčina', sl: 'Slovenščina', sv: 'Svenska',
};

/** Open Graph locale per language. */
export const ogLocales: Record<Lang, string> = {
  bg: 'bg_BG', cs: 'cs_CZ', da: 'da_DK', de: 'de_DE', el: 'el_GR', en: 'en_GB',
  es: 'es_ES', et: 'et_EE', fi: 'fi_FI', fr: 'fr_FR', ga: 'ga_IE', hr: 'hr_HR',
  hu: 'hu_HU', it: 'it_IT', lt: 'lt_LT', lv: 'lv_LV', mt: 'mt_MT', nl: 'nl_NL',
  nb: 'nb_NO', pl: 'pl_PL', pt: 'pt_PT', ro: 'ro_RO', sk: 'sk_SK', sl: 'sl_SI', sv: 'sv_SE',
};

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (langs as readonly string[]).includes(value);
}

/**
 * Map one BCP 47 tag (from navigator.languages or Accept-Language) to a site language.
 * Matches on the primary subtag; Norwegian 'no' and 'nn' map to 'nb'.
 */
export function matchLang(tag: string): Lang | null {
  const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
  if (primary === 'no' || primary === 'nn') return 'nb';
  return isLang(primary) ? primary : null;
}

/**
 * Choose the language for a visitor: a remembered choice wins, then the first supported
 * browser language, then the default.
 */
export function pickLang(stored: string | null | undefined, preferred: readonly string[]): Lang {
  if (isLang(stored)) return stored;
  for (const tag of preferred) {
    const match = matchLang(tag);
    if (match) return match;
  }
  return defaultLang;
}

/** Parse an Accept-Language header into tags, highest quality first. */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const quality = q ? Number(q.slice(2)) : 1;
      return { tag: tag.trim(), quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((entry) => entry.tag && entry.tag !== '*' && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((entry) => entry.tag);
}

/**
 * Localized text fallback, the same rule as in every OBX node and the admin UI:
 * the reader's language, then English, then the first available value.
 */
export function localized(text: Record<string, string> | null | undefined, lang: string): string {
  if (!text) return '';
  const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
  if (nonEmpty(text[lang])) return text[lang];
  const primary = lang.split('-')[0];
  if (nonEmpty(text[primary])) return text[primary];
  if (nonEmpty(text.en)) return text.en;
  const first = Object.values(text).find(nonEmpty);
  return first ?? '';
}

/** Replace {name} placeholders. Unknown placeholders are left as they are. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole,
  );
}
