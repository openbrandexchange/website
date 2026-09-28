// Country and language names in the reader's language, from the runtime's ICU data.
function displayName(lang: string, type: 'region' | 'language', code: string): string {
  try {
    const name = new Intl.DisplayNames([lang, 'en'], { type }).of(code);
    return name && name !== code ? name : code;
  } catch {
    return code;
  }
}

export const countryName = (lang: string, code: string) => displayName(lang, 'region', code.toUpperCase());
export const languageName = (lang: string, code: string) => displayName(lang, 'language', code);

/** Format a list with the reader's conjunction rules, e.g. "Dutch, English". */
export function list(lang: string, items: string[]): string {
  try {
    return new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' }).format(items);
  } catch {
    return items.join(', ');
  }
}
