// Who is behind the project, per language. The values live in org-core.ts (shared with the
// brochure script and the tests); this file binds them to the locale messages.
import { messages, type Lang } from '../i18n';
import imprint from '../data/imprint.json';
import { foundationName, initiativeText, orgPlaceholders } from './org-core.ts';

export { HELLO_EMAIL, SECURITY_EMAIL, PERSON, FOUNDATION, PRIVACY_UPDATED, longDate } from './org-core.ts';

export const foundation = (lang: Lang) => foundationName(messages[lang]);
export const initiativeLine = (lang: Lang) => initiativeText(messages[lang]);
export const orgVars = (lang: Lang) => orgPlaceholders(messages[lang]);

export interface ImprintDetails {
  address: string[] | null;
  phone: string | null;
  registration: string | null;
}

/** Optional imprint details, filled in by the owner in src/data/imprint.json; null = not shown. */
export const imprintDetails: ImprintDetails = {
  address: imprint.address as string[] | null,
  phone: imprint.phone as string | null,
  registration: imprint.registration as string | null,
};
