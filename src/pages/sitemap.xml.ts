import type { APIRoute } from 'astro';
import { langs, pageKeys, SITE, url, xDefaultLang } from '../i18n';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = () => {
  const entries = pageKeys.flatMap((page) =>
    langs.map((lang) => {
      const alternates = [
        ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escape(SITE + url(l, page))}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(SITE + url(xDefaultLang, page))}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${escape(SITE + url(lang, page))}</loc>\n${alternates}\n  </url>`;
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
