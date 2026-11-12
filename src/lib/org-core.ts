// Who is behind the project and how to reach them. PERSON is used only where the law asks for a
// responsible natural person (the imprint and the privacy statement) until the foundation is registered, without any build-tool imports, so the
// brochure script and the tests can use the same values as the pages (src/lib/org.ts).
export const PERSON = 'Richard Lindhout';
export const FOUNDATION = 'Open Brand Exchange Foundation';
/** Publishes the site on behalf of the foundation until it is registered: the owner's sole proprietorship. */
export const PUBLISHER = 'webRidge';
export const HELLO_EMAIL = 'hello@openbrandexchange.com';
export const SECURITY_EMAIL = 'security@openbrandexchange.com';

/** The date the privacy and cookie statements were last changed (ISO). */
export const PRIVACY_UPDATED = '2026-11-12';

interface OrgMessages {
  org: { inFormation: string };
}

const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in vars ? vars[key] : whole));

/** "Open Brand Exchange Foundation (in oprichting)": the name is never translated, the status is. */
export function foundationName(m: OrgMessages): string {
  return `${FOUNDATION} (${m.org.inFormation})`;
}

/** The publisher line in the footer, the imprint and the brochures: only the foundation, no personal name. */
export function initiativeText(m: OrgMessages): string {
  return foundationName(m);
}

/** Placeholder values for texts that name the people or addresses behind the site. */
export function orgPlaceholders(m: OrgMessages): Record<string, string> {
  return { person: PERSON, publisher: PUBLISHER, foundation: foundationName(m), email: HELLO_EMAIL };
}

export function longDate(lang: string, iso: string): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z'));
}
