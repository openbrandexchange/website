import { messages, SITE, url, format, type Lang } from '../i18n';

/** The "send this to your brand" email in one language, as plain text. */
export function switchKit(lang: Lang): { subject: string; body: string; text: string } {
  const kit = messages[lang].switchKit;
  const body = format(kit.body, { url: SITE + url(lang, 'brands') });
  return { subject: kit.subject, body, text: `${kit.subject}\n\n${body}\n` };
}

export const switchKitPath = (lang: Lang) => `/downloads/switch-kit-${lang}.txt`;
