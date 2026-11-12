# Notes and decisions

Choices made where the project requirements or the spec left room, and the open points that are tracked here
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
5. **Publisher and contact.** Since 2026-11-12 the footer, the brochures and NOTICE say only
   "Open Brand Exchange Foundation (in formation)". The founder's name appears only where the law
   asks for a responsible person until the foundation is registered: the imprint and the privacy
   statement (`imprint.foundationP`, `privacy.sections[0].p`; a test keeps `{person}` out of every
   other text). Contact is only hello@ and security@openbrandexchange.com (a test fails on any
   other e-mail address in the built pages). The imprint shows a postal address, phone and
   registration number only when they are filled in `src/data/imprint.json`; nothing is invented.
6. **Legal pages.** Privacy (controller, what is processed, Cloudflare hosting, optional cookieless
   statistics, e-mail, GDPR rights, Dutch DPA), a separate cookie statement (no cookies; language
   choice in localStorage; Cloudflare may set a strictly necessary security cookie only when it
   challenges a visitor) and an imprint. They are written for the site as it is: no forms,
   accounts or tracking. They are not legal advice: have them reviewed before the launch.
7. **Status wording.** Since the launch on 2026-11-12 the header pill (`site.nav.preview`, with
   `common.draft` as its full text, and the short "v0.2" in `src/layouts/Base.astro`), the footer
   (`site.footer.status`), the home page (`home.status`, the governance "Open specification" card),
   the developers page (`developers.specP`, `developers.statusDraft`) and the FAQ ("Is it ready?") say
   which version is out and free to use; since spec 0.2.0 (released 2026-11-12, the same day as 0.1.0)
   that is version 0.2. The brochures split "ready in version 0.2" from "coming next" and end with
   "Version 0.2, <month year>" (`EDITION` in `scripts/brochure/template.mjs`). Change these texts in
   all languages, then rebuild the brochures, with every new version; keep the wording, change only
   the number.
8. **Brochures.** Brands and retailers, all 25 languages, generated from the site's own locale
   texts (see docs/brochures.md). The retailer brochure includes the switch-kit e-mail. Contact
   is hello@openbrandexchange.com; Photopilot is mentioned only as the initiator's company and as
   one vendor building support, never as the way to get the service.
9. **Providers on /hosting** are listed alphabetically, all on the same conditions, each with an
   optional logo (light and dark version in `src/assets/providers/`). Since 2026-11-12 Photopilot
   is listed without a label; its relation to the founder is disclosed on the governance page
   (conflict-of-interest rule).
10. **Edition names.** "Portal for Cloudflare" (node-ts), "Portal for Google Cloud & Docker"
    (node-go), "Portal for web hosting" (node-php), translated per language. Repo names appear only
    as links.
11. **Switch-kit e-mails.** Written for every language; the retailers page shows the page language
    plus English; downloads are generated at build time (`/downloads/switch-kit-<lang>.txt`).
12. **Provider texts** use the LocalizedText fallback (reader's language → en → first).
13. **Fonts.** The site serves Inter (variable, OFL-1.1) from its own origin via
    `@fontsource-variable/inter`, with `unicode-range` subsets so a page only loads the scripts it
    uses; the Latin file is preloaded. No third-party requests. The brochures and social images
    embed Inter too, so Greek and Cyrillic render the same everywhere.

14. **Design system (2026-09-29 redesign).** One stylesheet (`src/styles/global.css`): tokens for
    colour, a 4 px spacing scale, a 12-column grid in a 1240 px container, Inter with tight display
    tracking. Colour: deep ink for dark bands, white and a cool near-white for light bands, and one
    accent, cobalt blue `#2450e8`, for actions, links and key highlights only. Blue was chosen over
    the earlier green because it reads as infrastructure, stays clearly apart from the admin-ui's
    own teal in the screenshots, and keeps AA contrast as a button fill and as link text on white.
    Pages alternate dark and light full-bleed bands. No icons in circles, no gradient blobs.
15. **Product screenshots** come from the real admin-ui in mock mode
    (`npm run capture:screenshots`, en, nl, de and fr; other languages show English). For the
    screenshots only, the spec's fixture swatches are redrawn as simple garment illustrations
    (`scripts/screenshots/garments.mjs`); admin-ui and its data are not changed. The recipes
    screen shows the fictional portal address instead of the local server.
16. **Header fits on one row** from 1280 px in every language; below that the menu button takes
    over. The status pill shows "v0.2" and, on very wide screens, its full label, except in the
    languages where the label would not fit (listed in `global.css`). An end-to-end test measures
    the header in all 25 languages; shorten a label rather than loosening the test.
17. **Explainer video** (`video/`, Remotion, its own package). One beat per point, timed by the
    voice-over (ElevenLabs, `npm run voice:en` / `voice:nl`; cost logged in `video/.drafts/`), no
    music, captions burned in. It uses the real portal screenshots and draws everything else; facts
    only (the label is spec fixture KT-2001, the suitcase KO-1008). `npm run render` writes
    `public/video/obx-{en,nl}.{mp4,webm,jpg}` and a 9:16 cut to `video/out/` (not committed). The
    home page shows Dutch for nl and English for every other language, with `preload="none"`, so
    nothing but the poster loads until the visitor presses play (an end-to-end test checks this).

18. **What the law requires (spec 0.2).** The retailers page has a table under the care-label example
    (`retailers.label.law`) with what EU law makes mandatory (fibre composition per component, also
    online before purchase, and "contains non-textile parts of animal origin": Regulation (EU) No
    1007/2011; footwear materials: Directive 94/11/EC) and what is voluntary (care, country of origin,
    certifications; the textiles DPP under Regulation (EU) 2024/1781 is still to come). It follows the
    spec's "Legal basis" table (protocol.md §5.9.7). It is legislation, never called a certification,
    and a pointer, not legal advice. Citations use each language's official form, as in admin-ui's
    `labelWarning` texts; the numbers are never changed. The brands page says the same in one sentence
    (`brands.labelNote`), next to `brands.bagsNote` on luggage and bag measurements and features.
19. **Schemas and error pages per version.** `npm run sync:spec` copies every version under the
    spec's `site/schemas/` (the current v0.2 and the frozen v0.1) to `public/schemas/`, so every
    `$id` resolves, and refuses to run when the current version is missing. `/errors/` lists the
    `obx_error` codes of protocol.md and, since 0.2, the label completeness warnings of
    import-format.md rule 10 (`fibre_composition_missing`, `animal_origin_unknown`,
    `footwear_materials_missing`, `fibre_percentages_not_100`), each with its own page. The
    directory is validated against the current (v0.2) Directory schema.

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

## Performance and accessibility (measured 2026-09-29, after the redesign)

- Lighthouse (mobile preset, local build): `/en/`, `/el/for-brands/`, `/bg/hosting/`,
  `/de/for-retailers/` performance 99, accessibility, best practices and SEO 100; LCP 1.8–2.1 s
  (the web font and the hero screenshot; before the redesign, with system fonts and no images,
  0.9–1.1 s); CLS 0.
- axe (WCAG 2.2 A/AA + best practices): no violations on all 13 page types in en, el and bg, light
  and dark, desktop and phone; none on the language chooser. No horizontal scrolling on any of the
  325 pages at phone width. Fixed on the way: a code block widened the hosting page on phones, the
  draft banner was outside every landmark, and the phone menu collapsed after first paint.
