# openbrandexchange.com

The website of **Open Brand Exchange**: a free, open way for brands to deliver product
images and article data to their retailers. This repository is the whole site: a static
[Astro](https://astro.build) build in 25 languages, deployable to Cloudflare Pages.

"Open Brand Exchange" is a working name. The specification is at version 0.1 (draft).

## 60-second quickstart

```sh
npm ci
npm run dev          # http://localhost:4321/  (picks your browser language)
npm run check        # validate directory, build, check links, run tests
```

Node 22.18 or newer. No other tools needed.

## What is where

| Path | What |
|---|---|
| `src/locales/<lang>.json` | **All page text**, one file per language. `en.json` is the source; every other file must have exactly the same keys (a test enforces it). |
| `src/views/*.astro` | One view per page; they only read from the locale files. |
| `src/data/snippets.ts` | Copy-paste code shown on the automation, hosting and developer pages (English, shared). |
| `src/data/providers.json` | The hosted providers on /hosting. |
| `public/directory.json` | The public brand directory, served as `/directory.json` and rendered on /directory. |
| `public/downloads/` | Retailer brochures (NL, EN). The switch-kit emails are generated per language at `/downloads/switch-kit-<lang>.txt`. |
| `tools/` | Directory validator (schema from the spec repo in `tools/schemas/`) and the link checker. |
| `tests/` | Locale completeness and wording, language detection, directory rules, and checks on the built site. |

## Languages

bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, nb, pl, pt, ro, sk, sl, sv.

- Every page lives at `/<lang>/<english-slug>/` (for example `/nl/for-brands/`).
- `/` sends visitors to their remembered choice, else their browser language, else Dutch.
  Without JavaScript it is a plain language chooser.
- Every page carries `hreflang` links for all 25 languages and `x-default` → English.
- The language menu remembers a choice in `localStorage` only (no cookie).

To change a text: edit `en.json`, then the same key in the other 24 files. `npm test` fails if
a key is missing, a placeholder such as `{portal}` or `{url}` was dropped, or a file is still
mostly English. Brand- and retailer-facing texts must not use protocol words (node, ingest,
GTIN, grant, cursor, tombstone); the test checks that too. Say EAN, portal, "automatic upload",
"API key for your software".

## Getting a brand listed

Brands (or their hosting provider on their behalf) open a pull request that adds one entry to
`public/directory.json`, sorted by `id`. CI validates it against the spec's Directory schema,
checks the listing rules and, on pull requests, fetches the entry's `/.well-known/obx`.
Format: [spec docs/directory.md](https://github.com/openbrandexchange/spec/blob/main/docs/directory.md).

## Becoming a listed provider

Add yourself to `src/data/providers.json` (same fields as the existing entry, texts per
language; readers see their language, else English). Conditions are on the hosting page.

## Deploying

Cloudflare Pages, static output in `dist/`. Headers (`public/_headers`, strict CSP) and
redirects (`public/_redirects`) are part of the build.

```sh
npx wrangler login                                   # once, or set CLOUDFLARE_API_TOKEN
CF_PAGES_PROJECT=openbrandexchange sh scripts/deploy-cloudflare-pages.sh
DRY_RUN=1 sh scripts/deploy-cloudflare-pages.sh      # build and check only
```

Or connect the repository in the Cloudflare dashboard: build command `npm run build`,
output directory `dist`, environment variable `NODE_VERSION=22`.

Optional: set `PUBLIC_CF_ANALYTICS_TOKEN` at build time for cookieless Cloudflare Web
Analytics. Without it the site loads no third-party script at all.

## License

Code MIT, content CC-BY-4.0. See [LICENSE](LICENSE) and [LICENSE-CONTENT](LICENSE-CONTENT).
