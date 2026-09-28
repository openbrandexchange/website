# Notes and decisions

Choices made where the brief or the spec left room, and the open points that are tracked here
instead of as TODOs in the code. Report changes to the spec repository if they matter there.

## Decisions

1. **Directory file.** `public/directory.json`, served as `https://openbrandexchange.com/directory.json`
   and rendered on /directory. The spec's docs/directory.md now says the same. Demo entries use
   `"x-obx-demo": true` (in the spec too), must use a `.example` host, get a "Demo entry" badge and
   never link to their fake portal. A weekly workflow re-checks listed portals (spec: remove after
   30 days of failures).
2. **URLs.** English slugs in every language (`/de/for-brands/`), so URLs never need translating and
   hreflang pairs are trivial.
3. **Default language.** `/` picks: remembered choice (localStorage) → first supported browser
   language (`no`/`nn` → `nb`) → Dutch. `x-default` points at English. Done in the browser
   (`/js/lang.js`, generated from `src/lib/i18n-core.ts`) so the site stays plain static files
   and works on any static host; the Accept-Language parser in `i18n-core.ts` is tested and ready
   for an edge redirect if one is ever wanted.
4. **Glossary.** Terms come from admin-ui (`src/data/glossary.json`), the publisher line from the
   spec glossary (`src/data/glossary-publisher.json`); both are copied with `npm run sync:glossary`
   and enforced by the locale tests for all 25 languages. Aligning with the glossary changed the
   Lithuanian portal word (Prekybininkų portalas), the Croatian "automatic upload" (Automatsko
   učitavanje) and the heading "API key for your software" in most languages.
5. **Publisher and contact.** "An initiative of Richard Lindhout · Open Brand Exchange Foundation
   (in formation)" in the footer, on the imprint, on the brochures and in NOTICE; the imprint and
   the governance page say once that the foundation will be a Dutch stichting. Contact is only
   hello@ and security@openbrandexchange.com (a test fails on any other e-mail address in the
   built pages). The imprint shows a postal address, phone and registration number only when they
   are filled in `src/data/imprint.json`; nothing is invented.
6. **Legal pages.** Privacy (controller, what is processed, Cloudflare hosting, optional cookieless
   statistics, e-mail, GDPR rights, Dutch DPA), a separate cookie statement (no cookies; language
   choice in localStorage; Cloudflare may set a strictly necessary security cookie only when it
   challenges a visitor) and an imprint. They are written for the site as it is: no forms,
   accounts or tracking. They are not legal advice: have them reviewed before the launch.
7. **Status wording.** The banner, the home status and the FAQ say that version 0.1 is in testing
   and the first public release is being prepared, and the brochures split "ready in version 0.1"
   from "coming next". Change these texts (all languages, then rebuild the brochures) on the day
   the repositories and releases become public.
8. **Brochures.** Brands and retailers, all 25 languages, generated from the site's own locale
   texts (see docs/brochures.md). The retailer brochure includes the switch-kit e-mail. Contact
   is hello@openbrandexchange.com; Photopilot is mentioned only as the initiator's company and as
   one vendor building support, never as the way to get the service.
9. **Photopilot on /hosting.** Listed as a provider, first, labelled "Company of the initiator of
   Open Brand Exchange" so the relation is visible. Everyone else is listed alphabetically on the
   same conditions.
10. **Edition names.** "Portal for Cloudflare" (node-ts), "Portal for Google Cloud & Docker"
    (node-go), "Portal for web hosting" (node-php), translated per language. Repo names appear only
    as links.
11. **Switch-kit e-mails.** Written for every language; the retailers page shows the page language
    plus English; downloads are generated at build time (`/downloads/switch-kit-<lang>.txt`).
12. **Provider texts** use the LocalizedText fallback (reader's language → en → first).
13. **Fonts.** The site uses system fonts (no font files, no third-party requests). The brochures
    and social images embed Inter (OFL-1.1) so Greek and Cyrillic render the same everywhere.

## Open points (tracked here, not in the code)

- **Native review of 21 languages.** en, nl, de and fr were written with extra care; the other 21
  are complete and on-glossary but machine-quality. Irish (ga) and Maltese (mt) first.
- **Links that only work once things are public.** GitHub repositories are private and nothing is
  released, so links to releases, the Deploy-to-Cloudflare button (needs the node-ts repo to be
  public) and `ghcr.io/openbrandexchange/*` images do not work for visitors yet. The internal link
  checker checks internal links and anchors; `node tools/check-links.mjs dist --external` lists
  the external ones for a check on launch day.
- **Example host names in texts** (for example `haendler.ihremarke.de`, `brands.yourbrand.com`)
  are illustrative, not links; some may be registered by someone. Code examples use `.example`.
- **Trademark.** The site says the name is not a registered trademark yet; the spec's governance
  describes the planned Benelux application. Update the governance page when it is filed.

## Performance and accessibility (measured 2026-09-28)

- Lighthouse (mobile preset, local build): `/en/`, `/el/for-brands/`, `/bg/hosting/`,
  `/de/for-retailers/` all 100 / 100 / 100 / 100; LCP 0.9–1.1 s; CLS 0.
- axe (WCAG 2.2 A/AA + best practices): no violations on all 13 page types in en, el and bg, light
  and dark, desktop and phone; none on the language chooser. No horizontal scrolling on any of the
  325 pages at phone width. Fixed on the way: a code block widened the hosting page on phones, the
  draft banner was outside every landmark, and the phone menu collapsed after first paint.
