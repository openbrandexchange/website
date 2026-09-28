// HTML for the brand and retailer brochures and the social preview images, from the same
// locale files as the website (src/locales/<lang>.json). Rendered to PDF/PNG by
// scripts/build-brochures.mjs. Keep every text in the locale files: this file only lays out.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HELLO_EMAIL, initiativeText, orgPlaceholders } from '../../src/lib/org-core.ts';

const root = new URL('../../', import.meta.url);
// Static Inter (SIL OFL 1.1): Latin, Latin Extended, Greek and Cyrillic, embedded as real fonts in the PDFs.
const FONT_DIR = new URL('node_modules/@fontsource/inter/', root);
const fontLinks = ['400', '600', '700'].map((w) => `<link rel="stylesheet" href="${new URL(`${w}.css`, FONT_DIR).href}">`).join('');
export const SITE = 'https://openbrandexchange.com';
/** Shown on the last page as "Version 0.1, <month year>". Bump with every content change. */
export const EDITION = '2026-09-28';

export const loadMessages = (lang) => JSON.parse(readFileSync(new URL(`src/locales/${lang}.json`, root), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (w, k) => (k in vars ? vars[k] : w));
const monthYear = (lang) => new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(EDITION + 'T00:00:00Z'));
const pageUrl = (lang, slug = '') => `openbrandexchange.com/${lang}/${slug ? slug + '/' : ''}`;

const MARK = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/><path d="M10 16h12M16 10v12" stroke="var(--mark-on)" stroke-width="3" stroke-linecap="round"/></svg>`;

// An SVG arrow instead of "→", which the embedded font subsets do not cover.
const ARROW = `<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const CSS = `
@page { size: A4; margin: 0; }
:root { --accent: #0e6655; --accent-strong: #0a4f42; --deep: #083c33; --soft: #e0f0eb; --paper: #ffffff;
  --tint: #f6f5f1; --ink: #1b1d1f; --muted: #4f545a; --line: #dedbd2; --warn: #fff4d6; --warn-fg: #6b4e00; --mark-on: #ffffff; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--paper); color: var(--ink);
  font-family: 'Inter', sans-serif; font-size: 10.8pt; line-height: 1.48;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; font-feature-settings: 'cv11'; }
.page { width: 210mm; height: 297mm; padding: 18mm 17mm 20mm; position: relative; overflow: hidden;
  break-after: page; display: flex; flex-direction: column; gap: 7mm; }
.page:last-child { break-after: auto; }
h1, h2, h3 { margin: 0; letter-spacing: -0.01em; hyphens: auto; }
h2 { font-size: 18.5pt; line-height: 1.2; font-weight: 700; margin-bottom: 3.5mm; }
h3 { font-size: 11.4pt; line-height: 1.3; font-weight: 700; margin-bottom: 1.2mm; }
p { margin: 0; hyphens: auto; }
ul { margin: 0; padding-left: 4.5mm; }
li { margin: 0.9mm 0; hyphens: auto; }
.muted { color: var(--muted); }
.foot { position: absolute; left: 17mm; right: 17mm; bottom: 9mm; font-size: 7.6pt; color: var(--muted);
  display: flex; justify-content: space-between; gap: 6mm; border-top: 0.3mm solid var(--line); padding-top: 2.5mm; }
.foot span:last-child { white-space: nowrap; }
.brandline { display: flex; align-items: center; gap: 2.5mm; font-weight: 700; font-size: 11.5pt; color: var(--accent); }
.mark { width: 7.5mm; height: 7.5mm; color: var(--accent); }

.cover { background: linear-gradient(160deg, #06302a 0%, #0a4f42 50%, #0e6655 100%); color: #fff; gap: 0; }
.cover .brandline { color: #fff; }
.cover .mark { color: #fff; --mark-on: #0a4f42; }
.cover .eyebrow { margin-top: 42mm; text-transform: uppercase; letter-spacing: 0.14em; font-size: 8.8pt; font-weight: 600; opacity: 0.85; }
.cover h1 { font-size: 31pt; line-height: 1.1; margin: 5mm 0 8mm; font-weight: 700; letter-spacing: -0.02em; max-width: 170mm; }
.cover .lead { font-size: 12.5pt; line-height: 1.5; max-width: 160mm; opacity: 0.95; }
.flow { position: absolute; left: 17mm; right: 17mm; bottom: 36mm; display: flex; align-items: stretch; gap: 3mm; }
.flow .step { flex: 1; border: 0.3mm solid rgba(255,255,255,0.4); border-radius: 4mm; padding: 4mm 4.5mm; background: rgba(255,255,255,0.08); }
.flow b { display: block; font-size: 10.8pt; margin-bottom: 0.6mm; }
.flow span { font-size: 8.6pt; opacity: 0.85; }
.flow .arrow { align-self: center; width: 5mm; height: 5mm; opacity: 0.8; flex: none; }
.cover .note { position: absolute; left: 17mm; right: 17mm; bottom: 13mm; font-size: 8.4pt; opacity: 0.85;
  display: flex; justify-content: space-between; gap: 6mm; }

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 5mm; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.card { background: var(--tint); border-radius: 3.5mm; padding: 4.5mm 5mm; }
.card p, .card li { color: var(--muted); font-size: 10pt; }
.card.soft { background: var(--soft); }
.card.soft p { color: #22403a; }
.num { width: 7mm; height: 7mm; border-radius: 50%; background: var(--accent); color: #fff; font-weight: 700; font-size: 9pt;
  display: flex; align-items: center; justify-content: center; margin-bottom: 2.5mm; }
.block { border-left: 1.1mm solid var(--accent); padding: 0.5mm 0 0.5mm 4mm; }
.block > p { color: var(--muted); font-size: 10pt; margin-bottom: 1.5mm; }
.block li { font-size: 9.9pt; }
.lead-dark { font-size: 11.6pt; color: #33383d; margin: -1.5mm 0 1mm; }
.status { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
.status .col { border-radius: 3.5mm; padding: 4.5mm 5mm; }
.status .ready { background: #eaf5ee; }
.status .coming { background: var(--warn); }
.status h3 { display: flex; align-items: center; justify-content: space-between; gap: 2mm; }
.pill { font-size: 6.8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; padding: 0.6mm 2.2mm; border-radius: 10mm; white-space: nowrap; }
.ready .pill { background: #1f6b3a; color: #fff; }
.coming .pill { background: var(--warn-fg); color: #fff; }
.status li { font-size: 9.9pt; }
.why { background: var(--accent-strong); color: #fff; border-radius: 4mm; padding: 5.5mm 6mm; }
.why h2 { color: #fff; font-size: 14pt; margin-bottom: 3mm; }
.why .grid3 p { color: rgba(255,255,255,0.88); font-size: 9.9pt; }
.faq > div { padding: 3mm 0; border-bottom: 0.3mm solid var(--line); }
.faq > div:last-child { border-bottom: 0; }
.faq p { color: var(--muted); font-size: 10pt; }
.kit { border: 0.45mm dashed #7fb5a8; border-radius: 4mm; padding: 5mm 6mm; }
.kit h3 { color: var(--accent-strong); font-size: 11.5pt; }
.kit .mail { white-space: pre-wrap; background: var(--tint); border-radius: 2.5mm; padding: 3.5mm 4.5mm; margin: 2.5mm 0; font-size: 8.3pt; line-height: 1.36; color: #33383d; }
.kit .mail b { color: var(--ink); }
.small { font-size: 8.8pt; color: var(--muted); }
.cta { margin-top: auto; margin-bottom: 6mm; border-radius: 4mm; padding: 6mm 7mm; background: linear-gradient(135deg, #0a4f42, #0e6655); color: #fff; }
.cta h2 { color: #fff; font-size: 14.5pt; margin-bottom: 2mm; }
.cta .contact { margin-top: 3.5mm; font-weight: 700; font-size: 12pt; }
.cta .org { margin-top: 2mm; font-size: 8.6pt; opacity: 0.9; }
.hosting .card h3 { color: var(--accent-strong); }
.facts { display: grid; grid-template-columns: max-content 1fr; gap: 1.6mm 5mm; margin: 0; }
.facts dt { font-weight: 600; }
.facts dd { margin: 0; color: var(--muted); }
.plainp p + p { margin-top: 2mm; }
`;

function head(lang, title) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="author" content="Open Brand Exchange">${fontLinks}<style>${CSS}</style></head><body>`;
}

function foot(t, n, total, left) {
  return `<div class="foot"><span>${esc(left ?? 'Open Brand Exchange · openbrandexchange.com')}</span><span>${n} / ${total}</span></div>`;
}

function cover(t, lang, { eyebrow, h1, lead, flow }) {
  const steps = flow.map((s) => `<div class="step"><b>${esc(s.h)}</b><span>${esc(s.p)}</span></div>`).join(ARROW);
  return `<section class="page cover">
  <div class="brandline">${MARK}<span>Open Brand Exchange</span></div>
  <div class="eyebrow">${esc(eyebrow)}</div>
  <h1>${esc(h1)}</h1>
  <p class="lead">${esc(lead)}</p>
  <div class="flow">${steps}</div>
  <div class="note"><span>${esc(initiativeText(t))}</span><span>openbrandexchange.com</span></div>
</section>`;
}

function statusBlock(t, ready, coming) {
  const b = t.brochure;
  const li = (xs) => xs.map((x) => `<li>${esc(x)}</li>`).join('');
  return `<div><h2>${esc(b.statusTitle)}</h2><div class="status">
  <div class="col ready"><h3><span>${esc(b.readyTitle)}</span><span class="pill">${esc(b.readyBadge)}</span></h3><ul>${li(ready)}</ul></div>
  <div class="col coming"><h3><span>${esc(b.comingTitle)}</span><span class="pill">${esc(b.comingBadge)}</span></h3><ul>${li(coming)}</ul></div>
</div></div>`;
}

function faqBlock(t, indexes) {
  const vars = orgPlaceholders(t);
  const items = indexes.map((i) => t.faq.items[i]).map((q) => `<div><h3>${esc(q.q)}</h3><p>${esc(fill(q.a, vars))}</p></div>`);
  return `<div><h2>${esc(t.faq.h1)}</h2><div class="faq">${items.join('')}</div></div>`;
}

function cta(t, lang, text) {
  const b = t.brochure;
  return `<div class="cta"><h2>${esc(b.ctaTitle)}</h2><p>${esc(text)}</p>
  <div class="contact">${HELLO_EMAIL} · openbrandexchange.com</div>
  <div class="org">${esc(initiativeText(t))}</div></div>`;
}

// Some languages end the month-year with a period (bg "септември 2026 г."): never print "..".
const lastFoot = (t, lang) => t.brochure.footer.replace('{date}', monthYear(lang)).replace(/\.\.$/, '.');

export function brandsHtml(lang, t = loadMessages(lang)) {
  const b = t.brochure;
  const total = 6;
  const steps = t.home.steps.map((s, i) => `<div class="card soft"><div class="num">${i + 1}</div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`).join('');
  const what = t.home.what.map((s) => `<div class="card"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`).join('');
  const why = t.home.why.map((s) => `<div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`).join('');
  const blocks = t.brands.blocks
    .map((bl) => `<div class="block"><h3>${esc(fill(bl.h, { portal: t.portalWord }))}</h3><p>${esc(fill(bl.p, { portal: t.portalWord }))}</p><ul>${bl.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`)
    .join('');
  const admin = t.brands.admin.map((a) => `<dt>${esc(a.k)}</dt><dd>${esc(a.v)}</dd>`).join('');
  const hosting = [
    [t.hosting.p1Title, t.hosting.p1P],
    [t.hosting.p2Title, `${t.hosting.p2P} ${t.common.editionCloudflare}, ${t.common.editionGoogle}, ${t.common.editionHosting}.`],
    [t.hosting.p3Title, t.hosting.p3P.replace(/[:：]\s*$/, '.')],
  ]
    .map(([h, p]) => `<div class="card"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`)
    .join('');
  return (
    head(lang, `Open Brand Exchange · ${t.nav.brands}`) +
    cover(t, lang, { eyebrow: t.nav.brands, h1: t.home.h1, lead: t.home.lead, flow: b.brandsFlow }) +
    `<section class="page">
  <div><h2>${esc(t.home.howTitle)}</h2><div class="grid3">${steps}</div></div>
  <div><h2>${esc(t.home.whatTitle)}</h2><div class="grid3">${what}</div></div>
  <div class="why"><h2>${esc(t.home.whyTitle)}</h2><div class="grid3">${why}</div></div>
  ${foot(t, 2, total)}
</section>
<section class="page">
  <div><h2>${esc(t.brands.h1)}</h2><p class="lead-dark">${esc(t.brands.lead)}</p></div>
  <div class="grid2">${blocks}</div>
  ${foot(t, 3, total)}
</section>
<section class="page hosting">
  <div><h2>${esc(t.brands.adminTitle)}</h2><dl class="facts">${admin}</dl></div>
  <div><h2>${esc(t.hosting.h1)}</h2><p class="lead-dark">${esc(t.hosting.lead)}</p></div>
  <div class="grid3">${hosting}</div>
  <div class="grid2">
    <div class="card soft"><h3>${esc(t.hosting.compareTitle)}</h3><p>${esc(t.hosting.compareP)}</p></div>
    <div class="card soft"><h3>${esc(t.hosting.domainTitle)}</h3><p>${esc(t.hosting.domainP)}</p></div>
  </div>
  ${foot(t, 4, total)}
</section>
<section class="page">
  ${faqBlock(t, [0, 1, 2, 3, 7, 8])}
  ${foot(t, 5, total)}
</section>
<section class="page">
  ${statusBlock(t, b.brandsReady, b.brandsComing)}
  <div><h2>${esc(t.brands.nextTitle)}</h2><dl class="facts next">
    <dt>${esc(t.brands.nextHosting)}</dt><dd>${pageUrl(lang, 'hosting')}</dd>
    <dt>${esc(t.brands.nextAutomation)}</dt><dd>${pageUrl(lang, 'automation')}</dd>
    <dt>${esc(t.nav.developers)}</dt><dd>${pageUrl(lang, 'developers')}</dd>
  </dl></div>
  ${cta(t, lang, b.ctaBrands)}
  ${foot(t, 6, total, lastFoot(t, lang))}
</section></body></html>`
  );
}

export function retailersHtml(lang, t = loadMessages(lang)) {
  const b = t.brochure;
  const r = t.retailers;
  const total = 4;
  const cards = r.portal.map((s) => `<div class="card"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`).join('');
  const kitUrl = pageUrl(lang, 'for-retailers') + '#switch-kit';
  return (
    head(lang, `Open Brand Exchange · ${t.nav.retailers}`) +
    cover(t, lang, { eyebrow: t.nav.retailers, h1: b.retailersH1, lead: r.lead, flow: b.retailersFlow }) +
    `<section class="page">
  <div><h2>${esc(r.portalTitle)}</h2><p class="lead-dark">${esc(fill(r.portalP, { portal: t.portalWord }))}</p></div>
  <div class="grid2">${cards}</div>
  <div class="card soft"><h3>${esc(r.apiTitle)}</h3><p>${esc(r.apiP)}</p></div>
  <div class="card"><h3>${esc(r.findTitle)}</h3><p>${esc(r.findP)} openbrandexchange.com/${lang}/directory/</p></div>
  <div><h3>${esc(r.toolsTitle)}</h3><p class="muted">${esc(r.toolsP)}</p></div>
  ${foot(t, 2, total)}
</section>
<section class="page">
  ${statusBlock(t, b.retailersReady, b.retailersComing)}
  <div class="kit"><h3>${esc(r.kitTitle)}</h3><p>${esc(r.kitP)}</p>
    <div class="mail"><b>${esc(t.switchKit.subject)}</b>\n\n${esc(fill(t.switchKit.body, { url: `https://${pageUrl(lang, 'for-brands')}` }))}</div>
    <p class="small">${esc(fill(b.kitP, { url: kitUrl }))}</p></div>
  ${foot(t, 3, total)}
</section>
<section class="page">
  ${faqBlock(t, [4, 5, 6, 0, 8])}
  ${cta(t, lang, b.ctaRetailers)}
  ${foot(t, 4, total, lastFoot(t, lang))}
</section></body></html>`
  );
}

/** 1200×630 social preview image (JPEG) for a language. */
export function ogHtml(lang, t = loadMessages(lang)) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">${fontLinks}<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  body{font-family:'Inter',sans-serif;color:#fff;background:linear-gradient(160deg,#06302a 0%,#0a4f42 50%,#0e6655 100%);
  display:flex;flex-direction:column;padding:72px 80px;box-sizing:border-box}
  .b{display:flex;align-items:center;gap:18px;font-weight:700;font-size:34px}
  .mark{width:56px;height:56px;color:#fff;--mark-on:#0a4f42}
  h1{font-size:64px;line-height:1.08;font-weight:700;letter-spacing:-0.02em;margin:auto 0 28px;max-width:1040px;hyphens:auto}
  p{font-size:28px;margin:0;opacity:.88}
  </style></head><body><div class="b">${MARK}<span>Open Brand Exchange</span></div><h1>${esc(t.home.h1)}</h1><p>openbrandexchange.com</p></body></html>`;
}

/** Hash of everything a rendered file depends on, so tests can tell when a PDF is stale. */
export function inputsHash(kind, lang) {
  const t = loadMessages(lang);
  const html = kind === 'brands' ? brandsHtml(lang, t) : kind === 'retailers' ? retailersHtml(lang, t) : ogHtml(lang, t);
  const fontVersion = JSON.parse(readFileSync(new URL('package.json', FONT_DIR), 'utf8')).version;
  return createHash('sha256').update(html.replaceAll(FONT_DIR.href, 'font/')).update(fontVersion).digest('hex');
}

export const rootPath = fileURLToPath(root);
