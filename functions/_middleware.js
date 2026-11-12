// 1. www.openbrandexchange.com redirects to the apex domain (one address per page for search
//    engines and for the canonical links).
// 2. A page address without a language (/partners, /hosting/, …), as people and assistants type
//    it, redirects to that page in the visitor's language: the first supported language of
//    Accept-Language, else Dutch, the same rule as the home address (src/lib/i18n-core.ts).
// Everything else passes through unchanged.

import { CURRENT_SCHEMA_VERSION } from './schema-version.js';

/** The page slugs of src/i18n.ts (tests/site.test.mjs checks they match). */
export const PAGE_SLUGS = [
  'for-brands', 'automation', 'hosting', 'partners', 'for-retailers', 'developers', 'check', 'directory',
  'downloads', 'faq', 'governance', 'privacy', 'cookies', 'imprint',
];
const LANGS = [
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'ga', 'hr', 'hu',
  'it', 'lt', 'lv', 'mt', 'nl', 'nb', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv',
];
const DEFAULT_LANG = 'nl';

/** The visitor's language from an Accept-Language header. */
export function langFor(header) {
  const tags = String(header ?? '')
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const quality = q ? Number(q.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((e) => e.tag && e.tag !== '*' && e.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  for (const { tag } of tags) {
    const primary = tag.split(/[-_]/)[0];
    const lang = primary === 'no' || primary === 'nn' ? 'nb' : primary;
    if (LANGS.includes(lang)) return lang;
  }
  return DEFAULT_LANG;
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.openbrandexchange.com') {
    url.hostname = 'openbrandexchange.com';
    return Response.redirect(url.toString(), 301);
  }
  // 3. Schemas of an earlier version (only the current one is served) redirect to the current one.
  const old = /^\/(reference\/)?schemas\/(v\d+\.\d+)\/(.*)$/.exec(url.pathname);
  if (old && old[2] !== CURRENT_SCHEMA_VERSION) {
    url.pathname = `/${old[1] ?? ''}schemas/${CURRENT_SCHEMA_VERSION}/${old[3]}`;
    return Response.redirect(url.toString(), 301);
  }
  const slug = url.pathname.replace(/^\/+|\/+$/g, '');
  if (PAGE_SLUGS.includes(slug)) {
    url.pathname = `/${langFor(request.headers.get('Accept-Language'))}/${slug}/`;
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString(), Vary: 'Accept-Language', 'Cache-Control': 'no-store' },
    });
  }
  return next();
}
