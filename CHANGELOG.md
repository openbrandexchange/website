# Changelog

All notable changes to openbrandexchange.com. The site follows the specification's version in
its texts; the repository itself is versioned with [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Specification 0.3.1 (2026-11-21): the download links carry `?v=0.3.1` and the discovery example says
  `"spec_version": "0.3.1"`; the reference already shows 0.3.1 (portal appearance in the Node Admin API).
- Specification 0.3.0 (2026-11-17): the schemas at `/schemas/v0.3/` (0.1 and 0.2 are withdrawn by the
  spec; their paths redirect to 0.3), the vocabularies at `/vocabularies/v0.3/`, the 0.3 API
  reference, templates and glossary; `/errors/` has `idempotency_key_reused` and the warnings
  `material_unknown` and `qualifier_deprecated` (`sync:spec` adds those two from the spec's prose,
  as they are not in the label table). Every "version 0.2" text says 0.3, "home and sport" moved to
  0.4, the developers page lists what is new in 0.3, the online check names P-FEED-7, the retailers
  label example and the snippets use the 0.3 shapes (material and qualifiers per fibre, stable
  variant ids). Brochures regenerated. In all 25 languages.
- Press kit (`/<lang>/press/`) with the "Works with Open Brand Exchange" / "OBX compatible" badges,
  "Get involved" on the governance and developers pages, concrete hosting steps; the website is no
  longer openly licensed (see LICENSE).
- Specification 0.2 (2026-11-12): the schemas are served at `/schemas/v0.2/` next to the frozen
  `/schemas/v0.1/`; the API reference is the 0.2 one; `/errors/` and its pages include the label
  completeness warnings `fibre_composition_missing`, `animal_origin_unknown`,
  `footwear_materials_missing` and `fibre_percentages_not_100`. `npm run sync:spec` copies every
  schema version and the warning table of import-format.md rule 10.
- For retailers: "What the law requires", a table under the care-label example of what EU law makes
  mandatory (fibre composition per component, also online before purchase; "contains non-textile
  parts of animal origin"; footwear materials) and what is voluntary (care, country of origin,
  certifications), with the textiles Digital Product Passport planned for Q4 2027, and the line that
  a warning at upload never blocks publishing. In all 25 languages.
- For brands: one sentence on the label warnings at upload and one on luggage and bags, which now
  carry measurements and features measured the same way by every brand.
- Developers page: a link to "OBX in 10 minutes", the spec's quickstart.
- For retailers: what is on the care label (composition per part, care instructions in label
  order, country of origin, EAN per size) shown on the test brand's trail shorts, next to the
  same article as the API returns it.
- Provider logos on /hosting (light and dark version).

### Changed
- The fictional brand is now MAISON NOOR (spec 0.3.1 test data) instead of Kestrel: brands MAISON NOOR
  and NOOR ATELIER, company MAISON NOOR Group, `brands.maison-noor.example`, article numbers `MN-`/`NA-`,
  in every text of all 25 languages, the snippets, the directory's demo entry, the retailers label
  example (NA-2001) and the developer prompts. The example download is `/downloads/maison-noor-example.zip`;
  the reference, schemas and Excel templates are synced from the spec. The product screenshots are
  retaken from admin-ui's mock (the catalog, not the new start page; eleven articles) and the
  brochures and social images rebuilt.
- Bun instead of npm: `bun install` with `bun.lock` (also in `video/`), `bun run` scripts, `bun audit`
  in CI, Dependabot on the bun ecosystem. oxlint (`bun run lint`, part of `check`) over the site's
  code; `video/` type-checks with oxlint instead of tsc. Astro 7.4.13 (security advisories).
- Version 0.2: the status pill ("v0.2"), footer, home page, developers page, FAQ and brochures say
  that version 0.2 is out, in all 25 languages; brochures and social images rebuilt; the discovery
  example shows `"obx_version": "0.2"`; the directory is validated against the 0.2 schema.
- The site leads with the fetching side: retailers get content in the portal, as file downloads
  or through the API; how a brand gets content into its portal is its own choice. Plainer copy
  on the home page.
- The publisher line is "Open Brand Exchange Foundation (in formation)"; the founder's name is
  only on the imprint and in the privacy statement. Providers are listed alphabetically, without
  labels.
- Launch (2026-11-12): the status pill, footer, home page, developers page and FAQ say that
  version 0.1 is out and free to use, in all 25 languages; brochures and social images rebuilt.
  The preview password lock (`functions/_middleware.js`) is removed.
- Redesign: one design system (tokens, 12-column grid, Inter served from the site itself, one
  cobalt accent), dark and light bands, a sticky header with a "v0.1" status pill instead of the
  yellow banner, and a multi-column footer. The home page now shows the product: real screenshots
  of the brand portal and the admin, an architecture diagram, the change feed and the `obx` tool,
  the hosting options side by side, and the governance facts. All main pages use the same system.
- Product screenshots are generated from admin-ui in mock mode (`npm run capture:screenshots`)
  and served as AVIF and WebP at several widths.

## [0.1.0] - 2026-09-28

First complete version of the site, not yet deployed.

### Added
- Static Astro site in 25 languages (the 24 official EU languages plus Norwegian Bokmål), one
  English slug per page, browser language detection on `/` without cookies, `hreflang`,
  canonical URLs, sitemap, robots.txt, Open Graph and Twitter card tags with a preview image per
  language.
- Pages: home, for brands, automation, hosting, for retailers, developers, directory, downloads,
  FAQ, governance and name, privacy, cookie statement, imprint.
- Imprint and footer: "An initiative of Richard Lindhout · Open Brand Exchange Foundation (in
  formation)", hello@openbrandexchange.com and security@openbrandexchange.com; optional address,
  phone and registration number shown only once filled in.
- Public brand directory (`/directory.json`) with a demo entry, schema validation, listing rules,
  a discovery check on pull requests and a weekly re-check.
- Brochures for brands (6 pages) and retailers (4 pages) in all 25 languages, generated from the
  site's texts with an honest "ready in 0.1" / "coming next" split; switch-kit e-mails per language.
- Strict security headers (CSP without inline code, HSTS, frame-ancestors, referrer policy),
  CORS only on the directory.
- CI: directory, typecheck, build, link check, unit and output tests (locales complete and
  on-glossary, brochures fresh), licence policy, `npm audit`, Playwright + axe end-to-end tests,
  Lighthouse budgets. Deploy workflow for Cloudflare Pages. Dependabot.
- Docs: deploying, operations, security, brochures, translations; SECURITY, CONTRIBUTING (DCO),
  Code of Conduct, NOTICE, issue and pull request templates.

### Also in this release

#### Fixed

- Hosting, *Portal for web hosting*: the release file is `obx-portal-php-<version>.zip` (not `obx-node-php.zip`), and the steps now include making `data` and `config` writable, the setup code in `data/SETUP-CODE.txt` and the cron job; the first-start steps say where that edition keeps the code.
- Hosting, *Portal for Google Cloud & Docker*: the deploy script is `deploy/cloudrun.sh`, and it takes the project from `gcloud config` instead of asking.
- Automation: the admin paths are *Automatic upload → Access keys* and *Automatic upload → Scheduled imports → Add scheduled import*, in the portal's own words per language.
- Automation: the import modes are called what the portal calls them (*Only add and update*, *Also take missing articles offline*), and the note on the Portal for Cloudflare no longer says a scheduled import makes web versions of photos (it delivers originals; obx and the Imports screen make them).
- Hosting, *Portal for Cloudflare*: says that a portal in daily use needs the Workers Paid plan, instead of only pointing at free allowances.
- Hosting, Docker: `docker logs obx 2>&1 | grep -i "setup code"` (the node logs to standard error, so without `2>&1` the command found nothing); the secret key is written to a file once instead of being generated inside the command, where nobody could keep it; the Caddy example sets `OBX_TRUST_PROXY`, so rate limits count per visitor and not for everyone behind Caddy together.
- Hosting, *Portal for Google Cloud & Docker*: `DRY_RUN=1 ./deploy/cloudrun.sh` shows the commands first without changing anything.
- Developers: there are four conformance profiles (protocol, ingest, portal and security), not three.
- The footer says the CC-BY-4.0/MIT line is about this website; the specification, the SDK and admin UI, and the portals have their own licences (listed on the developers page).

#### Added

- Developers: the specification's rendered API reference at `/reference/`, the JSON Schemas at the address of their `$id` (`/schemas/v0.1/…`), and a page per error code at `/errors/<obx_error>`, the `type` of every problem the APIs answer with; `npm run sync:spec` copies them from the spec. The developers page links the reference next to each OpenAPI file.
- Downloads: the Kestrel example files as one zip (`/downloads/kestrel-example.zip`, built from the specification's fixtures with `scripts/build-example-zip.sh`), next to the link to the specification.
- For retailers: the developer example also shows `obx pull`.

[0.1.0]: https://github.com/openbrandexchange/website/releases/tag/v0.1.0
