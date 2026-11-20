# openbrandexchange.com

The website of **Open Brand Exchange**: a free, open way for brands to deliver product images and
article data to their retailers. This repository is the whole site: a static
[Astro](https://astro.build) build in 25 languages, the brand directory, and the brochures for
brands and retailers. It is deployed to Cloudflare Pages.

Published by the Open Brand Exchange Foundation (in formation).
Contact: hello@openbrandexchange.com · security reports: security@openbrandexchange.com.

## Quickstart

```sh
bun install
bun run dev          # http://localhost:4321/  (the home address picks your browser language)
bun run check        # directory, typecheck, build, links, unit and output tests
```

Bun 1.3 or newer, and Node 22.18 or newer (Astro, the unit tests and Playwright run on Node).
For the end-to-end tests, once: `bunx playwright install chromium`, then
`bun run build && bun run test:e2e`.

| Command | What it does |
|---|---|
| `bun run check` | validate `public/directory.json`, `astro check`, build `dist/`, check every internal link and anchor, run the unit and output tests |
| `bun run lint` | oxlint over `src/`, `scripts/`, `tools/`, `tests/`, `functions/` and `e2e/` (part of `check`) |
| `bun run test:e2e` | Playwright against `dist/` served with the real headers: axe on every page type (light and dark, Latin/Greek/Cyrillic), keyboard use, phone layout on all 325 pages, CSP |
| `bun run lighthouse` | Lighthouse with budgets on four pages (needs Chrome) |
| `bun run check:licenses` | licence policy for every dependency |
| `bun run capture:screenshots` | regenerate the product screenshots in `src/assets/screens/` from `../admin-ui` in mock mode (en, nl, de, fr; other languages use English) |
| `bun run build:brochures` | regenerate the 50 brochure PDFs and 25 social images (needs Chrome) |
| `bun run sync:glossary` | copy the glossary from `../admin-ui` and `../spec` |
| `bun run sync:spec` | copy the rendered API reference, the schemas and the error codes from `../spec` |
| `sh scripts/deploy-cloudflare-pages.sh` | deploy (see [docs/deploying.md](docs/deploying.md)) |

## What is where

| Path | What |
|---|---|
| `src/locales/<lang>.json` | **All page and brochure text**, one file per language. `en.json` is the source; the tests keep the other 24 complete and on-glossary. |
| `src/views/*.astro` | One view per page; they only read from the locale files. |
| `src/components/`, `src/styles/global.css` | The design system: page hero, sections, screenshots in a browser frame, code windows, the architecture diagram; tokens, 12-column grid and type scale in one stylesheet. |
| `src/assets/screens/<lang>/` | Product screenshots (2× WebP), turned into AVIF/WebP at several widths at build time. |
| `src/lib/org-core.ts`, `src/data/imprint.json` | Who publishes the site and how to reach them; optional postal address, phone and registration number for the imprint (empty until the owner fills them in). |
| `src/data/snippets.ts` | Copy-paste code on the automation, hosting and developer pages. |
| `src/data/providers.json` | Official partners on /hosting and /partners. |
| `src/data/glossary*.json` | Copies of the project glossary (admin-ui terms, spec publisher line). |
| `public/directory.json` | The public brand directory, served as `/directory.json` and rendered on /directory. |
| `public/downloads/` | Brochures `brands-<lang>.pdf` and `retailers-<lang>.pdf` (generated), their manifest. Switch-kit e-mails are generated at build time. |
| `public/og/` | Social preview image per language (generated). |
| `public/_headers`, `public/_redirects` | Security headers, caching, CORS for the directory, short links. |
| `scripts/` | Brochure build, deploy script, glossary sync. |
| `tools/` | Directory validator, link checker, licence check, static test server, Lighthouse runner. |
| `tests/`, `e2e/` | Node unit and output tests; Playwright end-to-end tests. |

## Pages and languages

bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nb, nl, pl, pt, ro, sk, sl, sv.

- Every page lives at `/<lang>/<english-slug>/`: home, for-brands, automation, hosting,
  for-retailers, developers, directory, downloads, faq, governance, privacy, cookies, imprint.
- `/` sends visitors to their remembered choice, else their browser language, else Dutch.
  Without JavaScript it is a plain language chooser.
- Every page carries `hreflang` links for all 25 languages plus `x-default` (English), a canonical
  URL, Open Graph and Twitter card tags with a preview image in its language, and is listed in
  `/sitemap.xml`. `robots.txt` allows everything and points at the sitemap.
- No cookies. The language menu remembers a choice in `localStorage` only.

To change a text: edit `en.json`, then the same key in the other 24 files, see
[docs/translations.md](docs/translations.md). If it is used in a brochure, `bun run test` then reports
the PDF as stale: `bun run build:brochures -- --lang <lang>`.

## Getting a brand listed

Brands (or their hosting provider on their behalf) open a pull request that adds one entry to
`public/directory.json`, sorted by `id`. CI validates it against the spec's Directory schema,
checks the listing rules and, on pull requests, fetches the entry's `/.well-known/obx`. A weekly
workflow re-checks every listed portal. Format:
[spec docs/directory.md](https://github.com/openbrandexchange/spec/blob/main/docs/directory.md).

## Compatible and official partners

Passing the conformance test and saying "Compatible with Open Brand Exchange" is free. Official
partners (a paid listing, the same criteria for everyone; see /partners) are added to
`src/data/providers.json` by the maintainers: same fields as the existing entry, texts per
language; readers see their language, else English. They appear on /hosting and /partners.

## Documentation

- [docs/deploying.md](docs/deploying.md): Cloudflare Pages via GitHub Actions or by hand, domain, rollback, other hosts
- [docs/operations.md](docs/operations.md): health checks, budgets, statistics, regular tasks
- [docs/security.md](docs/security.md): headers, CSP, CORS, directory trust, supply chain
- [docs/brochures.md](docs/brochures.md): how the PDFs and social images are made and checked
- [docs/translations.md](docs/translations.md): languages, glossary, review status
- [NOTES.md](NOTES.md): decisions and open points · [CHANGELOG.md](CHANGELOG.md)
- [CONTRIBUTING.md](CONTRIBUTING.md) (sign-off, rights in contributions) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

## Licence

Copyright © 2026 Open Brand Exchange Foundation (in formation). All rights reserved. The repository is
public for transparency; no licence is granted to copy or reuse the site (see [LICENSE](LICENSE)).
Exceptions with their own licence: files from the specification (schemas, API reference, templates,
the Kestrel example) and the brand directory are CC-BY-4.0, third-party code and fonts keep theirs,
and the badges and brochures may be shared unchanged. See [NOTICE](NOTICE) and
[LICENSE-CONTENT](LICENSE-CONTENT). Contributions: [CONTRIBUTING.md](CONTRIBUTING.md). The copyright
and the name will be transferred to the Open Brand Exchange Foundation, a Dutch stichting that is
being set up.
