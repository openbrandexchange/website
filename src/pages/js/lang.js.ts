// /js/lang.js: sends a visitor on the home address to their language.
// Generated from lib/i18n-core.ts so the browser uses the same list and rules.
import type { APIRoute } from 'astro';
import { defaultLang, langs } from '../../lib/i18n-core.ts';

const code = `// Generated at build time. Picks the visitor's language on the home address.
(function () {
  var langs = ${JSON.stringify(langs)};
  var fallback = ${JSON.stringify(defaultLang)};
  function match(tag) {
    var primary = String(tag || '').trim().toLowerCase().split(/[-_]/)[0];
    if (primary === 'no' || primary === 'nn') primary = 'nb';
    return langs.indexOf(primary) === -1 ? null : primary;
  }
  var stored = null;
  try {
    stored = localStorage.getItem('obx-lang');
  } catch (e) {
    /* storage unavailable */
  }
  var lang = langs.indexOf(stored) !== -1 ? stored : null;
  var preferred = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) || [];
  for (var i = 0; !lang && i < preferred.length; i++) lang = match(preferred[i]);
  location.replace('/' + (lang || fallback) + '/' + location.hash);
})();
`;

export const GET: APIRoute = () =>
  new Response(code, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
