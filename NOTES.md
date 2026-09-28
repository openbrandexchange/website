# Notes and decisions

Choices made where the brief or spec left room. Report changes to the spec repo if they matter.

1. **Directory file location.** spec `docs/directory.md` says `data/directory.json`; the brief
   says `public/directory.json`. The site keeps it in `public/` so the same file is served at
   `https://openbrandexchange.com/directory.json` for software and rendered on /directory.
   The spec doc should be updated to point at `public/directory.json`.
2. **Demo entry.** Kestrel Outfitters is marked with the extension field `"x-obx-demo": true`
   (the schema allows `x-<vendor>-<name>`). Demo entries must use a `.example` host, are shown
   with a "Demo entry" badge and never link to their fake portal. Real entries may not use
   reserved TLDs. Entries must be sorted by `id` and use `https://…/.well-known/obx`.
3. **URLs.** English slugs in every language (`/de/for-brands/`), so URLs never need translating
   and hreflang pairs are trivial. Old Dutch slugs were never deployed, so no redirects.
4. **Default language.** `/` picks: remembered choice (localStorage) → first supported browser
   language (primary subtag; `no`/`nn` → `nb`) → Dutch. `hreflang="x-default"` points at the
   English pages. The root page is `noindex, follow` and lists all languages. Done in the
   browser (`/js/lang.js`, generated from `src/lib/i18n-core.ts`) instead of a Pages Function,
   so the site stays plain static files and also works on any other static host.
   Accept-Language parsing is in `i18n-core.ts` (tested) for a future edge redirect.
5. **Glossary.** The admin-ui agent owns `spec/docs/glossary.md` and
   `admin-ui/src/i18n/glossary.json`; neither existed while this site was written. The portal
   words used here (`portalWord` in each locale) follow the owner's list for nl/de/fr/en; the
   others are my choice and should be aligned with the glossary when it lands:
   bg Портал за търговци, cs Portál pro prodejce, da Forhandlerportal, el Πύλη μεταπωλητών,
   es Portal para distribuidores, et Edasimüüjate portaal, fi Jälleenmyyjäportaali,
   ga Tairseach miondíoltóirí, hr Portal za trgovce, hu Viszonteladói portál, it Area rivenditori,
   lt Pardavėjų portalas, lv Tirgotāju portāls, mt Portal għall-bejjiegħa, nb Forhandlerportal,
   pl Portal dla sprzedawców, pt Portal de revendedores, ro Portal pentru comercianți,
   sk Portál pre predajcov, sl Portal za trgovce, sv Återförsäljarportal.
   Admin menu names quoted on the automation page ("Automatic upload", "Imports → Scheduled
   imports") are assumptions about the admin UI wording.
6. **Wording.** Brand/retailer pages avoid node/ingest/GTIN/grant/cursor/tombstone (tested).
   The developers page and API names keep the technical terms ("OBX Ingest API", GTIN), since
   that audience needs them.
7. **Edition names.** "Portal for Cloudflare" (node-ts), "Portal for Google Cloud & Docker"
   (node-go), "Portal for web hosting" (node-php), translated per language. Repo names appear
   only as links.
8. **Switch-kit emails.** Written for every language; the retailers page shows the page
   language plus English. Downloads are generated at build time
   (`/downloads/switch-kit-<lang>.txt`) from the same locale text.
9. **Brochures.** Only NL and EN PDFs exist; all languages link to both.
10. **Provider texts** use the LocalizedText fallback (reader's language → en → first).
    Photopilot's entry has nl/en/de/fr.
11. **Translation quality.** en is the source; nl, de and fr were written with extra care.
    The other 21 languages are complete but should get a native review, Irish (ga) and
    Maltese (mt) first.
12. **Links to not-yet-existing things.** GitHub repos are private and there are no releases
    or packages yet, so links to releases, the Deploy-to-Cloudflare button and
    `ghcr.io/openbrandexchange/*` images will only work once published. The link checker
    checks internal links and anchors only; external links are listed with `--external`.
