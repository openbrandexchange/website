// Pages, URLs and the locale messages. Language logic lives in lib/i18n-core.ts.
import en from './locales/en.json';
import { langs, type Lang } from './lib/i18n-core.ts';

export * from './lib/i18n-core.ts';

export type Messages = typeof en;

const files = import.meta.glob<Messages>('./locales/*.json', { eager: true, import: 'default' });

/** Messages per language. Completeness against en.json is enforced by tests/locales.test.mjs. */
export const messages = Object.fromEntries(
  langs.map((lang) => {
    const file = files[`./locales/${lang}.json`];
    if (!file) throw new Error(`Missing locale file src/locales/${lang}.json`);
    return [lang, file];
  }),
) as Record<Lang, Messages>;

export type PageKey =
  | 'home'
  | 'brands'
  | 'automation'
  | 'hosting'
  | 'partners'
  | 'retailers'
  | 'developers'
  | 'check'
  | 'directory'
  | 'downloads'
  | 'faq'
  | 'governance'
  | 'privacy'
  | 'cookies'
  | 'imprint';

// One English slug per page for every language: short, stable URLs that never need translating.
export const slugs: Record<PageKey, string> = {
  home: '',
  brands: 'for-brands',
  automation: 'automation',
  hosting: 'hosting',
  partners: 'partners',
  retailers: 'for-retailers',
  developers: 'developers',
  check: 'check',
  directory: 'directory',
  downloads: 'downloads',
  faq: 'faq',
  governance: 'governance',
  privacy: 'privacy',
  cookies: 'cookies',
  imprint: 'imprint',
};

export const pageKeys = Object.keys(slugs) as PageKey[];

/** Path of a page in a language, always with a trailing slash. `hash` may start with '#'. */
export function url(lang: Lang, page: PageKey, hash = ''): string {
  const slug = slugs[page];
  return `/${lang}/${slug ? slug + '/' : ''}${hash}`;
}

export const SITE = 'https://openbrandexchange.com';
export const GITHUB = 'https://github.com/openbrandexchange';
export const repo = (name: string, path = '') => `${GITHUB}/${name}${path}`;
export const specDoc = (file: string) => repo('spec', `/blob/main/${file}`);
